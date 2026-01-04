
import React, { useState, useCallback } from 'react';
import { SpeakerWaveIcon, TrashIcon, HeartIcon as HeartIconSolid, ArrowPathIcon, LanguageIcon, SparklesIcon, PencilSquareIcon, ExclamationCircleIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { LearningItem, LanguageType, AccentType } from '../types';
import { speakWithBrowser } from '../services/audioUtils';
import { TRANSLATIONS } from '../utils/translations';

interface LearningCardProps {
  item: LearningItem;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
  onToggleSave: (id: string) => void;
  onRegenerateImage: (id: string) => void;
  onRegenerateAudio: (id: string) => void; 
  onZoom: (imageUrl: string) => void;
  onTranslate: (id: string) => void;
  onEdit: (id: string) => void;
  lang: LanguageType;
  accent: AccentType;
}

const LearningCard: React.FC<LearningCardProps> = ({ item, onDelete, onRetry, onToggleSave, onZoom, onEdit, lang, accent }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const t = TRANSLATIONS[lang];

  const handlePlay = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!item.text) return;
    setIsPlaying(true);
    await speakWithBrowser(item.text, 'en', { rate: 1.0, accent });
    setIsPlaying(false);
  }, [item.text, accent]);

  const toggleTranslate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  const playExample = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.example) speakWithBrowser(item.example, 'en', { rate: 0.9, accent });
  };

  return (
    <div className="clay-card p-4 md:p-5 group relative transform transition-all hover:scale-[1.02] active:scale-[0.98] animate-scale-up h-full flex flex-col min-h-[340px] md:min-h-[400px] cursor-pointer" onClick={() => !item.error && !item.loading && setShowDetails(!showDetails)}>
      {/* Action Buttons Layer */}
      <div className="absolute top-3 right-3 md:top-5 md:right-5 z-30 flex flex-col gap-2">
         {!item.loading && !item.error && (
             <>
                <button 
                  onClick={toggleTranslate} 
                  className={`p-2 md:p-2.5 rounded-xl md:rounded-2xl shadow-lg transition-all border-2 ${showDetails ? 'bg-orange-500 text-white border-orange-400' : 'bg-white/90 text-orange-500 border-orange-50'}`}
                  title={t.vnMeaning}
                >
                    <LanguageIcon className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onEdit(item.id); }} className="p-2 md:p-2.5 bg-white/90 rounded-xl md:rounded-2xl text-blue-500 hover:scale-110 shadow-lg transition-all border-2 border-blue-50">
                    <PencilSquareIcon className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onToggleSave(item.id); }} className={`p-2 md:p-2.5 rounded-xl md:rounded-2xl shadow-lg transition-all border-2 ${item.isSaved ? 'bg-pink-500 text-white border-pink-400' : 'bg-white/90 text-pink-400 border-pink-50'}`}>
                    {item.isSaved ? <HeartIconSolid className="w-4 h-4 md:w-5 md:h-5" /> : <HeartIconOutline className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
             </>
         )}
         <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 md:p-2.5 bg-white/90 rounded-xl md:rounded-2xl text-gray-400 hover:text-red-500 shadow-lg transition-all border-2 border-gray-50">
            <TrashIcon className="w-4 h-4 md:w-5 md:h-5" />
         </button>
      </div>
      
      {/* Visual content */}
      <div className="aspect-square bg-sky-100 rounded-[1.5rem] md:rounded-[2.5rem] relative overflow-hidden flex items-center justify-center mb-4 md:mb-6 shadow-inner border-2 md:border-4 border-white shrink-0">
        {item.imageUrl ? (
          <img src={`data:image/jpeg;base64,${item.imageUrl}`} alt={item.text} className="w-full h-full object-cover animate-fade-in transition-transform duration-700 group-hover:scale-110" onClick={(e) => { e.stopPropagation(); onZoom(`data:image/jpeg;base64,${item.imageUrl}`); }} />
        ) : item.error ? (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <ExclamationCircleIcon className="w-8 h-8 md:w-12 md:h-12 text-orange-400 mb-2" />
            <p className="text-orange-900 font-bold text-[10px] md:text-xs leading-tight line-clamp-2">{item.error}</p>
            <button onClick={(e) => { e.stopPropagation(); onRetry(item.id); }} className="mt-3 px-4 py-1.5 bg-orange-500 text-white rounded-xl font-black text-[9px] hover:scale-105 transition-all uppercase">Thử lại</button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            {item.emoji ? (
              <div className="text-6xl md:text-8xl animate-float drop-shadow-xl">{item.emoji}</div>
            ) : (
                <div className="w-10 h-10 md:w-16 md:h-16 border-[5px] md:border-[8px] border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
            )}
            {item.loading && <p className="mt-4 font-black text-sky-600 uppercase text-[9px] md:text-[10px] tracking-widest animate-pulse">{t.creating}</p>}
          </div>
        )}
      </div>

      {/* Information Area */}
      <div className="px-1 text-center flex-1 flex flex-col justify-between">
        <div className="mb-4 flex flex-col justify-center min-h-[70px] md:min-h-[90px] overflow-hidden">
           {item.loading ? (
             <h3 className="text-base md:text-xl font-black text-blue-300 italic animate-pulse">"{item.text}"...</h3>
           ) : showDetails ? (
                <div className="animate-fade-in flex flex-col items-center space-y-2">
                    <div className="bg-orange-50 p-2 md:p-3 rounded-xl md:rounded-2xl border-2 border-orange-100 shadow-inner w-full">
                        <p className="text-[8px] md:text-[9px] font-black text-orange-400 uppercase tracking-wider mb-0.5">Nghĩa tiếng Việt</p>
                        <h3 className="text-base md:text-lg font-black text-orange-600 leading-tight line-clamp-2">{item.vietnameseTranslation || '...'}</h3>
                    </div>
                </div>
           ) : (
                <div className="animate-fade-in">
                    <h3 className="text-2xl md:text-3xl font-black text-blue-950 leading-tight mb-0.5 capitalize line-clamp-1 drop-shadow-sm">{item.text}</h3>
                    {item.phonetic && <p className="text-blue-500 font-bold text-sm md:text-lg line-clamp-1">{item.phonetic}</p>}
                </div>
           )}
        </div>

        <button 
          onClick={handlePlay} 
          disabled={isPlaying || item.loading || !!item.error} 
          className={`w-full py-3 md:py-4 clay-button clay-blue text-white font-black flex items-center justify-center gap-2 text-base md:text-xl shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95`}
        >
            {isPlaying ? <ArrowPathIcon className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <><SpeakerWaveIcon className="w-5 h-5 md:w-6 md:h-6" /><span>{t.listen}</span></>}
        </button>
      </div>
    </div>
  );
};

export default LearningCard;
