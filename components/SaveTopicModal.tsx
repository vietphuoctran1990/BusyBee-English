
import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TagIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { TRANSLATIONS } from '../utils/translations';
import { LanguageType } from '../types';
import { suggestTopics } from '../services/geminiService';

interface SaveTopicModalProps {
  isOpen: boolean;
  itemText: string;
  onClose: () => void;
  onConfirm: (topic: string) => void;
  initialTopic: string;
  existingTopics: string[];
  lang: LanguageType;
}

const SaveTopicModal: React.FC<SaveTopicModalProps> = ({
  isOpen,
  itemText,
  onClose,
  onConfirm,
  initialTopic,
  existingTopics,
  lang
}) => {
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [newTopic, setNewTopic] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (isOpen) {
      setSelectedTopic(initialTopic || 'General');
      setNewTopic('');
      setIsCreating(false);
      
      // Load AI suggestions
      if (itemText) {
        setIsLoadingSuggestions(true);
        suggestTopics(itemText)
          .then(setSuggestions)
          .catch(() => setSuggestions([]))
          .finally(() => setIsLoadingSuggestions(false));
      }
    }
  }, [isOpen, initialTopic, itemText]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isCreating && newTopic.trim()) {
      onConfirm(newTopic.trim());
    } else {
      onConfirm(selectedTopic);
    }
  };

  // Filter out duplicates and the initial topic from existing list to avoid redundancy in UI
  const uniqueTopics = Array.from(new Set([...existingTopics, 'General'])).filter(t => t !== initialTopic);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up border-4 border-indigo-50" onClick={e => e.stopPropagation()}>
        <div className="bg-indigo-600 p-4 flex justify-between items-center">
          <h3 className="text-white font-black text-xl flex items-center gap-2">
            <TagIcon className="w-6 h-6" /> {t.saveToTopic}
          </h3>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-500 font-bold mb-4">{t.chooseTopic}</p>

          {/* AI Suggestions Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Gợi ý từ Ong Chăm Chỉ</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {isLoadingSuggestions ? (
                <div className="flex items-center gap-2 text-indigo-300 px-3 py-2 bg-indigo-50/50 rounded-xl border border-dashed border-indigo-200 w-full justify-center">
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-bold">Đang tìm chủ đề phù hợp...</span>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map(topic => (
                  <button
                    key={topic}
                    onClick={() => { setSelectedTopic(topic); setIsCreating(false); }}
                    className={`px-4 py-2 rounded-xl font-bold border-2 transition-all flex items-center gap-1.5 ${
                      !isCreating && selectedTopic === topic
                        ? 'bg-yellow-400 border-yellow-400 text-yellow-900 shadow-md scale-105'
                        : 'bg-yellow-50 border-yellow-100 text-yellow-700 hover:bg-yellow-100'
                    }`}
                  >
                    <SparklesIcon className="w-3 h-3" /> {topic}
                  </button>
                ))
              ) : (
                <span className="text-xs text-gray-300 italic">Ong chưa nghĩ ra chủ đề nào mới...</span>
              )}
            </div>
          </div>

          <div className="mb-4">
             <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Chủ đề của bé</span>
             <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 no-scrollbar">
                <button
                    onClick={() => { setSelectedTopic(initialTopic || 'General'); setIsCreating(false); }}
                    className={`px-4 py-2 rounded-xl font-bold border-2 transition-all ${
                      !isCreating && selectedTopic === (initialTopic || 'General')
                        ? 'bg-pink-500 border-pink-500 text-white shadow-md'
                        : 'bg-white border-pink-100 text-pink-500 hover:bg-pink-50'
                    }`}
                >
                  ✨ {initialTopic || 'General'}
                </button>

                {uniqueTopics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => { setSelectedTopic(topic); setIsCreating(false); }}
                    className={`px-4 py-2 rounded-xl font-bold border-2 transition-all ${
                      !isCreating && selectedTopic === topic
                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-md'
                        : 'bg-white border-indigo-100 text-indigo-500 hover:bg-indigo-50'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
             </div>
          </div>

          {/* New Topic Input Section */}
          <div className="mb-6">
             {!isCreating ? (
               <button
                 onClick={() => { setIsCreating(true); setSelectedTopic(''); }}
                 className="flex items-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
               >
                 <PlusIcon className="w-5 h-5" /> {t.createNewTopic}
               </button>
             ) : (
               <div className="animate-fade-in bg-indigo-50 p-3 rounded-xl border-2 border-indigo-100">
                 <label className="block text-xs font-bold text-indigo-400 mb-2 uppercase">{t.newTopicName}</label>
                 <div className="flex gap-2">
                    <input
                        autoFocus
                        type="text"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        className="flex-1 p-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 outline-none font-bold text-indigo-900 bg-white"
                        placeholder="e.g. Space, Dinosaurs..."
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                    />
                    <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-red-500"><XMarkIcon className="w-6 h-6"/></button>
                 </div>
               </div>
             )}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
              {t.cancel}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-transform active:scale-95 flex justify-center items-center gap-2"
            >
              <span>{t.confirmSave}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveTopicModal;
