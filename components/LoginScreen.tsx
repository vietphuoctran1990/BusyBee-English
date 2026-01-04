
import React, { useState } from 'react';
import { UserProfile, AppSettings, LanguageType } from '../types';
import { RocketLaunchIcon, SparklesIcon, FaceSmileIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { playSFX } from '../services/audioUtils';

const AVATARS = [
    '🐼', '🦁', '🐸', '🐨', '🐯', '🦄', '🦊', '🐰', '🐲', '🦖', '🐙', '🐳', '🦉', '🐝', '🦩', '🦒', '🐱', '🐶', '🐭', '🐹', '🦦', '🦥', '🦜',
    '🚀', '🤖', '🛸', '🌈', '🧚‍♀️', '🧜‍♂️', '🧙‍♂️', '🦸‍♂️', '🦸‍♀️', '👻', '👽', '🍄'
];

interface LoginScreenProps {
  onLogin: (profile: UserProfile, settings: AppSettings) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('5');
  const [gender, setGender] = useState<'boy' | 'girl'>('boy');
  const [avatar, setAvatar] = useState('🐝');
  const [lang, setLang] = useState<LanguageType>('vn');
  const [isLaunching, setIsLaunching] = useState(false);

  const handleStart = () => {
    if (!name.trim() || isLaunching) return;
    setIsLaunching(true);
    playSFX('success');
    
    // Tạo hiệu ứng chuyển cảnh 1.2s để bé thấy tên lửa bay
    setTimeout(() => {
      try {
        const profile: UserProfile = {
          id: 'u_' + Date.now(),
          name: name.trim(),
          age,
          gender,
          avatar,
          preferredLanguage: lang
        };
        const settings: AppSettings = {
          accent: 'US',
          language: lang
        };
        onLogin(profile, settings);
      } catch (e) {
        console.error("Login transition failed", e);
        setIsLaunching(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-pink-200/30 rounded-full blur-[80px] md:blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-200/30 rounded-full blur-[80px] md:blur-[150px] animate-pulse"></div>

        <div className="clay-card p-6 md:p-10 lg:p-14 w-full max-w-xl bg-white/80 backdrop-blur-xl animate-scale-up relative z-10 border-4 md:border-8 border-white max-h-[95vh] overflow-y-auto no-scrollbar">
            <div className="text-center mb-6 md:mb-10">
                <div className="text-6xl md:text-8xl mb-4 animate-float">🐝</div>
                <h1 className="text-3xl md:text-5xl font-black text-blue-900 leading-tight">Busy Bee English</h1>
                <p className="text-blue-500 font-bold text-sm md:text-xl mt-2">Bé ơi, sẵn sàng học tiếng Anh chưa?</p>
            </div>

            <div className="space-y-5 md:space-y-8 text-left">
                {/* Name field */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs md:text-sm font-black text-blue-400 uppercase tracking-widest ml-4">
                        <UserIcon className="w-4 h-4"/> Tên của bé là gì?
                    </label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nhập tên bé..."
                        className="w-full px-6 py-4 md:py-5 clay-input text-xl md:text-2xl font-black text-blue-900 focus:ring-4 ring-blue-100 outline-none transition-all placeholder-blue-100"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Age field */}
                    <div className="space-y-2">
                        <label className="text-[10px] md:text-xs font-black text-blue-400 uppercase tracking-widest ml-4">Bao nhiêu tuổi?</label>
                        <input 
                            type="number" 
                            value={age}
                            onChange={e => setAge(e.target.value)}
                            className="w-full px-6 py-4 md:py-5 clay-input text-xl md:text-2xl font-black text-blue-900 text-center outline-none"
                        />
                    </div>
                    {/* Gender field */}
                    <div className="space-y-2">
                        <label className="text-[10px] md:text-xs font-black text-blue-400 uppercase tracking-widest ml-4">Bé là...</label>
                        <div className="flex bg-blue-50/50 p-2 rounded-[1.5rem] md:rounded-[2rem] border-2 border-white shadow-inner">
                            <button onClick={() => { setGender('boy'); playSFX('pop'); }} className={`flex-1 py-2 md:py-3 rounded-xl md:rounded-2xl text-xl md:text-2xl transition-all ${gender==='boy'?'bg-white shadow-md':'opacity-40'}`}>👦</button>
                            <button onClick={() => { setGender('girl'); playSFX('pop'); }} className={`flex-1 py-2 md:py-3 rounded-xl md:rounded-2xl text-xl md:text-2xl transition-all ${gender==='girl'?'bg-white shadow-md':'opacity-40'}`}>👧</button>
                        </div>
                    </div>
                </div>

                {/* Avatar Selection */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs md:text-sm font-black text-blue-400 uppercase tracking-widest ml-4">
                        <FaceSmileIcon className="w-4 h-4"/> Chọn hình đại diện
                    </label>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 md:p-4 clay-input bg-white/50 max-h-32 overflow-y-auto no-scrollbar">
                        {AVATARS.map(a => (
                            <button 
                                key={a} 
                                onClick={() => { setAvatar(a); playSFX('click'); }} 
                                className={`text-2xl md:text-3xl p-2 rounded-xl transition-all ${avatar === a ? 'bg-white shadow-lg ring-2 ring-blue-300 scale-110' : 'opacity-40 hover:opacity-100'}`}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Language selection */}
                <div className="space-y-2">
                   <label className="text-[10px] md:text-xs font-black text-blue-400 uppercase tracking-widest ml-4">Ngôn ngữ</label>
                   <div className="flex gap-4">
                       <button onClick={() => setLang('vn')} className={`flex-1 py-3 md:py-4 rounded-2xl font-black transition-all border-4 ${lang==='vn'?'bg-white border-blue-400 text-blue-600 shadow-md':'bg-gray-100 border-transparent text-gray-400'}`}>🇻🇳 Tiếng Việt</button>
                       <button onClick={() => setLang('en')} className={`flex-1 py-3 md:py-4 rounded-2xl font-black transition-all border-4 ${lang==='en'?'bg-white border-blue-400 text-blue-600 shadow-md':'bg-gray-100 border-transparent text-gray-400'}`}>🇺🇸 English</button>
                   </div>
                </div>

                {/* Start Button */}
                <button 
                    disabled={!name.trim() || isLaunching}
                    onClick={handleStart}
                    className="w-full py-5 md:py-7 clay-button clay-pink text-white font-black text-xl md:text-3xl shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95 group"
                >
                    <span>Bắt đầu học nào</span>
                    <RocketLaunchIcon className="w-8 h-8 md:w-10 md:h-10 group-hover:translate-x-1 group-hover:translate-y-[-2px] transition-transform"/>
                </button>
            </div>
        </div>

        {/* Màn hình Launching Overlay - Z-index cực cao để che phủ toàn bộ */}
        {isLaunching && (
          <div className="fixed inset-0 z-[999] bg-blue-600 flex flex-col items-center justify-center text-white animate-fade-in pointer-events-auto">
             {/* Nút thoát khẩn cấp nếu bị kẹt quá lâu */}
             <button 
                onClick={() => setIsLaunching(false)}
                className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/40 rounded-full transition-all active:scale-90"
             >
                <XMarkIcon className="w-8 h-8" />
             </button>

             <div className="relative">
                <div className="text-8xl md:text-[12rem] animate-float relative z-10">🚀</div>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-40 bg-gradient-to-t from-transparent via-orange-400 to-yellow-300 blur-xl opacity-80 animate-pulse"></div>
             </div>
             <div className="mt-12 text-center space-y-4 px-6">
                <h2 className="text-4xl md:text-6xl font-black italic tracking-widest animate-bounce">BẮT ĐẦU HỌC NÀO!</h2>
                <div className="flex items-center justify-center gap-2">
                   <SparklesIcon className="w-6 h-6 text-yellow-300 animate-spin" />
                   <p className="text-xl md:text-2xl font-bold opacity-80 uppercase tracking-widest">Bé khởi hành đây...</p>
                </div>
             </div>
          </div>
        )}
    </div>
  );
};

export default LoginScreen;
