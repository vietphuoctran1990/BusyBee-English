
import React from 'react';
import { XMarkIcon, SparklesIcon, PuzzlePieceIcon, BookOpenIcon, PlayIcon } from '@heroicons/react/24/solid';
import { TRANSLATIONS } from '../utils/translations';
import { LanguageType } from '../types';

interface IntroModalProps {
  onClose: () => void;
  lang: LanguageType;
}

const IntroModal: React.FC<IntroModalProps> = ({ onClose, lang }) => {
  const t = TRANSLATIONS[lang];

  const features = [
    {
      icon: <SparklesIcon className="w-8 h-8 text-pink-500" />,
      title: t.feature1Title,
      desc: t.feature1Desc,
      bg: "bg-pink-100"
    },
    {
      icon: <PuzzlePieceIcon className="w-8 h-8 text-blue-500" />,
      title: t.feature2Title,
      desc: t.feature2Desc,
      bg: "bg-blue-100"
    },
    {
      icon: <BookOpenIcon className="w-8 h-8 text-indigo-600" />,
      title: t.magicStory,
      desc: t.feature3Desc,
      bg: "bg-indigo-100"
    },
    {
      icon: <PlayIcon className="w-8 h-8 text-sky-500" />,
      title: t.slideshow,
      desc: "Trình chiếu tự động các thẻ học giúp bé ghi nhớ từ vựng tự nhiên.",
      bg: "bg-sky-100"
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden animate-scale-up border-4 border-white relative flex flex-col max-h-[90vh] md:max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors z-30">
            <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="overflow-y-auto no-scrollbar flex-1 p-6 md:p-10">
            <div className="text-center mb-8">
                <div className="text-5xl md:text-6xl mb-4 animate-bounce">🎁</div>
                <h2 className="text-2xl md:text-3xl font-black text-blue-900 mb-2 leading-tight">{t.introTitle}</h2>
                <p className="text-sm md:text-base text-blue-500 font-medium">{t.introSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {features.map((f, idx) => (
                    <div key={idx} className={`${f.bg} p-4 md:p-5 rounded-[2rem] flex flex-col items-center text-center transition-transform hover:scale-105 shadow-sm`}>
                        <div className="bg-white p-3 rounded-2xl shadow-sm mb-3 md:mb-4">{f.icon}</div>
                        <h3 className="font-black text-blue-900 text-base md:text-lg mb-1 md:mb-2 leading-tight">{f.title}</h3>
                        <p className="text-[10px] md:text-xs text-blue-500/70 font-bold leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="p-6 md:p-10 pt-4 bg-white border-t-2 border-gray-50 flex-shrink-0">
            <button 
                onClick={onClose} 
                className="w-full py-5 md:py-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg md:text-xl rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-blue-100 transition-transform active:scale-95"
            >
                {t.gotIt}
            </button>
        </div>
      </div>
    </div>
  );
};

export default IntroModal;
