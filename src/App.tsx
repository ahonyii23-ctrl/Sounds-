import React, { useState, useEffect } from 'react';
import { SpellingWord, UserSettings, UserStats, WordProgress, UserProfile } from './types';
import { WORD_DATABASE, DEFAULT_SETTINGS, TINT_PRESETS, FONT_PRESETS } from './data';
import { PracticeArea } from './components/PracticeArea';
import { ProgressView } from './components/ProgressView';
import { SettingsPanel } from './components/SettingsPanel';
import { ReadingSection } from './components/ReadingSection';
import { WordForge } from './components/WordForge';
import { AgeAcademy } from './components/AgeAcademy';
import { Sparkles, BookOpen, Award, Settings, Star, Filter, Heart, ChevronRight, HelpCircle, Glasses, Hammer, Anvil, User, Download, Upload, Smile, Check, Zap, Gem, Rocket, Gamepad2, Shield, Flame, Crown, Swords, Wand2, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STICKER_ICONS: Record<string, { icon: React.ComponentType<any>; color: string; bg: string; border: string; name: string; desc: string }> = {
  '🛠️': { icon: Anvil, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', name: 'Steel Forger', desc: 'Master of words and metals' },
  'steel_forger': { icon: Anvil, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', name: 'Steel Forger', desc: 'Master of words and metals' },
  
  '🐉': { icon: Crown, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', name: 'Iron Dragon', desc: 'Breathes spelling sparks' },
  'iron_dragon': { icon: Crown, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', name: 'Iron Dragon', desc: 'Breathes spelling sparks' },
  
  '⚡': { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', name: 'Spark Bolt', desc: 'Charged with energy to learn' },
  'spark_bolt': { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', name: 'Spark Bolt', desc: 'Charged with energy to learn' },
  
  '💎': { icon: Gem, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', name: 'Forged Diamond', desc: 'Brilliant mind & focus' },
  'forged_diamond': { icon: Gem, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', name: 'Forged Diamond', desc: 'Brilliant mind & focus' },
  
  '🚀': { icon: Rocket, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', name: 'Word Rocket', desc: 'Blast off through syllables' },
  'word_rocket': { icon: Rocket, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', name: 'Word Rocket', desc: 'Blast off through syllables' },
  
  '🦄': { icon: Wand2, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', name: 'Starry Pegasus', desc: 'Fascinating imagination' },
  'starry_pegasus': { icon: Wand2, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', name: 'Starry Pegasus', desc: 'Fascinating imagination' },
  
  '🦖': { icon: Swords, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', name: 'Mighty T-Rex', desc: 'Mighty spelling explorer' },
  'mighty_trex': { icon: Swords, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', name: 'Mighty T-Rex', desc: 'Mighty spelling explorer' },
  
  '👾': { icon: Gamepad2, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', name: 'Retro Pixel', desc: 'Arcade spelling champion' },
  'retro_pixel': { icon: Gamepad2, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', name: 'Retro Pixel', desc: 'Arcade spelling champion' },
  
  '🛡️': { icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', name: 'Word Guardian', desc: 'Protects spelling strength' },
  'word_guardian': { icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', name: 'Word Guardian', desc: 'Protects spelling strength' },
  
  '🔥': { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', name: 'Forge Fire', desc: 'Keeps learning embers hot' },
  'forge_fire': { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', name: 'Forge Fire', desc: 'Keeps learning embers hot' },
};

const renderStickerIcon = (stickerId: string, size: number = 24, withBackground: boolean = true) => {
  const config = STICKER_ICONS[stickerId] || STICKER_ICONS['steel_forger'];
  const IconComponent = config.icon;
  if (!withBackground) {
    return <IconComponent size={size} className={config.color} />;
  }
  return (
    <div className={`p-2 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}>
      <IconComponent size={size} className={config.color} />
    </div>
  );
};

const renderStickerIconLarge = (stickerId: string) => {
  const config = STICKER_ICONS[stickerId] || STICKER_ICONS['steel_forger'];
  const IconComponent = config.icon;
  return (
    <div className={`p-4 rounded-2xl ${config.bg} border-2 ${config.border} flex items-center justify-center shrink-0 w-20 h-20 shadow-lg shadow-black/40`}>
      <IconComponent size={36} className={config.color} />
    </div>
  );
};

export default function App() {
  // Load settings from local storage or defaults
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('sound-bridges-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading saved settings, using defaults.", e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Load progress list from local storage or empty
  const [progressList, setProgressList] = useState<WordProgress[]>(() => {
    const saved = localStorage.getItem('sound-bridges-progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading saved progress list, using empty.", e);
      }
    }
    return [];
  });

  // Load stats from local storage or default
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('sound-bridges-stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading saved stats, using default.", e);
      }
    }
    return {
      totalStars: 0,
      wordsPracticed: 0,
      wordsPerfect: 0,
      streakDays: 1, // Start with a friendly 1 day streak!
      lastActiveDate: new Date().toLocaleDateString()
    };
  });

  // Load custom imported words from Gmail
  const [importedWords, setImportedWords] = useState<SpellingWord[]>(() => {
    const saved = localStorage.getItem('sound-bridges-gmail-imported-words');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading saved Gmail imported words, using empty.", e);
      }
    }
    return [];
  });

  const combinedWordDatabase = [...WORD_DATABASE, ...importedWords];

  // Core navigation state
  const [activeTab, setActiveTab] = useState<'practice' | 'forge' | 'reading' | 'academy' | 'progress'>('practice');
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  // Word selection and filters
  const [selectedWord, setSelectedWord] = useState<SpellingWord>(() => {
    const saved = localStorage.getItem('sound-bridges-gmail-imported-words');
    let words = WORD_DATABASE;
    if (saved) {
      try {
        words = [...WORD_DATABASE, ...JSON.parse(saved)];
      } catch (e) {}
    }
    return words[0];
  });
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Load profile from local storage or defaults
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sound-bridges-profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading saved profile, using defaults.", e);
      }
    }
    return {
      studentName: 'Apprentice Speller',
      avatar: '🛠️',
      focusProfile: 'standard',
      dailyWordGoal: 5,
      notes: '',
      age: '8',
      sticker: '🛠️'
    };
  });

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem('sound-bridges-settings', JSON.stringify(settings));
  }, [settings]);

  // Sync profile to localStorage
  useEffect(() => {
    localStorage.setItem('sound-bridges-profile', JSON.stringify(profile));
  }, [profile]);

  // Handle full backup file upload/restore
  const handleImportFullBackup = (importedData: {
    profile?: UserProfile;
    stats?: UserStats;
    progressList?: WordProgress[];
    settings?: UserSettings;
    importedWords?: SpellingWord[];
  }) => {
    if (importedData.profile) setProfile(importedData.profile);
    if (importedData.stats) setStats(importedData.stats);
    if (importedData.progressList) setProgressList(importedData.progressList);
    if (importedData.settings) setSettings(importedData.settings);
    if (importedData.importedWords) {
      setImportedWords(importedData.importedWords);
      localStorage.setItem('sound-bridges-gmail-imported-words', JSON.stringify(importedData.importedWords));
    }
  };

  const handleDownloadBackup = () => {
    const fullBackup = {
      profile,
      stats,
      progressList,
      settings,
      importedWords,
      backupVersion: '1.0',
      timestamp: new Date().toISOString()
    };
    
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(fullBackup, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `steelworlds_profile_${(profile.studentName || 'apprentice').toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBackupMessage('💾 Personal profile & progress database successfully downloaded! Store this file safely to restore later.');
    setTimeout(() => setBackupMessage(null), 5000);
  };

  const handleUploadBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed && (parsed.profile || parsed.stats || parsed.progressList)) {
          handleImportFullBackup(parsed);
          setBackupMessage('⚡ Steelworlds Profile successfully restored! Your stats and settings are fully updated.');
          setTimeout(() => setBackupMessage(null), 6000);
        } else {
          setBackupMessage('❌ Invalid backup file format. Please upload a valid Steelworlds backup JSON.');
          setTimeout(() => setBackupMessage(null), 5000);
        }
      } catch (err) {
        console.error("Error parsing backup file", err);
        setBackupMessage('❌ Failed to parse backup file. Please make sure the JSON file is not corrupted.');
        setTimeout(() => setBackupMessage(null), 5000);
      }
    };
    fileReader.readAsText(file);
  };

  // Handle streak updates on start
  useEffect(() => {
    const todayStr = new Date().toLocaleDateString();
    if (stats.lastActiveDate !== todayStr) {
      let newStreak = stats.streakDays;
      if (stats.lastActiveDate) {
        const lastDate = new Date(stats.lastActiveDate);
        const todayDate = new Date(todayStr);
        const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1; // Consecutive day, add to streak
        } else if (diffDays > 1) {
          newStreak = 1; // Missed days, reset to 1
        }
      }
      
      const updatedStats = {
        ...stats,
        streakDays: newStreak,
        lastActiveDate: todayStr
      };
      setStats(updatedStats);
      localStorage.setItem('sound-bridges-stats', JSON.stringify(updatedStats));
    }
  }, []);

  // Update Stats and Progress when word is graded
  const handleGradeSubmitted = (
    wordId: string,
    userInput: string,
    starsEarned: number,
    grade: 'perfect' | 'close' | 'try'
  ) => {
    const wordData = combinedWordDatabase.find(w => w.id === wordId);
    if (!wordData) return;

    const timestamp = new Date().toISOString();

    // 1. Update or create individual word progress record
    let updatedList = [...progressList];
    const existingIndex = progressList.findIndex(p => p.wordId === wordId);

    if (existingIndex !== -1) {
      const existing = progressList[existingIndex];
      // Keep the best grade achieved so far
      let bestGrade = existing.bestGrade;
      if (grade === 'perfect' || (grade === 'close' && bestGrade !== 'perfect')) {
        bestGrade = grade;
      }

      // Keep maximum stars earned
      const bestStars = Math.max(existing.starsEarned, starsEarned);

      updatedList[existingIndex] = {
        ...existing,
        attemptsCount: existing.attemptsCount + 1,
        bestGrade,
        starsEarned: bestStars,
        lastAttemptedAt: timestamp,
        history: [
          ...existing.history,
          { input: userInput, grade, timestamp }
        ]
      };
    } else {
      updatedList.push({
        wordId,
        word: wordData.word,
        attemptsCount: 1,
        bestGrade: grade,
        starsEarned,
        lastAttemptedAt: timestamp,
        history: [{ input: userInput, grade, timestamp }]
      });
    }

    setProgressList(updatedList);
    localStorage.setItem('sound-bridges-progress', JSON.stringify(updatedList));

    // 2. Compute updated global stats
    const newlyCompleted = existingIndex === -1;
    const previousBestStars = existingIndex !== -1 ? progressList[existingIndex].starsEarned : 0;
    const additionalStars = Math.max(0, starsEarned - previousBestStars);

    const isNewlyPerfect = grade === 'perfect' && (existingIndex === -1 || progressList[existingIndex].bestGrade !== 'perfect');

    const updatedStats = {
      ...stats,
      totalStars: stats.totalStars + (newlyCompleted ? starsEarned : additionalStars),
      wordsPracticed: updatedList.length,
      wordsPerfect: stats.wordsPerfect + (isNewlyPerfect ? 1 : 0)
    };

    setStats(updatedStats);
    localStorage.setItem('sound-bridges-stats', JSON.stringify(updatedStats));
  };

  const handleNextWord = () => {
    // Pick the next word from current filtered list if possible, or overall
    const filtered = getFilteredWords();
    const currentIndex = filtered.findIndex(w => w.id === selectedWord.id);
    if (currentIndex !== -1 && currentIndex < filtered.length - 1) {
      setSelectedWord(filtered[currentIndex + 1]);
    } else {
      // Pick next word overall, or circle back to first
      const overallIndex = combinedWordDatabase.findIndex(w => w.id === selectedWord.id);
      const nextIndex = (overallIndex + 1) % combinedWordDatabase.length;
      setSelectedWord(combinedWordDatabase[nextIndex]);
    }
  };

  const handleSelectWordDirectly = (wordId: string) => {
    const word = combinedWordDatabase.find(w => w.id === wordId);
    if (word) {
      setSelectedWord(word);
      setActiveTab('practice');
    }
  };

  const handleWordsImported = (newWords: SpellingWord[]) => {
    setImportedWords(prev => {
      const existingIds = new Set(prev.map(w => w.id));
      const filteredNew = newWords.filter(w => !existingIds.has(w.id));
      const updated = [...prev, ...filteredNew];
      localStorage.setItem('sound-bridges-gmail-imported-words', JSON.stringify(updated));
      return updated;
    });
  };

  // Extract unique categories from DB
  const categories = Array.from(new Set(combinedWordDatabase.map(w => w.category)));

  // Filter word database
  const getFilteredWords = () => {
    return combinedWordDatabase.filter(w => {
      const matchLevel = difficultyFilter === 'all' || w.level === difficultyFilter;
      const matchCategory = categoryFilter === 'all' || w.category === categoryFilter;
      return matchLevel && matchCategory;
    });
  };

  const filteredWords = getFilteredWords();
  const currentTint = TINT_PRESETS[settings.tint];
  const currentFont = FONT_PRESETS[settings.font];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${currentTint.bgClass} ${currentTint.textClass} ${currentFont.fontClass} flex flex-col`}
    >
      {/* Background soft pulse visual accents (hot coal fire embers) */}
      <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-orange-600/10 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Primary header bar */}
      <header className="relative w-full border-b bg-slate-900/80 backdrop-blur-md border-slate-850 px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-orange-500 shadow-lg flex items-center justify-center select-none shrink-0 rotate-[-1deg]">
            <img
              src="/src/assets/images/cracked_steel_s_1784539701123.jpg"
              alt="Steelworlds Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover animate-pulse-slow"
            />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black font-fredoka text-slate-100 tracking-tight leading-none uppercase">
              STEELWORLDS
            </h1>
            <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mt-1">
              THE WORD FORGE
            </p>
          </div>

          {/* Active Speller Persona Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/60 border border-slate-800 py-1 px-2.5 rounded-2xl ml-4">
            <div className="select-none animate-bounce" style={{ animationDuration: '3s' }}>
              {renderStickerIcon(profile.sticker || 'steel_forger', 14, true)}
            </div>
            <div>
              <div className="text-[9px] font-extrabold text-amber-500 uppercase tracking-widest">Active Speller</div>
              <div className="text-xs font-black text-slate-200">
                {profile.studentName || 'Apprentice'} {profile.age ? `• Age ${profile.age}` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Global Streak/Stars scoreboard */}
        <div className="flex items-center gap-4">
          {/* Stars display */}
          <div className="flex items-center gap-1.5 bg-amber-950/40 border-2 border-amber-500/30 py-1.5 px-3.5 rounded-full text-amber-300 shadow-md font-fredoka font-bold text-sm">
            <Star size={16} fill="currentColor" className="text-amber-400 animate-pulse" />
            <span>{stats.totalStars} Stars</span>
          </div>

          {/* Streak display */}
          <div className="flex items-center gap-1.5 bg-orange-950/40 border-2 border-orange-500/30 py-1.5 px-3.5 rounded-full text-orange-300 shadow-md font-fredoka font-bold text-sm">
            <span className="text-base select-none">🔥</span>
            <span>{stats.streakDays} Day Streak</span>
          </div>
        </div>
      </header>

      {/* Main navigation tabs */}
      <nav className="relative max-w-2xl mx-auto w-full px-4 mt-6 z-10">
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 py-3 px-1 rounded-xl text-[11px] md:text-sm font-black font-fredoka flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'practice'
                ? `bg-amber-500 text-slate-950 shadow-md`
                : `text-slate-400 hover:text-amber-400`
            }`}
            id="tab-btn-practice"
          >
            <Sparkles size={16} />
            Spelling Play
          </button>

          <button
            onClick={() => setActiveTab('forge')}
            className={`flex-1 py-3 px-1 rounded-xl text-[11px] md:text-sm font-black font-fredoka flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'forge'
                ? `bg-amber-500 text-slate-950 shadow-md`
                : `text-slate-400 hover:text-amber-400`
            }`}
            id="tab-btn-forge"
          >
            <Hammer size={16} />
            Word Forge
          </button>

          <button
            onClick={() => setActiveTab('reading')}
            className={`flex-1 py-3 px-1 rounded-xl text-[11px] md:text-sm font-black font-fredoka flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'reading'
                ? `bg-amber-500 text-slate-950 shadow-md`
                : `text-slate-400 hover:text-amber-400`
            }`}
            id="tab-btn-reading"
          >
            <BookOpen size={16} />
            Reading Room
          </button>

          <button
            onClick={() => setActiveTab('academy')}
            className={`flex-1 py-3 px-1 rounded-xl text-[11px] md:text-sm font-black font-fredoka flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'academy'
                ? `bg-amber-500 text-slate-950 shadow-md`
                : `text-slate-400 hover:text-amber-400`
            }`}
            id="tab-btn-academy"
          >
            <GraduationCap size={16} />
            Age Academy
          </button>
          
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 px-1 rounded-xl text-[11px] md:text-sm font-black font-fredoka flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'progress'
                ? `bg-amber-500 text-slate-950 shadow-md`
                : `text-slate-400 hover:text-amber-400`
            }`}
            id="tab-btn-progress"
          >
            <Award size={16} />
            My Progress
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8 z-10 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'practice' && (
            <motion.div
              key="practice-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              
              {/* Left Column: Word Selector Panel (span 4) */}
              <section className="lg:col-span-4 space-y-4">
                <div className={`p-5 rounded-3xl border-2 bg-slate-900 border-slate-700/80 shadow-xl space-y-4 text-slate-100`}>
                  
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Filter size={18} className="text-amber-500" />
                    <h3 className="font-fredoka font-black text-slate-200 text-lg">Pick a Word</h3>
                  </div>

                  {/* Level selector buttons */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Difficulty level</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {['all', 'easy', 'medium', 'hard'].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setDifficultyFilter(lvl)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize cursor-pointer transition-all ${
                            difficultyFilter === lvl
                              ? `bg-amber-500/10 text-amber-300 border border-amber-500/30 ring-1 ring-amber-500/30`
                              : 'bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                          id={`filter-lvl-${lvl}`}
                        >
                          {lvl === 'easy' ? '🟢 Easy' : lvl === 'medium' ? '🟡 Medium' : lvl === 'hard' ? '🔴 Hard' : 'All'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Selector dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Filter</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      id="select-category-filter"
                    >
                      <option value="all">📁 All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Word bubble list scrollable */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Words Available ({filteredWords.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                      {filteredWords.map((word) => {
                        const isSelected = word.id === selectedWord.id;
                        const wordProgress = progressList.find(p => p.wordId === word.id);
                        const hasCompleted = wordProgress?.bestGrade === 'perfect';
                        const bestStars = wordProgress?.starsEarned || 0;

                        return (
                          <button
                            key={word.id}
                            onClick={() => setSelectedWord(word)}
                            className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all text-left gap-1 cursor-pointer hover:shadow-sm ${
                              isSelected
                                ? `bg-amber-500 border-amber-400 text-slate-950 shadow-md`
                                : 'bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-800 hover:bg-slate-900'
                            }`}
                            id={`word-bubble-${word.word}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {word.imageUrl ? (
                                <img
                                  src={word.imageUrl}
                                  alt={word.word}
                                  className={`w-7 h-7 rounded-xl object-cover shrink-0 border ${
                                    isSelected ? 'border-amber-300' : 'border-slate-800'
                                  }`}
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="text-xl shrink-0 select-none">{word.emoji}</span>
                              )}
                              <span
                                className="font-bold text-sm capitalize truncate"
                                style={{ fontFamily: settings.font === 'lexend' ? 'Lexend' : settings.font === 'atkinson' ? 'Atkinson Hyperlegible' : 'Fredoka' }}
                              >
                                {word.word}
                              </span>
                            </div>
                            
                            {/* Stars display mini marker */}
                            <div className="flex shrink-0">
                              {bestStars > 0 ? (
                                <div className="flex gap-0.5 text-amber-400">
                                  {Array.from({ length: bestStars }).map((_, i) => (
                                    <Star key={i} size={8} fill="currentColor" className={isSelected ? 'text-slate-950' : 'text-amber-400'} />
                                  ))}
                                </div>
                              ) : (
                                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full ${
                                  isSelected ? 'bg-slate-950/20 text-slate-900' : 'bg-slate-900 text-slate-500'
                                }`}>
                                  New
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}

                      {filteredWords.length === 0 && (
                        <div className="col-span-full text-center py-6 text-xs text-slate-500 font-semibold">
                          No matching words found! Try relaxing your filters.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </section>

              {/* Right Column: Active Exercise Playground (span 8) */}
              <section className="lg:col-span-8">
                <PracticeArea
                  word={selectedWord}
                  settings={settings}
                  onGradeSubmitted={handleGradeSubmitted}
                  onNextWord={handleNextWord}
                />
              </section>

            </motion.div>
          )}

          {activeTab === 'forge' && (
            <motion.div
              key="forge-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <WordForge
                settings={settings}
                stats={stats}
                onUpdateStats={setStats}
              />
            </motion.div>
          )}

          {activeTab === 'reading' && (
            <motion.div
              key="reading-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <ReadingSection
                settings={settings}
                stats={stats}
                onUpdateStats={setStats}
              />
            </motion.div>
          )}

          {activeTab === 'academy' && (
            <motion.div
              key="academy-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <AgeAcademy
                settings={settings}
                stats={stats}
                onUpdateStats={setStats}
                profile={profile}
                setProfile={setProfile}
              />
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="progress-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <ProgressView
                    stats={stats}
                    progressList={progressList}
                    onSelectWord={handleSelectWordDirectly}
                    settings={settings}
                    wordsList={combinedWordDatabase}
                    onWordsImported={handleWordsImported}
                  />
                </div>
                <div className="lg:col-span-4">
                  <SettingsPanel
                    settings={settings}
                    onUpdateSettings={setSettings}
                  />
                </div>
              </div>

              {/* 🎭 MY PERSONAL LEARNER PERSONA & STICKER FORGE */}
              <div className="relative p-6 md:p-8 rounded-3xl border-2 bg-slate-900 border-slate-800 text-slate-100 shadow-2xl space-y-6" id="personal-persona-forge">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl w-14 h-14 flex items-center justify-center select-none shadow-inner text-amber-400">
                      <Smile size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-fredoka flex items-center gap-2 text-slate-100">
                        🎭 Speller Persona & Sticker Album
                      </h3>
                      <p className="text-xs text-slate-400">
                        Customize your name, age, choose your active learning sticker, and download backup files.
                      </p>
                    </div>
                  </div>

                  {/* Offline backup storage controls */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleDownloadBackup}
                      className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/10"
                      title="Download your complete personal progress & profile database"
                      id="download-app-data-btn"
                    >
                      <Download size={14} />
                      Download Progress JSON
                    </button>
                    
                    <label className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl text-xs font-extrabold bg-slate-850 hover:bg-slate-850/80 border border-slate-800 text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none">
                      <Upload size={14} />
                      Import Progress
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleUploadBackup}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Backup Action Feedback Notification */}
                {backupMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl text-xs font-bold border bg-emerald-950/40 text-emerald-400 border-emerald-850 flex items-center gap-2"
                  >
                    <Check size={14} />
                    {backupMessage}
                  </motion.div>
                )}

                {/* Main Persona Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: Form details (span 5) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
                          Your Nickname
                        </label>
                        <input
                          type="text"
                          value={profile.studentName}
                          onChange={(e) => setProfile({ ...profile, studentName: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border-2 border-slate-800 focus:border-amber-500 focus:outline-none text-slate-100 font-bold text-sm"
                          placeholder="Enter nickname..."
                          id="persona-nickname-input"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
                          Your Age
                        </label>
                        <select
                          value={profile.age || '8'}
                          onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border-2 border-slate-800 focus:border-amber-500 focus:outline-none text-slate-100 font-bold text-sm cursor-pointer"
                          id="persona-age-select"
                        >
                          {Array.from({ length: 11 }, (_, i) => i + 5).map(ageVal => (
                            <option key={ageVal} value={ageVal.toString()}>{ageVal} Years Old</option>
                          ))}
                          <option value="16+">16+ / Adult</option>
                        </select>
                      </div>
                    </div>

                    {/* Goal controls inside the persona block */}
                    <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-850">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                        Daily Word Practice Goal ({profile.dailyWordGoal} Words)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="2"
                          max="15"
                          value={profile.dailyWordGoal}
                          onChange={(e) => setProfile({ ...profile, dailyWordGoal: parseInt(e.target.value) })}
                          className="flex-1 accent-amber-500 bg-slate-950 h-2 rounded-lg appearance-none cursor-pointer"
                          id="daily-goal-range-persona"
                        />
                        <span className="text-sm font-fredoka font-bold text-amber-400 min-w-[70px] text-center bg-slate-950 border border-slate-850 px-2 py-1 rounded-lg">
                          {profile.dailyWordGoal} words
                        </span>
                      </div>
                      
                      {/* Visual completion progress checklist */}
                      <div className="mt-4 flex items-center justify-between gap-4 text-xs">
                        <span className="text-slate-400 font-semibold">Goal Progress Today:</span>
                        <span className="font-bold text-slate-200">
                          {progressList.length} / {profile.dailyWordGoal} Words Practiced
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 border border-slate-850 rounded-full h-3 overflow-hidden mt-1.5 relative">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, (progressList.length / profile.dailyWordGoal) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Sticker Grid (span 7) */}
                  <div className="lg:col-span-7 space-y-3">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                      🎨 Choose Your Sticker Persona
                    </label>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        'steel_forger',
                        'iron_dragon',
                        'spark_bolt',
                        'forged_diamond',
                        'word_rocket',
                        'starry_pegasus',
                        'mighty_trex',
                        'retro_pixel',
                        'word_guardian',
                        'forge_fire'
                      ].map((stickerId) => {
                        const config = STICKER_ICONS[stickerId];
                        const isSelected = profile.sticker === stickerId || 
                          (stickerId === 'steel_forger' && profile.sticker === '🛠️') ||
                          (stickerId === 'iron_dragon' && profile.sticker === '🐉') ||
                          (stickerId === 'spark_bolt' && profile.sticker === '⚡') ||
                          (stickerId === 'forged_diamond' && profile.sticker === '💎') ||
                          (stickerId === 'word_rocket' && profile.sticker === '🚀') ||
                          (stickerId === 'starry_pegasus' && profile.sticker === '🦄') ||
                          (stickerId === 'mighty_trex' && profile.sticker === '🦖') ||
                          (stickerId === 'retro_pixel' && profile.sticker === '👾') ||
                          (stickerId === 'word_guardian' && profile.sticker === '🛡️') ||
                          (stickerId === 'forge_fire' && profile.sticker === '🔥');

                        return (
                          <button
                            key={stickerId}
                            onClick={() => setProfile({ ...profile, sticker: stickerId, avatar: stickerId })}
                            className={`p-2.5 rounded-2xl border-2 transition-all text-left flex items-start gap-2.5 cursor-pointer relative ${
                              isSelected
                                ? 'border-amber-500 bg-slate-950 shadow-lg shadow-amber-500/5'
                                : 'border-slate-850 bg-slate-950 hover:bg-slate-850/60'
                            }`}
                            id={`sticker-btn-${stickerId}`}
                          >
                            {renderStickerIcon(stickerId, 20, true)}
                            <div className="min-w-0">
                              <div className="text-xs font-black text-slate-200 truncate">{config.name}</div>
                              <div className="text-[10px] text-slate-400 leading-tight truncate">{config.desc}</div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Active Persona Badge Display */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {renderStickerIconLarge(profile.sticker || 'steel_forger')}
                    <div>
                      <p className="text-xs text-amber-500 font-extrabold uppercase tracking-widest mb-0.5">Your Active Persona Shield</p>
                      <h4 className="text-lg font-black text-slate-100 font-fredoka">
                        {profile.studentName || 'Apprentice Speller'} (Age {profile.age || '8'})
                      </h4>
                      <p className="text-xs text-slate-400 italic">
                        "Something was broken, but we are fixing it!"
                      </p>
                    </div>
                  </div>
                  
                  <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold max-w-sm text-center sm:text-right">
                    ⭐ Your persona receives automatic star rewards on every perfectly spelled syllable or sound! Keep learning!
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Tiny support/credit footer bar */}
      <footer className="w-full mt-auto py-6 border-t border-gray-100 text-center text-xs opacity-70 flex flex-col items-center justify-center gap-1">
        <div className="flex items-center gap-1.5 font-bold">
          <Heart size={12} className="text-rose-500 fill-rose-500" />
          <span>Made for learners of all visual and reading styles</span>
        </div>
        <p className="text-[10px]">Tapping letters and sounds bridges spelling gaps beautifully!</p>
      </footer>
    </div>
  );
}
