
import React, { useState } from 'react';
import { XMarkIcon, LockClosedIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { Sticker, LanguageType } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface StickerBookModalProps {
  stars: number;
  unlockedStickers: string[];
  stickers: Sticker[];
  onClose: () => void;
  onUnlock: (stickerId: string, cost: number) => void;
  lang: LanguageType;
}

const StickerBookModal: React.FC<StickerBookModalProps> = ({ stars, unlockedStickers, stickers, onClose, onUnlock, lang }) => {
  const [viewingSticker, setViewingSticker] = useState<Sticker | null>(null);
  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up border-8 border-yellow-300 relative" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-yellow-400 p-4 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-3">
             <div className="bg-white p-2 rounded-full shadow-sm">
                 <StarIcon className="w-8 h-8 text-yellow-500" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-yellow-900 leading-none">{t.myStickerBook}</h2>
                <p className="text-yellow-800 font-bold text-sm">{t.collectAll}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="bg-white/30 px-4 py-2 rounded-full border-2 border-white/50 flex items-center gap-2">
                  <StarIcon className="w-6 h-6 text-yellow-700" />
                  <span className="text-xl font-black text-yellow-900">{stars}</span>
              </div>
              <button onClick={onClose} className="p-2 bg-white/30 hover:bg-white/50 rounded-full text-yellow-900 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
          </div>
        </div>

        {/* Sticker Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-yellow-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {stickers.map(sticker => {
                    const isUnlocked = unlockedStickers.includes(sticker.id);
                    const canAfford = stars >= sticker.cost;

                    return (
                        <div 
                            key={sticker.id} 
                            onClick={() => isUnlocked && setViewingSticker(sticker)}
                            className={`aspect-square rounded-2xl relative group transition-all duration-300 ${isUnlocked ? 'bg-white shadow-lg rotate-1 hover:rotate-0 hover:scale-105 cursor-pointer' : 'bg-gray-200 shadow-inner'}`}
                        >
                            {isUnlocked ? (
                                <div className={`w-full h-full flex flex-col items-center justify-center p-2 rounded-2xl border-4 border-white ${sticker.bg} overflow-hidden`}>
                                    <img src={sticker.imageUrl} className="w-24 h-24 object-contain drop-shadow-md animate-bounce-custom" alt={sticker.name} />
                                    <span className="mt-2 text-xs font-bold text-gray-700 bg-white/80 px-2 py-1 rounded-full">{sticker.name}</span>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-2 relative overflow-hidden">
                                    {/* Silhouetted Pokemon for locked state */}
                                    <img src={sticker.imageUrl} className="w-20 h-20 object-contain absolute opacity-20 blur-sm grayscale brightness-0" alt="locked" />
                                    
                                    <div className="z-10 flex flex-col items-center">
                                        <LockClosedIcon className="w-8 h-8 text-gray-500 mb-2 drop-shadow-sm" />
                                        {canAfford ? (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onUnlock(sticker.id, sticker.cost); }}
                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md animate-bounce-in flex items-center gap-1"
                                            >
                                                {t.unlock} <span className="text-xs flex items-center"><StarIcon className="w-3 h-3"/>{sticker.cost}</span>
                                            </button>
                                        ) : (
                                            <div className="bg-gray-300/80 backdrop-blur-sm text-gray-600 px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm">
                                                {t.need} <StarIcon className="w-3 h-3"/>{sticker.cost}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>

        {/* --- ZOOMED POKEMON OVERLAY --- */}
        {viewingSticker && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={() => setViewingSticker(null)}>
                <div 
                    className={`relative w-full max-w-md aspect-square rounded-full flex items-center justify-center p-8 animate-bounce-in shadow-[0_0_50px_rgba(255,255,255,0.5)] ${viewingSticker.bg} border-8 border-white`}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Background Burst Effect */}
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,transparent_70%)] opacity-50"></div>
                    <div className="absolute inset-0 rounded-full border-[20px] border-white/20 animate-pulse"></div>

                    {/* Sparkles */}
                    <SparklesIcon className="absolute top-10 left-10 w-12 h-12 text-white animate-spin-slow opacity-80" />
                    <SparklesIcon className="absolute bottom-10 right-10 w-8 h-8 text-yellow-200 animate-bounce opacity-80" />
                    
                    {/* The Pokemon */}
                    <img 
                        src={viewingSticker.imageUrl} 
                        className="w-[120%] h-[120%] object-contain drop-shadow-2xl z-10 transition-transform hover:scale-110" 
                        alt={viewingSticker.name} 
                    />
                    
                    {/* Name Badge */}
                    <div className="absolute -bottom-6 bg-white px-8 py-2 rounded-full shadow-xl border-4 border-indigo-100 flex flex-col items-center transform hover:scale-110 transition-transform cursor-default">
                        <h3 className="text-3xl font-black text-indigo-900 uppercase tracking-widest">{viewingSticker.name}</h3>
                    </div>

                    {/* Close Button */}
                    <button 
                        onClick={() => setViewingSticker(null)}
                        className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 p-3 rounded-full shadow-lg border-4 border-gray-100 transition-colors z-20"
                    >
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default StickerBookModal;
