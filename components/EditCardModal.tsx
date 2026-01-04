import React, { useState, useEffect } from 'react';
import { XMarkIcon, PencilSquareIcon, CheckIcon } from '@heroicons/react/24/solid';
import { LearningItem, LanguageType } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface EditCardModalProps {
  item: LearningItem | null;
  onClose: () => void;
  onSave: (id: string, newMeaning: string, newExample: string) => void;
  lang: LanguageType;
}

const EditCardModal: React.FC<EditCardModalProps> = ({ item, onClose, onSave, lang }) => {
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (item) {
      setMeaning(item.vietnameseTranslation || '');
      setExample(item.example || '');
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item.id, meaning, example);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up border-4 border-indigo-50" onClick={e => e.stopPropagation()}>
        <div className="bg-indigo-600 p-4 flex justify-between items-center">
          <h3 className="text-white font-black text-xl flex items-center gap-2">
            <PencilSquareIcon className="w-6 h-6" /> {t.editCard}
          </h3>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="mb-2">
             <h4 className="text-center text-2xl font-black text-indigo-900 mb-1">{item.text}</h4>
             <p className="text-center text-indigo-400 font-mono text-sm">{item.phonetic}</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-indigo-400 uppercase">{t.vnMeaning}</label>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              className="w-full p-3 border-2 border-indigo-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-gray-800 bg-indigo-50/50"
              placeholder={t.enterMeaning}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-indigo-400 uppercase">{t.example}</label>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              className="w-full p-3 border-2 border-indigo-100 rounded-xl focus:border-indigo-500 outline-none font-medium text-gray-700 bg-indigo-50/50 resize-none h-24"
              placeholder={t.enterExample}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-transform active:scale-95 flex justify-center items-center gap-2"
            >
              <CheckIcon className="w-5 h-5" />
              <span>{t.saveChanges}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCardModal;