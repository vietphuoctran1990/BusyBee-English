
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import InputArea from './components/InputArea';
import LearningCard from './components/LearningCard';
import PracticeSetup from './components/PracticeSetup';
import PracticeArena from './components/PracticeArena';
import SaveTopicModal from './components/SaveTopicModal';
import EditCardModal from './components/EditCardModal';
import StoryModal from './components/StoryModal';
import StickerBookModal from './components/StickerBookModal';
import IntroModal from './components/IntroModal';
import AIFriendModal from './components/AIFriendModal';
import SettingsModal from './components/SettingsModal';
import SlideshowModal from './components/SlideshowModal';
import StoryCreationSetup from './components/StoryCreationSetup';
import LoginScreen from './components/LoginScreen';
import NotificationPrompt from './components/NotificationPrompt';
import { LearningItem, UserProfile, AppSettings, UserStats, GameType, Sticker, StoryData, LanguageType, AccentType } from './types';
import { generateIllustration, generateCardDetails, generateStory, generatePronunciation } from './services/geminiService';
import { saveItemsToDB, loadItemsFromDB, saveStoryToDB, loadStoriesFromDB, deleteItemFromDB, deleteStoryFromDB } from './services/storageService';
import { checkCodeExists, downloadData, uploadData } from './services/syncService';
import { generateSyncCode } from './services/firebaseService';
import {
  HeartIcon, HomeIcon, MagnifyingGlassIcon,
  TrophyIcon, StarIcon, BookOpenIcon,
  UsersIcon, KeyIcon, PlayIcon, SparklesIcon,
  ExclamationTriangleIcon, XMarkIcon, IdentificationIcon, ArrowPathIcon, TrashIcon, TagIcon,
  FunnelIcon, FireIcon, ChartBarIcon, CloudArrowUpIcon,
} from '@heroicons/react/24/solid';
import { TRANSLATIONS } from './utils/translations';
import { playSFX } from './services/audioUtils';

const USER_KEY = 'kidlingo_user_clay_v2';
const STATS_KEY = 'kidlingo_stats_clay_v2';
const SETTINGS_KEY = 'kidlingo_settings_clay_v2';
const NOTIF_KEY = 'busybee_notif_prefs';
const SYNC_KEY = 'busybee_sync_code';

type SortOrder = 'newest' | 'oldest' | 'alpha';

const ALL_STICKERS: Sticker[] = [
  { id: 'p1', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', name: 'Pikachu', cost: 10, bg: 'bg-yellow-100' },
  { id: 'p2', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', name: 'Charmander', cost: 15, bg: 'bg-orange-100' },
  { id: 'p3', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', name: 'Squirtle', cost: 15, bg: 'bg-blue-100' },
  { id: 'p4', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', name: 'Bulbasaur', cost: 15, bg: 'bg-green-100' },
  { id: 'p5', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', name: 'Eevee', cost: 20, bg: 'bg-amber-100' },
  { id: 'p6', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', name: 'Mewtwo', cost: 50, bg: 'bg-purple-100' },
  { id: 'p7', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png', name: 'Mew', cost: 45, bg: 'bg-pink-100' },
  { id: 'p8', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png', name: 'Meowth', cost: 12, bg: 'bg-stone-100' },
  { id: 'p9', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png', name: 'Jigpuff', cost: 18, bg: 'bg-rose-50' },
  { id: 'p10', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png', name: 'Snorlax', cost: 30, bg: 'bg-teal-50' },
  { id: 'p11', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png', name: 'Charizard', cost: 60, bg: 'bg-orange-200' },
  { id: 'p12', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png', name: 'Blastoise', cost: 55, bg: 'bg-blue-200' },
  { id: 'p13', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png', name: 'Venusaur', cost: 55, bg: 'bg-green-200' },
  { id: 'p14', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png', name: 'Psyduck', cost: 14, bg: 'bg-yellow-50' },
  { id: 'p15', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/58.png', name: 'Growlithe', cost: 22, bg: 'bg-orange-50' },
  { id: 'p16', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/63.png', name: 'Abra', cost: 25, bg: 'bg-yellow-100' },
  { id: 'p17', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/77.png', name: 'Ponyta', cost: 28, bg: 'bg-red-50' },
  { id: 'p18', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/92.png', name: 'Gastly', cost: 30, bg: 'bg-purple-50' },
  { id: 'p19', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/95.png', name: 'Onix', cost: 35, bg: 'bg-gray-100' },
  { id: 'p20', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png', name: 'Lapras', cost: 40, bg: 'bg-sky-100' },
  { id: 'p21', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/147.png', name: 'Dratini', cost: 38, bg: 'bg-blue-50' },
  { id: 'p22', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png', name: 'Dragonite', cost: 65, bg: 'bg-orange-100' },
  { id: 'p23', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/175.png', name: 'Togepi', cost: 20, bg: 'bg-stone-50' },
  { id: 'p24', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/196.png', name: 'Espeon', cost: 45, bg: 'bg-purple-100' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try { const s = localStorage.getItem(USER_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  });

  const [items, setItems] = useState<LearningItem[]>([]);
  const [stories, setStories] = useState<StoryData[]>([]);

  const [stats, setStats] = useState<UserStats>(() => {
    try { const s = localStorage.getItem(STATS_KEY); return s ? JSON.parse(s) : { stars: 0, cardsCreated: 0, unlockedStickers: [], streak: 0, lastLoginDate: '' } as any; } catch { return { stars: 0, cardsCreated: 0, unlockedStickers: [], streak: 0, lastLoginDate: '' } as any; }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try { const s = localStorage.getItem(SETTINGS_KEY); return s ? JSON.parse(s) : { accent: 'US', language: 'vn' }; } catch { return { accent: 'US', language: 'vn' }; }
  });

  const [view, setView] = useState<'create' | 'saved' | 'practice' | 'friend' | 'stories'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSearchQuery, setSavedSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [activeSavedTopic, setActiveSavedTopic] = useState<string | null>(null);
  const [isSelectingForStory, setIsSelectingForStory] = useState(false);

  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStickerBook, setShowStickerBook] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [activeStory, setActiveStory] = useState<StoryData | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [itemToSave, setItemToSave] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<LearningItem | null>(null);
  const [practiceGame, setPracticeGame] = useState<{ active: boolean; type: GameType; items: LearningItem[] }>({ active: false, type: 'listening', items: [] });
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  const notifPromptShownRef = useRef(false);

  // Sync code — stable ID shared across devices
  const [syncCode, setSyncCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SYNC_KEY);
      if (saved) return saved;
      const code = generateSyncCode();
      localStorage.setItem(SYNC_KEY, code);
      return code;
    } catch { return generateSyncCode(); }
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = TRANSLATIONS[settings.language];
  const deletedItemIds = useRef<Set<string>>(new Set());
  const globalErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showGlobalError = useCallback((msg: string) => {
    setGlobalError(msg);
    if (globalErrorTimerRef.current) clearTimeout(globalErrorTimerRef.current);
    globalErrorTimerRef.current = setTimeout(() => setGlobalError(null), 6000);
  }, []);

  // On login: load local IndexedDB, then pull cloud data and merge
  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      loadItemsFromDB(currentUser.id),
      loadStoriesFromDB(currentUser.id),
    ]).then(([localItems, localStories]) => {
      setItems(localItems);
      setStories(localStories);
      // Pull cloud data and merge (cloud wins for items/stories, max for stats)
      setIsSyncing(true);
      downloadData(syncCode).then(cloud => {
        setIsSyncing(false);
        if (cloud.items.length) {
          setItems(cloud.items);
          saveItemsToDB(cloud.items).catch(() => {});
        } else if (localItems.length) {
          // Nothing on cloud yet — push local data up
          uploadData(syncCode, { items: localItems, stories: localStories, stats: null }).catch(() => {});
        }
        if (cloud.stories.length) setStories(cloud.stories);
        if (cloud.stats) {
          setStats(prev => ({
            ...prev,
            stars: Math.max(prev.stars || 0, cloud.stats!.stars || 0),
            cardsCreated: Math.max(prev.cardsCreated || 0, cloud.stats!.cardsCreated || 0),
            streak: cloud.stats!.streak || prev.streak || 0,
            lastLoginDate: cloud.stats!.lastLoginDate || prev.lastLoginDate || '',
            unlockedStickers: Array.from(new Set([
              ...(prev.unlockedStickers || []),
              ...(cloud.stats!.unlockedStickers || []),
            ])),
          }));
        }
      }).catch(() => setIsSyncing(false));
    });
  }, [currentUser]); // eslint-disable-line

  // Streak calculation
  useEffect(() => {
    if (!currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastLoginDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = stats.lastLoginDate === yesterday ? (stats.streak || 0) + 1 : 1;
    setStats(prev => ({ ...prev, streak: newStreak, lastLoginDate: today }));
  }, [currentUser]); // eslint-disable-line

  // AI Studio key check
  useEffect(() => {
    const checkKey = async () => {
      try {
        if ((window as any).aistudio?.hasSelectedApiKey) {
          setHasCustomKey(await (window as any).aistudio.hasSelectedApiKey());
        }
      } catch {}
    };
    checkKey();
  }, []);

  // Re-schedule reminder on app load if previously enabled
  useEffect(() => {
    if (!currentUser) return;
    try {
      const saved = localStorage.getItem(NOTIF_KEY);
      if (!saved) return;
      const prefs = JSON.parse(saved);
      if (prefs.enabled && Notification.permission === 'granted') {
        // Wait for SW to be ready then schedule
        navigator.serviceWorker?.ready.then(reg => {
          reg.active?.postMessage({ type: 'SCHEDULE_REMINDER', hour: prefs.hour ?? 8, minute: 0, lang: settings.language });
        }).catch(() => {});
      }
    } catch {}
  }, [currentUser]); // eslint-disable-line

  // Show notification prompt after 45s on first session if permission not yet decided
  useEffect(() => {
    if (!currentUser || notifPromptShownRef.current) return;
    if (!('Notification' in window)) return;
    try {
      const saved = localStorage.getItem(NOTIF_KEY);
      if (saved) return; // User already responded
    } catch {}
    if (Notification.permission !== 'default') return;
    const timer = setTimeout(() => {
      if (!notifPromptShownRef.current) {
        notifPromptShownRef.current = true;
        setShowNotifPrompt(true);
      }
    }, 45000);
    return () => clearTimeout(timer);
  }, [currentUser]);

  const scheduleReminder = (hour: number) => {
    try {
      const reg = navigator.serviceWorker?.controller;
      if (reg) {
        reg.postMessage({ type: 'SCHEDULE_REMINDER', hour, minute: 0, lang: settings.language });
      }
    } catch {}
  };

  const handleNotifConfirm = async (hour: number) => {
    setShowNotifPrompt(false);
    try {
      if (!('Notification' in window)) return;
      const permission = await Notification.requestPermission();
      const prefs = { enabled: permission === 'granted', hour, dismissedAt: null };
      localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
      if (permission === 'granted') {
        scheduleReminder(hour);
        setGlobalError(t.notifGranted);
        if (globalErrorTimerRef.current) clearTimeout(globalErrorTimerRef.current);
        globalErrorTimerRef.current = setTimeout(() => setGlobalError(null), 4000);
      }
    } catch {}
  };

  const handleNotifDismiss = () => {
    setShowNotifPrompt(false);
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify({ enabled: false, dismissedAt: new Date().toISOString() }));
    } catch {}
  };

  // Debounced cloud push — called after any data change
  const scheduleCloudPush = useCallback((overrideItems?: LearningItem[], overrideStories?: StoryData[]) => {
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    syncDebounceRef.current = setTimeout(() => {
      setItems(currentItems => {
        setStories(currentStories => {
          setStats(currentStats => {
            uploadData(syncCode, {
              items: (overrideItems ?? currentItems).map(({ loading, isRegeneratingImage, isRegeneratingAudio, error, ...i }: any) => i),
              stories: overrideStories ?? currentStories,
              stats: currentStats,
            }).catch(() => {});
            return currentStats;
          });
          return currentStories;
        });
        return currentItems;
      });
    }, 2000);
  }, [syncCode]); // eslint-disable-line

  useEffect(() => {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
  }, [stats]);
  useEffect(() => { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {} }, [settings]);

  const handleRewardStars = (amount: number) => {
    setStats(prev => ({ ...prev, stars: prev.stars + amount }));
  };

  const handleLogin = (profile: UserProfile, appSettings: AppSettings) => {
    setCurrentUser(profile);
    setSettings(appSettings);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
    } catch {}
    setShowIntroModal(true);
    playSFX('success');
  };

  const addItem = useCallback(async (text: string, refImage: string | null) => {
    if (!currentUser) return;
    const itemId = 'item_' + Date.now();
    const newItem: LearningItem = { id: itemId, userId: currentUser.id, text, type: text.includes(' ') ? 'sentence' : 'word', loading: true, createdAt: Date.now() };
    setItems(prev => [newItem, ...prev]);
    playSFX('click');
    setGlobalError(null);

    try {
      const [details, imageUrl] = await Promise.all([
        generateCardDetails(text, settings.accent),
        generateIllustration(text, refImage || undefined),
      ]);

      if (deletedItemIds.current.has(itemId)) return;

      const finalItem: LearningItem = {
        ...newItem,
        text: details.englishText || text,
        phonetic: details.phonetic,
        vietnameseTranslation: details.vietnamese,
        example: details.example,
        emoji: details.emoji,
        topic: details.topic,
        imageUrl: imageUrl || undefined,
        loading: false,
      };

      setItems(prev => prev.map(i => i.id === itemId ? finalItem : i));
      await saveItemsToDB([finalItem]);
      scheduleCloudPush();
      setStats(prev => ({ ...prev, cardsCreated: (prev.cardsCreated || 0) + 1 }));
      playSFX('pop');
    } catch (e: any) {
      const isQuotaError = e.message?.includes("429") || e.message?.includes("RESOURCE_EXHAUSTED") || e.message?.includes("503") || e.message?.includes("UNAVAILABLE");
      const errorMsg = isQuotaError
        ? "Bé ơi, chú Ong cần nghỉ ngơi một xíu vì mệt quá rồi! Hãy thử lại sau hoặc nhờ ba mẹ dùng mã PRO nhé!"
        : "Ôi, có lỗi nhỏ rồi! Bé thử lại nha!";
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, loading: false, error: errorMsg } : i));
      if (isQuotaError) showGlobalError(errorMsg);
    }
  }, [settings.accent, currentUser, showGlobalError]);

  // Fix #1: Regenerate image properly (update existing item, not create new)
  const regenerateImage = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, isRegeneratingImage: true } : i));
    try {
      const newImageUrl = await generateIllustration(item.text);
      setItems(prev => {
        const updated = prev.map(i => i.id === id ? { ...i, imageUrl: newImageUrl, isRegeneratingImage: false } : i);
        const target = updated.find(i => i.id === id);
        if (target) saveItemsToDB([target]);
        return updated;
      });
      scheduleCloudPush();
      playSFX('pop');
    } catch {
      setItems(prev => prev.map(i => i.id === id ? { ...i, isRegeneratingImage: false } : i));
    }
  }, [items, scheduleCloudPush]);

  // Fix #1: Regenerate audio properly (generate AI audio and store in item)
  const regenerateAudio = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, isRegeneratingAudio: true } : i));
    try {
      const audioBase64 = await generatePronunciation(item.text, settings.accent);
      setItems(prev => {
        const updated = prev.map(i => i.id === id ? { ...i, audioBase64, isRegeneratingAudio: false } : i);
        const target = updated.find(i => i.id === id);
        if (target) saveItemsToDB([target]);
        return updated;
      });
      scheduleCloudPush();
      playSFX('pop');
    } catch {
      setItems(prev => prev.map(i => i.id === id ? { ...i, isRegeneratingAudio: false } : i));
    }
  }, [items, settings.accent, scheduleCloudPush]);

  const deleteItem = async (id: string) => {
    if (confirm(t.deleteCardConfirm)) {
      deletedItemIds.current.add(id);
      setItems(prev => prev.filter(i => i.id !== id));
      await deleteItemFromDB(id);
      scheduleCloudPush();
      playSFX('click');
    }
  };

  const deleteStory = async (id: string) => {
    if (confirm(t.deleteStoryConfirm)) {
      setStories(prev => prev.filter(s => s.id !== id));
      await deleteStoryFromDB(id);
      scheduleCloudPush();
      playSFX('click');
    }
  };

  // Fix #10: Apply sort
  const applySortOrder = useCallback((arr: LearningItem[], order: SortOrder) => {
    const copy = [...arr];
    if (order === 'newest') return copy.sort((a, b) => b.createdAt - a.createdAt);
    if (order === 'oldest') return copy.sort((a, b) => a.createdAt - b.createdAt);
    return copy.sort((a, b) => a.text.localeCompare(b.text));
  }, []);

  const filteredItems = useMemo(() => {
    const searched = items.filter(item => item.text.toLowerCase().includes(searchQuery.toLowerCase()));
    return applySortOrder(searched, sortOrder);
  }, [items, searchQuery, sortOrder, applySortOrder]);

  // Fix #8: Separate filtered/sorted saved items with own search
  const filteredSavedItems = useMemo(() => {
    const saved = items.filter(item => {
      if (!item.isSaved) return false;
      const matchesSearch = item.text.toLowerCase().includes(savedSearchQuery.toLowerCase()) ||
        (item.vietnameseTranslation || '').toLowerCase().includes(savedSearchQuery.toLowerCase());
      const matchesTopic = activeSavedTopic ? (item.topic === activeSavedTopic) : true;
      return matchesSearch && matchesTopic;
    });
    return applySortOrder(saved, sortOrder);
  }, [items, savedSearchQuery, activeSavedTopic, sortOrder, applySortOrder]);

  const topics = useMemo(() => Array.from(new Set(items.filter(i => i.isSaved).map(i => i.topic || 'General'))), [items]);

  const handleCreateMagicStory = async (words: LearningItem[]) => {
    setIsGeneratingStory(true);
    setIsSelectingForStory(false);
    try {
      const story = await generateStory(words.map(w => w.text));
      setActiveStory(story);
      playSFX('success');
    } catch (e: any) {
      console.error(e);
      showGlobalError("Bé ơi, chú Ong mệt rồi, chưa viết truyện được! Thử lại sau nha!");
    }
    setIsGeneratingStory(false);
  };

  // Fix #6: Export/Import backup
  const handleExportData = () => {
    const data = { items, stories, stats, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `busybee_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playSFX('success');
  };

  const handleImportData = (data: any) => {
    if (!data || !data.items) return;
    const importedItems: LearningItem[] = (data.items || []).map((item: any) => ({
      ...item,
      userId: currentUser?.id || item.userId,
    }));
    setItems(importedItems);
    saveItemsToDB(importedItems);
    if (data.stories) setStories(data.stories);
    scheduleCloudPush(importedItems, data.stories);
    playSFX('success');
  };

  const handleLinkCode = async (newCode: string): Promise<{ success: boolean; errorType?: 'not_found' | 'firebase_error' }> => {
    const upperCode = newCode.toUpperCase();
    const status = await checkCodeExists(upperCode);
    if (status === 'error') return { success: false, errorType: 'firebase_error' };
    if (status === 'not_found') return { success: false, errorType: 'not_found' };
    const cloud = await downloadData(upperCode);
    if (cloud.items.length) {
      setItems(cloud.items);
      await saveItemsToDB(cloud.items);
    }
    if (cloud.stories.length) setStories(cloud.stories);
    if (cloud.stats) {
      setStats(prev => ({
        ...prev,
        stars: Math.max(prev.stars || 0, cloud.stats!.stars || 0),
        cardsCreated: Math.max(prev.cardsCreated || 0, cloud.stats!.cardsCreated || 0),
        unlockedStickers: Array.from(new Set([...(prev.unlockedStickers || []), ...(cloud.stats!.unlockedStickers || [])])),
      }));
    }
    setSyncCode(upperCode);
    try { localStorage.setItem(SYNC_KEY, upperCode); } catch {}
    return { success: true };
  };

  // Fix #11: Get 3 most recent unlocked stickers to show in header
  const displayStickers = useMemo(() =>
    ALL_STICKERS.filter(s => (stats.unlockedStickers || []).includes(s.id)).slice(-3),
    [stats.unlockedStickers]
  );

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (practiceGame.active) {
    return (
      <PracticeArena
        items={practiceGame.items}
        gameType={practiceGame.type}
        allItems={items}
        onExit={(res, stars) => {
          if (stars) handleRewardStars(stars);
          setPracticeGame(p => ({ ...p, active: false }));
        }}
        lang={settings.language}
      />
    );
  }

  const SortBar = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex items-center gap-2 ${compact ? '' : 'w-full md:w-auto'}`}>
      <FunnelIcon className="w-4 h-4 text-blue-300 shrink-0" />
      {(['newest', 'oldest', 'alpha'] as SortOrder[]).map(order => (
        <button
          key={order}
          onClick={() => setSortOrder(order)}
          className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${sortOrder === order ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-blue-300 border border-blue-100 hover:bg-blue-50'}`}
        >
          {t[order === 'newest' ? 'sortNewest' : order === 'oldest' ? 'sortOldest' : 'sortAlpha']}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F9FF] pb-32 lg:pb-12" style={{ paddingBottom: 'max(128px, calc(128px + env(safe-area-inset-bottom)))' }}>
      {showIntroModal && <IntroModal onClose={() => setShowIntroModal(false)} lang={settings.language} />}
      {showSettings && (
        <SettingsModal
          user={currentUser}
          settings={settings}
          stats={stats}
          onClose={() => setShowSettings(false)}
          onUpdateUser={(u) => { setCurrentUser(u); try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch {} }}
          onUpdateSettings={setSettings}
          onSelectKey={async () => { try { await (window as any).aistudio?.openSelectKey?.(); setHasCustomKey(true); } catch {} }}
          hasCustomKey={hasCustomKey}
          onExportData={handleExportData}
          onImportData={handleImportData}
          syncCode={syncCode}
          isSyncing={isSyncing}
          onSyncNow={async () => {
            const ok = await uploadData(syncCode, {
              items: items.map(({ loading, isRegeneratingImage, isRegeneratingAudio, error, ...i }: any) => i),
              stories,
              stats,
            });
            return ok;
          }}
          onLinkCode={handleLinkCode}
        />
      )}
      {showStickerBook && (
        <StickerBookModal
          stars={stats.stars}
          unlockedStickers={stats.unlockedStickers}
          stickers={ALL_STICKERS}
          onClose={() => setShowStickerBook(false)}
          onUnlock={(id, cost) => setStats(s => ({ ...s, stars: s.stars - cost, unlockedStickers: [...(s.unlockedStickers || []), id] }))}
          lang={settings.language}
        />
      )}
      {showSlideshow && <SlideshowModal items={view === 'saved' ? filteredSavedItems : filteredItems} onClose={() => setShowSlideshow(false)} lang={settings.language} />}

      {itemToSave && (
        <SaveTopicModal
          isOpen={!!itemToSave}
          itemText={items.find(i => i.id === itemToSave)?.text || ''}
          onClose={() => setItemToSave(null)}
          onConfirm={async (topic) => {
            const updated = items.map(i => i.id === itemToSave ? { ...i, isSaved: true, topic } : i);
            setItems(updated);
            const target = updated.find(i => i.id === itemToSave);
            if (target) await saveItemsToDB([target]);
            scheduleCloudPush();
            setItemToSave(null);
            playSFX('star');
          }}
          initialTopic={items.find(i => i.id === itemToSave)?.topic || ""}
          existingTopics={topics}
          lang={settings.language}
        />
      )}

      {editingItem && (
        <EditCardModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={async (id, meaning, ex) => {
            const updated = items.map(i => i.id === id ? { ...i, vietnameseTranslation: meaning, example: ex } : i);
            setItems(updated);
            const target = updated.find(i => i.id === id);
            if (target) await saveItemsToDB([target]);
            scheduleCloudPush();
            playSFX('success');
          }}
          lang={settings.language}
        />
      )}

      {activeStory && (
        <StoryModal
          data={activeStory}
          onClose={() => setActiveStory(null)}
          onSave={async (story) => {
            const newStory = { ...story, id: story.id || 'story_' + Date.now(), userId: currentUser.id };
            await saveStoryToDB(newStory);
            setStories(prev => [newStory, ...prev]);
            scheduleCloudPush();
            playSFX('success');
          }}
          isSaved={stories.some(s => s.id === activeStory.id)}
          lang={settings.language}
        />
      )}

      {zoomedImage && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 pt-safe pb-safe" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} className="max-w-full max-h-full rounded-[2.5rem] md:rounded-[4rem] shadow-2xl animate-scale-up border-4 md:border-8 border-white" />
        </div>
      )}

      {/* Daily Reminder Prompt */}
      {showNotifPrompt && (
        <NotificationPrompt
          lang={settings.language}
          onConfirm={handleNotifConfirm}
          onDismiss={handleNotifDismiss}
        />
      )}

      {/* Global Error Toast */}
      {globalError && (
        <div className="fixed bottom-28 md:bottom-8 left-1/2 -translate-x-1/2 z-[250] max-w-sm w-[90%] animate-fade-in">
          <div className="bg-orange-500 text-white px-5 py-4 rounded-[1.5rem] shadow-2xl flex items-start gap-3 border-2 border-orange-400">
            <ExclamationTriangleIcon className="w-6 h-6 shrink-0 mt-0.5" />
            <p className="font-bold text-sm leading-snug flex-1">{globalError}</p>
            <button onClick={() => setGlobalError(null)} className="shrink-0 p-1 hover:bg-white/20 rounded-lg transition-all">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-16 pt-4 md:pt-10 px-safe">
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-4 md:gap-8">
          {/* User Card with streak + stickers (#4, #5, #11) */}
          <div className="clay-card w-full md:w-auto px-6 py-3 md:px-10 md:py-6 flex items-center justify-between md:justify-start gap-4 md:gap-8 shadow-xl border-white hover:scale-[1.01] transition-all">
            <div className="flex items-center gap-3 md:gap-6">
              <div className="text-4xl md:text-8xl cursor-pointer hover:scale-110 transition-transform animate-float shrink-0" onClick={() => setShowSettings(true)}>
                {currentUser.avatar}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-4xl font-black text-blue-900 leading-tight truncate">{currentUser.name}</h1>
                <div className="flex items-center flex-wrap gap-1.5 mt-1">
                  {/* Stars */}
                  <div onClick={() => { setShowStickerBook(true); playSFX('click'); }} className="flex items-center gap-1 bg-yellow-400 px-2.5 py-1 md:px-4 md:py-1.5 rounded-full text-white font-black text-[11px] md:text-sm cursor-pointer hover:bg-yellow-500 transition-all shadow-md">
                    <StarIcon className="w-3 h-3 md:w-4 md:h-4" /> {stats.stars}
                  </div>
                  {/* Streak badge */}
                  {(stats.streak || 0) > 0 && (
                    <div className="flex items-center gap-1 bg-orange-400 px-2.5 py-1 md:px-4 md:py-1.5 rounded-full text-white font-black text-[11px] md:text-sm shadow-md">
                      <FireIcon className="w-3 h-3 md:w-4 md:h-4" /> {stats.streak}
                    </div>
                  )}
                  {/* Cards created badge */}
                  {(stats.cardsCreated || 0) > 0 && (
                    <div className="flex items-center gap-1 bg-blue-100 px-2.5 py-1 md:px-3 md:py-1 rounded-full text-blue-600 font-black text-[11px] md:text-xs shadow-sm">
                      <ChartBarIcon className="w-3 h-3 md:w-3.5 md:h-3.5" /> {stats.cardsCreated}
                    </div>
                  )}
                  {hasCustomKey && (
                    <div className="bg-indigo-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm shrink-0">
                      <KeyIcon className="w-2.5 h-2.5 md:w-3 md:h-3" /> PRO
                    </div>
                  )}
                </div>
                {/* Fix #11: Show unlocked stickers */}
                {displayStickers.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 cursor-pointer" onClick={() => { setShowStickerBook(true); playSFX('click'); }}>
                    {displayStickers.map(s => (
                      <img key={s.id} src={s.imageUrl} alt={s.name} className="w-6 h-6 md:w-9 md:h-9 object-contain drop-shadow hover:scale-125 transition-transform" title={s.name} />
                    ))}
                    {(stats.unlockedStickers || []).length > 3 && (
                      <span className="text-[10px] md:text-xs text-blue-400 font-black">+{(stats.unlockedStickers || []).length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setShowSettings(true)} className="md:hidden p-3 bg-blue-50 text-blue-500 rounded-2xl shadow-inner active:scale-90 transition-all">
              <IdentificationIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-2 bg-white/90 backdrop-blur-xl p-2 rounded-[3.5rem] shadow-lg border-2 border-white">
            {[
              { id: 'create', icon: HomeIcon, label: t.home },
              { id: 'saved', icon: HeartIcon, label: t.saved },
              { id: 'stories', icon: BookOpenIcon, label: t.myStories },
              { id: 'practice', icon: TrophyIcon, label: t.practice },
              { id: 'friend', icon: UsersIcon, label: t.aiFriend },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setView(item.id as any); playSFX('click'); setIsSelectingForStory(false); }}
                className={`px-4 lg:px-10 py-3 rounded-[3rem] font-black text-xs lg:text-lg flex flex-col items-center gap-1 transition-all ${view === item.id ? 'clay-button clay-blue text-white shadow-blue-200' : 'text-blue-300 hover:text-blue-500 hover:bg-blue-50/20'}`}
              >
                <item.icon className="w-5 h-5 lg:w-7 md:h-7" />
                <span className="uppercase tracking-wider text-[9px] lg:text-xs">{item.label}</span>
              </button>
            ))}
          </nav>
        </header>

        {/* Mobile Nav — pb-safe ensures clearance from home indicator */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pt-2 pb-safe bg-gradient-to-t from-sky-200/60 via-sky-100/40 to-transparent pointer-events-none" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
          <div className="bg-white/95 backdrop-blur-2xl p-1.5 rounded-[2.5rem] shadow-[0_-8px_20px_rgba(0,0,0,0.06)] border-[3px] border-white flex justify-between items-center pointer-events-auto max-w-lg mx-auto mb-2">
            {[
              { id: 'create', icon: HomeIcon, label: t.home },
              { id: 'saved', icon: HeartIcon, label: t.saved },
              { id: 'stories', icon: BookOpenIcon, label: t.story },
              { id: 'practice', icon: TrophyIcon, label: t.practice },
              { id: 'friend', icon: UsersIcon, label: t.aiFriend },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setView(item.id as any); playSFX('click'); setIsSelectingForStory(false); }}
                className={`flex-1 flex flex-col items-center gap-1 px-2 py-3 rounded-[2rem] transition-all duration-300 min-h-[56px] ${view === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[9px] font-black tracking-wider uppercase">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <main className="pb-16 md:pb-20">
          {/* CREATE TAB */}
          {view === 'create' && (
            <div className="animate-fade-in space-y-10 md:space-y-16">
              <div className="max-w-4xl mx-auto w-full">
                <InputArea onAdd={addItem} disabled={false} lang={settings.language} />
              </div>

              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
                  <h2 className="text-2xl md:text-5xl font-black text-blue-900 flex items-center gap-3">
                    {t.whatToLearn} <SparklesIcon className="w-8 h-8 md:w-12 md:h-12 text-yellow-400 animate-pulse" />
                  </h2>
                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 md:w-[360px]">
                        <MagnifyingGlassIcon className="w-5 h-5 md:w-7 md:h-7 absolute left-4 top-1/2 -translate-y-1/2 text-blue-200" />
                        <input
                          type="text"
                          placeholder={t.search}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 md:py-5 clay-input focus:ring-4 focus:ring-blue-100 outline-none font-black text-lg md:text-2xl text-blue-900 placeholder-blue-100"
                        />
                      </div>
                      <button onClick={() => { setShowSlideshow(true); playSFX('click'); }} className="p-4 md:p-5 clay-button clay-white text-blue-500 shadow-md border-white hover:scale-110 active:rotate-3 shrink-0">
                        <PlayIcon className="w-6 h-6 md:w-9 md:h-9" />
                      </button>
                    </div>
                    {/* Fix #10: Sort options */}
                    <SortBar />
                  </div>
                </div>

                {/* Fix #7: Empty state */}
                {filteredItems.length === 0 && !searchQuery ? (
                  <div className="py-20 text-center animate-fade-in">
                    <div className="text-8xl mb-6 animate-float">🐝</div>
                    <h3 className="text-2xl md:text-4xl font-black text-blue-300 mb-3">{t.emptyCreateTitle}</h3>
                    <p className="text-blue-200 font-bold text-base md:text-xl max-w-sm mx-auto">{t.emptyCreateDesc}</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="py-16 text-center opacity-50">
                    <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-blue-200 mb-4" />
                    <p className="text-xl font-black text-blue-300">{t.noMatches}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                    {filteredItems.map(item => (
                      <LearningCard
                        key={item.id}
                        item={item}
                        onDelete={deleteItem}
                        onRetry={() => addItem(item.text, null)}
                        onToggleSave={(id) => { setItemToSave(id); playSFX('click'); }}
                        onRegenerateImage={regenerateImage}
                        onRegenerateAudio={regenerateAudio}
                        onZoom={setZoomedImage}
                        onEdit={(id) => { const target = items.find(i => i.id === id); if (target) setEditingItem(target); }}
                        lang={settings.language}
                        accent={settings.accent}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SAVED TAB */}
          {view === 'saved' && (
            <div className="animate-fade-in space-y-8 md:space-y-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <HeartIcon className="w-10 h-10 md:w-16 md:h-16 text-pink-500 animate-float" />
                  <h2 className="text-3xl md:text-6xl font-black text-blue-900">Bộ Sưu Tập</h2>
                </div>
                <button
                  disabled={filteredSavedItems.length === 0}
                  onClick={() => { setShowSlideshow(true); playSFX('click'); }}
                  className="px-8 py-4 md:px-12 md:py-6 clay-button clay-pink text-white font-black text-lg md:text-2xl flex items-center justify-center gap-3 shadow-xl hover:scale-105 disabled:opacity-50"
                >
                  <PlayIcon className="w-7 h-7 md:w-9 md:h-9" /> {t.slideshow}
                </button>
              </div>

              {/* Fix #8: Search + Sort in Saved tab */}
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-blue-200" />
                  <input
                    type="text"
                    placeholder={t.search}
                    value={savedSearchQuery}
                    onChange={(e) => setSavedSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 clay-input focus:ring-4 focus:ring-blue-100 outline-none font-black text-lg text-blue-900 placeholder-blue-100"
                  />
                </div>
                <SortBar />
              </div>

              <div className="clay-card p-5 md:p-8 border-white bg-white/70 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <TagIcon className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
                  <span className="font-black text-blue-900 uppercase text-xs md:text-base tracking-widest">Lọc theo chủ đề</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveSavedTopic(null)}
                    className={`px-5 py-2.5 rounded-[1.5rem] font-black text-sm md:text-base transition-all ${activeSavedTopic === null ? 'bg-blue-500 text-white shadow-lg border-2 border-blue-300' : 'bg-white text-blue-400 border-2 border-blue-50 hover:bg-blue-50'}`}
                  >
                    Tất cả ({items.filter(i => i.isSaved).length})
                  </button>
                  {topics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => setActiveSavedTopic(topic)}
                      className={`px-5 py-2.5 rounded-[1.5rem] font-black text-sm md:text-base transition-all ${activeSavedTopic === topic ? 'bg-blue-500 text-white shadow-lg border-2 border-blue-300' : 'bg-white text-blue-400 border-2 border-blue-50 hover:bg-blue-50'}`}
                    >
                      {topic} ({items.filter(i => i.isSaved && (i.topic || 'General') === topic).length})
                    </button>
                  ))}
                </div>
              </div>

              {/* Fix #7: Empty state for saved */}
              {filteredSavedItems.length === 0 ? (
                <div className="py-20 text-center animate-fade-in">
                  <div className="text-7xl mb-6 animate-float">💛</div>
                  <h3 className="text-2xl md:text-3xl font-black text-blue-300 mb-3">{t.emptySavedTitle}</h3>
                  <p className="text-blue-200 font-bold text-base max-w-xs mx-auto">{t.emptySavedDesc}</p>
                  <button
                    onClick={() => setView('create')}
                    className="mt-6 px-8 py-4 clay-button clay-blue text-white font-black text-lg"
                  >
                    Tạo thẻ ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-10">
                  {filteredSavedItems.map(item => (
                    <LearningCard
                      key={item.id}
                      item={item}
                      onDelete={deleteItem}
                      onRetry={() => addItem(item.text, null)}
                      onToggleSave={(id) => {
                        const updated = items.map(i => i.id === id ? { ...i, isSaved: false } : i);
                        setItems(updated);
                        const target = updated.find(i => i.id === id);
                        if (target) saveItemsToDB([target]);
                        scheduleCloudPush();
                        playSFX('click');
                      }}
                      onRegenerateImage={regenerateImage}
                      onRegenerateAudio={regenerateAudio}
                      onZoom={setZoomedImage}
                      onEdit={(id) => { const target = items.find(i => i.id === id); if (target) setEditingItem(target); }}
                      lang={settings.language}
                      accent={settings.accent}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STORIES TAB */}
          {view === 'stories' && (
            <div className="animate-fade-in space-y-10">
              {isSelectingForStory ? (
                <StoryCreationSetup
                  savedItems={items.filter(i => i.isSaved)}
                  onConfirm={handleCreateMagicStory}
                  onCancel={() => setIsSelectingForStory(false)}
                  lang={settings.language}
                />
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <BookOpenIcon className="w-10 h-10 md:w-16 md:h-16 text-indigo-500 animate-float" />
                      <h2 className="text-3xl md:text-6xl font-black text-blue-900">Truyện Của Bé</h2>
                    </div>
                    <button
                      onClick={() => { setIsSelectingForStory(true); playSFX('click'); }}
                      className="px-8 py-4 md:px-12 md:py-6 clay-button clay-indigo text-white font-black text-lg md:text-2xl flex items-center justify-center gap-3 shadow-xl hover:scale-105"
                    >
                      <SparklesIcon className="w-7 h-7 md:w-9 md:h-9" />
                      <span>Tạo truyện thần kỳ</span>
                    </button>
                  </div>
                  {stories.length === 0 ? (
                    <div className="py-20 text-center animate-fade-in">
                      <div className="text-7xl mb-6 animate-float">📖</div>
                      <h3 className="text-2xl md:text-3xl font-black text-indigo-300 mb-3">Chưa có câu chuyện nào!</h3>
                      <p className="text-indigo-200 font-bold text-base max-w-xs mx-auto">Lưu thẻ rồi nhấn "Tạo truyện thần kỳ" để AI viết truyện cho bé nhé.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                      {stories.map(story => (
                        <div key={story.id} className="clay-card p-5 md:p-6 flex flex-col gap-5 border-white hover:scale-[1.03] transition-all group relative shadow-lg">
                          <button onClick={() => deleteStory(story.id!)} className="absolute top-5 right-5 p-2.5 bg-red-50 text-red-300 hover:text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                          <div className="aspect-video bg-indigo-50 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex items-center justify-center shadow-inner">
                            {story.scenes[0].imageUrl ? (
                              <img src={story.scenes[0].imageUrl.startsWith('data:') ? story.scenes[0].imageUrl : `data:image/jpeg;base64,${story.scenes[0].imageUrl}`} className="w-full h-full object-cover" />
                            ) : <BookOpenIcon className="w-16 h-16 md:w-20 md:h-20 text-indigo-200" />}
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl md:text-2xl font-black text-indigo-900 truncate">{story.title}</h3>
                            <p className="text-sm md:text-base text-indigo-400 font-bold line-clamp-1 italic">Vốn từ: {story.vocabulary?.join(', ')}</p>
                          </div>
                          <button onClick={() => setActiveStory(story)} className="w-full py-4 md:py-5 clay-button clay-indigo text-white font-black text-lg md:text-xl">Đọc truyện ngay</button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* PRACTICE TAB */}
          {view === 'practice' && (
            <div className="max-w-4xl mx-auto">
              <PracticeSetup
                savedItems={items.filter(i => i.isSaved)}
                onStartGame={(selected, type) => { setPracticeGame({ active: true, items: selected, type }); playSFX('click'); }}
                onCancel={() => setView('create')}
                lang={settings.language}
              />
            </div>
          )}

          {/* FRIEND TAB */}
          {view === 'friend' && (
            <div className="max-w-5xl mx-auto h-[75vh] md:h-[80vh]">
              <AIFriendModal
                userProfile={currentUser}
                lang={settings.language}
                items={items}
                onClose={() => setView('create')}
                onReward={handleRewardStars}
                fullView={true}
              />
            </div>
          )}

          {isGeneratingStory && (
            <div className="fixed inset-0 z-[300] bg-blue-900/80 backdrop-blur-2xl flex flex-col items-center justify-center text-white p-10 text-center animate-fade-in">
              <div className="w-32 h-32 md:w-56 md:h-56 bg-white/20 rounded-full flex items-center justify-center animate-pulse mb-8 border-8 border-white shadow-[0_0_80px_rgba(255,255,255,0.3)]">
                <BookOpenIcon className="w-16 h-16 md:w-28 md:h-28 text-yellow-300 animate-bounce" />
              </div>
              <p className="text-3xl md:text-6xl font-black mb-6 leading-tight">{t.paintingStory}</p>
              <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full">
                <ArrowPathIcon className="w-6 h-6 md:w-9 md:h-9 animate-spin text-blue-200" />
                <p className="text-lg md:text-2xl text-blue-100 font-bold uppercase tracking-widest">Phù thủy AI đang vẽ truyện...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
