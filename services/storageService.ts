
import { LearningItem, StoryData } from '../types';

// Sử dụng tên DB ổn định, không gắn phiên bản vào chuỗi để tránh tạo DB mới khi code update
const DB_NAME = 'KidLingo_Permanent_Storage'; 
const STORE_NAME = 'items';
const AUDIO_STORE_NAME = 'audio_cache';
const STORY_STORE_NAME = 'stories'; 

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 4); // Tăng version để trigger upgrade nếu cần

    request.onerror = () => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Kiểm tra và tạo Store nếu chưa có, KHÔNG bao giờ xóa store cũ
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(AUDIO_STORE_NAME)) {
        db.createObjectStore(AUDIO_STORE_NAME);
      }
      if (!db.objectStoreNames.contains(STORY_STORE_NAME)) {
        db.createObjectStore(STORY_STORE_NAME, { keyPath: 'id' });
      }
      
      console.log("Database upgraded safely.");
    };
  });
};

const sanitizeItem = (item: any): LearningItem => {
  return {
    ...item,
    emoji: item.emoji || undefined,
    loading: false, 
    isRegeneratingImage: false,
    isRegeneratingAudio: false,
    error: undefined,
    proficiency: typeof item.proficiency === 'number' ? item.proficiency : 0,
    imageStyle: item.imageStyle || 'default',
    type: item.type || (item.text?.includes(' ') ? 'sentence' : 'word'),
    userId: item.userId || 'legacy_user'
  };
};

export const saveItemsToDB = async (items: LearningItem[]): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      // Upsert: Cập nhật nếu trùng ID, thêm mới nếu chưa có.
      items.forEach(item => {
        store.put(item);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error("Failed to save to IndexedDB:", error);
  }
};

export const deleteItemFromDB = async (id: string): Promise<void> => {
    try {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
    } catch (e) { console.error("Delete failed", e); }
};

export const loadItemsFromDB = async (userId?: string): Promise<LearningItem[]> => {
  try {
    const db = await initDB();
    const itemsFromDB = await new Promise<any[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    let cleanItems = itemsFromDB.map(sanitizeItem);
    
    if (userId) {
        cleanItems = cleanItems.filter(item => item.userId === userId || item.userId === 'legacy_user');
    }

    return cleanItems.sort((a, b) => b.createdAt - a.createdAt);

  } catch (error) {
    console.error("Failed to load DB:", error);
    return [];
  }
};

// --- AUDIO CACHE METHODS ---

export const getAudioFromCache = async (key: string): Promise<string | undefined> => {
    try {
        const db = await initDB();
        return new Promise((resolve) => {
            const tx = db.transaction(AUDIO_STORE_NAME, 'readonly');
            const store = tx.objectStore(AUDIO_STORE_NAME);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(undefined);
        });
    } catch { return undefined; }
};

export const saveAudioToCache = async (key: string, base64: string): Promise<void> => {
    try {
        const db = await initDB();
        const tx = db.transaction(AUDIO_STORE_NAME, 'readwrite');
        const store = tx.objectStore(AUDIO_STORE_NAME);
        store.put(base64, key);
    } catch (e) { console.error("Cache save failed", e); }
};

// --- STORY METHODS ---

export const saveStoryToDB = async (story: StoryData): Promise<void> => {
    try {
        const db = await initDB();
        const tx = db.transaction(STORY_STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORY_STORE_NAME);
        store.put(story);
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve();
        });
    } catch (e) { console.error("Story save failed", e); }
};

export const loadStoriesFromDB = async (userId?: string): Promise<StoryData[]> => {
    try {
        const db = await initDB();
        const stories = await new Promise<any[]>((resolve) => {
            const tx = db.transaction(STORY_STORE_NAME, 'readonly');
            const store = tx.objectStore(STORY_STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
        
        if (userId) {
            return stories.filter(s => s.userId === userId || !s.userId);
        }
        return stories;
    } catch { return []; }
};

export const deleteStoryFromDB = async (id: string): Promise<void> => {
    try {
        const db = await initDB();
        const tx = db.transaction(STORY_STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORY_STORE_NAME);
        store.delete(id);
    } catch (e) { console.error("Story delete failed", e); }
};
