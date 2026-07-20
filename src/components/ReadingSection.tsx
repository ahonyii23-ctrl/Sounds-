import React, { useState, useEffect } from 'react';
import { UserSettings, UserStats } from '../types';
import { FONT_PRESETS } from '../data';
import { speakWord } from '../utils';
import { 
  Volume2, BookOpen, Star, HelpCircle, ArrowRight, 
  CheckCircle2, Sparkles, Glasses, Award, Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReadingSectionProps {
  settings: UserSettings;
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

interface Story {
  id: string;
  title: string;
  emoji: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  paragraphs: string[];
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

const READING_STORIES: Story[] = [
  {
    id: 'story-1',
    title: 'The Helpful Rabbit',
    emoji: '🐰',
    difficulty: 'easy',
    description: 'A sweet story about Ben the rabbit helping a tiny bird in the woods.',
    paragraphs: [
      "Ben was a small rabbit with long brown ears.",
      "He lived in a cozy nest under a big oak tree.",
      "One day, Ben saw a tiny bird with a hurt wing.",
      "Ben brought soft moss and sweet clover to the bird.",
      "The bird sang a happy song of thanks to her kind friend."
    ],
    questions: [
      {
        question: "Where did Ben the rabbit live?",
        options: [
          "Under a big oak tree 🌳",
          "On top of a high mountain ⛰️",
          "Inside a hollow log 🪵"
        ],
        correctIndex: 0,
        explanation: "The story says Ben lived in a cozy nest under a big oak tree!"
      },
      {
        question: "What did Ben bring to help the tiny bird?",
        options: [
          "A shiny blue stone 💎",
          "Soft moss and sweet clover 🍀",
          "A giant yellow apple 🍎"
        ],
        correctIndex: 1,
        explanation: "Ben brought soft moss and sweet clover to keep the bird comfortable."
      }
    ]
  },
  {
    id: 'story-2',
    title: 'The Silver Rocket',
    emoji: '🚀',
    difficulty: 'medium',
    description: 'Fly past glowing stars on an exciting space trip with Alex and Liz!',
    paragraphs: [
      "The silver rocket stood tall on the launch pad.",
      "Alex and Liz put on their white space helmets.",
      "The screen counted down: five, four, three, two, one, blast off!",
      "They flew past the glowing stars and the round yellow moon.",
      "Liz looked out the window and saw the blue planet Earth."
    ],
    questions: [
      {
        question: "What did Alex and Liz wear before blast off?",
        options: [
          "Warm red coats 🧥",
          "White space helmets 🧑‍🚀",
          "Yellow swimming goggles 🥽"
        ],
        correctIndex: 1,
        explanation: "Alex and Liz put on their white space helmets to prepare for outer space!"
      },
      {
        question: "What planet did Liz see outside the window?",
        options: [
          "Planet Earth 🌍",
          "Planet Mars 🔴",
          "The Planet of Toys 🧸"
        ],
        correctIndex: 0,
        explanation: "Liz looked out the window and saw our beautiful blue planet Earth!"
      }
    ]
  },
  {
    id: 'story-3',
    title: 'Under the Magic Forest',
    emoji: '🌲',
    difficulty: 'hard',
    description: 'Discover glowing trees, a friendly dragon, and a secret gold key.',
    paragraphs: [
      "Deep in the whispering woods, the trees glowed with a soft blue light.",
      "Ela found a path made of shining gold pebbles.",
      "She walked quietly until she reached a sparkling pond.",
      "A friendly dragon with green scales was drinking the sweet water.",
      "The dragon gave Ela a tiny gold key that could open any door."
    ],
    questions: [
      {
        question: "What color did the magic forest trees glow with?",
        options: [
          "Bright fiery orange 🔥",
          "Soft glowing blue light 💡",
          "Deep mystery purple 💜"
        ],
        correctIndex: 1,
        explanation: "The story mentions the trees glowed with a soft blue light in the whispering woods."
      },
      {
        question: "What special item did the dragon give to Ela?",
        options: [
          "A map of the secret kingdom 🗺️",
          "A tiny gold key 🔑",
          "A basket of delicious red berries 🍓"
        ],
        correctIndex: 1,
        explanation: "The dragon gave Ela a tiny gold key that could open any door!"
      }
    ]
  }
];

export function ReadingSection({ settings, stats, onUpdateStats }: ReadingSectionProps) {
  const activeFont = FONT_PRESETS[settings.font];

  // Story Selection
  const [selectedStory, setSelectedStory] = useState<Story>(READING_STORIES[0]);
  const [isReadingComplete, setIsReadingComplete] = useState<boolean>(false);
  const [completedStories, setCompletedStories] = useState<string[]>(() => {
    const saved = localStorage.getItem('sound-bridges-completed-stories');
    return saved ? JSON.parse(saved) : [];
  });

  // Reading Assist Toggles
  const [useRuler, setUseRuler] = useState<boolean>(true);
  const [rulerPosition, setRulerPosition] = useState<number>(0);
  const [useBionic, setUseBionic] = useState<boolean>(false);
  const [useSyllableColor, setUseSyllableColor] = useState<boolean>(true);
  const [lineSpacing, setLineSpacing] = useState<'normal' | 'relaxed' | 'double'>('relaxed');
  
  // Interactive word helper state
  const [speakingWordState, setSpeakingWordState] = useState<string | null>(null);
  const [speakingParagraph, setSpeakingParagraph] = useState<number | null>(null);

  // Comprehension Quiz State
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  
  // Track stars earned in current session
  const [showRewardToast, setShowRewardToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Save completed stories
  useEffect(() => {
    localStorage.setItem('sound-bridges-completed-stories', JSON.stringify(completedStories));
  }, [completedStories]);

  // Reset states when changing stories
  const handleSelectStory = (story: Story) => {
    setSelectedStory(story);
    setIsReadingComplete(completedStories.includes(story.id));
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setQuizAnswered(false);
    setQuizScore(0);
    setQuizCompleted(false);
    setSpeakingWordState(null);
    setSpeakingParagraph(null);
    window.speechSynthesis.cancel();
  };

  // Text-To-Speech for individual words
  const handleWordSpeak = (word: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const clean = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'—]/g, "");
    setSpeakingWordState(clean);
    speakWord(clean, settings.pronunciationSpeed, () => {
      setSpeakingWordState(null);
    });
  };

  // Text-To-Speech for paragraph
  const handleParagraphSpeak = (paraText: string, index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (speakingParagraph === index) {
      window.speechSynthesis.cancel();
      setSpeakingParagraph(null);
      return;
    }
    setSpeakingParagraph(index);
    speakWord(paraText, settings.pronunciationSpeed, () => {
      setSpeakingParagraph(null);
    });
  };

  // Dynamic Syllable Segment Highlighter
  const renderSyllableColoredWord = (word: string, wordIdx: number) => {
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'—]/g, "");
    const punctuation = word.replace(/[a-zA-Z]/g, "");
    
    // Fallback if very short
    if (cleanWord.length <= 2) {
      return (
        <span 
          key={wordIdx} 
          onClick={(e) => handleWordSpeak(cleanWord, e)}
          className={`inline-block px-1 rounded-md transition-all duration-200 cursor-help hover:bg-slate-800 hover:text-amber-400 ${
            speakingWordState === cleanWord ? 'bg-amber-500 text-slate-950 font-black scale-105 ring-2 ring-amber-500/30' : ''
          }`}
        >
          {word}
        </span>
      );
    }

    // Basic English syllable approximation regex
    const syllableRegex = /[^aeiouy]*[aeiouy]+(?:[^aeiouy](?![aeiouy]))*/gi;
    const parts = cleanWord.match(syllableRegex) || [cleanWord];

    // Glow theme assigns
    const primaryColor = 'text-amber-300';
    const secondaryColor = 'text-orange-400';

    return (
      <span 
        key={wordIdx} 
        onClick={(e) => handleWordSpeak(cleanWord, e)}
        className={`inline-block px-1 rounded-md transition-all duration-200 cursor-help hover:bg-slate-800 hover:text-amber-400 ${
          speakingWordState === cleanWord ? 'bg-amber-500 text-slate-950 font-black scale-105 ring-2 ring-amber-500/30' : ''
        }`}
      >
        {parts.map((part, pIdx) => {
          const isAlt = pIdx % 2 === 1;
          return (
            <span key={pIdx} className={`font-black tracking-wide ${isAlt ? secondaryColor : primaryColor} ${speakingWordState === cleanWord ? 'text-slate-950' : ''}`}>
              {part}
            </span>
          );
        })}
        {punctuation}
      </span>
    );
  };

  // Bionic Reading Boldface Helper
  const renderBionicWord = (word: string, wordIdx: number) => {
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'—]/g, "");
    const punctuation = word.replace(/[a-zA-Z]/g, "");

    if (cleanWord.length <= 1) {
      return (
        <span 
          key={wordIdx} 
          onClick={(e) => handleWordSpeak(cleanWord, e)}
          className={`inline-block px-1 rounded-md transition-all duration-200 cursor-help hover:bg-slate-800 hover:text-amber-400 ${
            speakingWordState === cleanWord ? 'bg-amber-500 text-slate-950 font-black scale-105 ring-2 ring-amber-500/30' : ''
          }`}
        >
          {word}
        </span>
      );
    }

    const mid = Math.ceil(cleanWord.length / 2);
    const boldPart = cleanWord.slice(0, mid);
    const restPart = cleanWord.slice(mid);

    return (
      <span 
        key={wordIdx} 
        onClick={(e) => handleWordSpeak(cleanWord, e)}
        className={`inline-block px-1 rounded-md transition-all duration-200 cursor-help hover:bg-slate-800 hover:text-amber-400 ${
          speakingWordState === cleanWord ? 'bg-amber-500 text-slate-950 font-black scale-105 ring-2 ring-amber-500/30 font-bold' : ''
        }`}
      >
        <span className={`font-black ${speakingWordState === cleanWord ? 'text-slate-950' : 'text-amber-300'}`}>{boldPart}</span>
        <span className={`opacity-90 ${speakingWordState === cleanWord ? 'text-slate-900' : 'text-slate-300'}`}>{restPart}</span>
        {punctuation}
      </span>
    );
  };

  // Normal Word Rendering with speaker on-click
  const renderNormalWord = (word: string, wordIdx: number) => {
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'—]/g, "");
    return (
      <span 
        key={wordIdx} 
        onClick={(e) => handleWordSpeak(cleanWord, e)}
        className={`inline-block px-1 rounded-md transition-all duration-200 cursor-help hover:bg-slate-800 hover:text-amber-400 text-slate-200 ${
          speakingWordState === cleanWord ? 'bg-amber-500 text-slate-950 font-black scale-105 ring-2 ring-amber-500/30 font-bold' : ''
        }`}
      >
        {word}
      </span>
    );
  };

  // Complete Story Reading triggers
  const handleMarkAsRead = () => {
    if (!completedStories.includes(selectedStory.id)) {
      const updated = [...completedStories, selectedStory.id];
      setCompletedStories(updated);
      setIsReadingComplete(true);

      const starsToAward = 5;
      const updatedStats = {
        ...stats,
        totalStars: stats.totalStars + starsToAward
      };
      onUpdateStats(updatedStats);
      localStorage.setItem('sound-bridges-stats', JSON.stringify(updatedStats));

      triggerToast(`⭐ Fabulous effort! You earned +${starsToAward} Stars for finishing the story!`);
    } else {
      triggerToast("💖 You already finished reading this beautiful story!");
    }
    
    setQuizStarted(true);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowRewardToast(true);
    setTimeout(() => {
      setShowRewardToast(false);
    }, 4500);
  };

  const handleAnswerSelect = (index: number) => {
    if (quizAnswered) return;
    setSelectedAnswerIndex(index);
  };

  const handleQuizSubmit = () => {
    if (selectedAnswerIndex === null) return;
    
    const isCorrect = selectedAnswerIndex === selectedStory.questions[currentQuestionIndex].correctIndex;
    setQuizAnswered(true);

    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      const starsToAward = 2;
      const updatedStats = {
        ...stats,
        totalStars: stats.totalStars + starsToAward
      };
      onUpdateStats(updatedStats);
      localStorage.setItem('sound-bridges-stats', JSON.stringify(updatedStats));
      triggerToast(`✨ Super smart! Correct answer! +${starsToAward} Stars!`);
    } else {
      triggerToast("🌈 Good try! Read the explanation to learn more.");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedStory.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswerIndex(null);
      setQuizAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const getLineSpacingClass = () => {
    if (lineSpacing === 'normal') return 'leading-normal';
    if (lineSpacing === 'relaxed') return 'leading-loose';
    return 'leading-[3]';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="reading-section-root">
      
      {/* Toast Alert for child reward reinforcement */}
      <AnimatePresence>
        {showRewardToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 font-fredoka font-black text-sm px-6 py-3.5 rounded-full shadow-2xl border-4 border-slate-900 flex items-center gap-3.5"
          >
            <Sparkles size={20} className="animate-spin text-amber-200" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT COLUMN: Story Selector & Difficulty Settings */}
      <section className="lg:col-span-4 space-y-4">
        <div className="p-5 rounded-3xl border-2 bg-slate-900 border-slate-700/80 shadow-xl space-y-4 text-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <BookOpen size={18} className="text-amber-500" />
            <h3 className="font-fredoka font-black text-slate-200 text-lg">Pick a Story</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Improve your fluent reading with visual assistance overlays and audio guides.
          </p>

          <div className="space-y-2.5">
            {READING_STORIES.map((story) => {
              const isSelected = story.id === selectedStory.id;
              const isCompleted = completedStories.includes(story.id);
              
              return (
                <button
                  key={story.id}
                  onClick={() => handleSelectStory(story)}
                  className={`w-full p-3.5 rounded-2xl border-2 transition-all text-left flex flex-col gap-1.5 cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'border-amber-500 bg-slate-800/80 shadow-sm'
                      : 'bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-800 hover:bg-slate-900'
                  }`}
                  id={`story-btn-${story.id}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl select-none">{story.emoji}</span>
                      <span className="font-extrabold font-fredoka text-sm text-slate-200">
                        {story.title}
                      </span>
                    </div>

                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      story.difficulty === 'easy' ? 'bg-green-950 text-green-400 border border-green-800/40' :
                      story.difficulty === 'medium' ? 'bg-amber-950 text-amber-400 border border-amber-800/40' :
                      'bg-rose-950 text-rose-400 border border-rose-800/40'
                    }`}>
                      {story.difficulty}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {story.description}
                  </p>

                  {/* Complete Check Indicator */}
                  {isCompleted && (
                    <div className="absolute right-2 bottom-2 text-green-400 bg-slate-950 rounded-full p-0.5 border border-slate-800 shadow-sm flex items-center justify-center">
                      <CheckCircle2 size={13} fill="currentColor" className="text-slate-950 fill-green-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dyslexic Visual Aid Panel */}
          <div className="border-t border-slate-800 pt-4 space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-300 uppercase tracking-wide">
              <Sliders size={14} className="text-amber-500" />
              <span>Visual Reading Aids</span>
            </div>

            {/* Focus Ruler switch */}
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-300 flex items-center gap-1.5">
                <span className="text-sm select-none">📏</span> Reading Ruler Focus
              </span>
              <button
                onClick={() => setUseRuler(!useRuler)}
                className={`w-11 h-6 rounded-full transition-all relative cursor-pointer flex items-center px-1 border border-slate-850 ${
                  useRuler ? 'bg-amber-500' : 'bg-slate-950'
                }`}
                id="toggle-reading-ruler"
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow ${
                  useRuler ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Bionic Reading switch */}
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-300 flex items-center gap-1.5">
                <span className="text-sm select-none">👁️</span> Bionic Bold Anchors
              </span>
              <button
                onClick={() => {
                  setUseBionic(!useBionic);
                  if (!useBionic) setUseSyllableColor(false);
                }}
                className={`w-11 h-6 rounded-full transition-all relative cursor-pointer flex items-center px-1 border border-slate-850 ${
                  useBionic ? 'bg-amber-500' : 'bg-slate-950'
                }`}
                id="toggle-bionic"
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow ${
                  useBionic ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Color-coded Syllables switch */}
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-300 flex items-center gap-1.5">
                <span className="text-sm select-none">🎨</span> Color-coded Syllables
              </span>
              <button
                onClick={() => {
                  setUseSyllableColor(!useSyllableColor);
                  if (!useSyllableColor) setUseBionic(false);
                }}
                className={`w-11 h-6 rounded-full transition-all relative cursor-pointer flex items-center px-1 border border-slate-850 ${
                  useSyllableColor ? 'bg-amber-500' : 'bg-slate-950'
                }`}
                id="toggle-syllable-color"
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow ${
                  useSyllableColor ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Line Spacing Adjuster buttons */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Line Spacing</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
                {['normal', 'relaxed', 'double'].map((spacing) => (
                  <button
                    key={spacing}
                    onClick={() => setLineSpacing(spacing as any)}
                    className={`py-1 rounded-lg text-[10px] font-extrabold capitalize cursor-pointer transition-all ${
                      lineSpacing === spacing
                        ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                        : 'text-slate-400 hover:text-slate-250'
                    }`}
                    id={`spacing-btn-${spacing}`}
                  >
                    {spacing === 'normal' ? 'Normal' : spacing === 'relaxed' ? 'Relaxed' : 'Double'}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* RIGHT COLUMN: Active Reading Board and Quizzes */}
      <section className="lg:col-span-8">
        <div className="p-6 md:p-8 rounded-3xl border-2 bg-slate-900 border-slate-700/80 shadow-xl space-y-6 relative overflow-hidden text-slate-100">
          
          {/* Header elements */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-4xl select-none">{selectedStory.emoji}</span>
              <div>
                <h2 className="text-xl md:text-2xl font-black font-fredoka text-slate-100">
                  {selectedStory.title}
                </h2>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-bold">
                  <span className="capitalize">{selectedStory.difficulty} level</span>
                  <span>•</span>
                  <span>{selectedStory.paragraphs.length} paragraphs</span>
                </div>
              </div>
            </div>

            {/* Whole story speak trigger */}
            <button
              onClick={(e) => handleParagraphSpeak(selectedStory.paragraphs.join(' '), 99, e)}
              className={`px-3.5 py-1.5 border-2 rounded-full text-xs font-black font-fredoka flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all ${
                speakingParagraph === 99
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'text-slate-300 bg-slate-950 border-slate-850 hover:bg-slate-800'
              }`}
              id="speak-whole-story-btn"
            >
              <Volume2 size={15} className={speakingParagraph === 99 ? 'animate-bounce' : ''} />
              <span>{speakingParagraph === 99 ? 'Speaking...' : 'Read Whole Story'}</span>
            </button>
          </div>

          <p className="text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-4 py-2.5 rounded-2xl flex items-center gap-2">
            <HelpCircle size={15} className="shrink-0 text-amber-500" />
            <span>Stuck on a word? Just tap it to hear it pronounced out loud slow!</span>
          </p>

          {/* ACTIVE READING ZONE */}
          {!quizStarted ? (
            <div className="space-y-6">
              
              {/* Reading board body with cursor ruler overlay tracking */}
              <div 
                className={`relative py-4 ${getLineSpacingClass()} text-lg md:text-xl font-bold select-text text-slate-200`}
                onMouseMove={(e) => {
                  if (useRuler) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    setRulerPosition(y);
                  }
                }}
                onTouchMove={(e) => {
                  if (useRuler && e.touches.length > 0) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.touches[0].clientY - rect.top;
                    setRulerPosition(y);
                  }
                }}
                id="reading-text-container"
              >
                {/* Guided Focus Ruler Overlay */}
                {useRuler && (
                  <motion.div
                    className="absolute left-0 right-0 h-10 pointer-events-none rounded-xl bg-amber-500/20 border-y-2 border-amber-400/40 mix-blend-screen transition-all duration-75 shadow-sm"
                    style={{ top: `${rulerPosition - 20}px` }}
                    initial={false}
                  />
                )}

                {/* Paragraph rendering */}
                {selectedStory.paragraphs.map((para, paraIdx) => {
                  const words = para.split(' ');
                  const isSpeakingPara = speakingParagraph === paraIdx;

                  return (
                    <div 
                      key={paraIdx} 
                      className={`relative mb-6 p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                        isSpeakingPara ? 'bg-slate-950/60 border-slate-800 shadow-inner' : 'border-transparent'
                      }`}
                    >
                      {/* Read Paragraph button */}
                      <button
                        onClick={(e) => handleParagraphSpeak(para, paraIdx, e)}
                        className={`p-1.5 rounded-xl border shrink-0 mt-1 cursor-pointer transition-all ${
                          isSpeakingPara 
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-800'
                        }`}
                        title="Read this line out loud"
                        id={`btn-read-para-${paraIdx}`}
                      >
                        <Volume2 size={14} className={isSpeakingPara ? 'animate-bounce' : ''} />
                      </button>

                      <div className="flex-1 flex-wrap inline-block">
                        {words.map((word, wordIdx) => {
                          if (useSyllableColor) {
                            return renderSyllableColoredWord(word, wordIdx);
                          } else if (useBionic) {
                            return renderBionicWord(word, wordIdx);
                          } else {
                            return renderNormalWord(word, wordIdx);
                          }
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Finish Reading / Proceed Button */}
              <div className="flex justify-center border-t border-slate-800 pt-6">
                <button
                  onClick={handleMarkAsRead}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black font-fredoka text-lg rounded-2xl flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                  id="btn-reading-complete"
                >
                  <Award size={22} className="animate-bounce" />
                  <span>I Finished Reading! Start Quiz (+5 Stars)</span>
                  <ArrowRight size={20} />
                </button>
              </div>

            </div>
          ) : (
            
            /* COMPREHENSION QUIZ SCENARIO */
            <div className="space-y-6">
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 flex justify-between items-center text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Glasses size={14} className="text-amber-500" />
                  Story Quiz: {selectedStory.title}
                </span>
                <span>Question {currentQuestionIndex + 1} of {selectedStory.questions.length}</span>
              </div>

              {!quizCompleted ? (
                <div className="space-y-6">
                  {/* Current Active Question */}
                  <h3 className="text-lg md:text-xl font-black text-slate-100 font-fredoka leading-relaxed">
                    {selectedStory.questions[currentQuestionIndex].question}
                  </h3>

                  {/* Options list */}
                  <div className="space-y-3">
                    {selectedStory.questions[currentQuestionIndex].options.map((option, idx) => {
                      const isSelected = selectedAnswerIndex === idx;
                      const isCorrect = idx === selectedStory.questions[currentQuestionIndex].correctIndex;
                      
                      let optionStyle = 'bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-800 hover:bg-slate-900';
                      if (isSelected) {
                        optionStyle = 'bg-slate-800 border-amber-500 text-slate-100';
                      }
                      if (quizAnswered) {
                        if (isCorrect) {
                          optionStyle = 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100';
                        } else if (isSelected) {
                          optionStyle = 'bg-rose-950/40 border-rose-500/40 text-rose-100';
                        } else {
                          optionStyle = 'bg-slate-950/40 border-slate-950 text-slate-500 opacity-40';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSelect(idx)}
                          disabled={quizAnswered}
                          className={`w-full p-4 rounded-2xl border-2 text-left font-bold text-sm md:text-base flex items-center justify-between transition-all relative overflow-hidden ${
                            !quizAnswered ? 'cursor-pointer active:scale-99' : 'cursor-default'
                          } ${optionStyle}`}
                          id={`quiz-option-${idx}`}
                        >
                          <span className="font-extrabold pr-4">{option}</span>
                          
                          {/* Checked mark status */}
                          {quizAnswered && isCorrect && (
                            <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                          )}
                          {quizAnswered && isSelected && !isCorrect && (
                            <span className="text-rose-400 shrink-0 font-extrabold text-xs uppercase bg-rose-950 px-2 py-0.5 rounded-full border border-rose-800/30">Incorrect</span>
                          )}
                          {isSelected && !quizAnswered && (
                            <div className="w-4 h-4 rounded-full border-4 border-amber-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Submission triggers & Explanations */}
                  {quizAnswered ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-2xl border ${
                        selectedAnswerIndex === selectedStory.questions[currentQuestionIndex].correctIndex
                          ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                          : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                      } space-y-1`}
                    >
                      <h4 className="font-extrabold font-fredoka text-sm flex items-center gap-1.5 text-amber-400">
                        <HelpCircle size={15} />
                        Explanation:
                      </h4>
                      <p className="text-xs font-semibold leading-relaxed">
                        {selectedStory.questions[currentQuestionIndex].explanation}
                      </p>
                    </motion.div>
                  ) : null}

                  <div className="flex justify-between items-center border-t border-slate-800 pt-5">
                    {/* Return to story */}
                    <button
                      onClick={() => setQuizStarted(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-xl cursor-pointer transition-all"
                      id="btn-quiz-back-to-story"
                    >
                      Back to Story
                    </button>

                    {/* Submit or Proceed button */}
                    {!quizAnswered ? (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={selectedAnswerIndex === null}
                        className={`px-6 py-3 font-fredoka font-black rounded-xl text-sm flex items-center gap-1.5 transition-all ${
                          selectedAnswerIndex === null
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 cursor-pointer shadow-md active:scale-95'
                        }`}
                        id="btn-quiz-submit"
                      >
                        Check Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-fredoka font-black rounded-xl text-sm flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
                        id="btn-quiz-next"
                      >
                        {currentQuestionIndex < selectedStory.questions.length - 1 ? 'Next Question' : 'View Score!'}
                        <ArrowRight size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* QUIZ FINISHED CELEBRATION CARD */
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-6"
                >
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-amber-950/40 border-4 border-amber-500/40 flex items-center justify-center animate-bounce">
                        <Award size={48} className="text-amber-400" />
                      </div>
                      <div className="absolute top-0 right-0 bg-yellow-400 rounded-full p-1 text-slate-950 shadow-md">
                        <Sparkles size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black font-fredoka text-slate-100">
                      Story Complete!
                    </h3>
                    <p className="text-sm font-semibold text-slate-400 max-w-sm mx-auto leading-relaxed">
                      You did an outstanding job reading and answering questions for <span className="font-extrabold text-slate-300">"{selectedStory.title}"</span>!
                    </p>
                  </div>

                  {/* Stars / Success banner */}
                  <div className="inline-block bg-amber-950/40 border-2 border-amber-500/30 px-6 py-3.5 rounded-3xl text-amber-200">
                    <div className="flex items-center gap-1.5 justify-center font-fredoka font-black text-lg">
                      <Star size={18} fill="currentColor" className="text-amber-500 animate-pulse" />
                      <span>Score: {quizScore} / {selectedStory.questions.length} Correct!</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-amber-500 mt-1">
                      Stars have been saved to your scoreboard!
                    </p>
                  </div>

                  <div className="flex gap-3 justify-center pt-2">
                    <button
                      onClick={() => handleSelectStory(selectedStory)}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-all"
                      id="btn-reread"
                    >
                      Read Again
                    </button>
                    <button
                      onClick={() => {
                        const nextIndex = (READING_STORIES.findIndex(s => s.id === selectedStory.id) + 1) % READING_STORIES.length;
                        handleSelectStory(READING_STORIES[nextIndex]);
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl text-xs font-black font-fredoka cursor-pointer transition-all shadow-md"
                      id="btn-next-story"
                    >
                      Next Story
                    </button>
                  </div>
                </motion.div>
              )}

            </div>
          )}

        </div>
      </section>

    </div>
  );
}
