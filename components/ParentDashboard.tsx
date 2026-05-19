
import React, { useMemo, useState } from 'react';
import {
  XMarkIcon, ChartBarIcon, ClockIcon, BookOpenIcon,
  ExclamationCircleIcon, FireIcon, StarIcon, AcademicCapIcon,
  LockClosedIcon, ShieldCheckIcon,
} from '@heroicons/react/24/solid';
import { LearningItem, UserStats, LanguageType, StoryData } from '../types';

const PARENT_PIN_KEY = 'busybee_parent_pin';

interface ParentDashboardProps {
  stats: UserStats;
  items: LearningItem[];
  stories: StoryData[];
  lang: LanguageType;
  onClose: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ stats, items, stories, lang, onClose }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [settingPin, setSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');

  const hasPin = !!localStorage.getItem(PARENT_PIN_KEY);

  const handleUnlock = () => {
    const saved = localStorage.getItem(PARENT_PIN_KEY);
    if (saved === pin) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1500);
    }
  };

  const handleSetPin = () => {
    if (pin.length !== 4 || pin !== confirmPin) {
      setPinError(true);
      return;
    }
    localStorage.setItem(PARENT_PIN_KEY, pin);
    setUnlocked(true);
    setSettingPin(false);
  };

  const savedItems = useMemo(() => items.filter(i => i.isSaved), [items]);
  const totalProficiency = useMemo(
    () => savedItems.reduce((sum, i) => sum + (i.proficiency || 0), 0),
    [savedItems],
  );
  const avgProficiency = savedItems.length > 0 ? Math.round(totalProficiency / savedItems.length) : 0;
  const mastered = savedItems.filter(i => (i.proficiency || 0) >= 80);
  const struggling = useMemo(
    () => savedItems.filter(i => (i.proficiency || 0) < 50 && (i.proficiency || 0) > 0)
      .sort((a, b) => (a.proficiency || 0) - (b.proficiency || 0))
      .slice(0, 5),
    [savedItems],
  );

  const topicStats = useMemo(() => {
    const map = new Map<string, { count: number; mastered: number }>();
    savedItems.forEach(i => {
      const topic = i.topic || 'General';
      const cur = map.get(topic) || { count: 0, mastered: 0 };
      cur.count++;
      if ((i.proficiency || 0) >= 80) cur.mastered++;
      map.set(topic, cur);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 6);
  }, [savedItems]);

  const totalCardsCreated = stats.cardsCreated || 0;
  const totalStories = stories.length;

  // PIN setup screen
  if (!hasPin && !unlocked) {
    return (
      <div className="fixed inset-0 z-[250] bg-blue-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-scale-up" onClick={e => e.stopPropagation()}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShieldCheckIcon className="w-9 h-9 text-blue-600" />
            </div>
            <h2 className="text-xl font-black text-blue-900 mb-1">{lang === 'vn' ? 'Đặt mã PIN phụ huynh' : 'Set Parent PIN'}</h2>
            <p className="text-blue-400 text-sm font-bold">{lang === 'vn' ? 'Mã 4 số để khoá dashboard' : '4-digit code to lock dashboard'}</p>
          </div>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="****"
            className={`w-full text-center text-3xl font-black tracking-[1em] py-4 mb-3 border-2 rounded-2xl ${pinError ? 'border-red-300 bg-red-50 animate-shake' : 'border-blue-200'}`}
          />
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={confirmPin}
            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder={lang === 'vn' ? 'Xác nhận' : 'Confirm'}
            className="w-full text-center text-2xl font-black tracking-[1em] py-3 mb-4 border-2 border-blue-200 rounded-2xl"
          />
          {pinError && <p className="text-red-500 text-xs font-black text-center mb-3">{lang === 'vn' ? 'Mã PIN không khớp hoặc thiếu' : 'PIN does not match or invalid'}</p>}
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-3 text-gray-400 font-black rounded-2xl bg-gray-50">{lang === 'vn' ? 'Huỷ' : 'Cancel'}</button>
            <button onClick={handleSetPin} className="flex-1 py-3 bg-blue-500 text-white font-black rounded-2xl shadow-lg">{lang === 'vn' ? 'Lưu' : 'Save'}</button>
          </div>
        </div>
      </div>
    );
  }

  // Unlock screen
  if (!unlocked) {
    return (
      <div className="fixed inset-0 z-[250] bg-blue-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-scale-up" onClick={e => e.stopPropagation()}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <LockClosedIcon className="w-9 h-9 text-blue-600" />
            </div>
            <h2 className="text-xl font-black text-blue-900 mb-1">{lang === 'vn' ? 'Nhập mã phụ huynh' : 'Enter Parent PIN'}</h2>
          </div>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            autoFocus
            value={pin}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 4);
              setPin(v);
              if (v.length === 4) {
                const saved = localStorage.getItem(PARENT_PIN_KEY);
                if (saved === v) { setUnlocked(true); setPinError(false); }
                else { setPinError(true); setTimeout(() => { setPinError(false); setPin(''); }, 800); }
              }
            }}
            placeholder="****"
            className={`w-full text-center text-4xl font-black tracking-[1em] py-5 mb-4 border-2 rounded-2xl ${pinError ? 'border-red-300 bg-red-50 animate-shake' : 'border-blue-200'}`}
          />
          {pinError && <p className="text-red-500 text-xs font-black text-center mb-3">{lang === 'vn' ? 'Sai mã PIN' : 'Wrong PIN'}</p>}
          <button onClick={onClose} className="w-full py-3 text-gray-400 font-black rounded-2xl bg-gray-50">{lang === 'vn' ? 'Huỷ' : 'Cancel'}</button>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="fixed inset-0 z-[250] bg-blue-900/70 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in" onClick={onClose}>
      <div className="bg-[#F0F9FF] w-full max-w-2xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden animate-scale-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-6 h-6" />
            <h2 className="text-lg font-black">{lang === 'vn' ? 'Trang phụ huynh' : 'Parent Dashboard'}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Top stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={FireIcon} color="orange" label={lang === 'vn' ? 'Chuỗi ngày' : 'Streak'} value={`${stats.streak ?? 0}`} suffix={lang === 'vn' ? 'ngày' : 'days'} />
            <StatCard icon={StarIcon} color="yellow" label={lang === 'vn' ? 'Ngôi sao' : 'Stars'} value={`${stats.stars ?? 0}`} />
            <StatCard icon={BookOpenIcon} color="blue" label={lang === 'vn' ? 'Thẻ đã tạo' : 'Cards created'} value={`${totalCardsCreated}`} />
            <StatCard icon={AcademicCapIcon} color="green" label={lang === 'vn' ? 'Thành thạo' : 'Mastered'} value={`${mastered.length}`} suffix={`/${savedItems.length}`} />
          </div>

          {/* Average proficiency */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black text-blue-400 uppercase tracking-widest">{lang === 'vn' ? 'Mức độ thành thạo trung bình' : 'Average proficiency'}</p>
              <span className="font-black text-blue-900 text-lg">{avgProficiency}%</span>
            </div>
            <div className="h-3 bg-blue-50 rounded-full overflow-hidden">
              <div className={`h-full transition-all ${avgProficiency >= 80 ? 'bg-green-500' : avgProficiency >= 50 ? 'bg-blue-500' : 'bg-orange-400'}`} style={{ width: `${avgProficiency}%` }} />
            </div>
          </div>

          {/* Topic breakdown */}
          {topicStats.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">{lang === 'vn' ? 'Chủ đề đã học' : 'Topics learned'}</p>
              <div className="space-y-2">
                {topicStats.map(([topic, s]) => (
                  <div key={topic} className="flex items-center gap-3">
                    <span className="flex-1 font-black text-blue-900 text-sm truncate">{topic}</span>
                    <div className="flex-1 max-w-[120px] h-2 bg-blue-50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${(s.mastered / s.count) * 100}%` }} />
                    </div>
                    <span className="text-xs font-black text-blue-500 w-12 text-right">{s.mastered}/{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Struggling words */}
          {struggling.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ExclamationCircleIcon className="w-5 h-5 text-orange-500" />
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest">{lang === 'vn' ? 'Từ con đang gặp khó khăn' : 'Words to revisit'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {struggling.map(w => (
                  <div key={w.id} className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-2">
                    {w.emoji && <span>{w.emoji}</span>}
                    <span className="font-black text-orange-700 text-sm">{w.text}</span>
                    <span className="text-orange-400 text-[10px] font-bold">{w.proficiency || 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 border-2 border-indigo-100">
            <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">{lang === 'vn' ? 'Đề xuất' : 'Recommendations'}</p>
            <ul className="space-y-1.5 text-sm font-bold text-indigo-700">
              {struggling.length > 0 && <li className="flex gap-2"><span>📌</span><span>{lang === 'vn' ? `Cùng ôn lại ${struggling.length} từ con đang quên.` : `Review ${struggling.length} words that need work.`}</span></li>}
              {(stats.streak ?? 0) === 0 && <li className="flex gap-2"><span>🔥</span><span>{lang === 'vn' ? 'Khuyến khích con học mỗi ngày để giữ streak.' : 'Encourage daily practice to build a streak.'}</span></li>}
              {totalStories === 0 && <li className="flex gap-2"><span>📖</span><span>{lang === 'vn' ? 'Thử tạo truyện AI từ các từ đã học.' : 'Try creating an AI story from saved words.'}</span></li>}
              {savedItems.length < 10 && <li className="flex gap-2"><span>💡</span><span>{lang === 'vn' ? 'Thêm nhiều thẻ hơn (mục tiêu 20-30 thẻ).' : 'Add more cards (target 20-30).'}</span></li>}
              {mastered.length >= 10 && <li className="flex gap-2"><span>🌟</span><span>{lang === 'vn' ? 'Con đang tiến bộ rất tốt!' : 'Great progress so far!'}</span></li>}
            </ul>
          </div>

          {/* Change PIN */}
          <div className="text-center">
            <button
              onClick={() => {
                if (confirm(lang === 'vn' ? 'Đặt lại mã PIN?' : 'Reset PIN?')) {
                  localStorage.removeItem(PARENT_PIN_KEY);
                  setUnlocked(false);
                  setPin('');
                  setConfirmPin('');
                }
              }}
              className="text-xs font-black text-blue-400 underline"
            >
              {lang === 'vn' ? 'Đổi mã PIN' : 'Reset PIN'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: any;
  color: string;
  label: string;
  value: string;
  suffix?: string;
}> = ({ icon: Icon, color, label, value, suffix }) => {
  const colorMap: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
  };
  return (
    <div className={`rounded-2xl p-4 border-2 ${colorMap[color]} shadow-sm`}>
      <Icon className="w-5 h-5 mb-2 opacity-80" />
      <p className="text-2xl font-black leading-none">{value}<span className="text-sm opacity-70">{suffix}</span></p>
      <p className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
};

export default ParentDashboard;
