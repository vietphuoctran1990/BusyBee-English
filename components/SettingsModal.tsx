
import React, { useState } from 'react';
import { XMarkIcon, UserCircleIcon, GlobeAltIcon, SpeakerWaveIcon, CheckIcon, IdentificationIcon, FaceSmileIcon, KeyIcon, ArrowTopRightOnSquareIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { UserProfile, AppSettings, LanguageType, AccentType } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface SettingsModalProps {
  user: UserProfile;
  settings: AppSettings;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onUpdateSettings: (updatedSettings: AppSettings) => void;
  onSelectKey: () => void;
  hasCustomKey: boolean;
}

const AVATARS = [
    '🐼', '🦁', '🐸', '🐨', '🐯', '🦄', '🦊', '🐰', '🐲', '🦖', '🐙', '🐳', '🦉', '🐝', '🦩', '🦒', '🐱', '🐶', '🐭', '🐹', '🦦', '🦥', '🦜',
    '🚀', '🤖', '🛸', '🌈', '🧚‍♀️', '🧜‍♂️', '🧙‍♂️', '🦸‍♂️', '🦸‍♀️', '👻', '👽', '🍄',
    '🍓', '🍕', '🍦', '🍭', '🍩', '🎨', '🎸', '⚽', '🎮', '🧘‍♂️', '🧗‍♀️', '☕', '💼'
];

const SettingsModal: React.FC<SettingsModalProps> = ({ user, settings, onClose, onUpdateUser, onUpdateSettings, onSelectKey, hasCustomKey }) => {
  const [tempUser, setTempUser] = useState<UserProfile>({ ...user });
  const [tempSettings, setTempSettings] = useState<AppSettings>({ ...settings });
  const t = TRANSLATIONS[tempSettings.language || 'vn'];

  const handleSave = () => {
    onUpdateUser(tempUser);
    onUpdateSettings(tempSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-scale-up border-4 border-blue-50 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <GlobeAltIcon className="w-8 h-8 text-blue-200" /> {t.settings}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
          {/* Section: Premium / API Key */}
          <section className="space-y-4">
            <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 border-b-2 border-blue-50 pb-2">
              <SparklesIcon className="w-5 h-5" /> {tempSettings.language === 'vn' ? 'Nâng cấp Trải nghiệm' : 'Premium Experience'}
            </h3>
            <div className={`p-6 rounded-[2.5rem] border-4 transition-all ${hasCustomKey ? 'bg-indigo-50 border-indigo-200' : 'bg-blue-50 border-blue-100'}`}>
                <div className="flex items-start gap-4 mb-4">
                    <div className={`p-4 rounded-2xl shadow-lg ${hasCustomKey ? 'bg-indigo-500' : 'bg-blue-500'}`}>
                        <KeyIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h4 className="font-black text-blue-900 text-lg leading-tight">
                            {hasCustomKey 
                                ? (tempSettings.language === 'vn' ? 'Đã kích hoạt Premium' : 'Premium Activated') 
                                : (tempSettings.language === 'vn' ? 'Mở khóa giới hạn' : 'Unlock Limits')}
                        </h4>
                        <p className="text-sm font-bold text-blue-600/70 mt-1">
                            {tempSettings.language === 'vn' 
                                ? 'Sử dụng API Key cá nhân để tạo ảnh và giọng đọc không giới hạn.' 
                                : 'Use your own API Key for unlimited images and voices.'}
                        </p>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <button 
                        onClick={onSelectKey}
                        className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${hasCustomKey ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        <KeyIcon className="w-5 h-5" />
                        {hasCustomKey 
                            ? (tempSettings.language === 'vn' ? 'Đổi API Key' : 'Change API Key') 
                            : (tempSettings.language === 'vn' ? 'Chọn API Key' : 'Select API Key')}
                    </button>
                    
                    <a 
                        href="https://ai.google.dev/gemini-api/docs/billing" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-xs font-black text-indigo-400 hover:text-indigo-600 py-2 transition-colors"
                    >
                        <span>{tempSettings.language === 'vn' ? 'Xem hướng dẫn thiết lập' : 'View setup guide'}</span>
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </a>
                </div>
            </div>
          </section>

          {/* Section: Profile */}
          <section className="space-y-6">
            <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 border-b-2 border-blue-50 pb-2">
              <UserCircleIcon className="w-5 h-5" /> {t.editProfile}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 ml-4 uppercase tracking-wide">{t.whatName}</label>
                <input 
                  type="text" 
                  value={tempUser.name} 
                  onChange={e => setTempUser({...tempUser, name: e.target.value})}
                  className="w-full px-6 py-4 rounded-[2rem] border-4 border-blue-50 focus:border-blue-400 outline-none font-black text-xl text-blue-900 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="flex items-center gap-1 text-xs font-bold text-gray-400 ml-4 uppercase tracking-wide"><IdentificationIcon className="w-3 h-3"/> {t.howOld}</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="120"
                        value={tempUser.age}
                        onChange={e => setTempUser({...tempUser, age: e.target.value})}
                        className="w-full px-6 py-4 rounded-[2rem] border-4 border-blue-50 bg-white font-black text-xl text-blue-900 outline-none focus:border-blue-400 text-center"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="flex items-center gap-1 text-xs font-bold text-gray-400 ml-4 uppercase tracking-wide"><FaceSmileIcon className="w-3 h-3"/> {t.gender}</label>
                      <div className="flex bg-blue-50/50 p-2 rounded-[2rem] border-4 border-blue-50">
                          <button 
                            onClick={() => setTempUser({...tempUser, gender: 'boy'})}
                            className={`flex-1 py-2 rounded-2xl text-xl transition-all ${tempUser.gender === 'boy' ? 'bg-white shadow-md' : 'opacity-40'}`}
                          >
                              👦
                          </button>
                          <button 
                            onClick={() => setTempUser({...tempUser, gender: 'girl'})}
                            className={`flex-1 py-2 rounded-2xl text-xl transition-all ${tempUser.gender === 'girl' ? 'bg-white shadow-md' : 'opacity-40'}`}
                          >
                              👧
                          </button>
                      </div>
                  </div>
              </div>
              
              <div className="bg-blue-50/50 p-6 rounded-[3rem] border-4 border-white">
                <p className="text-[10px] font-black text-blue-400 mb-4 ml-1 uppercase tracking-widest text-center">{t.pickAvatar}</p>
                <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto p-1 no-scrollbar">
                  {AVATARS.map(a => (
                    <button 
                      key={a} 
                      onClick={() => setTempUser({...tempUser, avatar: a})}
                      className={`text-2xl p-2 rounded-xl transition-all flex items-center justify-center ${tempUser.avatar === a ? 'bg-white shadow-xl scale-110 ring-4 ring-blue-200' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section: App Config */}
          <section className="space-y-6">
            <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 border-b-2 border-blue-50 pb-2">
              <SpeakerWaveIcon className="w-5 h-5" /> {t.accent} & {t.language}
            </h3>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 ml-4 uppercase tracking-wide">{t.language}</label>
                <div className="flex bg-blue-50/50 p-2 rounded-[2.5rem] border-4 border-blue-50">
                  {(['en', 'vn'] as LanguageType[]).map(l => (
                    <button 
                      key={l}
                      onClick={() => setTempSettings({...tempSettings, language: l})}
                      className={`flex-1 py-3 rounded-[2rem] text-sm font-black transition-all ${tempSettings.language === l ? 'bg-white text-blue-600 shadow-md' : 'text-blue-300 hover:text-blue-400'}`}
                    >
                      {l === 'en' ? '🇺🇸 English' : '🇻🇳 Tiếng Việt'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 ml-4 uppercase tracking-wide">{t.accent}</label>
                <div className="flex bg-blue-50/50 p-2 rounded-[2.5rem] border-4 border-blue-50">
                  {(['US', 'UK'] as AccentType[]).map(a => (
                    <button 
                      key={a}
                      onClick={() => setTempSettings({...tempSettings, accent: a})}
                      className={`flex-1 py-3 rounded-[2rem] text-sm font-black transition-all ${tempSettings.accent === a ? 'bg-white text-blue-600 shadow-md' : 'text-blue-300 hover:text-blue-400'}`}
                    >
                      {a === 'US' ? '🇺🇸 US (Mỹ)' : '🇬🇧 UK (Anh)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="p-8 bg-blue-50 border-t-2 border-blue-100 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 font-black text-gray-400 hover:bg-white rounded-[2rem] transition-colors border-2 border-transparent hover:border-blue-100">
            {t.cancel}
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[2rem] shadow-lg shadow-blue-200 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckIcon className="w-6 h-6" /> {t.saveChanges}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
