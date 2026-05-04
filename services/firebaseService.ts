import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  getDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { FIREBASE_CONFIG, IS_FIREBASE_ENABLED } from '../config';
import { LearningItem, StoryData, UserStats } from '../types';

// ── Init ───────────────────────────────────────────────────────────────────
let db: ReturnType<typeof initializeFirestore> | null = null;

if (IS_FIREBASE_ENABLED) {
  try {
    const app = initializeApp(FIREBASE_CONFIG);
    // Firebase 10+ offline persistence API
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch (e) {
    console.warn('[Firebase] Init failed:', e);
  }
}

// ── Sync-code helpers ──────────────────────────────────────────────────────

/** Generate a 6-char alphanumeric sync code */
export const generateSyncCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

/** Check whether a sync code has data in Firestore */
export const checkSyncCodeExists = async (code: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const snap = await getDocs(collection(db, 'users', code.toUpperCase(), 'items'));
    return !snap.empty;
  } catch { return false; }
};

/** Download all data for a sync code — returns { items, stories, stats } */
export const downloadSyncData = async (code: string): Promise<{
  items: LearningItem[];
  stories: StoryData[];
  stats: UserStats | null;
}> => {
  if (!db) return { items: [], stories: [], stats: null };
  const uid = code.toUpperCase();
  try {
    const [itemsSnap, storiesSnap, statsSnap] = await Promise.all([
      getDocs(query(collection(db, 'users', uid, 'items'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'users', uid, 'stories'), orderBy('createdAt', 'desc'))),
      getDoc(doc(db, 'users', uid, 'profile', 'stats')),
    ]);
    return {
      items: itemsSnap.docs.map(d => d.data() as LearningItem),
      stories: storiesSnap.docs.map(d => d.data() as StoryData),
      stats: statsSnap.exists() ? (statsSnap.data() as UserStats) : null,
    };
  } catch (e) {
    console.warn('[Firebase] downloadSyncData failed:', e);
    return { items: [], stories: [], stats: null };
  }
};

// ── Items ──────────────────────────────────────────────────────────────────

export const saveItemToCloud = async (syncCode: string, item: LearningItem): Promise<void> => {
  if (!db) return;
  try {
    const ref = doc(db, 'users', syncCode, 'items', item.id);
    // Strip non-serialisable / transient fields before saving
    const { loading, isRegeneratingImage, isRegeneratingAudio, error, ...clean } = item as any;
    await setDoc(ref, { ...clean, updatedAt: Date.now() }, { merge: true });
  } catch (e) { console.warn('[Firebase] saveItemToCloud:', e); }
};

export const saveItemsBatchToCloud = async (syncCode: string, items: LearningItem[]): Promise<void> => {
  if (!db || !items.length) return;
  try {
    const batch = writeBatch(db);
    items.forEach(item => {
      const { loading, isRegeneratingImage, isRegeneratingAudio, error, ...clean } = item as any;
      batch.set(doc(db!, 'users', syncCode, 'items', item.id), { ...clean, updatedAt: Date.now() }, { merge: true });
    });
    await batch.commit();
  } catch (e) { console.warn('[Firebase] saveItemsBatch:', e); }
};

export const deleteItemFromCloud = async (syncCode: string, itemId: string): Promise<void> => {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'users', syncCode, 'items', itemId));
  } catch (e) { console.warn('[Firebase] deleteItemFromCloud:', e); }
};

export const subscribeToItems = (
  syncCode: string,
  callback: (items: LearningItem[]) => void,
): () => void => {
  if (!db) return () => {};
  const q = query(collection(db, 'users', syncCode, 'items'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as LearningItem));
  }, err => console.warn('[Firebase] subscribeToItems:', err));
};

// ── Stories ────────────────────────────────────────────────────────────────

export const saveStoryToCloud = async (syncCode: string, story: StoryData): Promise<void> => {
  if (!db || !story.id) return;
  try {
    await setDoc(doc(db, 'users', syncCode, 'stories', story.id), { ...story, updatedAt: Date.now() }, { merge: true });
  } catch (e) { console.warn('[Firebase] saveStoryToCloud:', e); }
};

export const deleteStoryFromCloud = async (syncCode: string, storyId: string): Promise<void> => {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'users', syncCode, 'stories', storyId));
  } catch (e) { console.warn('[Firebase] deleteStoryFromCloud:', e); }
};

export const subscribeToStories = (
  syncCode: string,
  callback: (stories: StoryData[]) => void,
): () => void => {
  if (!db) return () => {};
  const q = query(collection(db, 'users', syncCode, 'stories'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as StoryData));
  }, err => console.warn('[Firebase] subscribeToStories:', err));
};

// ── Stats ──────────────────────────────────────────────────────────────────

export const saveStatsToCloud = async (syncCode: string, stats: UserStats): Promise<void> => {
  if (!db) return;
  try {
    await setDoc(doc(db, 'users', syncCode, 'profile', 'stats'), { ...stats, updatedAt: Date.now() }, { merge: true });
  } catch (e) { console.warn('[Firebase] saveStatsToCloud:', e); }
};

export const subscribeToStats = (
  syncCode: string,
  callback: (stats: UserStats) => void,
): () => void => {
  if (!db) return () => {};
  return onSnapshot(doc(db, 'users', syncCode, 'profile', 'stats'), snap => {
    if (snap.exists()) callback(snap.data() as UserStats);
  }, err => console.warn('[Firebase] subscribeToStats:', err));
};
