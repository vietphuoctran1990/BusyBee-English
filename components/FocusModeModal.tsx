
import React, { useState } from 'react';
import { XMarkIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { LanguageType } from '../types';
import { TRANSLATIONS } from '../utils/translations';

const FOCUS_PIN_KEY = 'busybee_focus_pin';

interface FocusModeSetupProps {
  lang: LanguageType;
  onClose: () => void;
  onStart: () => void;
}

export const FocusModeSetup: React.FC<FocusModeSetupProps> = ({ lang, onClose, onStart }) => {
  const t = TRANSLATIONS[lang];
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'set' | 'confirm'>('set');
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const handleSetPin = () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError(lang === 'vn' ? 'PIN phải là 4 chữ số' : 'PIN must be 4 digits');
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (confirmPin !== pin) {
      setError(lang === 'vn' ? 'PIN không khớp, thử lại' : 'PINs don\'t match, try again');
      setConfirmPin('');
      return;
    }
    localStorage.setItem(FOCUS_PIN_KEY, pin);
    onStart();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-blue-900/70 backdrop-blur-md flex items-center justify-center p-5 animate-fade-in" onClick={onClose}>
      <div className="clay-card bg-white w-full max-w-sm animate-scale-up overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <LockClosedIcon className="w-6 h-6" />
            <h2 className="font-black text-lg">{t.focusMode}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm font-bold text-blue-400 text-center">{t.focusModeDesc}</p>

          <div>
            <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-2">
              {step === 'set' ? t.focusModePin : (lang === 'vn' ? 'Xác nhận PIN' : 'Confirm PIN')}
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                value={step === 'set' ? pin : confirmPin}
                onChange={e => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (step === 'set') setPin(v); else setConfirmPin(v);
                  setError('');
                }}
                className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 border-4 border-blue-100 rounded-2xl outline-none focus:border-blue-400 transition-all"
                placeholder="••••"
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-500"
              >
                {show ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs font-bold mt-2 text-center">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 font-black text-gray-400 border-2 border-gray-100 rounded-2xl">
              {t.cancel}
            </button>
            <button
              onClick={step === 'set' ? handleSetPin : handleConfirm}
              disabled={step === 'set' ? pin.length !== 4 : confirmPin.length !== 4}
              className="flex-1 py-3 bg-indigo-500 text-white font-black rounded-2xl disabled:opacity-50 active:scale-95 transition-all"
            >
              {step === 'set' ? (lang === 'vn' ? 'Tiếp theo' : 'Next') : t.focusModeStart}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FocusModePinOverlayProps {
  lang: LanguageType;
  onUnlock: () => void;
}

export const FocusModePinOverlay: React.FC<FocusModePinOverlayProps> = ({ lang, onUnlock }) => {
  const t = TRANSLATIONS[lang];
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleCheck = () => {
    const saved = localStorage.getItem(FOCUS_PIN_KEY);
    if (pin === saved) {
      localStorage.removeItem(FOCUS_PIN_KEY);
      onUnlock();
    } else {
      setAttempts(a => a + 1);
      setError(t.focusModeWrongPin);
      setPin('');
      try { navigator.vibrate?.(200); } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-indigo-900 flex flex-col items-center justify-center p-6 text-white">
      <LockClosedIcon className="w-16 h-16 text-indigo-300 mb-4 animate-float" />
      <h2 className="text-2xl font-black mb-2">{t.focusMode}</h2>
      <p className="text-indigo-300 font-bold mb-8 text-center">{t.focusModeEnter}</p>

      <div className="w-full max-w-xs space-y-4">
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            inputMode="numeric"
            maxLength={4}
            value={pin}
            autoFocus
            onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && pin.length === 4 && handleCheck()}
            className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 bg-indigo-800 border-4 border-indigo-600 rounded-2xl text-white placeholder-indigo-500 outline-none focus:border-indigo-300 transition-all"
            placeholder="••••"
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white"
          >
            {show ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>

        {error && (
          <p className={`text-red-400 text-sm font-bold text-center animate-fade-in ${attempts > 3 ? 'text-red-300' : ''}`}>
            {error} {attempts > 3 ? (lang === 'vn' ? `(${attempts} lần sai)` : `(${attempts} attempts)`) : ''}
          </p>
        )}

        <button
          onClick={handleCheck}
          disabled={pin.length !== 4}
          className="w-full py-4 bg-white text-indigo-900 font-black rounded-2xl shadow-xl disabled:opacity-40 active:scale-95 transition-all"
        >
          {lang === 'vn' ? 'Mở khóa' : 'Unlock'}
        </button>
      </div>
    </div>
  );
};

export const isFocusModeLocked = (): boolean => {
  return !!localStorage.getItem(FOCUS_PIN_KEY);
};
