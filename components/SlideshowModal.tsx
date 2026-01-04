
import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PlayPauseIcon, ForwardIcon, SpeakerWaveIcon, LanguageIcon } from '@heroicons/react/24/solid';
import { LearningItem, LanguageType } from '../types';
import { decodeBase64Audio, playAudioBuffer, speakWithBrowser } from '../services/audioUtils';
import { TRANSLATIONS } from '../utils/translations';

interface SlideshowModalProps {
  items: LearningItem[];
  onClose: () => void;
  lang: LanguageType;
}

const SlideshowModal: React.FC<SlideshowModalProps> = ({ items, onClose, lang }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const currentItem = items[currentIndex];
  const t = TRANSLATIONS[lang];

  // Reset translation when changing slides
  useEffect(() => {
    setShowTranslation(false);
  }, [currentIndex]);

  // Effect to handle the slide logic
  useEffect(() => {
    if (!isPlaying) return;

    const playStep = async () => {
      if (!currentItem) return;

      let duration = 3000; // Default wait time

      // 1. Play Audio
      if (currentItem.audioBase64) {
        // Prefer AI Audio
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const buffer = await decodeBase64Audio(currentItem.audioBase64, ctx);
          playAudioBuffer(buffer, ctx);
          duration = buffer.duration * 1000 + 1000; // Audio duration + 1s buffer
        } catch (e) {
          console.warn("Slideshow AI audio error, falling back", e);
          await speakWithBrowser(currentItem.text, 'en', { rate: 0.9 });
          duration = 3000;
        }
      } else {
        // Fallback to Browser TTS
        await speakWithBrowser(currentItem.text, 'en', { rate: 0.9 });
        duration = 3000; // Estimate for browser TTS since we can't easily get exact duration
      }

      // 2. Wait before moving next
      timeoutRef.current = window.setTimeout(() => {
         if (currentIndex < items.length - 1) {
             setCurrentIndex(prev => prev + 1);
         } else {
             // Loop back
             setCurrentIndex(0);
         }
      }, duration);
    };

    playStep();

    return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, isPlaying, items, currentItem]);

  if (!currentItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white z-50">
            <XMarkIcon className="w-8 h-8" />
        </button>

        <div className="w-full max-w-4xl h-full flex flex-col items-center justify-center p-4">
            
            {/* Card Display */}
            <div className="relative bg-white p-2 rounded-3xl shadow-2xl animate-scale-up max-h-[70vh] aspect-[3/4] sm:aspect-square flex flex-col overflow-hidden">
                <div className="flex-1 relative bg-gray-100 rounded-2xl overflow-hidden">
                    {currentItem.imageUrl ? (
                        <img 
                            src={`data:image/jpeg;base64,${currentItem.imageUrl}`} 
                            className="w-full h-full object-cover" 
                            alt={currentItem.text} 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">?</div>
                    )}
                    
                    {/* Floating Translation Toggle */}
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
                        <p className="text-2xl text-orange-600 font-bold font-fredoka capitalize animate-fade-in">
                            {currentItem.vietnameseTranslation || '...'}
                        </p>
                    ) : (
                        <p className="text-lg text-gray-300 font-bold italic">Tap the globe to see meaning</p>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex gap-4">
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`p-4 rounded-full hover:scale-110 transition-transform shadow-lg ${isPlaying ? 'bg-white text-indigo-900' : 'bg-green-500 text-white'}`}
                >
                    <PlayPauseIcon className="w-8 h-8" />
                </button>
                <button 
                    onClick={() => setCurrentIndex(prev => (prev + 1) % items.length)}
                    className="p-4 bg-white/20 text-white rounded-full hover:bg-white/40 transition-colors backdrop-blur-md"
                >
                    <ForwardIcon className="w-8 h-8" />
                </button>
            </div>
            
            <p className="text-white/50 mt-4 text-sm font-bold tracking-widest uppercase">
                {t.slideshow} • {currentIndex + 1} / {items.length}
            </p>
        </div>
    </div>
  );
};

export default SlideshowModal;
