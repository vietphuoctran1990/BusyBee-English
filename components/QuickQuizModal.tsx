
import React, { useState, useMemo, useEffect } from 'react';
import { XMarkIcon, StarIcon, TrophyIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import { LearningItem, LanguageType } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { speakWithBrowser } from '../services/audioUtils';
import { applySM2 } from '../utils/srs';

interface QuickQuizModalProps {
  items: LearningItem[];
  lang: LanguageType;
  onClose: () => void;
  onComplete: (stars: number, srsUpdates: { itemId: string; update: Partial<LearningItem> }[]) => void;
}

const QUIZ_SIZE = 5;

const QuickQuizModal: React.FC<QuickQuizModalProps> = ({ items, lang, onClose, onComplete }) => {
  const t = TRANSLATIONS[lang];

  // Pick quiz items: prefer SRS-due items, then lowest proficiency, then random
  const quizItems = useMemo(() => {
    const saved = items.filter(i => i.isSaved && !i.loading);
    if (saved.length === 0) return [];
    const now = Date.now();
    const due = saved.filter(i => !i.srsNextReview || i.srsNextReview <= now);
    const pool = due.length >= QUIZ_SIZE
      ? due
      : [...due, ...saved.filter(i => i.srsNextReview && i.srsNextReview > now)
          .sort((a, b) => (a.proficiency ?? 50) - (b.proficiency ?? 50))];
    return pool.sort(() => 0.5 - Math.random()).slice(0, QUIZ_SIZE);
  }, [items]);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [options, setOptions] = useState<LearningItem[]>([]);
  const [done, setDone] = useState(false);
  const [srsUpdates, setSrsUpdates] = useState<{ itemId: string; update: Partial<LearningItem> }[]>([]);

  const current = quizItems[index];

  useEffect(() => {
    if (!current) return;
    const others = items
      .filter(i => i.id !== current.id && i.isSaved && !i.loading)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setOptions([...others, current].sort(() => 0.5 - Math.random()));
    setFeedback('none');
    setTimeout(() => speakWithBrowser(current.text, 'en').catch(() => {}), 400);
  }, [index, current]);

  if (quizItems.length === 0) {
    return (
      <div className="fixed inset-0 z-[200] bg-blue-900/70 backdrop-blur-md flex items-center justify-center p-5 animate-fade-in">
        <div className="clay-card bg-white p-8 max-w-sm w-full text-center animate-scale-up">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-black text-blue-900 mb-2">{t.emptySavedTitle}</h3>
          <p className="text-blue-400 font-bold text-sm mb-6">{t.emptySavedDesc}</p>
          <button onClick={onClose} className="w-full py-3 bg-blue-500 text-white font-black rounded-2xl">{t.cancel}</button>
        </div>
      </div>
    );
  }

  const handleChoice = (item: LearningItem) => {
    if (feedback !== 'none') return;
    const correct = item.id === current.id;
    if (correct) {
      setScore(s => s + 1);
      setFeedback('correct');
      try { navigator.vibrate?.([30, 20, 80]); } catch {}
    } else {
      setFeedback('wrong');
      try { navigator.vibrate?.(100); } catch {}
    }
    setSrsUpdates(prev => [...prev, { itemId: current.id, update: applySM2(current, correct) }]);
    setTimeout(() => {
      if (index < quizItems.length - 1) {
        setIndex(i => i + 1);
      } else {
        setDone(true);
      }
    }, 1200);
  };

  if (done) {
    const stars = Math.ceil(score / 2);
    return (
      <div className="fixed inset-0 z-[200] bg-blue-900/70 backdrop-blur-md flex items-center justify-center p-5 animate-fade-in">
        <div className="clay-card bg-white p-8 max-w-sm w-full text-center animate-scale-up">
          <TrophyIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
          <h3 className="text-2xl font-black text-blue-900 mb-2">{t.quickQuizResult}</h3>
          <p className="text-blue-400 font-bold mb-4">{t.youGot} {score}/{quizItems.length} {t.correct}</p>
          <div className="flex items-center justify-center gap-2 bg-yellow-50 rounded-2xl p-4 mb-6">
            <StarIcon className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-black text-yellow-700">+{stars} {t.stars}</span>
          </div>
          <button
            onClick={() => onComplete(stars, srsUpdates)}
            className="w-full py-4 bg-blue-500 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            {t.claimFinish}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-blue-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="clay-card bg-white w-full max-w-md animate-scale-up overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between text-white">
          <div>
            <h2 className="font-black text-lg">{t.quickQuiz}</h2>
            <p className="text-indigo-200 text-sm font-bold">{index + 1} / {quizItems.length}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl">
              <StarIcon className="w-4 h-4 text-yellow-300" />
              <span className="font-black text-sm">{score}</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-indigo-100">
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${((index + 1) / quizItems.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => speakWithBrowser(current.text, 'en').catch(() => {})}
              className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl hover:bg-indigo-200 transition-colors active:scale-95"
            >
              <SpeakerWaveIcon className="w-7 h-7" />
            </button>
            <div className="text-center">
              <p className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-1">
                {lang === 'vn' ? 'Đây là hình gì?' : 'Which picture matches?'}
              </p>
            </div>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-3">
            {options.map(opt => {
              const isCorrect = opt.id === current.id;
              const bgClass = feedback === 'none'
                ? 'hover:scale-105 active:scale-95 bg-white border-blue-100'
                : isCorrect
                  ? 'bg-green-50 border-green-400 ring-4 ring-green-300 scale-105'
                  : feedback === 'wrong' && !isCorrect
                    ? 'opacity-30 bg-white border-gray-100'
                    : 'bg-red-50 border-red-300';

              return (
                <button
                  key={opt.id}
                  onClick={() => handleChoice(opt)}
                  disabled={feedback !== 'none'}
                  className={`aspect-square clay-card p-2 border-2 transition-all ${bgClass} flex items-center justify-center overflow-hidden`}
                >
                  {opt.imageUrl ? (
                    <img
                      src={`data:image/png;base64,${opt.imageUrl}`}
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                      alt=""
                    />
                  ) : (
                    <span className="text-4xl">{opt.emoji || '?'}</span>
                  )}
                </button>
              );
            })}
          </div>

          {feedback !== 'none' && (
            <div className={`text-center font-black text-lg animate-fade-in py-2 ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
              {feedback === 'correct' ? '✓ ' + (lang === 'vn' ? 'Đúng rồi!' : 'Correct!') : '✗ ' + current.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickQuizModal;
