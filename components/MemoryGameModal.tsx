
import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, TrophyIcon, StarIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { LearningItem, LanguageType } from '../types';
import { speakWithBrowser, playSFX } from '../services/audioUtils';

interface MemoryGameModalProps {
  items: LearningItem[];
  lang: LanguageType;
  onClose: () => void;
  onComplete: (stars: number) => void;
}

interface Card {
  id: number;
  itemId: string;
  type: 'image' | 'text';
  item: LearningItem;
}

const PAIRS = 6;

const MemoryGameModal: React.FC<MemoryGameModalProps> = ({ items, lang, onClose, onComplete }) => {
  const eligible = useMemo(
    () => items.filter(i => i.isSaved && !i.loading && (i.imageUrl || i.emoji)),
    [items],
  );

  const initialCards = useMemo<Card[]>(() => {
    const selected = [...eligible].sort(() => 0.5 - Math.random()).slice(0, PAIRS);
    const pairs: Card[] = selected.flatMap((item, i) => [
      { id: i * 2, itemId: item.id, type: 'image' as const, item },
      { id: i * 2 + 1, itemId: item.id, type: 'text' as const, item },
    ]);
    return pairs.sort(() => 0.5 - Math.random());
  }, [eligible]);

  const [cards] = useState(initialCards);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (matched.size === PAIRS && cards.length > 0) {
      setTimeout(() => setDone(true), 500);
    }
  }, [matched, cards.length]);

  if (eligible.length < PAIRS) {
    return (
      <div className="fixed inset-0 z-[200] bg-blue-900/70 backdrop-blur-md flex items-center justify-center p-5 animate-fade-in">
        <div className="bg-white p-8 max-w-sm w-full rounded-3xl text-center animate-scale-up">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-black text-blue-900 mb-2">
            {lang === 'vn' ? 'Chưa đủ thẻ' : 'Not enough cards'}
          </h3>
          <p className="text-blue-400 font-bold text-sm mb-6">
            {lang === 'vn' ? `Cần ít nhất ${PAIRS} thẻ đã lưu để chơi` : `Need at least ${PAIRS} saved cards to play`}
          </p>
          <button onClick={onClose} className="w-full py-3 bg-blue-500 text-white font-black rounded-2xl">
            {lang === 'vn' ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  const handleFlip = (card: Card) => {
    if (flipped.length >= 2 || flipped.includes(card.id) || matched.has(card.itemId)) return;

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);
    playSFX('click');

    if (card.type === 'text') {
      speakWithBrowser(card.item.text, 'en').catch(() => {});
    }

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped.map(id => cards.find(c => c.id === id)!);
      if (a.itemId === b.itemId && a.type !== b.type) {
        setMatched(prev => new Set([...prev, a.itemId]));
        playSFX('star');
        setTimeout(() => setFlipped([]), 600);
      } else {
        setTimeout(() => setFlipped([]), 1200);
      }
    }
  };

  if (done) {
    const stars = moves <= PAIRS + 2 ? 3 : moves <= PAIRS + 5 ? 2 : 1;
    return (
      <div className="fixed inset-0 z-[200] bg-blue-900/70 backdrop-blur-md flex items-center justify-center p-5 animate-fade-in">
        <div className="bg-white p-8 max-w-sm w-full rounded-3xl text-center animate-scale-up">
          <TrophyIcon className="w-16 h-16 text-yellow-400 mx-auto mb-3 animate-bounce" />
          <h3 className="text-2xl font-black text-blue-900 mb-2">
            {lang === 'vn' ? 'Tuyệt vời!' : 'Awesome!'}
          </h3>
          <p className="text-blue-400 font-bold text-sm mb-4">
            {lang === 'vn' ? `Hoàn thành trong ${moves} lượt` : `Completed in ${moves} moves`}
          </p>
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3].map(i => (
              <StarIcon key={i} className={`w-10 h-10 ${i <= stars ? 'text-yellow-400' : 'text-gray-200'}`} />
            ))}
          </div>
          <button
            onClick={() => onComplete(stars)}
            className="w-full py-4 bg-blue-500 text-white font-black rounded-2xl shadow-lg active:scale-95"
          >
            +{stars} {lang === 'vn' ? 'ngôi sao' : 'stars'} 🎉
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-blue-900/80 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-white w-full max-w-md max-h-[95vh] rounded-3xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black">{lang === 'vn' ? 'Trò chơi Trí Nhớ' : 'Memory Match'}</h2>
            <p className="text-pink-100 text-xs font-bold">
              {lang === 'vn' ? `Lượt ${moves} · Đã ghép ${matched.size}/${PAIRS}` : `Moves ${moves} · Matched ${matched.size}/${PAIRS}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 rounded-full">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-3 gap-2">
            {cards.map(card => {
              const isFlipped = flipped.includes(card.id) || matched.has(card.itemId);
              return (
                <button
                  key={card.id}
                  onClick={() => handleFlip(card)}
                  disabled={isFlipped}
                  className={`aspect-square rounded-2xl border-2 transition-all overflow-hidden flex items-center justify-center text-center p-1 ${
                    matched.has(card.itemId)
                      ? 'bg-green-50 border-green-300 ring-2 ring-green-200'
                      : isFlipped
                        ? 'bg-white border-pink-300 ring-2 ring-pink-200'
                        : 'bg-gradient-to-br from-pink-400 to-purple-500 border-white shadow-md active:scale-95'
                  }`}
                >
                  {isFlipped ? (
                    card.type === 'image' ? (
                      card.item.imageUrl ? (
                        <img src={`data:image/png;base64,${card.item.imageUrl}`} className="w-full h-full object-cover rounded-xl" alt="" />
                      ) : (
                        <span className="text-4xl">{card.item.emoji || '?'}</span>
                      )
                    ) : (
                      <span className="font-black text-blue-900 text-xs sm:text-sm leading-tight break-words">
                        {card.item.text}
                      </span>
                    )
                  ) : (
                    <span className="text-3xl text-white">🐝</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 shrink-0">
          <p className="text-xs font-bold text-blue-400 text-center">
            {lang === 'vn' ? 'Ghép ảnh với từ tiếng Anh tương ứng' : 'Match each image with its English word'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemoryGameModal;
