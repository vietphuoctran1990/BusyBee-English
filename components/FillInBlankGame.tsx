
import React, { useState, useMemo, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, TrophyIcon, StarIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import { LearningItem, LanguageType } from '../types';
import { speakWithBrowser, playSFX } from '../services/audioUtils';

interface FillInBlankGameProps {
  items: LearningItem[];
  lang: LanguageType;
  onClose: () => void;
  onComplete: (stars: number, srsUpdates: { itemId: string; update: Partial<LearningItem> }[]) => void;
}

interface Question {
  item: LearningItem;
  sentence: string;
  answer: string;
  options: string[];
}

const ROUND_SIZE = 5;

function pickQuestions(items: LearningItem[]): Question[] {
  const usable = items.filter(i => i.isSaved && i.example && i.example.toLowerCase().includes(i.text.toLowerCase()));
  if (usable.length === 0) return [];
  const pool = [...usable].sort(() => 0.5 - Math.random()).slice(0, ROUND_SIZE);
  return pool.map(item => {
    const answer = item.text;
    const re = new RegExp(`\\b${answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const sentence = item.example!.replace(re, '___');
    const wrongs = items
      .filter(i => i.id !== item.id && i.text)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(i => i.text);
    const options = [answer, ...wrongs].sort(() => 0.5 - Math.random());
    return { item, sentence, answer, options };
  });
}

function applySM2(item: LearningItem, correct: boolean): Partial<LearningItem> {
  const ef = item.srsEaseFactor ?? 2.5;
  const interval = item.srsInterval ?? 0;
  const newInterval = correct ? (interval === 0 ? 1 : interval === 1 ? 6 : Math.round(interval * ef)) : 1;
  return {
    srsInterval: newInterval,
    srsEaseFactor: correct ? Math.min(3.0, ef + 0.1) : Math.max(1.3, ef - 0.2),
    srsNextReview: Date.now() + newInterval * 86_400_000,
    proficiency: correct ? Math.min(100, (item.proficiency ?? 0) + 10) : Math.max(0, (item.proficiency ?? 0) - 10),
    updatedAt: Date.now(),
  };
}

const FillInBlankGame: React.FC<FillInBlankGameProps> = ({ items, lang, onClose, onComplete }) => {
  const questions = useMemo(() => pickQuestions(items), [items]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [srsUpdates, setSrsUpdates] = useState<{ itemId: string; update: Partial<LearningItem> }[]>([]);

  const current = questions[index];

  useEffect(() => {
    if (current) speakWithBrowser(current.item.example || '', 'en').catch(() => {});
  }, [index]); // eslint-disable-line

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 z-[200] bg-blue-900/70 backdrop-blur-md flex items-center justify-center p-5 animate-fade-in">
        <div className="bg-white p-8 max-w-sm w-full rounded-3xl text-center animate-scale-up">
          <div className="text-5xl mb-3">📝</div>
          <h3 className="text-xl font-black text-blue-900 mb-2">
            {lang === 'vn' ? 'Chưa đủ dữ liệu' : 'Not enough data'}
          </h3>
          <p className="text-blue-400 font-bold text-sm mb-6">
            {lang === 'vn' ? 'Cần ít nhất 1 thẻ đã lưu có câu ví dụ chứa từ đó' : 'Need saved cards with example sentences'}
          </p>
          <button onClick={onClose} className="w-full py-3 bg-blue-500 text-white font-black rounded-2xl">{lang === 'vn' ? 'Đóng' : 'Close'}</button>
        </div>
      </div>
    );
  }

  const handlePick = (opt: string) => {
    if (feedback !== 'none') return;
    const correct = opt === current.answer;
    setPicked(opt);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) { setScore(s => s + 1); playSFX('star'); }
    else playSFX('click');
    setSrsUpdates(prev => [...prev, { itemId: current.item.id, update: applySM2(current.item, correct) }]);

    setTimeout(() => {
      if (index < questions.length - 1) {
        setIndex(i => i + 1);
        setPicked(null);
        setFeedback('none');
      } else {
        setDone(true);
      }
    }, 1300);
  };

  if (done) {
    const stars = Math.ceil(score / 2);
    return (
      <div className="fixed inset-0 z-[200] bg-blue-900/70 backdrop-blur-md flex items-center justify-center p-5 animate-fade-in">
        <div className="bg-white p-8 max-w-sm w-full rounded-3xl text-center animate-scale-up">
          <TrophyIcon className="w-16 h-16 text-yellow-400 mx-auto mb-3 animate-bounce" />
          <h3 className="text-2xl font-black text-blue-900 mb-2">{lang === 'vn' ? 'Hoàn thành!' : 'Done!'}</h3>
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

  return (
    <div className="fixed inset-0 z-[200] bg-blue-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md max-h-[90vh] rounded-3xl flex flex-col overflow-hidden animate-scale-up">
        <div className="bg-green-500 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black">{lang === 'vn' ? 'Điền từ vào chỗ trống' : 'Fill in the Blank'}</h2>
            <p className="text-green-100 text-xs font-bold">{index + 1} / {questions.length} · ⭐ {score}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 rounded-full"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <div className="h-2 bg-green-100"><div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Image hint */}
          <div className="aspect-video bg-blue-50 rounded-2xl overflow-hidden flex items-center justify-center">
            {current.item.imageUrl
              ? <img src={`data:image/png;base64,${current.item.imageUrl}`} className="w-full h-full object-contain" alt="" />
              : <span className="text-6xl">{current.item.emoji || '📝'}</span>}
          </div>

          {/* Sentence with blank */}
          <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-4 relative">
            <button
              onClick={() => speakWithBrowser(current.item.example || '', 'en').catch(() => {})}
              className="absolute top-3 right-3 p-2 bg-white text-green-600 rounded-full shadow-sm hover:scale-110 transition-all"
            >
              <SpeakerWaveIcon className="w-4 h-4" />
            </button>
            <p className="text-lg font-black text-green-900 leading-snug pr-10">
              {current.sentence.split('___').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className={`inline-block min-w-[80px] px-3 py-1 mx-1 rounded-lg text-center ${feedback === 'correct' ? 'bg-green-500 text-white' : feedback === 'wrong' ? 'bg-red-500 text-white line-through' : 'bg-white border-2 border-dashed border-green-300 text-green-300'}`}>
                      {picked || '___'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </p>
            {feedback === 'wrong' && (
              <p className="text-green-700 text-xs font-black mt-2">
                {lang === 'vn' ? 'Đáp án đúng:' : 'Answer:'} <span className="bg-green-200 px-2 py-0.5 rounded">{current.answer}</span>
              </p>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2">
            {current.options.map(opt => {
              const isCorrect = opt === current.answer;
              const isPicked = opt === picked;
              const bg = feedback === 'none'
                ? 'bg-white border-blue-100 hover:bg-blue-50 active:scale-95'
                : isCorrect ? 'bg-green-50 border-green-400 ring-2 ring-green-300'
                : isPicked ? 'bg-red-50 border-red-300'
                : 'opacity-40 bg-white border-gray-100';
              return (
                <button
                  key={opt}
                  onClick={() => handlePick(opt)}
                  disabled={feedback !== 'none'}
                  className={`p-3 border-2 rounded-2xl font-black text-blue-900 text-base transition-all ${bg}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillInBlankGame;
