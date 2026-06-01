
import React, { useState, useMemo, useEffect } from 'react';
import { XMarkIcon, TrophyIcon, StarIcon, SpeakerWaveIcon, ArrowUturnLeftIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { LearningItem, LanguageType } from '../types';
import { speakWithBrowser, playSFX } from '../services/audioUtils';
import { applySM2 } from '../utils/srs';

interface Props {
  items: LearningItem[];
  lang: LanguageType;
  /** When true, play audio first then user arranges from memory (Listen & Arrange).
   * When false, sentence is visible (Sentence Scramble). */
  listenMode?: boolean;
  onClose: () => void;
  onComplete: (stars: number, srsUpdates: { itemId: string; update: Partial<LearningItem> }[]) => void;
}

const ROUND_SIZE = 5;
const MIN_WORDS = 3;
const MAX_WORDS = 8;

interface Question {
  item: LearningItem;
  target: string;
  words: string[]; // shuffled
  correct: string[]; // in order
}

function buildQuestions(items: LearningItem[]): Question[] {
  const candidates = items
    .filter(i => i.isSaved && i.example)
    .map(i => {
      const sentence = (i.example || '').replace(/[.?!,;:"()]/g, '').trim();
      const tokens = sentence.split(/\s+/).filter(Boolean);
      return { item: i, sentence, tokens };
    })
    .filter(c => c.tokens.length >= MIN_WORDS && c.tokens.length <= MAX_WORDS);

  return candidates
    .sort(() => 0.5 - Math.random())
    .slice(0, ROUND_SIZE)
    .map(c => {
      // Ensure shuffled order is different from original
      let shuffled = [...c.tokens];
      for (let attempt = 0; attempt < 5; attempt++) {
        shuffled = [...c.tokens].sort(() => 0.5 - Math.random());
        if (shuffled.join(' ') !== c.tokens.join(' ')) break;
      }
      return { item: c.item, target: c.sentence, words: shuffled, correct: c.tokens };
    });
}

const SentenceScrambleGame: React.FC<Props> = ({ items, lang, listenMode = false, onClose, onComplete }) => {
  const questions = useMemo(() => buildQuestions(items), [items]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [arranged, setArranged] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [done, setDone] = useState(false);
  const [revealed, setRevealed] = useState(!listenMode);
  const [srsUpdates, setSrsUpdates] = useState<{ itemId: string; update: Partial<LearningItem> }[]>([]);

  const current = questions[index];

  useEffect(() => {
    if (!current) return;
    setArranged([]);
    setAvailable(current.words.map((w, i) => `${i}:${w}`));
    setFeedback('none');
    setRevealed(!listenMode);
    if (listenMode) {
      // Play audio immediately, allow ‘peek’ after first attempt
      setTimeout(() => speakWithBrowser(current.target, 'en').catch(() => {}), 300);
    }
  }, [index, current, listenMode]);

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 z-[200] bg-blue-900/70 backdrop-blur-md flex items-center justify-center p-5 animate-fade-in">
        <div className="bg-white p-8 max-w-sm w-full rounded-3xl text-center animate-scale-up">
          <div className="text-5xl mb-3">📝</div>
          <h3 className="text-xl font-black text-blue-900 mb-2">
            {lang === 'vn' ? 'Chưa đủ câu' : 'Not enough sentences'}
          </h3>
          <p className="text-blue-400 font-bold text-sm mb-6">
            {lang === 'vn' ? 'Cần thẻ đã lưu có câu ví dụ 3-8 từ' : 'Need saved cards with 3-8 word example sentences'}
          </p>
          <button onClick={onClose} className="w-full py-3 bg-blue-500 text-white font-black rounded-2xl">{lang === 'vn' ? 'Đóng' : 'Close'}</button>
        </div>
      </div>
    );
  }

  const handleAddWord = (token: string) => {
    if (feedback !== 'none') return;
    setArranged(a => [...a, token]);
    setAvailable(av => av.filter(t => t !== token));
    playSFX('click');
  };

  const handleRemoveWord = (idx: number) => {
    if (feedback !== 'none') return;
    const token = arranged[idx];
    setArranged(a => a.filter((_, i) => i !== idx));
    setAvailable(av => [...av, token]);
  };

  const handleSubmit = () => {
    if (arranged.length !== current.correct.length) return;
    const userSentence = arranged.map(t => t.split(':')[1]).join(' ');
    const correct = userSentence.toLowerCase().trim() === current.target.toLowerCase().trim();
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) { setScore(s => s + 1); playSFX('star'); }
    else playSFX('click');
    setSrsUpdates(prev => [...prev, { itemId: current.item.id, update: applySM2(current.item, correct) }]);

    if (correct) speakWithBrowser(current.target, 'en').catch(() => {});

    setTimeout(() => {
      if (index < questions.length - 1) setIndex(i => i + 1);
      else setDone(true);
    }, 1700);
  };

  const handleReset = () => {
    if (feedback !== 'none') return;
    setArranged([]);
    setAvailable(current.words.map((w, i) => `${i}:${w}`));
  };

  if (done) {
    const stars = Math.ceil(score / 2);
    return (
      <div className="fixed inset-0 z-[200] bg-blue-900/70 backdrop-blur-md flex items-center justify-center p-5 animate-fade-in">
        <div className="bg-white p-8 max-w-sm w-full rounded-3xl text-center animate-scale-up">
          <TrophyIcon className="w-16 h-16 text-yellow-400 mx-auto mb-3 animate-bounce" />
          <h3 className="text-2xl font-black text-blue-900 mb-2">{lang === 'vn' ? 'Tuyệt!' : 'Great!'}</h3>
          <p className="text-blue-400 font-bold mb-4">{score}/{questions.length} {lang === 'vn' ? 'đúng' : 'correct'}</p>
          <div className="flex items-center justify-center gap-2 bg-yellow-50 rounded-2xl p-3 mb-6">
            <StarIcon className="w-7 h-7 text-yellow-500" />
            <span className="text-xl font-black text-yellow-700">+{stars} {lang === 'vn' ? 'sao' : 'stars'}</span>
          </div>
          <button onClick={() => onComplete(stars, srsUpdates)} className="w-full py-4 bg-blue-500 text-white font-black rounded-2xl shadow-lg">{lang === 'vn' ? 'Nhận thưởng' : 'Claim'}</button>
        </div>
      </div>
    );
  }

  const headerColor = listenMode ? 'bg-purple-500' : 'bg-orange-500';
  const accentBg = listenMode ? 'bg-purple-50 border-purple-100' : 'bg-orange-50 border-orange-100';
  const accentText = listenMode ? 'text-purple-700' : 'text-orange-700';

  return (
    <div className="fixed inset-0 z-[200] bg-blue-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md max-h-[92vh] rounded-3xl flex flex-col overflow-hidden animate-scale-up">
        <div className={`${headerColor} px-5 py-4 text-white flex items-center justify-between shrink-0`}>
          <div>
            <h2 className="text-lg font-black">
              {listenMode
                ? (lang === 'vn' ? 'Nghe & Sắp Xếp' : 'Listen & Arrange')
                : (lang === 'vn' ? 'Sắp Xếp Câu' : 'Sentence Scramble')}
            </h2>
            <p className="text-white/80 text-xs font-bold">{index + 1} / {questions.length} · ⭐ {score}</p>
          </div>
          <button onClick={onClose} aria-label="Đóng" className="p-2 bg-white/20 rounded-full"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <div className={`h-2 ${listenMode ? 'bg-purple-100' : 'bg-orange-100'}`}>
          <div className={`h-full ${headerColor} transition-all duration-500`} style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Audio control */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => speakWithBrowser(current.target, 'en').catch(() => {})}
              className={`p-4 ${listenMode ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'} rounded-2xl shadow-sm hover:scale-105 active:scale-95 transition-all`}
            >
              <SpeakerWaveIcon className="w-7 h-7" />
            </button>
            <div className="text-xs font-black text-blue-400 uppercase tracking-widest">
              {listenMode ? (lang === 'vn' ? 'Nghe rồi sắp xếp' : 'Listen, then arrange') : (lang === 'vn' ? 'Sắp xếp câu' : 'Arrange the words')}
            </div>
          </div>

          {/* Target sentence (only when not listenMode, or after submitted) */}
          {revealed && (
            <div className={`p-3 rounded-2xl border-2 ${accentBg}`}>
              <p className={`text-sm font-black ${accentText} text-center`}>{current.target}</p>
            </div>
          )}
          {listenMode && !revealed && (
            <button onClick={() => setRevealed(true)} className="text-xs font-black text-blue-400 underline w-full text-center">
              {lang === 'vn' ? 'Xem câu (giảm sao)' : 'Reveal sentence (less stars)'}
            </button>
          )}

          {/* Arranged area */}
          <div className={`min-h-[80px] p-3 rounded-2xl border-2 border-dashed flex flex-wrap gap-2 items-center transition-all ${
            feedback === 'correct' ? 'bg-green-50 border-green-400'
            : feedback === 'wrong' ? 'bg-red-50 border-red-300'
            : 'bg-blue-50 border-blue-200'
          }`}>
            {arranged.length === 0 ? (
              <p className="text-blue-300 font-bold text-sm w-full text-center">
                {lang === 'vn' ? 'Chạm vào từ bên dưới để sắp xếp' : 'Tap words below to arrange'}
              </p>
            ) : (
              arranged.map((token, idx) => (
                <button
                  key={token + idx}
                  onClick={() => handleRemoveWord(idx)}
                  disabled={feedback !== 'none'}
                  className="px-3 py-1.5 bg-white text-blue-900 font-black text-sm rounded-xl shadow-sm border border-blue-100 active:scale-95"
                >
                  {token.split(':')[1]}
                </button>
              ))
            )}
          </div>

          {/* Available pool */}
          <div className="flex flex-wrap gap-2 justify-center">
            {available.map(token => (
              <button
                key={token}
                onClick={() => handleAddWord(token)}
                disabled={feedback !== 'none'}
                className={`px-3 py-2 ${headerColor} text-white font-black text-sm rounded-xl shadow-md active:scale-95 transition-all`}
              >
                {token.split(':')[1]}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {feedback !== 'none' && (
            <div className={`text-center font-black text-base py-2 animate-fade-in ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
              {feedback === 'correct' ? '✓ ' + (lang === 'vn' ? 'Đúng rồi!' : 'Correct!') : '✗ ' + current.target}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-gray-100 shrink-0 flex gap-2">
          <button
            onClick={handleReset}
            disabled={arranged.length === 0 || feedback !== 'none'}
            className="px-4 py-3 bg-gray-100 text-gray-500 font-black rounded-2xl disabled:opacity-40 active:scale-95 transition-all"
          >
            <ArrowUturnLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={arranged.length !== current.correct.length || feedback !== 'none'}
            className={`flex-1 py-3 ${headerColor} text-white font-black rounded-2xl shadow-lg disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2`}
          >
            <CheckCircleIcon className="w-5 h-5" />
            {lang === 'vn' ? 'Kiểm tra' : 'Check'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SentenceScrambleGame;
