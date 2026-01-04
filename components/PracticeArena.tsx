
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
}

const PracticeArena: React.FC<PracticeArenaProps> = ({ items, gameType, allItems, onExit, lang }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [shuffledOptions, setShuffledOptions] = useState<LearningItem[]>([]);
  const [userSpelling, setUserSpelling] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [canInteract, setCanInteract] = useState(false); 
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const isTransitioning = useRef(false);
  const recognitionRef = useRef<any>(null);
  const currentItem = items[currentIndex];
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (!currentItem || isFinished) return;

    setFeedback('none');
    setUserSpelling('');
    setTranscript('');
    setShowHint(false);
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

    // Khởi tạo Speech Recognition cho chế độ Luyện Nói
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
          
          // Fuzzy matching đơn giản: Nếu từ bé nói có chứa từ mục tiêu hoặc ngược lại
          if (result.includes(target) || target.includes(result)) {
            handleNext(true);
          } else {
            setFeedback('incorrect');
            playSFX('click');
            // Cho phép bé thử lại sau 1.5s
            setTimeout(() => {
                if (!isTransitioning.current) setFeedback('none');
            }, 1500);
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

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch(e) {}
        }
    };
  }, [currentIndex, gameType, allItems, isFinished]);

  const handleNext = (success: boolean) => {
    if (isTransitioning.current || feedback === 'correct') return;
    isTransitioning.current = true;

    if (success) {
      setScore(s => s + 1);
      playSFX('star');
      setFeedback('correct');
    } else {
      // Trường hợp skip (bỏ qua)
      playSFX('click');
    }
    
    // Tự động chuyển câu sau 1.5 giây
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

  const handleExitEarly = () => {
    onExit();
  };

  if (isFinished) {
    const stars = Math.ceil(score / 2);
    return (
      <div className="fixed inset-0 bg-[#F0F9FF] flex flex-col items-center justify-center p-6 text-center animate-scale-up z-[200]">
        <TrophyIcon className="w-24 h-24 md:w-48 md:h-48 text-yellow-400 mb-6 animate-bounce" />
        <h2 className="text-3xl md:text-6xl font-black text-indigo-900 mb-4">{t.greatJob}</h2>
        <p className="text-lg md:text-3xl text-indigo-500 font-bold mb-8">{t.youGot} {score}/{items.length} {t.correct}</p>
        <div className="clay-card p-6 md:p-12 bg-yellow-50 flex items-center gap-4 md:gap-8 mb-12 animate-float mx-auto shadow-xl">
            <StarIcon className="w-10 h-10 md:w-20 md:h-20 text-yellow-500" />
            <span className="text-2xl md:text-5xl font-black text-yellow-700">+{stars} {t.stars}!</span>
        </div>
        <button onClick={() => onExit([], stars)} className="px-10 py-4 md:px-20 md:py-8 clay-button clay-indigo text-white font-black text-lg md:text-3xl shadow-2xl transition-transform hover:scale-105 active:scale-95">Xong rồi! 🚀</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#F0F9FF] flex flex-col pt-safe pb-safe overflow-hidden">
      {/* Header - Phù hợp màn hình rộng */}
      <div className="w-full max-w-[1440px] mx-auto px-4 py-3 md:py-8 flex items-center gap-3 md:gap-12 shrink-0">
          <button 
            onClick={handleExitEarly}
            className="flex items-center gap-2 px-4 py-2 md:px-8 md:py-4 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition-all active:scale-95 shadow-md font-black text-xs md:text-xl border-2 border-red-200"
          >
            <XMarkIcon className="w-5 h-5 md:w-8 md:h-8" /> 
            <span>{t.endPractice}</span>
          </button>
          
          <div className="flex-1 flex items-center gap-2 md:gap-6">
            <span className="font-black text-indigo-400 text-xs md:text-2xl shrink-0">{currentIndex + 1}/{items.length}</span>
            <div className="flex-1 h-3 md:h-8 bg-white rounded-full p-1 shadow-inner border border-white overflow-hidden relative">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-700 shadow-md" style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}></div>
            </div>
          </div>
          
          <div className="bg-yellow-100 px-4 py-2 md:px-8 md:py-4 rounded-2xl border-2 border-yellow-200 flex items-center gap-2 shrink-0 shadow-sm">
            <StarIcon className="w-5 h-5 md:w-10 md:h-10 text-yellow-500"/>
            <span className="font-black text-yellow-700 text-sm md:text-3xl">{score}</span>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-20">
        <div className="max-w-[1440px] mx-auto w-full min-h-full flex flex-col items-center justify-center relative py-6">
          
          <button 
            onClick={() => setShowHint(!showHint)}
            className={`absolute top-0 right-0 p-3 md:p-6 rounded-2xl shadow-lg transition-all border-4 flex items-center gap-3 font-black z-20 ${showHint ? 'bg-orange-500 text-white border-white animate-pulse' : 'bg-white text-orange-500 border-orange-100'}`}
          >
            <LanguageIcon className="w-5 h-5 md:w-8 md:h-8" /> 
            <span className="text-xs md:text-2xl">{showHint ? currentItem.vietnameseTranslation : (lang === 'vn' ? 'Dịch' : 'Hint')}</span>
          </button>

          {gameType === 'listening' && (
             <div className="w-full max-w-6xl space-y-8 md:space-y-16">
                <div className="flex flex-col items-center">
                    <button 
                      onClick={() => speakWithBrowser(currentItem.text)} 
                      disabled={feedback !== 'none' || !canInteract}
                      className={`w-24 h-24 md:w-56 md:h-56 clay-button clay-blue text-white flex items-center justify-center hover:scale-110 shadow-xl transition-all active:rotate-12 ${feedback !== 'none' || !canInteract ? 'opacity-50 grayscale' : ''}`}
                    >
                      <SpeakerWaveIcon className="w-12 h-12 md:w-32 md:h-32"/>
                    </button>
                    <p className="mt-4 text-indigo-300 font-black text-xs md:text-2xl uppercase tracking-widest animate-pulse">Lắng nghe thật kỹ...</p>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12 w-full px-2">
                   {shuffledOptions.map(opt => (
                       <button 
                          key={opt.id} 
                          disabled={feedback !== 'none' || !canInteract}
                          onClick={() => handleListeningChoice(opt.id === currentItem.id)} 
                          className={`clay-card p-3 md:p-8 aspect-square flex items-center justify-center transition-all bg-white relative overflow-hidden ${
                            feedback === 'correct' && opt.id === currentItem.id ? 'ring-8 ring-green-400 scale-105 z-10' : 
                            feedback === 'incorrect' && opt.id === currentItem.id ? 'ring-8 ring-red-400' :
                            feedback === 'incorrect' && opt.id !== currentItem.id ? 'opacity-20 scale-95 shadow-none border-transparent' : 
                            canInteract ? 'hover:scale-105 active:scale-95 shadow-md' : 'opacity-90'
                          }`}
                       >
                          {opt.imageUrl ? (
                            <img src={`data:image/jpeg;base64,${opt.imageUrl}`} className="w-full h-full object-contain rounded-2xl md:rounded-[3rem]" alt="option" />
                          ) : (
                            <div className="text-6xl md:text-[10rem]">{opt.emoji || '?'}</div>
                          )}
                          
                          {feedback === 'correct' && opt.id === currentItem.id && (
                            <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center animate-fade-in">
                              <CheckCircleIcon className="w-16 h-16 md:w-40 md:h-40 text-white drop-shadow-xl" />
                            </div>
                          )}
                       </button>
                   ))}
                </div>
             </div>
          )}

          {gameType === 'spelling' && (
              <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-24 items-center">
                  <div className="w-56 h-56 md:w-[500px] md:h-[500px] clay-card p-4 md:p-12 flex items-center justify-center bg-indigo-50 border-white shadow-lg shrink-0">
                     {currentItem.imageUrl ? <img src={`data:image/jpeg;base64,${currentItem.imageUrl}`} className="w-full h-full object-contain" alt="spelling" /> : <div className="text-8xl md:text-[14rem]">{currentItem.emoji || '?'}</div>}
                  </div>
                  
                  <div className="flex-1 w-full space-y-8 md:space-y-16">
                      <div className="text-center lg:text-left">
                          <label className="text-xs md:text-2xl font-black text-indigo-300 uppercase tracking-widest mb-4 block">Bé hãy viết từ này nhé:</label>
                          <input 
                            type="text" 
                            value={userSpelling} 
                            onChange={e => setUserSpelling(e.target.value)} 
                            autoFocus 
                            disabled={feedback !== 'none' || !canInteract}
                            className={`w-full clay-input text-center text-2xl md:text-7xl font-black py-4 md:py-12 transition-all uppercase ${feedback === 'incorrect' ? 'ring-8 ring-red-200 text-red-600' : 'text-indigo-900 focus:ring-8 focus:ring-indigo-100'}`}
                            placeholder="..." 
                            onKeyDown={(e) => e.key === 'Enter' && handleNext(userSpelling.toLowerCase().trim() === currentItem.text.toLowerCase().trim())}
                          />
                      </div>
                      <div className="flex gap-4">
                        <button 
                            disabled={feedback !== 'none' || !canInteract}
                            onClick={() => handleNext(false)}
                            className="px-8 py-6 md:py-10 clay-button clay-white text-gray-400 font-black text-lg md:text-3xl hover:text-red-500"
                        >
                            Bỏ qua
                        </button>
                        <button 
                            disabled={feedback !== 'none' || !userSpelling.trim() || !canInteract}
                            onClick={() => handleNext(userSpelling.toLowerCase().trim() === currentItem.text.toLowerCase().trim())} 
                            className="flex-1 py-6 md:py-12 clay-button clay-indigo text-white font-black text-xl md:text-5xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                            Kiểm tra ngay!
                        </button>
                      </div>
                  </div>
              </div>
          )}

          {gameType === 'speaking' && (
             <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center gap-10 lg:gap-24">
                {/* Hình ảnh bên trái */}
                <div className="w-64 h-64 md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] clay-card p-4 md:p-12 aspect-square flex items-center justify-center bg-indigo-50 border-white shadow-xl relative overflow-hidden shrink-0">
                     {currentItem.imageUrl ? (
                        <img src={`data:image/jpeg;base64,${currentItem.imageUrl}`} className={`w-full h-full object-contain transition-transform duration-1000 ${feedback === 'correct' ? 'scale-110' : feedback === 'incorrect' ? 'grayscale opacity-50' : ''}`} alt="speaking" />
                     ) : <div className="text-9xl md:text-[16rem]">{currentItem.emoji || '?'}</div>}
                     
                     {feedback === 'correct' && (
                        <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center animate-fade-in">
                           <CheckCircleIcon className="w-32 h-32 md:w-64 md:h-64 text-green-500/80 drop-shadow-md" />
                        </div>
                     )}
                     
                     {isListening && (
                        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 px-10">
                            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                <div key={i} className={`w-2 h-8 md:w-4 md:h-20 bg-indigo-500 rounded-full animate-bounce shadow-sm`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                            ))}
                        </div>
                     )}
                </div>
                
                {/* Nội dung bên phải */}
                <div className="flex-1 text-center lg:text-left space-y-10 md:space-y-16 w-full">
                  <div>
                    <h3 className={`text-5xl md:text-8xl lg:text-[10rem] font-black capitalize mb-6 transition-colors ${feedback === 'correct' ? 'text-green-600' : feedback === 'incorrect' ? 'text-red-500 animate-shake' : 'text-indigo-900'}`}>
                      {currentItem.text}
                    </h3>
                    <div className="flex items-center justify-center lg:justify-start gap-6">
                        <p className="text-indigo-400 font-bold text-2xl md:text-5xl">{currentItem.phonetic || '...'}</p>
                        <button onClick={() => speakWithBrowser(currentItem.text)} className="p-3 bg-indigo-100 text-indigo-500 rounded-full hover:bg-indigo-200 transition-colors shadow-sm">
                            <SpeakerWaveIcon className="w-6 h-6 md:w-10 md:h-10" />
                        </button>
                    </div>
                    
                    {transcript && (
                       <div className="mt-10 bg-white/70 p-6 md:p-10 rounded-3xl border-4 border-dashed border-indigo-100 animate-fade-in shadow-inner">
                          <p className="text-xs md:text-2xl font-black text-indigo-300 uppercase tracking-widest mb-2">Máy nghe thấy:</p>
                          <p className="text-xl md:text-5xl font-bold text-indigo-600 italic">"{transcript}"</p>
                       </div>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {feedback === 'correct' ? (
                       <button 
                        onClick={() => handleNext(true)}
                        className="w-full py-8 md:py-16 clay-button bg-green-500 text-white shadow-2xl flex items-center justify-center gap-6 animate-pulse"
                       >
                         <span className="text-2xl md:text-6xl font-black uppercase">Tuyệt vời! Tiếp tục nào</span>
                         <ChevronRightIcon className="w-10 h-10 md:w-20 md:h-20" />
                       </button>
                    ) : (
                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleNext(false)}
                                className="px-6 md:px-10 py-8 md:py-16 clay-button clay-white text-gray-300 font-black text-lg md:text-3xl hover:text-red-400 transition-colors"
                            >
                                Bỏ qua
                            </button>
                            <button 
                            disabled={!canInteract}
                            onClick={startSpeakingTest}
                            className={`flex-1 py-8 md:py-16 clay-button transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-6 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'clay-pink text-white hover:scale-[1.02]'}`}
                            >
                            {isListening ? (
                                <div className="flex items-center gap-6">
                                    <div className="w-6 h-6 md:w-12 md:h-12 bg-white rounded-full animate-ping"></div>
                                    <span className="text-2xl md:text-6xl font-black uppercase tracking-tight">Đang nghe bé...</span>
                                </div>
                            ) : (
                                <>
                                    <MicrophoneIcon className="w-12 h-12 md:w-24 md:h-24" />
                                    <span className="text-2xl md:text-6xl font-black uppercase tracking-tight">Chạm để nói!</span>
                                </>
                            )}
                            </button>
                        </div>
                    )}
                    
                    <p className="text-indigo-300 font-bold text-sm md:text-2xl text-center lg:text-left uppercase tracking-widest">
                        Bé hãy đọc thật to và rõ từ ở trên nhé! 📣
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
