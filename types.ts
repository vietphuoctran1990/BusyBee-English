
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
  isSaved?: boolean;
  proficiency?: number;
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