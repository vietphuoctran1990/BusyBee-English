
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  enableIndexedDbPersistence 
} from "firebase/firestore";
import { FIREBASE_CONFIG } from "../config";
import { LearningItem, StoryData, UserStats } from "../types";

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable Offline Persistence (Best for mobile/kids)
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
    } else if (err.code === 'unimplemented') {
      console.warn("The current browser doesn't support all of the features necessary to enable persistence");
    }
  });
} catch (e) {}

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const logout = () => signOut(auth);

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// --- DATA SYNC ---

export const saveItemToCloud = async (userId: string, item: LearningItem) => {
  const docRef = doc(db, "users", userId, "items", item.id);
  await setDoc(docRef, { ...item, updatedAt: Date.now() }, { merge: true });
};

export const deleteItemFromCloud = async (userId: string, itemId: string) => {
  const docRef = doc(db, "users", userId, "items", itemId);
  await deleteDoc(docRef);
};

export const subscribeToItems = (userId: string, callback: (items: LearningItem[]) => void) => {
  const q = query(collection(db, "users", userId, "items"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => doc.data() as LearningItem);
    callback(items);
  });
};

export const saveStoryToCloud = async (userId: string, story: StoryData) => {
  if (!story.id) story.id = Date.now().toString();
  const docRef = doc(db, "users", userId, "stories", story.id);
  await setDoc(docRef, { ...story, updatedAt: Date.now() }, { merge: true });
};

export const deleteStoryFromCloud = async (userId: string, storyId: string) => {
  const docRef = doc(db, "users", userId, "stories", storyId);
  await deleteDoc(docRef);
};

export const subscribeToStories = (userId: string, callback: (stories: StoryData[]) => void) => {
  const q = query(collection(db, "users", userId, "stories"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const stories = snapshot.docs.map(doc => doc.data() as StoryData);
    callback(stories);
  });
};

export const saveStatsToCloud = async (userId: string, stats: UserStats) => {
  const docRef = doc(db, "users", userId, "profile", "stats");
  await setDoc(docRef, { ...stats, updatedAt: Date.now() }, { merge: true });
};

export const subscribeToStats = (userId: string, callback: (stats: UserStats) => void) => {
  const docRef = doc(db, "users", userId, "profile", "stats");
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as UserStats);
    }
  });
};
