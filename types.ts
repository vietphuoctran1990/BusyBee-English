
export interface LearningItem {
  id: string;
  userId: string;
  text: string;
  type: 'word' | 'sentence';
  imageUrl?: string;
  emoji?: string;
  audioBase64?: string;
  phonetic?: string;
  vietnameseTranslation?: string;
  example?: string;
  topic?: string;
  loading: boolean;
  isRegeneratingImage?: boolean;
  isRegeneratingAudio?: boolean;
  imageStyle?: 'default' | '3d-dynamic';
  error?: string;
  createdAt: number;
  updatedAt?: number;
  isSaved?: boolean;
  proficiency?: number;
  // SRS (Spaced Repetition System — SM-2)
  srsInterval?: number;    // days until next review
  srsEaseFactor?: number;  // 1.3–2.5, default 2.5
  srsNextReview?: number;  // timestamp
  // Word family suggestions
  wordFamilies?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  age: string;
  gender: 'boy' | 'girl';
  avatar: string;
  preferredLanguage: LanguageType;
}

export interface AppSettings {
  accent: AccentType;
  language: LanguageType;
  fontSize?: 'S' | 'M' | 'L';
  darkMode?: boolean;
  cardLayout?: 'grid' | 'list';
}

export interface UserStats {
  totalTimeSeconds: number;
  cardsCreated: number;
  wordsLearned: number;
  sentencesLearned: number;
  stars: number;
  unlockedStickers: string[];
  streak: number;
  lastLoginDate: string;
  streakShield?: number;       // number of shields available (max 3)
  lastChallengeDate?: string;  // ISO date of last completed daily challenge
  milestonesSeen?: number[];   // streak milestones already celebrated
  // Weekly activity: array of 7 numbers (cards created per day, oldest first)
  weeklyActivity?: number[];
  // Achievement IDs the user has unlocked
  achievements?: string[];
}

export type GameType = 'listening' | 'speaking' | 'spelling';
export type AccentType = 'US' | 'UK';
export type LanguageType = 'en' | 'vn';

export interface Sticker {
  id: string;
  imageUrl: string;
  name: string;
  cost: number;
  bg: string;
}

export interface StoryScene {
  text: string;
  vietnamese: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface StoryData {
  id?: string;
  userId: string;
  title: string;
  characterDescription?: string;
  scenes: StoryScene[];
  vocabulary?: string[];
  createdAt?: number;
}

export type FriendMode = 'chat' | 'voice' | 'video';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Deck {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  color: string;
  itemIds: string[];
  createdAt: number;
}
