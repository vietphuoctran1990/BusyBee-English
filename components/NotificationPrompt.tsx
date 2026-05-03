
import React, { useState } from 'react';
import { BellIcon, XMarkIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/solid';
import { TRANSLATIONS } from '../utils/translations';
import { LanguageType } from '../types';

interface NotificationPromptProps {
  lang: LanguageType;
  onConfirm: (hour: number) => void;
  onDismiss: () => void;
}

const HOUR_OPTIONS = [7, 8, 9, 12, 15, 17, 19, 20, 21];

function formatHour(h: number) {
  const suffix = h < 12 ? 'AM' : 'PM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix}`;
}

const NotificationPrompt: React.FC<NotificationPromptProps> = ({ lang, onConfirm, onDismiss }) => {
  const t = TRANSLATIONS[lang];
  const [selectedHour, setSelectedHour] = useState(8);

  return (
    <div className="fixed bottom-24 md:bottom-8 left-0 right-0 z-[150] px-4 flex justify-center animate-fade-in pointer-events-none">
      <div
        className="clay-card w-full max-w-md border-2 border-blue-100 shadow-2xl pointer-events-auto"
        style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #FFF7ED 100%)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-md text-2xl shrink-0 animate-float">
              🐝
            </div>
            <div>
              <h3 className="font-black text-blue-900 text-base leading-tight">{t.notifPromptTitle}</h3>
              <p className="text-blue-500 font-bold text-xs mt-0.5 leading-snug">{t.notifPromptDesc}</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 text-blue-200 hover:text-blue-400 hover:bg-blue-50 rounded-xl transition-all shrink-0"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Time picker */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <ClockIcon className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-black text-blue-500 uppercase tracking-wider">{t.notifSetTime}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {HOUR_OPTIONS.map(h => (
              <button
                key={h}
                onClick={() => setSelectedHour(h)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                  selectedHour === h
                    ? 'bg-blue-500 text-white shadow-md scale-105'
                    : 'bg-white text-blue-400 border border-blue-100 hover:bg-blue-50'
                }`}
              >
                {formatHour(h)}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 rounded-2xl font-black text-sm text-blue-300 hover:bg-blue-50 border border-blue-100 transition-all"
          >
            {t.notifDismiss}
          </button>
          <button
            onClick={() => onConfirm(selectedHour)}
            className="flex-[2] py-3 rounded-2xl font-black text-sm text-white clay-button clay-blue flex items-center justify-center gap-2 shadow-lg"
          >
            <BellIcon className="w-4 h-4" />
            {t.notifConfirm}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
