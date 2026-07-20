import React, { useState } from 'react';
import { SpellingWord, UserSettings } from '../types';
import { FONT_PRESETS } from '../data';
import { speakWord } from '../utils';
import { Volume2, Sparkles, HelpCircle } from 'lucide-react';

interface SoundBridgesProps {
  word: SpellingWord;
  settings: UserSettings;
}

export const SoundBridges: React.FC<SoundBridgesProps> = ({ word, settings }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const activeFont = FONT_PRESETS[settings.font];

  const handlePlayChunk = (chunk: string, index: number) => {
    setPlayingIndex(index);
    speakWord(chunk, settings.pronunciationSpeed, () => {
      setPlayingIndex(null);
    });
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-3xl border border-slate-800 shadow-inner text-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-amber-400 animate-pulse" />
        <span className="text-xs font-black uppercase tracking-widest text-amber-400 font-fredoka">
          Sound Syllable Bridges
        </span>
        <Sparkles size={18} className="text-amber-400 animate-pulse" />
      </div>

      <p className="text-center text-sm mb-6 opacity-90 max-w-md text-slate-300">
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
                className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex flex-col items-center justify-center border-3 ${activeFont.fontClass} text-2xl md:text-3xl font-extrabold shadow-md transition-all duration-300 relative ${
                  isPlaying
                    ? 'scale-110 border-amber-500 bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 ring-4 ring-amber-500/15'
                    : isHovered
                    ? 'scale-105 border-amber-500 bg-slate-800 text-slate-100 shadow-md'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                }`}
                id={`btn-chunk-${index}`}
                aria-label={`Hear sound chunk ${chunk}`}
              >
                <span className="capitalize">{chunk}</span>
                
                {/* Micro speaker indicator */}
                <span className={`absolute bottom-1.5 right-1.5 ${isPlaying ? 'text-slate-950' : 'text-amber-500'}`}>
                  <Volume2 size={12} className={isPlaying ? 'animate-bounce' : ''} />
                </span>

                {/* Animated visual wave when clicked */}
                {isPlaying && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-amber-500"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
              </button>

              {/* The "Sound Bridge" - SVG curving under the card */}
              <div className="w-full h-10 mt-1 relative flex justify-center overflow-visible">
                <svg className="absolute w-24 md:w-28 h-8 -top-1 overflow-visible pointer-events-none">
                  <path
                    d="M 5,2 Q 50,22 95,2"
                    fill="transparent"
                    stroke={isPlaying ? '#f59e0b' : isHovered ? '#f59e0be6' : '#f59e0b44'}
                    strokeWidth={isPlaying ? '4' : '3'}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  {/* Decorative sound dots on the bridge */}
                  <circle
                    cx="50"
                    cy="12"
                    r={isPlaying ? "5" : isHovered ? "4" : "3"}
                    fill={isPlaying ? '#f59e0b' : isHovered ? '#f59e0bdd' : '#f59e0b66'}
                    className="transition-all duration-300"
                  />
                </svg>
                <span className={`text-[10px] uppercase font-bold opacity-80 mt-5 tracking-wider ${isPlaying ? 'text-amber-400' : 'text-slate-400'}`}>
                  Chunk {index + 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-slate-800 bg-slate-950 text-amber-400">
        <HelpCircle size={14} />
        <span>Hearing words in separate syllables builds spelling awareness!</span>
      </div>
    </div>
  );
};
