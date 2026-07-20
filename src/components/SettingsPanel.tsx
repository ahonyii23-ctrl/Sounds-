import React from 'react';
import { UserSettings, BackgroundTint, TextSize, LetterSpacing, SelectedFont } from '../types';
import { TINT_PRESETS, TEXT_SIZE_PRESETS, SPACING_PRESETS, FONT_PRESETS } from '../data';
import { Settings, Volume2, Eye, Sliders, Check } from 'lucide-react';

interface SettingsPanelProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const updateField = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="p-6 rounded-3xl border-2 shadow-xl transition-all duration-300 bg-slate-900 border-slate-700/80 text-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-amber-500">
          <Settings size={28} className="animate-spin-slow" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-fredoka text-slate-100">Accessibility & Style Settings</h2>
          <p className="text-sm text-slate-400">Tune this board to fit your reading and visual needs!</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Font Family selection */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-slate-300">
            <Eye size={16} className="text-amber-500" /> Font Style (Accessibility Researched)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.keys(FONT_PRESETS) as SelectedFont[]).map((fontKey) => {
              const font = FONT_PRESETS[fontKey];
              const isSelected = settings.font === fontKey;
              return (
                <button
                  key={fontKey}
                  onClick={() => updateField('font', fontKey)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-slate-800/80 shadow-md ring-2 ring-amber-500/20'
                      : 'border-slate-850 hover:border-slate-800 bg-slate-950 text-slate-300'
                  }`}
                  id={`font-opt-${fontKey}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-lg font-bold ${font.fontClass} text-slate-100`}>
                      {font.name}
                    </span>
                    {isSelected && <Check size={16} className="text-amber-500" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">{font.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Size selection */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-slate-300">
            <Eye size={16} className="text-amber-500" /> Text Size
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(TEXT_SIZE_PRESETS) as TextSize[]).map((sizeKey) => {
              const size = TEXT_SIZE_PRESETS[sizeKey];
              const isSelected = settings.textSize === sizeKey;
              
              let sizeClass = 'text-xs';
              if (sizeKey === 'lg') sizeClass = 'text-sm';
              if (sizeKey === 'xl') sizeClass = 'text-base';
              if (sizeKey === 'huge') sizeClass = 'text-lg';

              return (
                <button
                  key={sizeKey}
                  onClick={() => updateField('textSize', sizeKey)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-slate-800/80 shadow-md ring-2 ring-amber-500/20 text-slate-100'
                      : 'border-slate-850 hover:border-slate-800 bg-slate-950 text-slate-300'
                  }`}
                  id={`size-opt-${sizeKey}`}
                >
                  <span className={`font-bold ${sizeClass}`}>Aa</span>
                  <span className="text-xs font-semibold">{size.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Letter Spacing selection */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-slate-300">
            <Sliders size={16} className="text-amber-500" /> Letter Spacing (Separates letters for dyslexia/visual focus)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.keys(SPACING_PRESETS) as LetterSpacing[]).map((spacingKey) => {
              const preset = SPACING_PRESETS[spacingKey];
              const isSelected = settings.spacing === spacingKey;
              return (
                <button
                  key={spacingKey}
                  onClick={() => updateField('spacing', spacingKey)}
                  className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-slate-800/80 shadow-md ring-2 ring-amber-500/20 font-bold text-slate-100'
                      : 'border-slate-850 hover:border-slate-800 bg-slate-950 text-slate-300'
                  }`}
                  id={`spacing-opt-${spacingKey}`}
                >
                  <span className={`${preset.trackingClass} block text-base font-medium`}>
                    {spacingKey === 'normal' ? 'Spelling' : spacingKey === 'wide' ? 'S p e l l i n g' : 'S  p  e  l  l  i  n  g'}
                  </span>
                  <span className="text-xs mt-1 block opacity-70">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pronunciation & Auditory settings */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-slate-300">
            <Volume2 size={16} className="text-amber-500" /> Speaking Speed & Audio Preferences
          </label>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-300">Pronunciation Speed</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800/30">
                  {settings.pronunciationSpeed === 1.0
                    ? 'Normal (1.0x)'
                    : settings.pronunciationSpeed === 0.75
                    ? 'Slightly Slow (0.75x)'
                    : settings.pronunciationSpeed === 0.65
                    ? 'Slowed for Clarity (0.65x) 🐢'
                    : `Kid Sized (${settings.pronunciationSpeed}x) 🐢`}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.1"
                step="0.05"
                value={settings.pronunciationSpeed}
                onChange={(e) => updateField('pronunciationSpeed', parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                id="pron-speed-slider"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                Slowing down speech makes letters, vowel blends, and soft syllables significantly easier to hear!
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <label className="relative flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 cursor-pointer transition-colors">
                <div className="flex flex-col pr-4">
                  <span className="text-xs font-bold text-slate-300">Speak Automatically</span>
                  <span className="text-[11px] text-slate-400 leading-snug">Pronounce word immediately when starting a new exercise</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.speakAutomatically}
                  onChange={(e) => updateField('speakAutomatically', e.target.checked)}
                  className="sr-only peer"
                  id="auto-speak-toggle"
                />
                <div className="relative w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
