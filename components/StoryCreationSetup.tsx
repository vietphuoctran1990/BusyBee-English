
import React, { useState, useMemo } from 'react';
import { LearningItem, LanguageType } from '../types';
import { CheckCircleIcon, SparklesIcon, TagIcon, ArrowLeftIcon, PlayIcon } from '@heroicons/react/24/solid';
import { TRANSLATIONS } from '../utils/translations';

interface StoryCreationSetupProps {
  savedItems: LearningItem[];
  onConfirm: (selectedItems: LearningItem[]) => void;
  onCancel: () => void;
  lang: LanguageType;
}

const StoryCreationSetup: React.FC<StoryCreationSetupProps> = ({ savedItems, onConfirm, onCancel, lang }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const t = TRANSLATIONS[lang];

  const topics = useMemo(() => {
    const allTopics = savedItems.map(i => i.topic || 'General');
    return Array.from(new Set(allTopics)).sort();
  }, [savedItems]);

  const visibleItems = useMemo(() => {
    if (!activeTopic) return savedItems;
    return savedItems.filter(i => (i.topic || 'General') === activeTopic);
  }, [savedItems, activeTopic]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAllVisible = () => {
    const newSet = new Set(selectedIds);
    const allVisibleSelected = visibleItems.every(i => selectedIds.has(i.id));
    if (allVisibleSelected) {
      visibleItems.forEach(i => newSet.delete(i.id));
    } else {
      visibleItems.forEach(i => newSet.add(i.id));
    }
    setSelectedIds(newSet);
  };

  const isAllVisibleSelected = visibleItems.length > 0 && visibleItems.every(i => selectedIds.has(i.id));

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-indigo-900">{t.magicStory}</h2>
          <p className="text-indigo-400 font-bold mt-1">{t.selectMore}</p>
        </div>
        <button onClick={onCancel} className="flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-600 transition-colors">
          <ArrowLeftIcon className="w-5 h-5" /> {t.back}
        </button>
      </div>

      <div className="clay-card p-6 bg-white/70 border-white">
        <div className="flex items-center gap-3 mb-6">
          <TagIcon className="w-6 h-6 text-indigo-400" />
          <span className="font-black text-indigo-900 uppercase text-sm tracking-widest">{t.filterByTopic}</span>
        </div>
        <div className="flex flex-wrap gap-3 mb-8">
          <button 
            onClick={() => setActiveTopic(null)}
            className={`px-5 py-2.5 rounded-2xl font-black transition-all ${activeTopic === null ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white text-indigo-400 border-2 border-indigo-50'}`}
          >
            {t.allWords}
          </button>
          {topics.map(topic => (
            <button 
              key={topic}
              onClick={() => setActiveTopic(topic)}
              className={`px-5 py-2.5 rounded-2xl font-black transition-all ${activeTopic === topic ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white text-indigo-400 border-2 border-indigo-50'}`}
            >
              {topic}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-black text-indigo-900">{activeTopic || t.allWords} ({visibleItems.length})</h3>
            <button onClick={handleSelectAllVisible} className="text-xs font-black text-indigo-500 uppercase tracking-widest hover:underline bg-indigo-50 px-3 py-1.5 rounded-xl transition-all active:scale-95">
              {isAllVisibleSelected ? t.deselectAll : t.selectAll}
            </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar p-2">
          {visibleItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => toggleSelection(item.id)}
              className={`clay-card p-3 flex flex-col items-center gap-2 cursor-pointer transition-all border-2 ${selectedIds.has(item.id) ? 'border-indigo-400 bg-indigo-50 scale-105 shadow-md' : 'border-white hover:border-indigo-100 shadow-sm'}`}
            >
              <div className="relative w-full aspect-square bg-indigo-100 rounded-2xl overflow-hidden flex items-center justify-center">
                {item.imageUrl ? (
                  <img src={`data:image/jpeg;base64,${item.imageUrl}`} className="w-full h-full object-cover" />
                ) : <span className="text-3xl">{item.emoji || '❓'}</span>}
                {selectedIds.has(item.id) && (
                  <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                    <CheckCircleIcon className="w-10 h-10 text-white drop-shadow-md" />
                  </div>
                )}
              </div>
              <span className={`text-xs font-black truncate w-full text-center ${selectedIds.has(item.id) ? 'text-indigo-600' : 'text-indigo-400'}`}>{item.text}</span>
            </div>
          ))}
          {visibleItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-indigo-200 font-bold italic">
              {t.noWordsFound}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => onConfirm(savedItems.filter(i => selectedIds.has(i.id)))}
          disabled={selectedIds.size < 2}
          className="flex-1 py-5 clay-button clay-indigo text-white font-black text-xl md:text-2xl flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
        >
          <SparklesIcon className="w-8 h-8" />
          <span>{lang === 'vn' ? 'Tạo truyện ngay' : 'Create Story Now'}</span>
        </button>
      </div>
    </div>
  );
};

export default StoryCreationSetup;
