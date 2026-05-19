
import React, { useEffect } from 'react';
import { Achievement } from '../utils/achievements';
import { LanguageType } from '../types';

interface AchievementToastProps {
  achievement: Achievement;
  lang: LanguageType;
  onDone: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, lang, onDone }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 4200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] w-[92%] max-w-sm animate-scale-up pointer-events-none">
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white">
        <div className="w-12 h-12 bg-white/95 rounded-xl flex items-center justify-center text-2xl shrink-0 animate-bounce">
          {achievement.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-yellow-50">
            {lang === 'vn' ? 'Mở khoá thành tích' : 'Achievement unlocked'}
          </p>
          <h3 className="font-black text-base leading-tight truncate">
            {lang === 'vn' ? achievement.titleVn : achievement.titleEn}
          </h3>
          <p className="text-xs font-bold text-white/90 truncate">
            {lang === 'vn' ? achievement.descVn : achievement.descEn}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
