import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

setLogLevel('silent');

const app = initializeApp(firebaseConfig);
try {
  initializeFirestore(
    app,
    { experimentalAutoDetectLongPolling: true },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  // Already initialized
}
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();

// Blueprint validation constants
export const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
export const MAX_ID_LENGTH = 128;
export const MAX_PLAYER_NAME_LENGTH = 40;
export const MAX_LEADERBOARD_ENTRIES = 10;

export function sanitizeId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, MAX_ID_LENGTH);
  return cleaned.length > 0 ? cleaned : 'score_default';
}

export function sanitizePlayerName(rawName: string | null | undefined): string {
  const trimmed = (rawName || 'Lagoon Player').trim().slice(0, MAX_PLAYER_NAME_LENGTH);
  return trimmed.length > 0 ? trimmed : 'Lagoon Player';
}

export interface LeaderboardEntryItem {
  userId: string;
  playerName: string;
  score: number;
  levelReached: number;
  matchesCount: number;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signOutUser() {
  return firebaseSignOut(auth);
}

export async function submitCompletedScoreToFirebase(params: {
  score: number;
  levelReached: number;
  matchesCount: number;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    return;
  }

  const safeUid = sanitizeId(user.uid);
  if (!ID_REGEX.test(safeUid)) return;

  const safePlayerName = sanitizePlayerName(
    user.displayName || user.email?.split('@')[0]
  );
  const safeScore = Math.max(0, Math.min(10000000, Math.floor(params.score)));
  const safeLevel = Math.max(1, Math.min(1000, Math.floor(params.levelReached)));
  const safeMatches = Math.max(0, Math.min(100000, Math.floor(params.matchesCount)));

  const scoreId = sanitizeId(`${safeUid}_${Date.now()}`);
  const scorePath = `scores/${scoreId}`;

  try {
    await setDoc(doc(db, 'scores', scoreId), {
      userId: safeUid,
      playerName: safePlayerName,
      score: safeScore,
      levelReached: safeLevel,
      matchesCount: safeMatches,
      status: 'completed',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, scorePath);
  }

  // Also update Global Top-10 Leaderboard if this score qualifies or improves topScore
  const boardPath = 'leaderboards/global';
  const boardRef = doc(db, 'leaderboards', 'global');
  let snap;
  try {
    snap = await getDoc(boardRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, boardPath);
  }

  const newEntry: LeaderboardEntryItem = {
    userId: safeUid,
    playerName: safePlayerName,
    score: safeScore,
    levelReached: safeLevel,
    matchesCount: safeMatches,
  };

  if (!snap.exists()) {
    try {
      await setDoc(boardRef, {
        boardType: 'global',
        lastUpdatedBy: safeUid,
        topScore: safeScore,
        entries: [newEntry],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, boardPath);
    }
  } else {
    const data = snap.data();
    const existingEntries: LeaderboardEntryItem[] = Array.isArray(data.entries)
      ? data.entries
      : [];
    const existingTopScore =
      typeof data.topScore === 'number' ? data.topScore : 0;

    const combined = [...existingEntries, newEntry]
      .filter(
        (e) =>
          e &&
          typeof e.userId === 'string' &&
          typeof e.playerName === 'string' &&
          typeof e.score === 'number'
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_LEADERBOARD_ENTRIES)
      .map((e) => ({
        userId: sanitizeId(e.userId),
        playerName: sanitizePlayerName(e.playerName),
        score: Math.max(0, Math.min(10000000, Math.floor(e.score))),
        levelReached: Math.max(1, Math.min(1000, Math.floor(e.levelReached || 1))),
        matchesCount: Math.max(0, Math.min(100000, Math.floor(e.matchesCount || 0))),
      }));

    const nextTopScore = Math.max(
      existingTopScore,
      combined[0]?.score ?? safeScore
    );

    try {
      await updateDoc(boardRef, {
        lastUpdatedBy: safeUid,
        topScore: nextTopScore,
        entries: combined,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, boardPath);
    }
  }
}

export async function fetchPersonalScores(): Promise<LeaderboardEntryItem[]> {
  const user = auth.currentUser;
  if (!user) return [];
  const path = 'scores';
  try {
    const q = query(collection(db, 'scores'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    const results: LeaderboardEntryItem[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      results.push({
        userId: String(d.userId || user.uid),
        playerName: String(d.playerName || 'Player'),
        score: Number(d.score || 0),
        levelReached: Number(d.levelReached || 1),
        matchesCount: Number(d.matchesCount || 0),
      });
    });
    return results.sort((a, b) => b.score - a.score).slice(0, 10);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
