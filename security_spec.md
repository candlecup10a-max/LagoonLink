# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default-Deny Global Catch-All**: All paths not explicitly matched (`/{document=**}`) deny all `read` and `write` operations unconditionally.
2. **Verified Authentication Gate**: All mutations (`create`, `update`, `delete`) require `request.auth != null` and `request.auth.token.email_verified == true`.
3. **Path Variable Hardening**: Every single-document path variable (`{scoreId}`, `{boardId}`) must pass `isValidId(id)` (`id is string && id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
4. **Identity Ownership Invariant**:
   - A `ScoreRecord` in `/scores/{scoreId}` must have `userId == request.auth.uid` on `create` and `update`, and `userId` is immutable (`incoming().userId == existing().userId`).
   - A `GlobalLeaderboard` in `/leaderboards/{boardId}` must have `lastUpdatedBy == request.auth.uid` on `create` and `update`.
5. **Query Enforcer & Zero Blanket Reads**:
   - `/scores/{scoreId}` only permits `list` when `isSignedIn() && resource.data.userId == request.auth.uid`.
   - `/leaderboards/{boardId}` forbids `list` (`allow list: if false;`) and only allows `get` when `isSignedIn() && isValidId(boardId) && existing().boardType == 'global'`.
6. **Terminal State Locking**: Once a `ScoreRecord` has `existing().status == 'completed'`, no further updates are permitted (`existing().status != 'completed'`).
7. **Temporal Integrity**: `createdAt` must equal `request.time` on `create` and remain immutable on `update` (`incoming().createdAt == existing().createdAt`). `updatedAt` must equal `request.time` on both `create` and `update`.
8. **Bounded Collections & Volumetric Limits**: `entries` in `GlobalLeaderboard` must be a `list` with `size() >= 1 && size() <= 10`, with `entries[0] is map`. All strings have strict `.size()` upper bounds.

---

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Identity Spoofing on Score Create)**: Authenticated user `user_A` attempts to create `/scores/score_1` with `userId: "user_B"`.
2. **Payload 2 (Unverified Email Write)**: Authenticated user with `email_verified: false` attempts to create `/scores/score_1`.
3. **Payload 3 (Shadow Field Injection on Create)**: User sends valid `ScoreRecord` fields plus `isAdmin: true`.
4. **Payload 4 (Shadow Field Injection on Update)**: User attempts to update `/scores/score_1` adding an undeclared key `bonusMultiplier: 99`.
5. **Payload 5 (Terminal State Bypass)**: User attempts to update `/scores/score_1` when `existing().status == 'completed'`.
6. **Payload 6 (Immutable Field Mutation)**: User attempts to change `createdAt` or `userId` during an update on `/scores/score_1`.
7. **Payload 7 (Client Timestamp Forgery)**: User supplies a past or future timestamp instead of `request.time` for `createdAt` or `updatedAt`.
8. **Payload 8 (Denial-of-Wallet Oversized String)**: User submits a `playerName` of 500 characters (`> 40` max).
9. **Payload 9 (ID Poisoning Attack)**: User attempts to create `/scores/bad$id!@#` with invalid characters.
10. **Payload 10 (Cross-User Score Read/List Scraping)**: Authenticated user `user_A` attempts to `get` or `list` `/scores` belonging to `user_B`.
11. **Payload 11 (Unbounded Array Poisoning on Leaderboard)**: User attempts to update `/leaderboards/global` with `entries` containing 25 items (`> 10` limit) or an empty array.
12. **Payload 12 (Value Poisoning on Score Update)**: User updates allowed key `score` with a negative integer `-500` or string `"999999"`.
