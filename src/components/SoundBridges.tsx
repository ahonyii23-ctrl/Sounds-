import React, { useState } from 'react';
import { SpellingWord, UserSettings } from '../types';
import { TINT_PRESETS } from '../data';
import { speakWord } from '../utils';
import { Volume2, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SoundBridgesProps {
  word: SpellingWord;
  settings: UserSettings;
}

export const SoundBridges: React.FC<SoundBridgesProps> = ({ word, settings }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const activeTint = TINT_PRESETS[settings.tint];

  const handlePlayChunk = (chunk: string, index: number) => {
    setPlayingIndex(index);
    // Standard kid speed or slower
    speakWord(chunk, settings.pronunciationSpeed, () => {
      setPlayingIndex(null);
    });
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 bg-indigo-50/40 rounded-3xl border border-indigo-100/50">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-indigo-500 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-700 font-fredoka">
          Sound Syllable Bridges
        </span>
        <Sparkles size={18} className="text-indigo-500 animate-pulse" />
      </div>

      <p className="text-center text-sm mb-6 opacity-95 max-w-md">
        Tap any syllable block below to hear how it sounds! Notice how the bridges connect the letter sounds together.
      </p>

      {/* Syllables and Bridges container */}
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 py-6 relative">
        {word.chunks.map((chunk, index) => {
          const isHovered = hoveredIndex === index;
          const isPlaying = playingIndex === index;

          return (
            <div
              key={`${chunk}-${index}`}
              className="flex flex-col items-center relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              id={`sound-chunk-container-${index}`}
            >
              {/* Syllable bubble card */}
              <button
                onClick={() => handlePlayChunk(chunk, index)}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex flex-col items-center justify-center border-3 font-fredoka text-2xl md:text-3xl font-extrabold shadow-md transition-all duration-300 relative ${
                  isPlaying
                    ? 'scale-110 border-indigo-500 bg-indigo-100 text-indigo-800 shadow-lg ring-4 ring-indigo-200'
                    : isHovered
                    ? 'scale-105 border-indigo-400 bg-white shadow-md'
                    : 'border-indigo-200 bg-white hover:border-indigo-400'
                }`}
                style={{ fontFamily: settings.font === 'lexend' ? 'Lexend' : settings.font === 'atkinson' ? 'Atkinson Hyperlegible' : 'Fredoka' }}
                id={`btn-chunk-${index}`}
                aria-label={`Hear sound chunk ${chunk}`}
              >
                <span className="capitalize">{chunk}</span>
                
                {/* Micro speaker indicator */}
                <span className="absolute bottom-1.5 right-1.5 text-indigo-400">
                  <Volume2 size={12} className={isPlaying ? 'animate-bounce text-indigo-600' : ''} />
                </span>

                {/* Animated visual wave when clicked */}
                {isPlaying && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>
                )}
              </button>

              {/* The "Sound Bridge" - SVG curving under the card */}
              <div className="w-full h-10 mt-1 relative flex justify-center overflow-visible">
                <svg className="absolute w-24 md:w-28 h-8 -top-1 overflow-visible pointer-events-none">
                  <path
                    d="M 5,2 Q 50,22 95,2"
                    fill="transparent"
                    stroke={isPlaying ? '#4f46e5' : isHovered ? '#818cf8' : '#c7d2fe'}
                    strokeWidth={isPlaying ? '4' : '3'}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  {/* Decorative sound dots on the bridge */}
                  <circle
                    cx="50"
                    cy="12"
                    r={isPlaying ? "5" : isHovered ? "4" : "3"}
                    fill={isPlaying ? "#4f46e5" : isHovered ? "#818cf8" : "#a5b4fc"}
                    className="transition-all duration-300"
                  />
                </svg>
                <span className="text-[10px] uppercase font-bold text-indigo-400/80 mt-5 tracking-wider">
                  Chunk {index + 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-indigo-600/90 font-medium bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100/50">
        <HelpCircle size={14} />
        <span>Hearing words in separate syllables builds spelling awareness!</span>
      </div>
    </div>
  );
};
