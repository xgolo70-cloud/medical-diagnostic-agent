import React from 'react';
import { useCurrentFrame } from 'remotion';

export const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  // Blink every 0.5s (15 frames at 30fps)
  const opacity = frame % 30 < 15 ? 1 : 0;
  
  return (
    <span 
      className="inline-block w-3 h-8 bg-gray-500 ml-1 align-middle" 
      style={{ opacity }}
    />
  );
};
