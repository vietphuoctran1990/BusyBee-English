
import React, { useState, useRef } from 'react';
import { PhotoIcon, PlusIcon, XMarkIcon, PaintBrushIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { TRANSLATIONS } from '../utils/translations';
import { LanguageType } from '../types';
import DrawingCanvas from './DrawingCanvas';

interface InputAreaProps {
  onAdd: (text: string, refImage: string | null) => void;
  disabled: boolean;
  lang: LanguageType;
}

const InputArea: React.FC<InputAreaProps> = ({ onAdd, disabled, lang }) => {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[lang];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setIsDrawingMode(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const lines = text.split('\n').filter(line => line.trim() !== '');
    lines.forEach(line => {
        const base64Data = selectedImage ? selectedImage.split(',')[1] : null;
        onAdd(line.trim(), base64Data);
    });
    setText('');
    setSelectedImage(null);
  };

  return (
    <div className="clay-card p-5 md:p-10 mb-8 md:mb-14 border-2 md:border-4 border-white bg-white/90 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-8">
        <div>
          <label className="flex items-center gap-2 md:gap-3 text-xl md:text-3xl font-black text-blue-900 mb-3 md:mb-6 ml-1">
            {t.wordAndSentence} <SparklesIcon className="w-5 h-5 md:w-8 md:h-8 text-yellow-400" />
          </label>
          <div className="relative">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={disabled}
                rows={2}
                className="w-full p-4 md:p-8 text-lg md:text-3xl clay-input focus:ring-4 md:focus:ring-8 focus:ring-blue-100 outline-none resize-none font-black text-blue-900 placeholder-blue-200 transition-all min-h-[100px] md:min-h-[160px]"
                placeholder={t.placeholder}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
            <div className="flex-1 flex flex-wrap gap-2 md:gap-4">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className={`px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl font-black text-sm md:text-lg flex items-center gap-2 transition-all border-2 md:border-4 ${selectedImage && !isDrawingMode ? 'bg-green-500 text-white border-green-400 shadow-lg' : 'bg-white text-blue-500 border-blue-50 hover:bg-blue-50'}`}
                >
                    {selectedImage && !isDrawingMode ? <CheckIcon className="w-5 h-5 md:w-6 md:h-6" /> : <PhotoIcon className="w-5 h-5 md:w-6 md:h-6" />}
                    <span>{selectedImage && !isDrawingMode ? t.imageAdded : t.addRefImage}</span>
                </button>

                <button 
                  type="button" 
                  onClick={() => setIsDrawingMode(!isDrawingMode)} 
                  className={`px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl font-black text-sm md:text-lg flex items-center gap-2 transition-all border-2 md:border-4 ${isDrawingMode ? 'bg-pink-500 text-white border-pink-400 shadow-lg' : 'bg-white text-pink-500 border-pink-50 hover:bg-pink-50'}`}
                >
                    <PaintBrushIcon className="w-5 h-5 md:w-6 md:h-6" />
                    <span>{isDrawingMode ? t.clearDrawing : t.drawIt}</span>
                </button>

                {selectedImage && (
                    <button type="button" onClick={() => { setSelectedImage(null); setIsDrawingMode(false); }} className="p-3 md:p-4 bg-red-50 text-red-500 rounded-2xl border-2 border-red-100 hover:bg-red-100"><XMarkIcon className="w-5 h-5 md:w-6 md:h-6"/></button>
                )}
            </div>

            <button 
              type="submit" 
              disabled={disabled || !text.trim()} 
              className="w-full lg:w-auto px-10 py-4 md:py-6 clay-button clay-blue text-white font-black text-xl md:text-2xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
            >
                <PlusIcon className="w-6 h-6 md:w-8 md:h-8" /> <span>{t.createCards}</span>
            </button>
        </div>

        {isDrawingMode && (
          <div className="max-w-md animate-scale-up">
            <DrawingCanvas 
              onConfirm={(img) => { setSelectedImage(img); setIsDrawingMode(false); }} 
              onCancel={() => setIsDrawingMode(false)}
              confirmText={t.drawingAdded}
              clearText={t.clearDrawing}
              cancelText={t.cancel}
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default InputArea;
