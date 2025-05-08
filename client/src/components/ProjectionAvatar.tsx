import React from 'react';
import Lottie from 'lottie-react';
// Make sure these files exist in your assets folder or replace with your own
// @ts-ignore
import happyAvatar from '@/assets/avatarHappy.json';
// @ts-ignore
import worriedAvatar from '@/assets/avatarWorried.json';

const avatarStates: Record<string, any> = {
  happy: happyAvatar,
  worried: worriedAvatar,
  // Add more states as needed
};

interface ProjectionAvatarProps {
  mood: 'happy' | 'worried' | string;
  commentary: string;
}

export default function ProjectionAvatar({ mood, commentary }: ProjectionAvatarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Lottie
        animationData={avatarStates[mood] || avatarStates['happy']}
        style={{ width: 100, height: 100 }}
        loop
      />
      <div className="speech-bubble">{commentary}</div>
    </div>
  );
} 