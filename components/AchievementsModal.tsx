
import React from 'react';
import { XMarkIcon, TrophyIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { LanguageType, LearningItem, UserStats } from '../types';
import { ACHIEVEMENTS } from '../utils/achievements';

interface AchievementsModalProps {
  stats: UserStats;
  items: LearningItem[];
  storiesCount: number;
  lang: LanguageType;
  onClose: () => void;
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({ stats, items, storiesCount, lang, onClose }) => {
  const unlocked = new Set(stats.achievements ?? []);
  const ctx = { stats, items, storiesCount };

  return (
    <div
      className="fixed inset-0 z-[200] bg-blue-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="clay-card bg-white w-full max-w-md max-h-[85vh] flex flex-col animate-scale-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <TrophyIcon className="w-7 h-7" />
            <div>
              <h2 className="text-xl font-black">{lang === 'vn' ? 'Thành Tích' : 'Achievements'}</h2>
              <p className="text-orange-100 text-xs font-bold">
                {unlocked.size} / {ACHIEVEMENTS.length} {lang === 'vn' ? 'đã đạt' : 'unlocked'}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Đóng" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {ACHIEVEMENTS.map(a => {
            const isUnlocked = unlocked.has(a.id);
            const eligible = a.check(ctx);
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm'
                    : 'bg-gray-50 border-gray-100 opacity-70'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked ? 'bg-white shadow-sm' : 'bg-gray-200 grayscale'
                  }`}
                >
                  {isUnlocked ? a.emoji : <LockClosedIcon className="w-5 h-5 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-black text-sm leading-tight ${isUnlocked ? 'text-orange-700' : 'text-gray-500'}`}>
                    {lang === 'vn' ? a.titleVn : a.titleEn}
                  </h3>
                  <p className={`text-xs font-bold leading-tight ${isUnlocked ? 'text-orange-500' : 'text-gray-400'}`}>
                    {lang === 'vn' ? a.descVn : a.descEn}
                  </p>
                </div>
                {isUnlocked && (
                  <span className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-1 rounded-lg uppercase">
                    {lang === 'vn' ? 'Đã đạt' : 'Done'}
                  </span>
                )}
                {!isUnlocked && eligible && (
                  <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded-lg uppercase animate-pulse">
                    {lang === 'vn' ? 'Sẵn sàng' : 'Ready'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsModal;
