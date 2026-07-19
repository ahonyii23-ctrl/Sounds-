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

  const activeTint = TINT_PRESETS[settings.tint];

  return (
    <div className={`p-6 rounded-3xl border-3 shadow-xl transition-all duration-300 ${activeTint.cardClass} ${activeTint.textClass}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
          <Settings size={28} className="animate-spin-slow" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-fredoka">Accessibility & Style Settings</h2>
          <p className="text-sm opacity-80">Tune this board to fit your reading and visual needs!</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Font Family selection */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Eye size={16} /> Font Style (Accessibility Researched)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.keys(FONT_PRESETS) as SelectedFont[]).map((fontKey) => {
              const font = FONT_PRESETS[fontKey];
              const isSelected = settings.font === fontKey;
              return (
                <button
                  key={fontKey}
                  onClick={() => updateField('font', fontKey)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-300'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  id={`font-opt-${fontKey}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-lg font-bold ${font.fontClass}`}>
                      {font.name}
                    </span>
                    {isSelected && <Check size={16} className="text-indigo-600" />}
                  </div>
                  <p className="text-xs opacity-80 leading-snug">{font.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Size selection */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Eye size={16} /> Text Size
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(TEXT_SIZE_PRESETS) as TextSize[]).map((sizeKey) => {
              const size = TEXT_SIZE_PRESETS[sizeKey];
              const isSelected = settings.textSize === sizeKey;
              
              // Visual size preview indicator inside the buttons
              let sizeClass = 'text-xs';
              if (sizeKey === 'lg') sizeClass = 'text-sm';
              if (sizeKey === 'xl') sizeClass = 'text-base';
              if (sizeKey === 'huge') sizeClass = 'text-lg';

              return (
                <button
                  key={sizeKey}
                  onClick={() => updateField('textSize', sizeKey)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-200'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
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

        {/* Background Tints selection */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            🎨 Friendly Background Tint
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(Object.keys(TINT_PRESETS) as BackgroundTint[]).map((tintKey) => {
              const tint = TINT_PRESETS[tintKey];
              const isSelected = settings.tint === tintKey;
              return (
                <button
                  key={tintKey}
                  onClick={() => updateField('tint', tintKey)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${tint.bgClass} ${tint.textClass} ${
                    isSelected
                      ? 'border-indigo-600 shadow-lg ring-3 ring-indigo-200 scale-105'
                      : 'border-gray-200 hover:scale-102 hover:shadow-sm'
                  }`}
                  id={`tint-opt-${tintKey}`}
                >
                  <div className="w-5 h-5 rounded-full border border-gray-300" style={{ backgroundColor: tint.primaryHex }} />
                  <span className="text-xs font-bold whitespace-nowrap">{tint.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Letter Spacing selection */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sliders size={16} /> Letter Spacing (Separates letters for dyslexia/visual focus)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.keys(SPACING_PRESETS) as LetterSpacing[]).map((spacingKey) => {
              const preset = SPACING_PRESETS[spacingKey];
              const isSelected = settings.spacing === spacingKey;
              return (
                <button
                  key={spacingKey}
                  onClick={() => updateField('spacing', spacingKey)}
                  className={`p-3 rounded-2xl border-2 text-center transition-all ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/50 shadow-md ring-2 ring-sky-200 font-bold'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
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
          <label className="block text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Volume2 size={16} /> Speaking Speed & Audio Preferences
          </label>
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-700">Pronunciation Speed</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
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
                className="w-full accent-amber-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
                id="pron-speed-slider"
              />
              <p className="text-[11px] text-gray-500 mt-1.5 leading-snug">
                Slowing down speech makes letters, vowel blends, and soft syllables significantly easier to hear!
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <label className="relative flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="flex flex-col pr-4">
                  <span className="text-xs font-bold text-gray-700">Speak Automatically</span>
                  <span className="text-[11px] text-gray-500 leading-snug">Pronounce word immediately when starting a new exercise</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.speakAutomatically}
                  onChange={(e) => updateField('speakAutomatically', e.target.checked)}
                  className="sr-only peer"
                  id="auto-speak-toggle"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-2.5 after:right-[18px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
