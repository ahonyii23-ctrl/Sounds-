import { useState, useEffect } from 'react';
import { SpellingWord, UserSettings, UserStats, WordProgress } from './types';
import { WORD_DATABASE, DEFAULT_SETTINGS, TINT_PRESETS, FONT_PRESETS } from './data';
import { PracticeArea } from './components/PracticeArea';
import { ProgressView } from './components/ProgressView';
import { SettingsPanel } from './components/SettingsPanel';
import { Sparkles, BookOpen, Award, Settings, Star, Filter, Heart, ChevronRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [activeTab, setActiveTab] = useState<'practice' | 'progress' | 'settings'>('practice');

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

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem('sound-bridges-settings', JSON.stringify(settings));
  }, [settings]);

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
      className={`min-h-screen transition-colors duration-300 ${currentTint.bgClass} flex flex-col`}
      style={{ fontFamily: currentFont.fontClass }}
    >
      {/* Background soft pulse visual accents */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-yellow-100/30 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-indigo-100/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Primary header bar */}
      <header className="relative w-full border-b bg-white/70 backdrop-blur-md border-gray-100 px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-md rotate-[-2deg] flex items-center justify-center select-none">
            <span className="text-2xl font-black">🌉</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold font-fredoka text-gray-900 tracking-tight leading-none">
              Sound Bridges
            </h1>
            <p className="text-[11px] font-bold text-indigo-600/90 uppercase tracking-widest mt-1">
              Syllable Spelling Practice
            </p>
          </div>
        </div>

        {/* Global Streak/Stars scoreboard */}
        <div className="flex items-center gap-4">
          {/* Stars display */}
          <div className="flex items-center gap-1.5 bg-amber-50 border-2 border-amber-200 py-1.5 px-3.5 rounded-full text-amber-700 shadow-sm font-fredoka font-bold text-sm">
            <Star size={16} fill="currentColor" className="text-amber-500 animate-pulse" />
            <span>{stats.totalStars} Stars</span>
          </div>

          {/* Streak display */}
          <div className="flex items-center gap-1.5 bg-rose-50 border-2 border-rose-200 py-1.5 px-3.5 rounded-full text-rose-600 shadow-sm font-fredoka font-bold text-sm">
            <span className="text-base select-none">🔥</span>
            <span>{stats.streakDays} Day Streak</span>
          </div>
        </div>
      </header>

      {/* Main navigation tabs */}
      <nav className="relative max-w-lg mx-auto w-full px-4 mt-6 z-10">
        <div className="flex p-1 bg-white border border-gray-200/80 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 py-3 px-2 rounded-xl text-xs md:text-sm font-black font-fredoka flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-500 hover:text-indigo-600'
            }`}
            id="tab-btn-practice"
          >
            <BookOpen size={16} />
            Practice
          </button>
          
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 px-2 rounded-xl text-xs md:text-sm font-black font-fredoka flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'progress'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-500 hover:text-indigo-600'
            }`}
            id="tab-btn-progress"
          >
            <Award size={16} />
            My Progress
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-2 rounded-xl text-xs md:text-sm font-black font-fredoka flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-500 hover:text-indigo-600'
            }`}
            id="tab-btn-settings"
          >
            <Settings size={16} />
            Board Settings
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
                <div className={`p-5 rounded-3xl border-2 bg-white/95 border-gray-100 shadow-lg space-y-4`}>
                  
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Filter size={18} className="text-indigo-600" />
                    <h3 className="font-fredoka font-black text-gray-800 text-lg">Pick a Word</h3>
                  </div>

                  {/* Level selector buttons */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Difficulty level</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {['all', 'easy', 'medium', 'hard'].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setDifficultyFilter(lvl)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize cursor-pointer transition-all ${
                            difficultyFilter === lvl
                              ? 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-300'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
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
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Category Filter</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
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
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                : 'bg-white border-gray-150 hover:border-gray-300'
                            }`}
                            id={`word-bubble-${word.word}`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xl shrink-0 select-none">{word.emoji}</span>
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
                                    <Star key={i} size={8} fill="currentColor" className={isSelected ? 'text-yellow-200' : 'text-amber-400'} />
                                  ))}
                                </div>
                              ) : (
                                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full ${
                                  isSelected ? 'bg-indigo-500 text-indigo-100' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  New
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}

                      {filteredWords.length === 0 && (
                        <div className="col-span-full text-center py-6 text-xs text-gray-400 font-semibold">
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

          {activeTab === 'progress' && (
            <motion.div
              key="progress-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <ProgressView
                stats={stats}
                progressList={progressList}
                onSelectWord={handleSelectWordDirectly}
                settings={settings}
                wordsList={combinedWordDatabase}
                onWordsImported={handleWordsImported}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <SettingsPanel
                settings={settings}
                onUpdateSettings={setSettings}
              />
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
