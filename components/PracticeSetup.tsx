
import React, { useState, useMemo } from 'react';
import { LearningItem, GameType, LanguageType } from '../types';
import { SpeakerWaveIcon, MicrophoneIcon, PencilSquareIcon, CheckCircleIcon, PlayIcon, TagIcon, SparklesIcon, AcademicCapIcon } from '@heroicons/react/24/solid';
import { TRANSLATIONS } from '../utils/translations';

interface PracticeSetupProps {
  savedItems: LearningItem[];
  onStartGame: (selectedItems: LearningItem[], gameType: GameType) => void;
  onCancel: () => void;
  lang: LanguageType;
}

const PracticeSetup: React.FC<PracticeSetupProps> = ({ savedItems, onStartGame, onCancel, lang }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(savedItems.map(i => i.id)));
  const [selectedGame, setSelectedGame] = useState<GameType>('listening');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const t = TRANSLATIONS[lang];

  const topics = useMemo(() => {
    const allTopics = savedItems.map(i => i.topic || 'General');
    return Array.from(new Set(allTopics)).sort();
  }, [savedItems]);

  const visibleItems = useMemo(() => {
    if (!activeTopic) return savedItems;
    return savedItems.filter(i => (i.topic || 'General') === activeTopic);
  }, [savedItems, activeTopic]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAllVisible = () => {
    const newSet = new Set(selectedIds);
    const allVisibleSelected = visibleItems.every(i => selectedIds.has(i.id));
    if (allVisibleSelected) {
      visibleItems.forEach(i => newSet.delete(i.id));
    } else {
      visibleItems.forEach(i => newSet.add(i.id));
    }
    setSelectedIds(newSet);
  };
  
  const handleSmartReview = () => {
    const now = Date.now();
    // Priority 1: SRS-due items (overdue for review)
    const due = savedItems.filter(i => !i.srsNextReview || i.srsNextReview <= now);
    // Priority 2: low proficiency items not yet due, sorted by proficiency ascending
    const notDue = savedItems
      .filter(i => i.srsNextReview && i.srsNextReview > now)
      .sort((a, b) => (a.proficiency ?? 50) - (b.proficiency ?? 50));
    const pool = [...due, ...notDue];
    const smartSet = new Set(pool.slice(0, 20).map(i => i.id));
    // Fill to at least 5 with random items if needed
    if (smartSet.size < 5) {
      savedItems
        .filter(i => !smartSet.has(i.id))
        .sort(() => 0.5 - Math.random())
        .slice(0, 5 - smartSet.size)
        .forEach(i => smartSet.add(i.id));
    }
    setSelectedIds(smartSet);
  };

  const isAllVisibleSelected = visibleItems.length > 0 && visibleItems.every(i => selectedIds.has(i.id));

  const handleStart = () => {
    const selected = savedItems.filter(item => selectedIds.has(item.id));
    const shuffled = [...selected].sort(() => Math.random() - 0.5);
    onStartGame(shuffled, selectedGame);
  };

  const GAME_COLORS: Record<string, { border: string; bg: string; ring: string; badge: string; icon: string }> = {
    blue:   { border: 'border-blue-500',   bg: 'bg-blue-50',   ring: 'ring-blue-200',   badge: 'bg-blue-500',   icon: 'bg-blue-100 text-blue-600' },
    sky:    { border: 'border-sky-500',    bg: 'bg-sky-50',    ring: 'ring-sky-200',    badge: 'bg-sky-500',    icon: 'bg-sky-100 text-sky-600' },
    indigo: { border: 'border-indigo-500', bg: 'bg-indigo-50', ring: 'ring-indigo-200', badge: 'bg-indigo-500', icon: 'bg-indigo-100 text-indigo-600' },
  };

  const GameOption = ({ type, icon: Icon, title, desc, color }: { type: GameType, icon: any, title: string, desc: string, color: string }) => {
    const c = GAME_COLORS[color] ?? GAME_COLORS.blue;
    const active = selectedGame === type;
    return (
      <button
        onClick={() => setSelectedGame(type)}
        className={`relative p-4 rounded-2xl border-4 text-left transition-all duration-200 ${active ? `${c.border} ${c.bg} ring-2 ${c.ring} scale-105 shadow-xl` : 'border-gray-100 bg-white hover:bg-gray-50'}`}
      >
        {active && (
          <div className={`absolute -top-3 -right-3 ${c.badge} text-white p-1 rounded-full shadow-md`}>
            <CheckCircleIcon className="w-5 h-5" />
          </div>
        )}
        <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center mb-3`}>
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="font-black text-gray-800 text-lg">{title}</h3>
        <p className="text-sm text-gray-500 font-medium leading-tight">{desc}</p>
      </button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-blue-900 mb-2">{t.practiceTime}</h2>
        <p className="text-blue-500 font-medium">{t.chooseGame}</p>
      </div>

      <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-3 mb-8">
        <GameOption 
          type="listening" 
          icon={SpeakerWaveIcon} 
          title={t.listening} 
          desc={t.listeningDesc}
          color="blue"
        />
        <GameOption 
          type="speaking" 
          icon={MicrophoneIcon} 
          title={t.speaking}
          desc={t.speakingDesc}
          color="sky"
        />
        <GameOption 
          type="spelling" 
          icon={PencilSquareIcon} 
          title={t.spelling}
          desc={t.spellingDesc}
          color="indigo"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-lg border-2 border-blue-50 overflow-hidden">
        <div className="p-4 bg-white border-b border-blue-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div className="flex flex-wrap gap-2">
              <button
                 onClick={() => setActiveTopic(null)}
                 className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-all border-2 ${
                    activeTopic === null ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                 }`}
              >
                 {t.allWords}
              </button>
              {topics.map(topic => (
                 <button
                    key={topic}
                    onClick={() => setActiveTopic(topic === activeTopic ? null : topic)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-all border-2 ${
                       activeTopic === topic ? 'bg-blue-500 border-blue-500 text-white shadow-md' : 'bg-white text-blue-500 border-blue-100 hover:bg-blue-50'
                    }`}
                 >
                    {topic}
                 </button>
              ))}
           </div>
           <button onClick={handleSmartReview} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95">
               <AcademicCapIcon className="w-5 h-5" />
               <span className="font-bold text-sm">{t.smartReview}</span>
           </button>
        </div>

        <div className="p-4 bg-blue-50 flex items-center justify-between border-b border-blue-100">
          <h3 className="font-bold text-blue-900">{activeTopic || t.allWords} ({visibleItems.length})</h3>
          <button onClick={handleSelectAllVisible} className="text-sm font-bold text-blue-600 hover:underline bg-white px-3 py-1 rounded-lg border border-blue-200 shadow-sm">
            {isAllVisibleSelected ? t.deselectAll : t.selectAll}
          </button>
        </div>
        
        <div className="max-h-64 overflow-y-auto p-2 grid grid-cols-1 min-[480px]:grid-cols-2 gap-2 bg-blue-50/50">
          {visibleItems.length === 0 ? (
             <div className="col-span-full py-8 text-center text-gray-400 font-medium">{t.noSaved}</div>
          ) : (
            visibleItems.map(item => (
                <div key={item.id} onClick={() => toggleSelection(item.id)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all bg-white min-h-[56px] ${selectedIds.has(item.id) ? 'border-blue-400 bg-blue-50' : 'border-transparent hover:border-blue-100 shadow-sm'}`}>
                    {/* Checkbox — min 44px touch area */}
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedIds.has(item.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                        {selectedIds.has(item.id) && <CheckCircleIcon className="w-5 h-5 text-white" />}
                    </div>
                    {item.imageUrl ? (
                        <img src={`data:image/png;base64,${item.imageUrl}`} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" />
                    ) : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-base shrink-0">🖼️</div>}
                    <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-700 block truncate text-sm">{item.text}</span>
                        <div className="flex gap-1 mt-1">
                           {[20, 50, 80].map(v => (
                               <div key={v} className={`w-2.5 h-2.5 rounded-full ${(item.proficiency || 0) >= v ? 'bg-blue-400' : 'bg-gray-200'}`} />
                           ))}
                        </div>
                    </div>
                </div>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button onClick={onCancel} className="px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">{t.back}</button>
        <div className="flex-1 flex gap-4">
            <button 
              onClick={handleStart}
              disabled={selectedIds.size < 1}
              className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transform active:scale-95 transition-all disabled:opacity-50"
            >
              <PlayIcon className="w-6 h-6" />
              {t.start}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeSetup;
