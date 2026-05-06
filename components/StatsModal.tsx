
import React, { useMemo } from 'react';
import { XMarkIcon, StarIcon, FireIcon, ChartBarIcon, BookOpenIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { LearningItem, UserStats, LanguageType } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface StatsModalProps {
  stats: UserStats;
  items: LearningItem[];
  lang: LanguageType;
  onClose: () => void;
}

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_VN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const StatsModal: React.FC<StatsModalProps> = ({ stats, items, lang, onClose }) => {
  const t = TRANSLATIONS[lang];

  // Build labels for last 7 days based on actual weekdays (index 6 = today)
  const dayLabels = useMemo(() => {
    const labels = lang === 'vn' ? DAYS_VN : DAYS_EN;
    const todayDow = new Date().getDay(); // 0=Sun
    return Array.from({ length: 7 }, (_, i) => {
      const dow = (todayDow - (6 - i) + 7) % 7;
      return labels[dow];
    });
  }, [lang]);

  // Weekly activity — last 7 days
  const weeklyActivity = useMemo(() => {
    const counts = new Array(7).fill(0);
    const now = Date.now();
    items.forEach(item => {
      const daysAgo = Math.floor((now - item.createdAt) / 86_400_000);
      if (daysAgo >= 0 && daysAgo < 7) {
        const dayIndex = 6 - daysAgo; // 0 = Mon-ish, 6 = today
        counts[dayIndex]++;
      }
    });
    return counts;
  }, [items]);

  const maxActivity = Math.max(...weeklyActivity, 1);

  // Topics breakdown
  const topicBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    items.filter(i => i.isSaved).forEach(i => {
      const topic = i.topic || 'General';
      map[topic] = (map[topic] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [items]);

  const totalSaved = items.filter(i => i.isSaved).length;
  const totalDue = items.filter(i => i.isSaved && (!i.srsNextReview || i.srsNextReview <= Date.now())).length;
  const avgProficiency = items.filter(i => i.isSaved && i.proficiency !== undefined).reduce((a, b) => a + (b.proficiency ?? 0), 0) / Math.max(1, items.filter(i => i.isSaved && i.proficiency !== undefined).length);

  const TOPIC_COLORS = ['bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400', 'bg-orange-400', 'bg-green-400'];

  return (
    <div
      className="fixed inset-0 z-[150] bg-blue-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border-4 border-blue-50 flex flex-col max-h-[90vh] animate-scale-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-600 px-6 py-5 flex justify-between items-center text-white shrink-0">
          <h2 className="text-xl font-black flex items-center gap-2">
            <ChartBarIcon className="w-7 h-7 text-blue-200" />
            {t.statsScreen}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">

          {/* Summary stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-yellow-50 border-2 border-yellow-100 rounded-2xl p-4 text-center">
              <StarIcon className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
              <div className="text-2xl font-black text-yellow-700">{stats.stars || 0}</div>
              <div className="text-[10px] font-black text-yellow-500 uppercase tracking-wide">{t.stars}</div>
            </div>
            <div className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-4 text-center">
              <FireIcon className="w-6 h-6 text-orange-500 mx-auto mb-1" />
              <div className="text-2xl font-black text-orange-700">{stats.streak || 0}</div>
              <div className="text-[10px] font-black text-orange-500 uppercase tracking-wide">{t.streakLabel}</div>
            </div>
            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 text-center">
              <BookOpenIcon className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <div className="text-2xl font-black text-blue-700">{totalSaved}</div>
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-wide">{t.saved}</div>
            </div>
          </div>

          {/* SRS review due */}
          {totalDue > 0 && (
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3 bg-indigo-500 rounded-xl">
                <TrophyIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-black text-indigo-800">
                  {totalDue} {lang === 'vn' ? 'thẻ đến hạn ôn tập' : 'cards due for review'}
                </p>
                <p className="text-indigo-400 text-xs font-bold">
                  {lang === 'vn' ? 'Bắt đầu Quiz Nhanh để ôn ngay!' : 'Start Quick Quiz to review now!'}
                </p>
              </div>
            </div>
          )}

          {/* Weekly activity bar chart */}
          <div>
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4" /> {t.statsWeekly}
            </h3>
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="flex items-end gap-2 h-20">
                {weeklyActivity.map((count, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-blue-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(count / maxActivity) * 64}px`, minHeight: count > 0 ? '8px' : '2px', opacity: count > 0 ? 1 : 0.2 }}
                    />
                    <span className="text-[9px] font-black text-blue-400">{dayLabels[i]}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs font-bold text-blue-300 mt-2">
                {weeklyActivity.reduce((a, b) => a + b, 0)} {lang === 'vn' ? 'thẻ tạo trong 7 ngày' : 'cards created in 7 days'}
              </p>
            </div>
          </div>

          {/* Proficiency */}
          <div>
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">
              {t.statsReviewAccuracy}
            </h3>
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-black text-blue-700">{Math.round(avgProficiency || 0)}%</div>
                <div className="flex-1 h-4 bg-white rounded-full overflow-hidden border border-blue-100">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${avgProficiency || 0}%` }}
                  />
                </div>
              </div>
              <p className="text-xs font-bold text-blue-300 mt-2">
                {lang === 'vn' ? 'Độ thành thạo trung bình của tất cả thẻ đã lưu' : 'Average proficiency across all saved cards'}
              </p>
            </div>
          </div>

          {/* Topics breakdown */}
          {topicBreakdown.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">
                {t.statsByTopic}
              </h3>
              <div className="space-y-2">
                {topicBreakdown.map(([topic, count], i) => (
                  <div key={topic} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${TOPIC_COLORS[i % TOPIC_COLORS.length]} shrink-0`} />
                    <span className="flex-1 text-sm font-bold text-blue-800 truncate">{topic}</span>
                    <span className="font-black text-blue-500 text-sm">{count}</span>
                    <div className="w-24 h-2 bg-blue-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${TOPIC_COLORS[i % TOPIC_COLORS.length]}`}
                        style={{ width: `${(count / totalSaved) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All-time stats */}
          <div>
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">
              {t.statsAllTime}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-2xl font-black text-blue-700">{stats.cardsCreated || 0}</p>
                <p className="text-xs font-black text-blue-400 uppercase tracking-wide mt-1">{t.cardsCreated}</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4">
                <p className="text-2xl font-black text-green-700">{stats.streak || 0}</p>
                <p className="text-xs font-black text-green-400 uppercase tracking-wide mt-1">{t.statsStreak}</p>
              </div>
            </div>
          </div>

        </div>

        <div className="p-5 border-t border-blue-50 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-4 bg-blue-500 text-white font-black rounded-[2rem] shadow-lg active:scale-95 transition-all"
          >
            {lang === 'vn' ? 'Xong!' : 'Done!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
