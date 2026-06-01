
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { XMarkIcon, PlayPauseIcon, ForwardIcon, BackwardIcon, LanguageIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { LearningItem, LanguageType } from '../types';
import { decodeBase64Audio, playAudioBuffer, speakWithBrowser } from '../services/audioUtils';
import { TRANSLATIONS } from '../utils/translations';

interface SlideshowModalProps {
  items: LearningItem[];
  onClose: () => void;
  lang: LanguageType;
}

type SlideMode = 'slideshow' | 'flip';

const SlideshowModal: React.FC<SlideshowModalProps> = ({ items, onClose, lang }) => {
  const [mode, setMode] = useState<SlideMode>('slideshow');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const t = TRANSLATIONS[lang];

  // Shuffled or original order
  const displayItems = useMemo(() => {
    if (!shuffled) return items;
    return [...items].sort(() => 0.5 - Math.random());
  }, [items, shuffled]);

  const currentItem = displayItems[currentIndex];

  // Reset state when changing slides
  useEffect(() => {
    setShowTranslation(false);
    setIsFlipped(false);
  }, [currentIndex, mode]);

  // Slideshow auto-advance
  useEffect(() => {
    if (mode !== 'slideshow' || !isPlaying) return;

    const playStep = async () => {
      if (!currentItem) return;
      let duration = 3000;
      if (currentItem.audioBase64) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const buffer = await decodeBase64Audio(currentItem.audioBase64, ctx);
          playAudioBuffer(buffer, ctx);
          duration = buffer.duration * 1000 + 1200;
        } catch {
          await speakWithBrowser(currentItem.text, 'en', { rate: 0.9 });
          duration = 3000;
        }
      } else {
        await speakWithBrowser(currentItem.text, 'en', { rate: 0.9 });
        duration = 3000;
      }
      timeoutRef.current = window.setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % displayItems.length);
      }, duration);
    };

    playStep();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [currentIndex, isPlaying, mode, displayItems, currentItem]);

  const goNext = () => setCurrentIndex(prev => (prev + 1) % displayItems.length);
  const goPrev = () => setCurrentIndex(prev => (prev - 1 + displayItems.length) % displayItems.length);

  if (!currentItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 animate-fade-in">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-50">
        {/* Mode toggle */}
        <div className="flex bg-white/10 rounded-2xl p-1 gap-1 backdrop-blur-sm">
          <button
            onClick={() => { setMode('slideshow'); setIsPlaying(true); }}
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${mode === 'slideshow' ? 'bg-white text-indigo-900' : 'text-white/60 hover:text-white'}`}
          >
            {t.slideshowMode}
          </button>
          <button
            onClick={() => { setMode('flip'); setIsPlaying(false); }}
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${mode === 'flip' ? 'bg-white text-indigo-900' : 'text-white/60 hover:text-white'}`}
          >
            {t.flipCardMode}
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShuffled(s => !s)}
            className={`p-2.5 rounded-xl transition-all ${shuffled ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}
            title="Shuffle"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
          <button onClick={onClose} aria-label="Đóng" className="p-2.5 bg-white/20 hover:bg-white/30 rounded-full text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-4xl h-full flex flex-col items-center justify-center p-4 pt-16">

        {/* ── SLIDESHOW MODE ─────────────────────────────────────────────── */}
        {mode === 'slideshow' && (
          <div className="relative bg-white p-2 rounded-3xl shadow-2xl animate-scale-up max-h-[70vh] aspect-[3/4] sm:aspect-square flex flex-col overflow-hidden">
            <div className="flex-1 relative bg-gray-100 rounded-2xl overflow-hidden">
              {currentItem.imageUrl ? (
                <img
                  src={`data:image/png;base64,${currentItem.imageUrl}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  alt={currentItem.text}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">{currentItem.emoji || '?'}</div>
              )}
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`absolute bottom-6 right-6 p-4 rounded-2xl shadow-xl transition-all border-4 ${showTranslation ? 'bg-orange-500 text-white border-white scale-110' : 'bg-white/90 text-orange-500 border-orange-50 hover:scale-105'}`}
              >
                <LanguageIcon className="w-8 h-8" />
              </button>
            </div>
            <div className="p-6 text-center">
              <h2 className="text-4xl font-black text-indigo-900 mb-2 capitalize">{currentItem.text}</h2>
              {showTranslation ? (
                <p className="text-2xl text-orange-600 font-bold animate-fade-in capitalize">
                  {currentItem.vietnameseTranslation || '...'}
                </p>
              ) : (
                <p className="text-lg text-gray-300 font-bold italic">
                  {lang === 'vn' ? 'Nhấn quả địa cầu để xem nghĩa' : 'Tap the globe to see meaning'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── FLIP CARD MODE ─────────────────────────────────────────────── */}
        {mode === 'flip' && (
          <div
            className="flip-scene w-full max-w-sm aspect-[3/4] cursor-pointer"
            onClick={() => setIsFlipped(f => !f)}
          >
            <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
              {/* Front: image + word */}
              <div className="flip-card-front bg-white shadow-2xl flex flex-col">
                <div className="flex-1 bg-indigo-50 overflow-hidden">
                  {currentItem.imageUrl ? (
                    <img
                      src={`data:image/png;base64,${currentItem.imageUrl}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      alt={currentItem.text}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl">{currentItem.emoji || '?'}</div>
                  )}
                </div>
                <div className="p-5 text-center">
                  <h2 className="text-3xl font-black text-indigo-900 capitalize">{currentItem.text}</h2>
                  {currentItem.phonetic && (
                    <p className="text-indigo-400 font-bold mt-1">{currentItem.phonetic}</p>
                  )}
                  <p className="text-xs text-indigo-200 font-bold mt-2">
                    {lang === 'vn' ? '👆 Chạm để xem nghĩa' : '👆 Tap to reveal meaning'}
                  </p>
                </div>
              </div>

              {/* Back: translation + example */}
              <div className="flip-card-back bg-gradient-to-br from-indigo-500 to-blue-600 flex flex-col items-center justify-center p-8 text-white text-center">
                <p className="text-3xl font-black mb-4">
                  {currentItem.vietnameseTranslation || '?'}
                </p>
                {currentItem.example && (
                  <p className="text-sm font-bold text-indigo-200 italic">"{currentItem.example}"</p>
                )}
                {currentItem.emoji && (
                  <p className="text-5xl mt-4">{currentItem.emoji}</p>
                )}
                <p className="text-xs text-indigo-300 font-bold mt-6">
                  {lang === 'vn' ? '👆 Chạm để quay lại' : '👆 Tap to flip back'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={goPrev}
            className="p-3 bg-white/20 text-white rounded-full hover:bg-white/40 transition-colors backdrop-blur-md"
          >
            <BackwardIcon className="w-6 h-6" />
          </button>

          {mode === 'slideshow' && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-4 rounded-full hover:scale-110 transition-transform shadow-lg ${isPlaying ? 'bg-white text-indigo-900' : 'bg-green-500 text-white'}`}
            >
              <PlayPauseIcon className="w-8 h-8" />
            </button>
          )}

          <button
            onClick={goNext}
            className="p-3 bg-white/20 text-white rounded-full hover:bg-white/40 transition-colors backdrop-blur-md"
          >
            <ForwardIcon className="w-6 h-6" />
          </button>
        </div>

        <p className="text-white/50 mt-3 text-sm font-bold tracking-widest uppercase">
          {mode === 'slideshow' ? t.slideshowMode : t.flipCardMode} • {currentIndex + 1} / {displayItems.length}
          {shuffled && ' 🔀'}
        </p>
      </div>
    </div>
  );
};

export default SlideshowModal;
