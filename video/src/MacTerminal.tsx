import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TerminalContent } from './TerminalContent';

export const MacTerminal: React.FC = () => {
  return (
    <AbsoluteFill className="bg-transparent p-8 flex items-center justify-center">
      <div className="w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono text-4xl text-gray-800 border border-gray-200">
        {/* Title Bar */}
        <div className="h-12 bg-gray-100 flex items-center px-4 border-b border-gray-200 space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500 border border-red-600" />
          <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600" />
          <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600" />
          <div className="flex-1 text-center text-gray-400 text-sm font-sans font-medium">
            user@macbook: ~
          </div>
        </div>
        
        {/* Terminal Content */}
        <div className="flex-1 p-6 overflow-hidden">
          <TerminalContent />
        </div>
      </div>
    </AbsoluteFill>
  );
};
