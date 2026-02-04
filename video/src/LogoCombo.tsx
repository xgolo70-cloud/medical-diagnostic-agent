import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const LogoCombo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sequence 1 Animation: Scale up text
  const scaleText = spring({
    frame,
    fps,
    config: {
      damping: 15, // slightly bouncy
      stiffness: 120,
    },
  });

  // Sequence 2 Animation: Fade in/Slide up logos
  // Relative frame for Sequence 2 (starts at frame 60)
  const seq2Frame = frame - 60;
  const logoOpacity = interpolate(seq2Frame, [0, 20], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const logoTranslateY = interpolate(seq2Frame, [0, 20], [20, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill className="bg-white flex items-center justify-center">
      
      {/* Sequence 1: Text Intro (First 60 frames) */}
      <Sequence from={0} durationInFrames={60}>
        <AbsoluteFill className="flex items-center justify-center">
          <h1 
            style={{ 
              fontFamily: 'system-ui, sans-serif', 
              fontSize: 60, 
              fontWeight: 'bold', 
              color: '#333',
              transform: `scale(${scaleText})` 
            }}
          >
            Agent Skills now available
          </h1>
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 2: Logos (From frame 60 onwards) */}
      <Sequence from={60}>
        <AbsoluteFill className="flex items-center justify-center">
          <div 
            className="flex items-center space-x-8"
            style={{
              opacity: logoOpacity,
              transform: `translateY(${logoTranslateY}px)`
            }}
          >
            {/* Remotion Logo Placeholder */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-32 h-32 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">Remotion</span>
              </div>
            </div>

            {/* Plus Sign */}
            <div className="text-6xl font-bold text-gray-400">+</div>

            {/* Claude Logo Placeholder */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-32 h-32 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">Claude</span>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

    </AbsoluteFill>
  );
};
