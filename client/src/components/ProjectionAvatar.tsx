import React from 'react';
import Lottie from 'lottie-react';
// @ts-ignore
import happyAvatar from '@/assets/avatarHappy.json';
// @ts-ignore
import worriedAvatar from '@/assets/avatarWorried.json';
import { useAvatar } from '@/contexts/AvatarContext';

const avatarStates: Record<string, any> = {
  happy: happyAvatar,
  worried: worriedAvatar,
  neutral: happyAvatar, // Using happy avatar for neutral state
  // Add more states as needed
};

export default function ProjectionAvatar() {
  const { mood, commentary } = useAvatar();

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="w-20 h-20 rounded-full overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200 mb-2">
        <Lottie
          animationData={avatarStates[mood] || avatarStates['neutral']}
          style={{ width: '100%', height: '100%' }}
          loop
        />
      </div>
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-gray-200 w-full max-w-[180px]">
        <p className="text-gray-700 text-xs text-center">{commentary}</p>
        {/* Speech bubble triangle */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/80 backdrop-blur-sm border-l border-t border-gray-200 transform rotate-45" />
      </div>
    </div>
  );
} 