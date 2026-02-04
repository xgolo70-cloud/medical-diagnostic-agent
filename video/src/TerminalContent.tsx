import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Cursor } from './Cursor';

const COMMAND = 'npx skills add remotion-dev/skills';
const OUTPUT_LINES = [
  '✓ Resolving remotion-dev/skills...',
  '✓ Downloading skill package...',
  '✓ Verifying checksums...',
  '✓ Installing dependencies...',
  '✓ Skill "remotion-dev/skills" added successfully!',
  '  - Description: Best practices and helpers for Remotion development.',
  '  - Version: 1.0.2',
  '  - Added to: .agent/skills/remotion-dev'
];

export const TerminalContent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Typing configuration
  const charsPerSecond = 15;
  const charsPerFrame = charsPerSecond / fps;
  const charsToShow = Math.floor(frame * charsPerFrame);
  
  const text = COMMAND.slice(0, charsToShow);
  const isTypingDone = charsToShow >= COMMAND.length;
  const typingDurationFrames = COMMAND.length / charsPerFrame;

  // Output configuration
  const outputDelaySeconds = 0.5;
  const outputDelayFrames = outputDelaySeconds * fps;
  const startOutputFrame = typingDurationFrames + outputDelayFrames;
  
  const lineDelayMs = 50;
  const lineDelayFrames = (lineDelayMs / 1000) * fps;

  return (
    <div className="font-mono text-xl leading-relaxed text-gray-800">
      {/* Command Line */}
      <div className="flex items-center mb-2">
        <span className="text-green-600 mr-2 font-bold">➜</span>
        <span className="text-blue-600 mr-2 font-bold">~</span>
        <span>{text}</span>
        {!isTypingDone && <Cursor />}
      </div>

      {/* Output */}
      <div className="flex flex-col space-y-1 text-gray-600">
        {OUTPUT_LINES.map((line, index) => {
          const lineStartFrame = startOutputFrame + (index * lineDelayFrames);
          if (frame < lineStartFrame) return null;
          
          return (
            <div key={index} className="break-words">
              {line}
            </div>
          );
        })}
        {/* Show cursor at the end after all output */}
        {frame > startOutputFrame + (OUTPUT_LINES.length * lineDelayFrames) + 10 && (
           <div className="flex items-center mt-2">
            <span className="text-green-600 mr-2 font-bold">➜</span>
            <span className="text-blue-600 mr-2 font-bold">~</span>
            <Cursor />
          </div>
        )}
      </div>
    </div>
  );
};
