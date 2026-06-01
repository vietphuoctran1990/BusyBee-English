import React from 'react';
import { TrophyIcon, StarIcon } from '@heroicons/react/24/solid';

const overlayClass =
  'fixed inset-0 z-[200] bg-blue-900/70 backdrop-blur-md flex items-center justify-center p-5 animate-fade-in';
const cardClass = 'clay-card bg-white p-8 max-w-sm w-full text-center animate-scale-up';

interface EmptyStateProps {
  emoji: string;
  title: string;
  message: string;
  closeLabel: string;
  onClose: () => void;
}

/** Shared "not enough data" screen used by every mini-game. */
export const GameEmptyState: React.FC<EmptyStateProps> = ({ emoji, title, message, closeLabel, onClose }) => (
  <div className={overlayClass}>
    <div className={cardClass}>
      <div className="text-5xl mb-3">{emoji}</div>
      <h3 className="text-xl font-black text-blue-900 mb-2">{title}</h3>
      <p className="text-blue-400 font-bold text-sm mb-6">{message}</p>
      <button onClick={onClose} aria-label={closeLabel} className="w-full py-3 bg-blue-500 text-white font-black rounded-2xl active:scale-95 transition-all">
        {closeLabel}
      </button>
    </div>
  </div>
);

interface ResultScreenProps {
  title: string;
  scoreLabel: string;
  stars: number;
  starsLabel: string;
  claimLabel: string;
  onClaim: () => void;
}

/** Shared end-of-game result screen (trophy + score + stars + claim). */
export const GameResultScreen: React.FC<ResultScreenProps> = ({ title, scoreLabel, stars, starsLabel, claimLabel, onClaim }) => (
  <div className={overlayClass}>
    <div className={cardClass}>
      <TrophyIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
      <h3 className="text-2xl font-black text-blue-900 mb-2">{title}</h3>
      <p className="text-blue-400 font-bold mb-4">{scoreLabel}</p>
      <div className="flex items-center justify-center gap-2 bg-yellow-50 rounded-2xl p-4 mb-6">
        <StarIcon className="w-8 h-8 text-yellow-500" />
        <span className="text-2xl font-black text-yellow-700">+{stars} {starsLabel}</span>
      </div>
      <button
        onClick={onClaim}
        className="w-full py-4 bg-blue-500 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all"
      >
        {claimLabel}
      </button>
    </div>
  </div>
);
