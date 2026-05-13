
import { useState, useEffect, useRef, useCallback } from 'react';
import { UserStats, UserProfile } from '../types';
import { playSFX } from '../services/audioUtils';
import { TRANSLATIONS } from '../utils/translations';
import { LanguageType } from '../types';

const STATS_KEY = 'kidlingo_stats_clay_v2';

const DEFAULT_STATS: UserStats = {
  totalTimeSeconds: 0,
  cardsCreated: 0,
  wordsLearned: 0,
  sentencesLearned: 0,
  stars: 0,
  unlockedStickers: [],
  streak: 0,
  lastLoginDate: '',
};

export function useStats(currentUser: UserProfile | null, lang: LanguageType) {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const s = localStorage.getItem(STATS_KEY);
      return s ? JSON.parse(s) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  const [milestoneToast, setMilestoneToast] = useState<string | null>(null);
  const statsRef = useRef<UserStats>(stats);
  const t = TRANSLATIONS[lang];

  useEffect(() => { statsRef.current = stats; }, [stats]);

  // Persist to localStorage on change
  useEffect(() => {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
  }, [stats]);

  // Streak calculation on login
  useEffect(() => {
    if (!currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastLoginDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = stats.lastLoginDate === yesterday ? (stats.streak || 0) + 1 : 1;
    setStats(prev => ({ ...prev, streak: newStreak, lastLoginDate: today }));
  }, [currentUser]); // eslint-disable-line

  // Streak shield: award 1 shield every 7 days (max 3)
  useEffect(() => {
    if (!currentUser || !(stats.streak > 0) || stats.streak % 7 !== 0) return;
    const current = stats.streakShield ?? 0;
    if (current < 3) {
      setStats(prev => ({ ...prev, streakShield: Math.min(3, (prev.streakShield ?? 0) + 1) }));
    }
  }, [stats.streak]); // eslint-disable-line

  // Milestone toasts
  useEffect(() => {
    if (!currentUser || !stats.streak) return;
    const milestones = [7, 30, 100];
    const seen = stats.milestonesSeen ?? [];
    const hit = milestones.find(m => stats.streak === m && !seen.includes(m));
    if (hit) {
      const msg = hit === 7 ? t.milestone7 : hit === 30 ? t.milestone30 : t.milestone100;
      setMilestoneToast(msg);
      setStats(prev => ({ ...prev, milestonesSeen: [...(prev.milestonesSeen ?? []), hit] }));
      playSFX('success');
      setTimeout(() => setMilestoneToast(null), 5000);
    }
  }, [stats.streak]); // eslint-disable-line

  const handleRewardStars = useCallback((amount: number) => {
    setStats(prev => ({ ...prev, stars: prev.stars + amount }));
  }, []);

  return { stats, setStats, statsRef, milestoneToast, handleRewardStars };
}
