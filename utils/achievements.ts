
import { LearningItem, UserStats } from '../types';

export interface Achievement {
  id: string;
  emoji: string;
  titleVn: string;
  titleEn: string;
  descVn: string;
  descEn: string;
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  stats: UserStats;
  items: LearningItem[];
  storiesCount: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_card',
    emoji: '🐣',
    titleVn: 'Bé Mới Học',
    titleEn: 'First Step',
    descVn: 'Tạo thẻ đầu tiên',
    descEn: 'Created your first card',
    check: ({ stats }) => (stats.cardsCreated || 0) >= 1,
  },
  {
    id: 'cards_10',
    emoji: '🌱',
    titleVn: 'Bộ Sưu Tập Nhỏ',
    titleEn: 'Tiny Collection',
    descVn: 'Tạo 10 thẻ',
    descEn: 'Created 10 cards',
    check: ({ stats }) => (stats.cardsCreated || 0) >= 10,
  },
  {
    id: 'cards_50',
    emoji: '🌳',
    titleVn: 'Khu Vườn Nhỏ',
    titleEn: 'Little Garden',
    descVn: 'Tạo 50 thẻ',
    descEn: 'Created 50 cards',
    check: ({ stats }) => (stats.cardsCreated || 0) >= 50,
  },
  {
    id: 'cards_100',
    emoji: '🏆',
    titleVn: 'Nhà Sưu Tầm',
    titleEn: 'Collector',
    descVn: 'Tạo 100 thẻ',
    descEn: 'Created 100 cards',
    check: ({ stats }) => (stats.cardsCreated || 0) >= 100,
  },
  {
    id: 'streak_3',
    emoji: '🔥',
    titleVn: 'Cháy Bỏng',
    titleEn: 'On Fire',
    descVn: '3 ngày liên tiếp',
    descEn: '3-day streak',
    check: ({ stats }) => (stats.streak || 0) >= 3,
  },
  {
    id: 'streak_7',
    emoji: '⚡',
    titleVn: 'Một Tuần Hoàn Hảo',
    titleEn: 'Perfect Week',
    descVn: '7 ngày liên tiếp',
    descEn: '7-day streak',
    check: ({ stats }) => (stats.streak || 0) >= 7,
  },
  {
    id: 'streak_30',
    emoji: '👑',
    titleVn: 'Vua Kiên Trì',
    titleEn: 'Persistence King',
    descVn: '30 ngày liên tiếp',
    descEn: '30-day streak',
    check: ({ stats }) => (stats.streak || 0) >= 30,
  },
  {
    id: 'stars_50',
    emoji: '⭐',
    titleVn: 'Ngôi Sao Sáng',
    titleEn: 'Rising Star',
    descVn: 'Đạt 50 ngôi sao',
    descEn: 'Earned 50 stars',
    check: ({ stats }) => (stats.stars || 0) >= 50,
  },
  {
    id: 'stars_200',
    emoji: '✨',
    titleVn: 'Siêu Sao',
    titleEn: 'Superstar',
    descVn: 'Đạt 200 ngôi sao',
    descEn: 'Earned 200 stars',
    check: ({ stats }) => (stats.stars || 0) >= 200,
  },
  {
    id: 'master_5',
    emoji: '🎓',
    titleVn: 'Học Sinh Giỏi',
    titleEn: 'Top Student',
    descVn: 'Thành thạo 5 từ',
    descEn: 'Mastered 5 words',
    check: ({ items }) => items.filter(i => (i.proficiency || 0) >= 80).length >= 5,
  },
  {
    id: 'master_20',
    emoji: '🧠',
    titleVn: 'Bộ Não Vĩ Đại',
    titleEn: 'Brain Power',
    descVn: 'Thành thạo 20 từ',
    descEn: 'Mastered 20 words',
    check: ({ items }) => items.filter(i => (i.proficiency || 0) >= 80).length >= 20,
  },
  {
    id: 'saved_25',
    emoji: '💖',
    titleVn: 'Bộ Sưu Tập Yêu Thích',
    titleEn: 'Favorites Pack',
    descVn: 'Lưu 25 thẻ vào yêu thích',
    descEn: 'Saved 25 cards',
    check: ({ items }) => items.filter(i => i.isSaved).length >= 25,
  },
  {
    id: 'first_story',
    emoji: '📖',
    titleVn: 'Người Kể Chuyện',
    titleEn: 'Storyteller',
    descVn: 'Tạo truyện đầu tiên',
    descEn: 'Created your first story',
    check: ({ storiesCount }) => storiesCount >= 1,
  },
  {
    id: 'stories_5',
    emoji: '📚',
    titleVn: 'Thư Viện Mini',
    titleEn: 'Mini Library',
    descVn: 'Tạo 5 truyện',
    descEn: 'Created 5 stories',
    check: ({ storiesCount }) => storiesCount >= 5,
  },
];

export function checkAchievements(
  unlocked: string[],
  ctx: AchievementContext,
): Achievement[] {
  const set = new Set(unlocked);
  return ACHIEVEMENTS.filter(a => !set.has(a.id) && a.check(ctx));
}
