
import React, { useState, useEffect, useRef } from 'react';
import { LearningItem, GameType, LanguageType } from '../types';
import { SpeakerWaveIcon, CheckCircleIcon, XCircleIcon, TrophyIcon, MicrophoneIcon, StarIcon, XMarkIcon, LanguageIcon, ArrowPathIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { speakWithBrowser, playSFX } from '../services/audioUtils';
import { TRANSLATIONS } from '../utils/translations';

interface PracticeArenaProps {
  items: LearningItem[];
  gameType: GameType;
  allItems: LearningItem[];
  onExit: (results?: { itemId: string; success: boolean }[], starsEarned?: number) => void;
  lang: LanguageType;
  starsMultiplier?: number; // 2 for daily challenge bonus
}

// Haptic feedback helper
const haptic = (pattern: number | number[]) => {
  try { navigator.vibrate?.(pattern); } catch {}
};

// SM-2 spaced repetition update
function applySM2(item: LearningItem, correct: boolean): Partial<LearningItem> {
  const easeFactor = item.srsEaseFactor ?? 2.5;
  let interval = item.srsInterval ?? 0;
  let newEase = easeFactor;
  let newInterval: number;
  if (correct) {
    if (interval === 0) newInterval = 1;
    else if (interval === 1) newInterval = 6;
    else newInterval = Math.round(interval * easeFactor);
    newEase = Math.min(3.0, easeFactor + 0.1);
  } else {
    newInterval = 1;
    newEase = Math.max(1.3, easeFactor - 0.2);
  }
  return {
    srsInterval: newInterval,
    srsEaseFactor: newEase,
    srsNextReview: Date.now() + newInterval * 86_400_000,
    proficiency: correct
      ? Math.min(100, (item.proficiency ?? 0) + 10)
      : Math.max(0, (item.proficiency ?? 0) - 10),
    updatedAt: Date.now(),
  };
}

const PracticeArena: React.FC<PracticeArenaProps> = ({ items, gameType, allItems, onExit, lang, starsMultiplier = 1 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [srsUpdates, setSrsUpdates] = useState<{ itemId: string; update: Partial<LearningItem> }[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [shuffledOptions, setShuffledOptions] = useState<LearningItem[]>([]);
  const [userSpelling, setUserSpelling] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [canInteract, setCanInteract] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [speakingScore, setSpeakingScore] = useState<number | null>(null);

  const isTransitioning = useRef(false);

  const calcSimilarity = (a: string, b: string): number => {
    const norm = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
    const na = norm(a);
    const nb = norm(b);
    if (na === nb) return 1.0;
    if (na.includes(nb) || nb.includes(na)) return 0.9;
    const setA = new Set(na.split(''));
    const setB = new Set(nb.split(''));
    const intersection = [...setA].filter(c => setB.has(c)).length;
    return intersection / Math.max(setA.size, setB.size);
  };

  const recognitionRef = useRef<any>(null);
  const currentItem = items[currentIndex];
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (!currentItem || isFinished) return;

    setFeedback('none');
    setUserSpelling('');
    setTranscript('');
    setShowHint(false);
    setSpeakingScore(null);
    setCanInteract(false);
    isTransitioning.current = false;

    if (gameType === 'listening') {
      const others = allItems
        .filter(i => i.id !== currentItem.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      const newOptions = [...others, currentItem].sort(() => 0.5 - Math.random());
      setShuffledOptions(newOptions);

      const timer = setTimeout(() => {
        speakWithBrowser(currentItem.text).then(() => {
          setCanInteract(true);
        });
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setCanInteract(true);
    }

    if (gameType === 'speaking') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const result = event.results[0][0].transcript.toLowerCase().trim();
          const target = currentItem.text.toLowerCase().trim();
          setTranscript(result);

          const sim = calcSimilarity(result, target);
          const sc = Math.round(sim * 100);
          setSpeakingScore(sc);

          if (sim >= 0.75) {
            handleNext(true);
          } else {
            setFeedback('incorrect');
            playSFX('click');
            setTimeout(() => {
              if (!isTransitioning.current) {
                setFeedback('none');
                setSpeakingScore(null);
              }
            }, 2200);
          }
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
          setFeedback('incorrect');
          setTimeout(() => {
            if (!isTransitioning.current) setFeedback('none');
          }, 1500);
        };

        recognitionRef.current.onend = () => setIsListening(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [currentIndex, gameType, allItems, isFinished]);

  const handleNext = (success: boolean) => {
    if (isTransitioning.current || feedback === 'correct') return;
    isTransitioning.current = true;

    // Record SRS update
    if (currentItem) {
      const update = applySM2(currentItem, success);
      setSrsUpdates(prev => [...prev, { itemId: currentItem.id, update }]);
    }

    if (success) {
      setScore(s => s + 1);
      playSFX('star');
      haptic([30, 20, 80]);
      setFeedback('correct');
    } else {
      playSFX('click');
      haptic(100);
      setFeedback('incorrect');
    }

    setTimeout(() => {
      if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  const startSpeakingTest = () => {
    if (!recognitionRef.current || isListening || feedback === 'correct') return;
    setTranscript('');
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  if (isFinished) {
    const baseStars = Math.ceil(score / 2);
    const stars = baseStars * starsMultiplier;
    const results = srsUpdates.map(u => ({ itemId: u.itemId, success: (u.update.proficiency ?? 0) > 0, srsUpdate: u.update }));
    return (
      <div className="fixed inset-0 bg-[#F0F9FF] flex flex-col items-center justify-center p-6 text-center animate-scale-up z-[200] safe-inset">
        <TrophyIcon className="w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 text-yellow-400 mb-4 md:mb-6 animate-bounce" />
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-indigo-900 mb-3">{t.greatJob}</h2>
        <p className="text-base sm:text-lg md:text-2xl text-indigo-500 font-bold mb-6">{t.youGot} {score}/{items.length} {t.correct}</p>
        <div className="clay-card p-5 md:p-10 bg-yellow-50 flex items-center gap-4 md:gap-6 mb-8 animate-float mx-auto shadow-xl">
          <StarIcon className="w-8 h-8 md:w-14 md:h-14 text-yellow-500" />
          <span className="text-xl md:text-4xl font-black text-yellow-700">+{stars} {t.stars}!</span>
          {starsMultiplier > 1 && <span className="text-sm font-black text-orange-500 bg-orange-100 px-2 py-1 rounded-xl">x{starsMultiplier}</span>}
        </div>
        <button
          onClick={() => onExit(results as any, stars)}
          className="px-8 py-4 md:px-16 md:py-6 clay-button clay-indigo text-white font-black text-lg md:text-2xl shadow-2xl transition-transform hover:scale-105 active:scale-95"
        >
          Xong rồi! 🚀
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#F0F9FF] flex flex-col safe-inset overflow-hidden">
      {/* Exit Confirmation */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[200] bg-blue-900/70 backdrop-blur-md flex items-center justify-center p-5 animate-fade-in">
          <div className="clay-card bg-white p-6 md:p-10 max-w-sm w-full text-center animate-scale-up">
            <div className="text-4xl mb-3">🤔</div>
            <h3 className="text-xl md:text-2xl font-black text-blue-900 mb-2">{t.exitConfirmTitle}</h3>
            <p className="text-blue-400 font-bold mb-6 text-sm">{t.exitConfirmMsg}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 clay-button clay-blue text-white font-black text-base"
              >
                {t.keepPlaying}
              </button>
              <button
                onClick={() => onExit()}
                className="flex-1 py-3 bg-red-100 text-red-500 rounded-[1.5rem] font-black text-base hover:bg-red-200 transition-all"
              >
                {t.endPractice}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="w-full max-w-[1440px] mx-auto px-3 py-2 sm:px-4 sm:py-3 md:py-5 flex items-center gap-2 sm:gap-4 md:gap-8 shrink-0 border-b border-blue-100 bg-white/60 backdrop-blur-sm">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-2 md:px-6 md:py-3 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition-all active:scale-95 shadow-md font-black text-xs md:text-base border-2 border-red-200 shrink-0 min-h-[44px]"
        >
          <XMarkIcon className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
          <span className="hidden sm:inline">{t.endPractice}</span>
        </button>

        <div className="flex-1 flex items-center gap-2 md:gap-4 min-w-0">
          <span className="font-black text-indigo-500 text-xs sm:text-sm md:text-lg shrink-0">
            {currentIndex + 1}/{items.length}
          </span>
          <div className="flex-1 h-2.5 sm:h-3 md:h-5 bg-white rounded-full p-0.5 shadow-inner border border-white overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-yellow-100 px-3 py-2 md:px-5 md:py-3 rounded-2xl border-2 border-yellow-200 flex items-center gap-1.5 shrink-0 shadow-sm min-h-[44px]">
          <StarIcon className="w-4 h-4 md:w-6 md:h-6 text-yellow-500" />
          <span className="font-black text-yellow-700 text-sm md:text-xl">{score}</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 sm:px-4 md:px-6 pb-4">
        <div className="max-w-[1440px] mx-auto w-full min-h-full flex flex-col items-center justify-center relative py-4">

          {/* Hint button */}
          <button
            onClick={() => setShowHint(!showHint)}
            className={`absolute top-2 right-0 px-3 py-2 rounded-2xl shadow-md transition-all border-2 flex items-center gap-2 font-black z-20 text-xs md:text-base min-h-[44px] ${showHint ? 'bg-orange-500 text-white border-white' : 'bg-white text-orange-500 border-orange-100'}`}
          >
            <LanguageIcon className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
            <span className="max-w-[120px] truncate">{showHint ? (currentItem.vietnameseTranslation || '?') : (lang === 'vn' ? 'Dịch' : 'Hint')}</span>
          </button>

          {/* ══ LISTENING GAME ══ */}
          {gameType === 'listening' && (
            <div className="w-full max-w-3xl space-y-5 md:space-y-10 mt-8">
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => speakWithBrowser(currentItem.text)}
                  disabled={feedback !== 'none' || !canInteract}
                  className={`w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 clay-button clay-blue text-white flex items-center justify-center shadow-xl transition-all active:rotate-12 ${feedback !== 'none' || !canInteract ? 'opacity-50 grayscale' : 'hover:scale-110'}`}
                >
                  <SpeakerWaveIcon className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20" />
                </button>
                <p className="text-indigo-300 font-black text-xs md:text-base uppercase tracking-widest animate-pulse">
                  {lang === 'vn' ? 'Lắng nghe thật kỹ...' : 'Listen carefully...'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full">
                {shuffledOptions.map(opt => (
                  <button
                    key={opt.id}
                    disabled={feedback !== 'none' || !canInteract}
                    onClick={() => handleListeningChoice(opt.id === currentItem.id)}
                    className={`clay-card p-2 sm:p-3 md:p-5 aspect-square flex items-center justify-center transition-all bg-white relative overflow-hidden ${
                      feedback === 'correct' && opt.id === currentItem.id ? 'ring-4 md:ring-8 ring-green-400 scale-105 z-10' :
                      feedback === 'incorrect' && opt.id === currentItem.id ? 'ring-4 md:ring-8 ring-red-400' :
                      feedback === 'incorrect' && opt.id !== currentItem.id ? 'opacity-20 scale-95 shadow-none border-transparent' :
                      canInteract ? 'hover:scale-103 active:scale-95 shadow-md' : 'opacity-90'
                    }`}
                  >
                    {opt.imageUrl ? (
                      <img src={`data:image/jpeg;base64,${opt.imageUrl}`} className="w-full h-full object-contain rounded-xl md:rounded-[2rem]" alt="option" />
                    ) : (
                      <div className="text-4xl sm:text-5xl md:text-7xl">{opt.emoji || '?'}</div>
                    )}
                    {feedback === 'correct' && opt.id === currentItem.id && (
                      <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center animate-fade-in">
                        <CheckCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 md:w-28 md:h-28 text-white drop-shadow-xl" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══ SPELLING GAME ══ */}
          {gameType === 'spelling' && (
            <div className="w-full max-w-4xl flex flex-col md:flex-row gap-5 md:gap-10 lg:gap-16 items-center mt-8">
              {/* Image */}
              <div className="w-full max-w-[180px] sm:max-w-[220px] md:max-w-[300px] lg:max-w-[380px] aspect-square clay-card p-3 md:p-6 flex items-center justify-center bg-indigo-50 border-white shadow-lg shrink-0 mx-auto md:mx-0">
                {currentItem.imageUrl
                  ? <img src={`data:image/jpeg;base64,${currentItem.imageUrl}`} className="w-full h-full object-contain" alt="spelling" />
                  : <div className="text-6xl sm:text-7xl md:text-9xl">{currentItem.emoji || '?'}</div>}
              </div>

              {/* Input area */}
              <div className="flex-1 w-full space-y-4 md:space-y-8">
                <div className="text-center md:text-left">
                  <label className="text-xs md:text-lg font-black text-indigo-300 uppercase tracking-widest mb-3 block">
                    {lang === 'vn' ? 'Bé hãy viết từ này nhé:' : 'Spell this word:'}
                  </label>
                  <input
                    type="text"
                    value={userSpelling}
                    onChange={e => setUserSpelling(e.target.value)}
                    autoFocus
                    disabled={feedback !== 'none' || !canInteract}
                    className={`w-full clay-input text-center text-xl sm:text-2xl md:text-4xl font-black py-3 md:py-6 transition-all uppercase ${feedback === 'incorrect' ? 'ring-4 ring-red-200 text-red-600' : 'text-indigo-900 focus:ring-4 focus:ring-indigo-100'}`}
                    placeholder="..."
                    onKeyDown={(e) => e.key === 'Enter' && handleNext(userSpelling.toLowerCase().trim() === currentItem.text.toLowerCase().trim())}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={feedback !== 'none' || !canInteract}
                    onClick={() => handleNext(false)}
                    className="px-5 py-3 md:py-5 clay-button clay-white text-gray-400 font-black text-base md:text-xl hover:text-red-500 min-h-[52px]"
                  >
                    {lang === 'vn' ? 'Bỏ qua' : 'Skip'}
                  </button>
                  <button
                    disabled={feedback !== 'none' || !userSpelling.trim() || !canInteract}
                    onClick={() => handleNext(userSpelling.toLowerCase().trim() === currentItem.text.toLowerCase().trim())}
                    className="flex-1 py-3 md:py-5 clay-button clay-indigo text-white font-black text-base md:text-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 min-h-[52px]"
                  >
                    {lang === 'vn' ? 'Kiểm tra!' : 'Check!'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ SPEAKING GAME ══ */}
          {gameType === 'speaking' && (
            <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-5 md:gap-8 lg:gap-16 mt-8">
              {/* Image */}
              <div className="w-full max-w-[200px] sm:max-w-[260px] md:max-w-[340px] lg:max-w-[420px] aspect-square clay-card p-3 md:p-8 flex items-center justify-center bg-indigo-50 border-white shadow-xl relative overflow-hidden shrink-0 mx-auto lg:mx-0">
                {currentItem.imageUrl ? (
                  <img
                    src={`data:image/jpeg;base64,${currentItem.imageUrl}`}
                    className={`w-full h-full object-contain transition-transform duration-700 ${feedback === 'correct' ? 'scale-110' : feedback === 'incorrect' ? 'grayscale opacity-50' : ''}`}
                    alt="speaking"
                  />
                ) : <div className="text-7xl sm:text-8xl md:text-[10rem]">{currentItem.emoji || '?'}</div>}

                {feedback === 'correct' && (
                  <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center animate-fade-in">
                    <CheckCircleIcon className="w-20 h-20 md:w-36 md:h-36 text-green-500/80 drop-shadow-md" />
                  </div>
                )}

                {isListening && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-6">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-1.5 h-5 md:w-2 md:h-8 bg-indigo-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left space-y-4 md:space-y-6 w-full">
                <div>
                  <h3 className={`text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black capitalize mb-2 transition-colors leading-tight ${feedback === 'correct' ? 'text-green-600' : feedback === 'incorrect' ? 'text-red-500' : 'text-indigo-900'}`}>
                    {currentItem.text}
                  </h3>
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <p className="text-indigo-400 font-bold text-lg md:text-2xl">{currentItem.phonetic || '...'}</p>
                    <button
                      onClick={() => speakWithBrowser(currentItem.text)}
                      className="p-2 bg-indigo-100 text-indigo-500 rounded-full hover:bg-indigo-200 transition-colors shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <SpeakerWaveIcon className="w-5 h-5 md:w-7 md:h-7" />
                    </button>
                  </div>

                  {transcript && (
                    <div className="mt-4 space-y-2">
                      <div className="bg-white/70 p-3 md:p-5 rounded-2xl border-2 border-dashed border-indigo-100 animate-fade-in shadow-inner">
                        <p className="text-[10px] md:text-sm font-black text-indigo-300 uppercase tracking-widest mb-1">
                          {lang === 'vn' ? 'Máy nghe thấy:' : 'You said:'}
                        </p>
                        <p className="text-base md:text-2xl font-bold text-indigo-600 italic">"{transcript}"</p>
                      </div>
                      {speakingScore !== null && (
                        <div className={`p-3 md:p-4 rounded-2xl font-black text-center animate-fade-in ${speakingScore >= 75 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          <span className="text-xl md:text-2xl">{speakingScore >= 75 ? '🎉' : '💪'}</span>
                          <span className="ml-2 text-sm md:text-xl">{t.speakAccuracy}: {speakingScore}%</span>
                          {speakingScore < 75 && <p className="text-xs md:text-sm mt-1 font-bold">{t.speakTryAgain}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {feedback === 'correct' ? (
                    <button
                      onClick={() => handleNext(true)}
                      className="w-full py-4 md:py-6 clay-button bg-green-500 text-white shadow-2xl flex items-center justify-center gap-3 animate-pulse min-h-[56px]"
                    >
                      <span className="text-lg md:text-3xl font-black uppercase">
                        {lang === 'vn' ? 'Tuyệt vời! Tiếp tục' : 'Awesome! Next'}
                      </span>
                      <ChevronRightIcon className="w-6 h-6 md:w-10 md:h-10" />
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleNext(false)}
                        className="px-4 md:px-6 py-4 md:py-5 clay-button clay-white text-gray-300 font-black text-base md:text-xl hover:text-red-400 transition-colors min-h-[56px]"
                      >
                        {lang === 'vn' ? 'Bỏ qua' : 'Skip'}
                      </button>
                      <button
                        disabled={!canInteract}
                        onClick={startSpeakingTest}
                        className={`flex-1 py-4 md:py-5 clay-button transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 min-h-[56px] ${isListening ? 'bg-red-500 text-white animate-pulse' : 'clay-pink text-white hover:scale-[1.02]'}`}
                      >
                        {isListening ? (
                          <>
                            <div className="w-4 h-4 md:w-5 md:h-5 bg-white rounded-full animate-ping" />
                            <span className="text-base md:text-2xl font-black uppercase tracking-tight">
                              {lang === 'vn' ? 'Đang nghe...' : 'Listening...'}
                            </span>
                          </>
                        ) : (
                          <>
                            <MicrophoneIcon className="w-6 h-6 md:w-10 md:h-10" />
                            <span className="text-base md:text-2xl font-black uppercase tracking-tight">
                              {lang === 'vn' ? 'Chạm để nói!' : 'Tap to speak!'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <p className="text-indigo-300 font-bold text-xs md:text-sm text-center lg:text-left uppercase tracking-widest">
                    {lang === 'vn' ? 'Bé hãy đọc thật to từ ở trên! 📣' : 'Say the word above clearly! 📣'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function handleListeningChoice(isCorrect: boolean) {
    if (feedback !== 'none' || isTransitioning.current || !canInteract) return;
    handleNext(isCorrect);
  }
};

export default PracticeArena;
