
import React from 'react';

export type BeeMood = 'idle' | 'happy' | 'sad' | 'celebrate' | 'thinking';

interface BeeAvatarProps {
  mood?: BeeMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP: Record<string, string> = {
  sm: 'text-4xl',
  md: 'text-6xl',
  lg: 'text-8xl',
  xl: 'text-[120px]',
};

const MOOD_CLASS: Record<BeeMood, string> = {
  idle: 'animate-float',
  happy: 'bee-happy',
  sad: 'bee-sad',
  celebrate: 'bee-celebrate',
  thinking: 'bee-thinking',
};

const BeeAvatar: React.FC<BeeAvatarProps> = ({ mood = 'idle', size = 'md', className = '' }) => (
  <div className={`relative select-none inline-flex items-center justify-center ${className}`}>
    <span className={`${SIZE_MAP[size]} ${MOOD_CLASS[mood]} leading-none`}>🐝</span>
    {mood === 'celebrate' && (
      <>
        <span className="bee-star-1 text-lg" style={{ top: '-12px', right: '-8px' }}>⭐</span>
        <span className="bee-star-2 text-base" style={{ top: '-20px', left: '4px' }}>✨</span>
        <span className="bee-star-3 text-lg" style={{ top: '4px', left: '-16px' }}>🌟</span>
      </>
    )}
    {mood === 'sad' && (
      <span className="absolute text-lg leading-none animate-fade-in" style={{ bottom: '-8px', right: '0' }}>💧</span>
    )}
    {mood === 'thinking' && (
      <span className="bee-think-bubble absolute text-2xl leading-none" style={{ top: '-20px', right: '-24px' }}>💭</span>
    )}
  </div>
);

export default BeeAvatar;
