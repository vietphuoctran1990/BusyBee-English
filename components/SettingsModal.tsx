
import React, { useState, useRef } from 'react';
import { XMarkIcon, UserCircleIcon, GlobeAltIcon, SpeakerWaveIcon, CheckIcon, IdentificationIcon, FaceSmileIcon, KeyIcon, ArrowTopRightOnSquareIcon, SparklesIcon, FireIcon, ChartBarIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/solid';
import { UserProfile, AppSettings, LanguageType, AccentType, UserStats } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface SettingsModalProps {
  user: UserProfile;
  settings: AppSettings;
  stats: UserStats;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onUpdateSettings: (updatedSettings: AppSettings) => void;
  onSelectKey: () => void;
  hasCustomKey: boolean;
  onExportData: () => void;
  onImportData: (data: any) => void;
}

const AVATARS = [
  '🐼', '🦁', '🐸', '🐨', '🐯', '🦄', '🦊', '🐰', '🐲', '🦖', '🐙', '🐳', '🦉', '🐝', '🦩', '🦒', '🐱', '🐶', '🐭', '🐹', '🦦', '🦥', '🦜',
  '🚀', '🤖', '🛸', '🌈', '🧚‍♀️', '🧜‍♂️', '🧙‍♂️', '🦸‍♂️', '🦸‍♀️', '👻', '👽', '🍄',
  '🍓', '🍕', '🍦', '🍭', '🍩', '🎨', '🎸', '⚽', '🎮', '🧘‍♂️', '🧗‍♀️', '☕', '💼',
];

const SettingsModal: React.FC<SettingsModalProps> = ({
  user, settings, stats, onClose, onUpdateUser, onUpdateSettings, onSelectKey, hasCustomKey, onExportData, onImportData,
}) => {
  const [tempUser, setTempUser] = useState<UserProfile>({ ...user });
  const [tempSettings, setTempSettings] = useState<AppSettings>({ ...settings });
  const [importFeedback, setImportFeedback] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[tempSettings.language || 'vn'];

  const handleSave = () => {
    onUpdateUser(tempUser);
    onUpdateSettings(tempSettings);
    onClose();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        onImportData(data);
        setImportFeedback(t.backupImportDone);
        setTimeout(() => setImportFeedback(''), 3000);
      } catch {
        setImportFeedback('File không hợp lệ!');
        setTimeout(() => setImportFeedback(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-scale-up border-4 border-blue-50 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-blue-600 p-6 flex justify-between items-center text-white shrink-0">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <GlobeAltIcon className="w-8 h-8 text-blue-200" /> {t.settings}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">

          {/* Fix #4: Stats Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 border-b-2 border-blue-50 pb-2">
              <ChartBarIcon className="w-5 h-5" /> {t.statsTitle}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-yellow-50 border-2 border-yellow-100 rounded-2xl p-4 text-center">
                <StarIcon className="w-7 h-7 text-yellow-500 mx-auto mb-1" />
                <div className="text-2xl font-black text-yellow-700">{stats.stars || 0}</div>
                <div className="text-[10px] font-black text-yellow-500 uppercase tracking-wider">{t.stars}</div>
              </div>
              <div className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-4 text-center">
                <FireIcon className="w-7 h-7 text-orange-500 mx-auto mb-1" />
                <div className="text-2xl font-black text-orange-700">{stats.streak || 0}</div>
                <div className="text-[10px] font-black text-orange-500 uppercase tracking-wider">{t.streakLabel}</div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 text-center">
                <ChartBarIcon className="w-7 h-7 text-blue-500 mx-auto mb-1" />
                <div className="text-2xl font-black text-blue-700">{stats.cardsCreated || 0}</div>
                <div className="text-[10px] font-black text-blue-500 uppercase tracking-wider">{t.cardsCreated}</div>
              </div>
            </div>
          </section>

          {/* Premium / API Key */}
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
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-xs font-black text-indigo-400 hover:text-indigo-600 py-2 transition-colors"
                >
                  <span>{tempSettings.language === 'vn' ? 'Lấy API Key miễn phí tại đây' : 'Get free API Key here'}</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>

          {/* Profile */}
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
                  onChange={e => setTempUser({ ...tempUser, name: e.target.value })}
                  className="w-full px-6 py-4 rounded-[2rem] border-4 border-blue-50 focus:border-blue-400 outline-none font-black text-xl text-blue-900 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-xs font-bold text-gray-400 ml-4 uppercase tracking-wide"><IdentificationIcon className="w-3 h-3" /> {t.howOld}</label>
                  <input
                    type="number" min="1" max="120"
                    value={tempUser.age}
                    onChange={e => setTempUser({ ...tempUser, age: e.target.value })}
                    className="w-full px-6 py-4 rounded-[2rem] border-4 border-blue-50 bg-white font-black text-xl text-blue-900 outline-none focus:border-blue-400 text-center"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-xs font-bold text-gray-400 ml-4 uppercase tracking-wide"><FaceSmileIcon className="w-3 h-3" /> {t.gender}</label>
                  <div className="flex bg-blue-50/50 p-2 rounded-[2rem] border-4 border-blue-50">
                    <button onClick={() => setTempUser({ ...tempUser, gender: 'boy' })} className={`flex-1 py-2 rounded-2xl text-xl transition-all ${tempUser.gender === 'boy' ? 'bg-white shadow-md' : 'opacity-40'}`}>👦</button>
                    <button onClick={() => setTempUser({ ...tempUser, gender: 'girl' })} className={`flex-1 py-2 rounded-2xl text-xl transition-all ${tempUser.gender === 'girl' ? 'bg-white shadow-md' : 'opacity-40'}`}>👧</button>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50/50 p-6 rounded-[3rem] border-4 border-white">
                <p className="text-[10px] font-black text-blue-400 mb-4 ml-1 uppercase tracking-widest text-center">{t.pickAvatar}</p>
                <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto p-1 no-scrollbar">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      onClick={() => setTempUser({ ...tempUser, avatar: a })}
                      className={`text-2xl p-2 rounded-xl transition-all flex items-center justify-center ${tempUser.avatar === a ? 'bg-white shadow-xl scale-110 ring-4 ring-blue-200' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Language & Accent */}
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
                      onClick={() => setTempSettings({ ...tempSettings, language: l })}
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
                      onClick={() => setTempSettings({ ...tempSettings, accent: a })}
                      className={`flex-1 py-3 rounded-[2rem] text-sm font-black transition-all ${tempSettings.accent === a ? 'bg-white text-blue-600 shadow-md' : 'text-blue-300 hover:text-blue-400'}`}
                    >
                      {a === 'US' ? '🇺🇸 US (Mỹ)' : '🇬🇧 UK (Anh)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Fix #6: Backup Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 border-b-2 border-blue-50 pb-2">
              <ArrowDownTrayIcon className="w-5 h-5" /> {t.backupSection}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onExportData}
                className="flex items-center justify-center gap-2 py-4 bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-200 rounded-2xl font-black text-sm transition-all active:scale-95"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                {t.backupExport}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200 rounded-2xl font-black text-sm transition-all active:scale-95"
              >
                <ArrowUpTrayIcon className="w-5 h-5" />
                {t.backupImport}
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
            {importFeedback && (
              <p className="text-center text-sm font-black text-green-600 animate-fade-in">{importFeedback}</p>
            )}
            <p className="text-xs text-blue-300 font-bold text-center">
              {tempSettings.language === 'vn'
                ? 'Xuất file JSON để sao lưu, nhập lại khi cần khôi phục dữ liệu.'
                : 'Export a JSON file to backup, import to restore your data.'}
            </p>
          </section>

        </div>

        <div className="p-8 bg-blue-50 border-t-2 border-blue-100 flex gap-4 shrink-0">
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
