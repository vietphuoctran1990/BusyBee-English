
import React, { useMemo } from 'react';
import { XMarkIcon, StarIcon, FireIcon, BoltIcon } from '@heroicons/react/24/solid';
import { LearningItem, LanguageType } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface DailyChallengeModalProps {
  items: LearningItem[];
  lang: LanguageType;
  alreadyDone: boolean;
  onClose: () => void;
  onStart: (challengeItems: LearningItem[]) => void;
}

const CHALLENGE_SIZE = 5;

const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  items, lang, alreadyDone, onClose, onStart,
}) => {
  const t = TRANSLATIONS[lang];

  const challengeItems = useMemo(() => {
    const saved = items.filter(i => i.isSaved && !i.loading);
    if (saved.length === 0) return [];
    const now = Date.now();
    // Prefer SRS-due, then lowest proficiency
    const due = saved.filter(i => !i.srsNextReview || i.srsNextReview <= now);
    const rest = saved
      .filter(i => i.srsNextReview && i.srsNextReview > now)
      .sort((a, b) => (a.proficiency ?? 50) - (b.proficiency ?? 50));
    return [...due, ...rest]
      .sort(() => 0.5 - Math.random())
      .slice(0, CHALLENGE_SIZE);
  }, [items]);

  return (
    <div
      className="fixed inset-0 z-[200] bg-blue-900/70 backdrop-blur-md flex items-center justify-center p-5 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="clay-card bg-white w-full max-w-sm animate-scale-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-400 px-6 py-5 text-white relative overflow-hidden">
          <div className="absolute -top-4 -right-4 text-7xl opacity-20">🔥</div>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-full transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <FireIcon className="w-7 h-7 text-white" />
            <h2 className="text-xl font-black">{t.dailyChallenge}</h2>
          </div>
          <p className="text-orange-100 font-bold text-sm">{t.dailyChallengeDesc}</p>
        </div>

        <div className="p-6 space-y-5">
          {alreadyDone ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="text-lg font-black text-green-600 mb-2">{t.dailyChallengeComplete}</h3>
              <p className="text-gray-400 font-bold text-sm">{t.dailyChallengeAlreadyDone}</p>
            </div>
          ) : (
            <>
              {/* Bonus indicator */}
              <div className="flex items-center gap-3 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
                <div className="p-2 bg-yellow-400 rounded-xl">
                  <BoltIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-yellow-800 text-sm">
                    {lang === 'vn' ? 'Thưởng x2 Ngôi Sao' : '2x Star Bonus'}
                  </p>
                  <p className="text-yellow-600 text-xs font-bold">
                    {lang === 'vn' ? 'Hoàn thành để nhận gấp đôi sao hôm nay!' : 'Complete to earn double stars today!'}
                  </p>
                </div>
              </div>

              {/* Cards preview */}
              <div>
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">
                  {lang === 'vn' ? `${challengeItems.length} thẻ cần ôn` : `${challengeItems.length} cards to review`}
                </p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {challengeItems.map(item => (
                    <div
                      key={item.id}
                      className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-blue-50 border-2 border-blue-100 flex items-center justify-center"
                    >
                      {item.imageUrl ? (
                        <img
                          src={`data:image/png;base64,${item.imageUrl}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          alt=""
                        />
                      ) : (
                        <span className="text-xl">{item.emoji || '📝'}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stars earned indicator */}
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400">
                <StarIcon className="w-4 h-4 text-yellow-400" />
                <span>{lang === 'vn' ? 'Tối đa' : 'Up to'}</span>
                <span className="font-black text-yellow-600">{Math.ceil(CHALLENGE_SIZE / 2) * 2} {t.stars}</span>
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 font-black text-gray-400 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 transition-all"
            >
              {t.cancel}
            </button>
            {!alreadyDone && challengeItems.length > 0 && (
              <button
                onClick={() => onStart(challengeItems)}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all"
              >
                {t.start} 🔥
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallengeModal;
