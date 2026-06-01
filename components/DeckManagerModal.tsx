
import React, { useState } from 'react';
import {
  XMarkIcon, PlusIcon, TrashIcon, ChevronRightIcon,
  ChevronLeftIcon, CheckIcon, PencilSquareIcon,
} from '@heroicons/react/24/solid';
import { Deck, LearningItem, LanguageType } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface DeckManagerModalProps {
  decks: Deck[];
  items: LearningItem[];
  lang: LanguageType;
  onClose: () => void;
  onCreateDeck: (name: string, emoji: string, color: string) => void;
  onDeleteDeck: (id: string) => void;
  onToggleItemInDeck: (deckId: string, itemId: string) => void;
  onRenameDeck: (id: string, name: string, emoji: string) => void;
}

const DECK_COLORS = [
  { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400' },
  { bg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-700', dot: 'bg-pink-400' },
  { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-400' },
  { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-400' },
  { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-400' },
];

const QUICK_EMOJIS = ['📚', '🐾', '🍎', '🏫', '🌈', '🚀', '🎵', '🌸', '⭐', '🔢', '🌍', '🏠', '🎨', '🐠', '🦁', '🍭', '🌊', '🎯'];

const DeckManagerModal: React.FC<DeckManagerModalProps> = ({
  decks, items, lang, onClose, onCreateDeck, onDeleteDeck, onToggleItemInDeck, onRenameDeck,
}) => {
  const t = TRANSLATIONS[lang];
  const [viewDeckId, setViewDeckId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📚');
  const [newColor, setNewColor] = useState('bg-blue-100');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('');

  const savedItems = items.filter(i => i.isSaved && !i.loading && !i.error);
  const viewDeck = viewDeckId ? decks.find(d => d.id === viewDeckId) ?? null : null;

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreateDeck(newName.trim(), newEmoji, newColor);
    setNewName('');
    setNewEmoji('📚');
    setNewColor('bg-blue-100');
    setShowCreate(false);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;
    onRenameDeck(editingId, editName.trim(), editEmoji);
    setEditingId(null);
  };

  const colorFor = (bg: string) => DECK_COLORS.find(c => c.bg === bg) ?? DECK_COLORS[0];

  return (
    <div className="fixed inset-0 z-[180] bg-blue-900/60 backdrop-blur-md flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="w-full md:max-w-2xl max-h-[90vh] md:max-h-[85vh] bg-white flex flex-col overflow-hidden rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-blue-50 flex items-center justify-between shrink-0">
          {viewDeck ? (
            <button onClick={() => { setViewDeckId(null); setEditingId(null); }} className="flex items-center gap-2 text-blue-500 font-black text-sm hover:text-blue-700 transition-colors">
              <ChevronLeftIcon className="w-5 h-5" /> {t.deckLabel}
            </button>
          ) : (
            <h2 className="text-xl font-black text-blue-900">{t.deckManage}</h2>
          )}
          <button onClick={onClose} aria-label="Đóng" className="p-2 bg-gray-100 rounded-xl text-gray-400 hover:bg-gray-200 transition-all">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6">

          {/* ── Deck detail ── */}
          {viewDeck && (
            <div className="animate-fade-in space-y-4">
              {/* Deck header */}
              <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${colorFor(viewDeck.color).bg} ${colorFor(viewDeck.color).border}`}>
                <span className="text-4xl shrink-0">{viewDeck.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-black truncate ${colorFor(viewDeck.color).text}`}>{viewDeck.name}</h3>
                  <p className="text-sm text-gray-500 font-bold">{viewDeck.itemIds.length} {t.deckCards}</p>
                </div>
                <button
                  onClick={() => { setEditingId(viewDeck.id); setEditName(viewDeck.name); setEditEmoji(viewDeck.emoji); }}
                  className="p-2 bg-white/60 rounded-xl text-gray-400 hover:text-blue-500 transition-all"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Inline edit */}
              {editingId === viewDeck.id && (
                <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100 animate-fade-in space-y-3">
                  <div className="flex gap-2 items-center">
                    <span className="text-2xl">{editEmoji}</span>
                    <input
                      className="flex-1 clay-input px-3 py-2 font-black text-blue-900 outline-none text-sm"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_EMOJIS.map(em => (
                      <button key={em} onClick={() => setEditEmoji(em)} className={`text-xl p-1.5 rounded-xl transition-all ${editEmoji === em ? 'bg-blue-200 scale-110' : 'hover:bg-blue-100'}`}>{em}</button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} className="flex-1 py-2.5 clay-button clay-blue text-white font-black text-sm">Lưu</button>
                    <button onClick={() => setEditingId(null)} className="px-4 py-2.5 bg-white text-gray-400 rounded-2xl font-black text-sm">Huỷ</button>
                  </div>
                </div>
              )}

              {/* Cards checklist */}
              {savedItems.length === 0 ? (
                <p className="text-center text-blue-200 font-bold py-10">{t.emptyPracticeDesc}</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-black text-blue-300 uppercase tracking-wider mb-3">
                    {lang === 'vn' ? 'Chọn thẻ cho bộ này' : 'Select cards for this deck'}
                  </p>
                  {savedItems.map(item => {
                    const inDeck = viewDeck.itemIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => onToggleItemInDeck(viewDeck.id, item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border-2 text-left active:scale-[0.99] ${inDeck ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-blue-100'}`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${inDeck ? 'bg-blue-500' : 'bg-gray-100'}`}>
                          {inDeck
                            ? <CheckIcon className="w-4 h-4 text-white" />
                            : <span className="text-base leading-none">{item.emoji || '📝'}</span>
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-blue-900 text-sm truncate capitalize">{item.text}</p>
                          {item.vietnameseTranslation && (
                            <p className="text-xs text-blue-400 truncate">{item.vietnameseTranslation}</p>
                          )}
                        </div>
                        {item.topic && (
                          <span className="text-[10px] font-black text-blue-300 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg shrink-0">{item.topic}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Delete deck */}
              <button
                onClick={() => {
                  if (confirm(t.deckDeleteConfirm)) {
                    onDeleteDeck(viewDeck.id);
                    setViewDeckId(null);
                  }
                }}
                className="mt-2 w-full py-3 bg-red-50 text-red-400 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-all border-2 border-red-100"
              >
                <TrashIcon className="w-4 h-4" /> {t.deckDelete}
              </button>
            </div>
          )}

          {/* ── Deck list ── */}
          {!viewDeck && (
            <div className="animate-fade-in space-y-3">
              {decks.length === 0 && !showCreate && (
                <div className="py-14 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-black text-blue-300 mb-2">{t.deckEmpty}</h3>
                  <p className="text-blue-200 font-bold text-sm max-w-xs mx-auto">{t.deckEmptyDesc}</p>
                </div>
              )}

              {decks.map(deck => {
                const c = colorFor(deck.color);
                return (
                  <button
                    key={deck.id}
                    onClick={() => setViewDeckId(deck.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${c.bg} ${c.border}`}
                  >
                    <span className="text-3xl shrink-0">{deck.emoji}</span>
                    <div className="text-left min-w-0 flex-1">
                      <p className={`font-black text-base truncate ${c.text}`}>{deck.name}</p>
                      <p className="text-xs text-gray-500 font-bold">{deck.itemIds.length} {t.deckCards}</p>
                    </div>
                    <ChevronRightIcon className={`w-5 h-5 shrink-0 ${c.text}`} />
                  </button>
                );
              })}

              {/* Create form */}
              {showCreate && (
                <div className="bg-blue-50 border-2 border-blue-100 p-4 rounded-2xl space-y-3 animate-scale-up">
                  <h3 className="font-black text-blue-900 text-sm">{t.deckCreate}</h3>
                  <div className="flex gap-2 items-center">
                    <span className="text-2xl shrink-0">{newEmoji}</span>
                    <input
                      className="flex-1 clay-input px-3 py-2 font-black text-blue-900 outline-none text-sm"
                      placeholder={t.deckName}
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCreate()}
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_EMOJIS.map(em => (
                      <button key={em} onClick={() => setNewEmoji(em)} className={`text-xl p-1.5 rounded-xl transition-all ${newEmoji === em ? 'bg-blue-200 scale-110' : 'hover:bg-blue-100'}`}>{em}</button>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs font-black text-blue-400">Màu:</span>
                    {DECK_COLORS.map(c => (
                      <button
                        key={c.bg}
                        onClick={() => setNewColor(c.bg)}
                        className={`w-7 h-7 rounded-full border-2 ${c.dot} transition-all ${newColor === c.bg ? 'border-blue-600 scale-125 shadow-md' : 'border-transparent'}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCreate} className="flex-1 py-3 clay-button clay-blue text-white font-black text-sm">
                      {lang === 'vn' ? 'Tạo bộ thẻ' : 'Create'}
                    </button>
                    <button onClick={() => { setShowCreate(false); setNewName(''); }} className="px-4 py-3 bg-white text-gray-400 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all">
                      {lang === 'vn' ? 'Huỷ' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — only on list view */}
        {!viewDeck && (
          <div className="p-4 border-t border-blue-50 shrink-0">
            <button
              onClick={() => setShowCreate(true)}
              disabled={showCreate}
              className="w-full py-4 clay-button clay-blue text-white font-black flex items-center justify-center gap-2 text-base disabled:opacity-50"
            >
              <PlusIcon className="w-5 h-5" /> {t.deckCreate}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckManagerModal;
