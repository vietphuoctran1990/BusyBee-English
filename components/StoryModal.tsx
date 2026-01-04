
import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, SpeakerWaveIcon, BookOpenIcon, LanguageIcon, ArrowLeftIcon, ArrowRightIcon, SparklesIcon, HeartIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { generateIllustration, generatePronunciation } from '../services/geminiService';
import { speakWithBrowser, decodeBase64Audio, playAudioBuffer } from '../services/audioUtils';
import { StoryData, LanguageType } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface StoryModalProps {
  data: StoryData;
  onClose: () => void;
  onSave?: (story: StoryData) => void;
  isSaved?: boolean;
  lang: LanguageType;
}

const StoryModal: React.FC<StoryModalProps> = ({ data, onClose, onSave, isSaved = false, lang }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [hasSaved, setHasSaved] = useState(isSaved);
  const [sceneImages, setSceneImages] = useState<Record<number, string>>({});
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [cachedAudio, setCachedAudio] = useState<Record<number, string>>({});

  const t = TRANSLATIONS[lang];
  const currentScene = data.scenes[currentSceneIndex];
  const highlightIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const prefetch = async () => {
        const firstScene = data.scenes[0];
        let firstImg = firstScene.imageUrl;
        
        if (!firstImg) {
            const prompt = data.characterDescription 
                ? `${data.characterDescription}. Scene: ${firstScene.imagePrompt}` 
                : firstScene.imagePrompt;
            firstImg = await generateIllustration(prompt);
            if (firstImg && isMounted) {
                setSceneImages(prev => ({ ...prev, [0]: firstImg! }));
            }
        } else {
            setSceneImages(prev => ({ ...prev, [0]: firstImg! }));
        }

        data.scenes.forEach(async (scene, index) => {
            if (index === 0) return;
            if (scene.imageUrl) {
                if (isMounted) setSceneImages(prev => ({ ...prev, [index]: scene.imageUrl! }));
            } else {
                const prompt = data.characterDescription 
                    ? `${data.characterDescription}. Scene: ${scene.imagePrompt}` 
                    : scene.imagePrompt;
                const img = await generateIllustration(prompt, firstImg);
                if (img && isMounted) setSceneImages(prev => ({ ...prev, [index]: img }));
            }
        });

        data.scenes.forEach(async (scene, index) => {
            try {
                const base64 = await generatePronunciation(scene.text);
                if (base64 && isMounted) {
                    setCachedAudio(prev => ({ ...prev, [index]: base64 }));
                }
            } catch (e) { console.error("Prefetch audio failed", e); }
        });
    };
    prefetch();
    return () => { isMounted = false; };
  }, [data.scenes, data.characterDescription]);

  const handleNext = () => {
    stopPlayback();
    setCurrentSceneIndex(prev => (prev + 1) % data.scenes.length);
  };
  
  const handlePrev = () => {
    stopPlayback();
    setCurrentSceneIndex(prev => (prev - 1 + data.scenes.length) % data.scenes.length);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    if (highlightIntervalRef.current) {
        clearInterval(highlightIntervalRef.current);
        highlightIntervalRef.current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const playVoice = async () => {
    if (!currentScene) return;
    if (isPlaying) {
        stopPlayback();
        return;
    }

    setIsPlaying(true);
    setIsAudioLoading(true);
    setCurrentWordIndex(-1);

    const sceneText = currentScene.text;
    const words = sceneText.split(/\s+/);
    
    try {
        let base64 = cachedAudio[currentSceneIndex];
        if (!base64) {
            base64 = await generatePronunciation(sceneText);
            if (base64) setCachedAudio(prev => ({ ...prev, [currentSceneIndex]: base64! }));
        }

        if (base64) {
            const buffer = await decodeBase64Audio(base64);
            setIsAudioLoading(false);
            const totalDuration = buffer.duration;
            const timePerWord = (totalDuration * 1000) / words.length;
            let startTime = Date.now();
            playAudioBuffer(buffer);

            highlightIntervalRef.current = window.setInterval(() => {
                const elapsed = Date.now() - startTime;
                const wordIdx = Math.floor(elapsed / timePerWord);
                if (wordIdx < words.length) setCurrentWordIndex(wordIdx);
                else stopPlayback();
            }, 50);
        } else {
            setIsAudioLoading(false);
            await speakWithBrowser(sceneText);
            stopPlayback();
        }
    } catch (e) {
        setIsAudioLoading(false);
        await speakWithBrowser(sceneText);
        stopPlayback();
    }
  };

  const handleSave = () => {
    if (onSave && !hasSaved) {
        const fullData = { 
            ...data, 
            scenes: data.scenes.map((s, i) => ({ ...s, imageUrl: sceneImages[i] || s.imageUrl })) 
        };
        onSave(fullData);
        setHasSaved(true);
    }
  };

  if (!currentScene) return null;
  const sceneWords = currentScene.text.split(/\s+/);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-indigo-950/98 backdrop-blur-xl animate-fade-in" onClick={onClose}>
        <div className="bg-white w-full h-full md:h-[80vh] md:max-h-[700px] md:max-w-5xl md:rounded-[2rem] shadow-[0_0_120px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative animate-scale-up" onClick={e => e.stopPropagation()}>
            
            {/* Header - Minimalist */}
            <div className="px-3 py-2 md:px-5 md:py-2.5 flex justify-between items-center border-b border-gray-100 bg-white z-30 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="bg-indigo-600 p-1.5 rounded-lg shrink-0">
                      <BookOpenIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xs md:text-base font-black text-indigo-900 truncate">{data.title}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {!hasSaved && (
                      <button onClick={handleSave} className="flex items-center gap-1 px-2.5 py-1.5 bg-pink-500 text-white rounded-lg font-black text-[8px] md:text-[10px] shadow-sm hover:bg-pink-600 transition-all active:scale-95">
                        <HeartIcon className="w-2.5 h-2.5 md:w-3 md:h-3" /> Lưu
                      </button>
                    )}
                    <button onClick={onClose} className="p-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-all group">
                      <XMarkIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                </div>
            </div>

            {/* Bố cục chính */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                
                {/* Trang trái: Hình ảnh */}
                <div className="w-full md:w-1/2 h-[30vh] md:h-full bg-indigo-50 relative flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-gray-100 shrink-0 md:shrink">
                    <div className="w-full h-full p-2.5 md:p-5 flex items-center justify-center">
                        {sceneImages[currentSceneIndex] ? (
                            <img 
                                src={sceneImages[currentSceneIndex].startsWith('data:') ? sceneImages[currentSceneIndex] : `data:image/jpeg;base64,${sceneImages[currentSceneIndex]}`} 
                                className="w-full h-full object-contain rounded-lg md:rounded-[1.2rem] shadow-md animate-fade-in transition-all duration-700" 
                                alt="scene" 
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-indigo-300 p-6 text-center bg-white rounded-lg md:rounded-[1.2rem]">
                                <SparklesIcon className="w-6 h-6 md:w-10 md:h-10 animate-spin text-yellow-400 opacity-50 mb-2" />
                                <p className="font-black text-[10px] md:text-xs animate-pulse">Đang vẽ tranh...</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Page Indicator */}
                    <div className="absolute top-2.5 left-2.5 bg-black/40 backdrop-blur-md text-white px-2 py-0.5 rounded-full font-black text-[7px] md:text-[9px] border border-white/20 z-20">
                        {t.page} {currentSceneIndex + 1} / {data.scenes.length}
                    </div>
                </div>

                {/* Trang phải: Chữ */}
                <div className="flex-1 md:w-1/2 flex flex-col bg-white overflow-hidden relative">
                    
                    {/* Nội dung chữ - Cực kỳ gọn gàng */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-3 md:p-5 flex flex-col">
                        <div className="max-w-xl mx-auto w-full space-y-3 md:space-y-4 my-auto">
                            <div className="flex justify-between items-center">
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded-md text-[7px] md:text-[8px] font-black uppercase tracking-widest border border-indigo-100">Lời truyện</span>
                                <button 
                                    onClick={() => setShowTranslation(!showTranslation)} 
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all font-black text-[8px] md:text-[10px] border-2 ${showTranslation ? 'bg-orange-500 text-white border-orange-400' : 'bg-white text-orange-500 border-orange-100 hover:bg-orange-50'}`}
                                >
                                    <LanguageIcon className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> {showTranslation ? 'Ẩn dịch' : 'Dịch'}
                                </button>
                            </div>
                            
                            {/* Văn bản truyện: Giảm 30% (text-lg), Dàn trang đều (text-justify) */}
                            <div className="text-base md:text-lg font-black text-indigo-950 leading-snug md:leading-snug text-justify flex flex-wrap gap-x-1 gap-y-1 md:gap-x-2 md:gap-y-1">
                                {sceneWords.map((word, idx) => (
                                    <span 
                                        key={idx} 
                                        className={`transition-all duration-300 rounded-md px-1 py-0.5 ${currentWordIndex === idx ? 'text-white bg-pink-500 scale-105 shadow-sm z-10' : 'text-indigo-900'}`}
                                    >
                                        {word}
                                    </span>
                                ))}
                            </div>
                            
                            {/* Dịch Tiếng Việt - Gọn nhất có thể */}
                            {showTranslation && (
                                <div className="animate-scale-up bg-orange-50 p-2.5 md:p-3 rounded-lg border border-orange-100 shadow-inner">
                                    <p className="text-[10px] md:text-sm font-bold text-orange-800 leading-normal italic">
                                        "{currentScene.vietnamese}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer - Controls - Giảm 50% kích thước */}
                    <div className="p-3 md:p-5 md:pt-0 bg-white shrink-0">
                        <div className="max-w-xl mx-auto space-y-2 md:space-y-2.5">
                            <button 
                                onClick={playVoice} 
                                disabled={isAudioLoading} 
                                className={`w-full py-2 md:py-2.5 ${isPlaying ? 'bg-red-500' : 'bg-indigo-600'} text-white font-black rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 group`}
                            >
                                {isAudioLoading ? (
                                    <ArrowPathIcon className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                                ) : isPlaying ? (
                                    <XMarkIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                ) : (
                                    <SpeakerWaveIcon className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:scale-110" />
                                )}
                                <span className="text-[10px] md:text-sm font-black uppercase tracking-wide">
                                    {isAudioLoading ? 'Đang tải...' : isPlaying ? 'Dừng đọc' : 'Đọc truyện'}
                                </span>
                            </button>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={handlePrev} 
                                    className="flex-1 py-1.5 md:py-2 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-lg font-black text-[8px] md:text-[10px] flex items-center justify-center gap-1.5 transition-all active:scale-95"
                                >
                                    <ArrowLeftIcon className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> Trước
                                </button>
                                <button 
                                    onClick={handleNext} 
                                    className="flex-1 py-1.5 md:py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg font-black text-[8px] md:text-[10px] flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-indigo-100"
                                >
                                    Sau <ArrowRightIcon className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default StoryModal;
