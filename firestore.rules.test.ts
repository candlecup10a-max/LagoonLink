/**
 * Firestore Security Rules Test Specification
 * Verifies that all "Dirty Dozen" payloads return PERMISSION_DENIED.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenTestCase[] = [
  { id: 1, name: 'Identity Spoofing on Score Create', collection: 'scores', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 2, name: 'Unverified Email Write', collection: 'scores', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 3, name: 'Shadow Field Injection on Create', collection: 'scores', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 4, name: 'Shadow Field Injection on Update', collection: 'scores', operation: 'update', expectedResult: 'PERMISSION_DENIED' },
  { id: 5, name: 'Terminal State Bypass', collection: 'scores', operation: 'update', expectedResult: 'PERMISSION_DENIED' },
  { id: 6, name: 'Immutable Field Mutation', collection: 'scores', operation: 'update', expectedResult: 'PERMISSION_DENIED' },
  { id: 7, name: 'Client Timestamp Forgery', collection: 'scores', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 8, name: 'Denial-of-Wallet Oversized String', collection: 'scores', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 9, name: 'ID Poisoning Attack', collection: 'scores', operation: 'create', expectedResult: 'PERMISSION_DENIED' },
  { id: 10, name: 'Cross-User Score Read/List Scraping', collection: 'scores', operation: 'list', expectedResult: 'PERMISSION_DENIED' },
  { id: 11, name: 'Unbounded Array Poisoning on Leaderboard', collection: 'leaderboards', operation: 'update', expectedResult: 'PERMISSION_DENIED' },
  { id: 12, name: 'Value Poisoning on Score Update', collection: 'scores', operation: 'update', expectedResult: 'PERMISSION_DENIED' },
];
