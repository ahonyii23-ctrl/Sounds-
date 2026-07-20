import React, { useState } from 'react';
import { UserSettings, UserStats, UserProfile } from '../types';
import { FONT_PRESETS } from '../data';
import { speakWord } from '../utils';
import { 
  Sparkles, Star, Award, ChevronRight, HelpCircle, Check, 
  RefreshCw, Volume2, Play, Book, Brain, Feather, Lightbulb, 
  Crown, Smile, ArrowRight, Zap, Target, BookOpen, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AgeAcademyProps {
  settings: UserSettings;
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

interface ActivityState {
  currentRound: number;
  selectedOption: number | null;
  scrambledInput: string[];
  isCorrect: boolean | null;
  completed: boolean;
  score: number;
}

export function AgeAcademy({ settings, stats, onUpdateStats, profile, setProfile }: AgeAcademyProps) {
  const activeFont = FONT_PRESETS[settings.font];
  
  // Local state to allow manual age-switching inside the Academy to test different age groups
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>(() => {
    const age = parseInt(profile.age || '8');
    if (age <= 6) return '5-6';
    if (age <= 8) return '7-8';
    if (age <= 11) return '9-11';
    if (age <= 15) return '12-15';
    return '16+';
  });

  // Keep selected group synced if profile age changes
  React.useEffect(() => {
    const age = parseInt(profile.age || '8');
    if (profile.age === '16+') {
      setSelectedAgeGroup('16+');
    } else if (age <= 6) {
      setSelectedAgeGroup('5-6');
    } else if (age <= 8) {
      setSelectedAgeGroup('7-8');
    } else if (age <= 11) {
      setSelectedAgeGroup('9-11');
    } else if (age <= 15) {
      setSelectedAgeGroup('12-15');
    } else {
      setSelectedAgeGroup('16+');
    }
  }, [profile.age]);

  // Selected Activity index within the current age group (0, 1, or 2)
  const [activeActivityIdx, setActiveActivityIdx] = useState<number>(0);
  
  // Game Play State
  const [gameState, setGameState] = useState<ActivityState>({
    currentRound: 0,
    selectedOption: null,
    scrambledInput: [],
    isCorrect: null,
    completed: false,
    score: 0
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const playAcademySound = (type: 'success' | 'click' | 'fail') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'success') {
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.08, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.2);
        });
      } else if (type === 'fail') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (err) {}
  };

  // Define Age Groups & Activities DB
  const AGE_GROUPS_CONFIG: Record<string, {
    id: string;
    name: string;
    range: string;
    badge: string;
    color: string;
    borderColor: string;
    accentColor: string;
    description: string;
    motto: string;
    activities: {
      id: string;
      title: string;
      icon: any;
      description: string;
      rounds: {
        prompt: string;
        word?: string; // For scrambled
        options?: string[]; // For multiple choice
        correctIndex?: number; // For multiple choice
        clue?: string; // Clue for scrambled / puzzle
        sentenceContext?: string;
      }[];
    }[];
  }> = {
    '5-6': {
      id: 'early-explorers',
      name: 'Early Explorers',
      range: 'Ages 5-6 🐾',
      badge: '👶 Beginner',
      color: 'bg-emerald-500/10 text-emerald-300',
      borderColor: 'border-emerald-500/20',
      accentColor: 'text-emerald-400',
      motto: 'Welding letter sounds and finding cozy rhyming pals!',
      description: 'Perfect for early learners! Focuses on rhymes, short vowel sounds, and starting consonant letters with friendly cues.',
      activities: [
        {
          id: 'rhyme-time',
          title: 'Rhyme Time Matcher',
          icon: Smile,
          description: 'Listen carefully and select the word that rhymes with the target word!',
          rounds: [
            {
              prompt: 'Tap the word that rhymes with CAT! 🐱',
              options: ['Dog 🐶', 'Hat 🎩', 'Pig 🐷'],
              correctIndex: 1
            },
            {
              prompt: 'Tap the word that rhymes with BUN! 🧁',
              options: ['Sun ☀️', 'Bed 🛏️', 'Tree 🌲'],
              correctIndex: 0
            },
            {
              prompt: 'Tap the word that rhymes with FROG! 🐸',
              options: ['Cow 🐮', 'Bite 🍎', 'Log 🪵'],
              correctIndex: 2
            },
            {
              prompt: 'Tap the word that rhymes with BED! 🛏️',
              options: ['Red 🔴', 'Cup 🥛', 'Rain 🌧️'],
              correctIndex: 0
            }
          ]
        },
        {
          id: 'vowel-catcher',
          title: 'Vowel Spark Matcher',
          icon: Zap,
          description: 'Weld the missing middle vowel letter to complete the simple word!',
          rounds: [
            {
              prompt: 'Complete the word: S _ N (The bright light in the sky) ☀️',
              options: ['A', 'U', 'E'],
              correctIndex: 1
            },
            {
              prompt: 'Complete the word: D _ G (Your friendly tail-wagging pal) 🐶',
              options: ['O', 'I', 'U'],
              correctIndex: 0
            },
            {
              prompt: 'Complete the word: P _ N (Something you use to write or draw) ✏️',
              options: ['E', 'O', 'A'],
              correctIndex: 0
            },
            {
              prompt: 'Complete the word: C _ T (A sweet fluffy pet that purrs) 🐱',
              options: ['O', 'A', 'U'],
              correctIndex: 1
            }
          ]
        },
        {
          id: 'sound-safari',
          title: 'Starting Sound Safari',
          icon: Compass,
          description: 'Identify which letter makes the starting sound of the item pictured!',
          rounds: [
            {
              prompt: 'Which letter makes the starting sound of RABBIT? 🐰',
              options: ['B', 'T', 'R'],
              correctIndex: 2
            },
            {
              prompt: 'Which letter makes the starting sound of BANANA? 🍌',
              options: ['P', 'B', 'M'],
              correctIndex: 1
            },
            {
              prompt: 'Which letter makes the starting sound of MOON? 🌙',
              options: ['M', 'W', 'N'],
              correctIndex: 0
            },
            {
              prompt: 'Which letter makes the starting sound of FLOWER? 🌸',
              options: ['F', 'V', 'L'],
              correctIndex: 0
            }
          ]
        }
      ]
    },
    '7-8': {
      id: 'junior-blacksmiths',
      name: 'Junior Blacksmiths',
      range: 'Ages 7-8 ⚒️',
      badge: '🧑‍🎓 Intermediate',
      color: 'bg-sky-500/10 text-sky-300',
      borderColor: 'border-sky-500/20',
      accentColor: 'text-sky-400',
      motto: 'Welding syllable chunks and solving word riddles!',
      description: 'Tailored for children learning to connect spelling blocks, create compound words, and spot tricky homophones.',
      activities: [
        {
          id: 'syllable-linker',
          title: 'Syllable Linker Match',
          icon: Brain,
          description: 'Match the starting syllable to the ending syllable to make a word!',
          rounds: [
            {
              prompt: 'Join with "RAB" to spell the long-eared carrot eater! 🐰',
              options: ['_LET', '_BIT', '_KEY'],
              correctIndex: 1
            },
            {
              prompt: 'Join with "PUP" to spell the friendly baby dog! 🐶',
              options: ['_PY', '_PIN', '_PET'],
              correctIndex: 0
            },
            {
              prompt: 'Join with "TEA" to spell the classroom helper! 👩‍🏫',
              options: ['_POT', '_CHER', '_CUP'],
              correctIndex: 1
            },
            {
              prompt: 'Join with "RAIN" to spell the colorful arc in the sky! 🌈',
              options: ['_BOW', '_DROP', '_COAT'],
              correctIndex: 0
            }
          ]
        },
        {
          id: 'compound-connector',
          title: 'Compound Word Fusion',
          icon: Zap,
          description: 'Forge two separate words together to build a magnificent compound word!',
          rounds: [
            {
              prompt: 'SUN + ________ = A tall bright yellow flower! 🌻',
              options: ['LIGHT', 'FLOWER', 'SHINE'],
              correctIndex: 1
            },
            {
              prompt: 'SNOW + ________ = A friendly frozen character! ☃️',
              options: ['BALL', 'MAN', 'STORM'],
              correctIndex: 1
            },
            {
              prompt: 'RAIN + ________ = Water drops falling from clouds! 🌧️',
              options: ['BOW', 'COAT', 'FALL'],
              correctIndex: 2
            },
            {
              prompt: 'PLAY + ________ = The outdoor place with slides & swings! 🛝',
              options: ['GROUND', 'MATE', 'ROOM'],
              correctIndex: 0
            }
          ]
        },
        {
          id: 'homophone-detective',
          title: 'Homophone Detective',
          icon: Target,
          description: 'Solve the riddle by choosing the correct spelling of words that sound identical!',
          rounds: [
            {
              prompt: 'Complete the sentence: "We went to ________ house for board games." 🏠',
              options: ['there', 'their', "they're"],
              correctIndex: 1
            },
            {
              prompt: 'Complete the sentence: "The rocket sailed past ________ glowing stars." ⭐',
              options: ['to', 'too', 'two'],
              correctIndex: 2
            },
            {
              prompt: 'Complete the sentence: "The weather was very cold in the ________." ❄️',
              options: ['blue', 'blew', 'bloomed'],
              correctIndex: 1
            },
            {
              prompt: 'Complete the sentence: "I ________ a yellow banana for my sweet snack." 🍌',
              options: ['ate', 'eight', 'hated'],
              correctIndex: 0
            }
          ]
        }
      ]
    },
    '9-11': {
      id: 'word-craftmasters',
      name: 'Word Craftmasters',
      range: 'Ages 9-11 ⚔️',
      badge: '🛡️ Advanced',
      color: 'bg-amber-500/10 text-amber-300',
      borderColor: 'border-amber-500/20',
      accentColor: 'text-amber-400',
      motto: 'Forging prefixes, jumbled anagrams, and synonym pairs!',
      description: 'Strengthens advanced spelling rules, understanding structural prefixes/suffixes, and solving synonym puzzles.',
      activities: [
        {
          id: 'prefix-welder',
          title: 'Prefix & Suffix Welder',
          icon: Brain,
          description: 'Attach the correct prefix or suffix to match the target meaning!',
          rounds: [
            {
              prompt: 'Weld a prefix to HAPPY to mean "not happy" 😞',
              options: ['RE-', 'UN-', 'DIS-'],
              correctIndex: 1
            },
            {
              prompt: 'Weld a suffix to PLAY to mean "doing play right now" 🏃',
              options: ['-FUL', '-ED', '-ING'],
              correctIndex: 2
            },
            {
              prompt: 'Weld a prefix to WRITE to mean "write something again" ✏️',
              options: ['RE-', 'PRE-', 'DE-'],
              correctIndex: 0
            },
            {
              prompt: 'Weld a suffix to BEAUTY to mean "full of beauty" 🌸',
              options: ['-LESS', '-ED', '-FUL'],
              correctIndex: 2
            }
          ]
        },
        {
          id: 'synonym-sparks',
          title: 'Synonym Sparks',
          icon: Sparkles,
          description: 'Match the vocabulary words to their closest synonym partners!',
          rounds: [
            {
              prompt: 'Which word means almost the same as ANCIENT? 🦖',
              options: ['Old', 'New', 'Polished'],
              correctIndex: 0
            },
            {
              prompt: 'Which word means almost the same as TINY? 🫧',
              options: ['Huge', 'Bright', 'Small'],
              correctIndex: 2
            },
            {
              prompt: 'Which word means almost the same as FRIENDLY? 🤗',
              options: ['Mean', 'Kind', 'Quiet'],
              correctIndex: 1
            },
            {
              prompt: 'Which word means almost the same as WARM? ☀️',
              options: ['Cool', 'Hot', 'Cozy'],
              correctIndex: 2
            }
          ]
        },
        {
          id: 'anagram-scramble',
          title: 'Anagram Cookie Alchemy',
          icon: Lightbulb,
          description: 'Unscramble the letters below to forge the sweet treat!',
          rounds: [
            {
              prompt: 'Unscramble the letters: O O K I C E 🍪',
              word: 'COOKIE',
              clue: 'A sweet baked treat often containing chocolate chips!'
            },
            {
              prompt: 'Unscramble the letters: E P N I L C ✏️',
              word: 'PENCIL',
              clue: 'Use this wooden tool to write and draw on paper.'
            },
            {
              prompt: 'Unscramble the letters: C O K E T R 🚀',
              word: 'ROCKET',
              clue: 'A silver space vehicle designed to blast off into orbit!'
            },
            {
              prompt: 'Unscramble the letters: E N T I K T 🐱',
              word: 'KITTEN',
              clue: 'A sweet baby cat that makes quiet purrs.'
            }
          ]
        }
      ]
    },
    '12-15': {
      id: 'steel-scribes',
      name: 'Steel Scribes',
      range: 'Ages 12-15 📜',
      badge: '👑 Master',
      color: 'bg-lavender-500/10 text-lavender-300',
      borderColor: 'border-lavender-500/20',
      accentColor: 'text-lavender-400',
      motto: 'Deciphering Latin word roots and vocabulary context!',
      description: 'High-school preparation. Explores classical Latin/Greek roots, sentence completions, and syllable cryptography.',
      activities: [
        {
          id: 'root-builder',
          title: 'Ancient Root Builder',
          icon: Brain,
          description: 'Use historical word parts to unlock spelling and meaning definitions!',
          rounds: [
            {
              prompt: 'The root SPECT means "to look". Which word means "someone who watches a live event"? 🏟️',
              options: ['Spectator', 'Inspector', 'Respect'],
              correctIndex: 0
            },
            {
              prompt: 'The root PORT means "to carry". Which word means "capable of being carried easily"? 🎒',
              options: ['Export', 'Portable', 'Transport'],
              correctIndex: 1
            },
            {
              prompt: 'The root SCRIB/SCRIPT means "to write". Which word means "a handwritten or typed text"? 📜',
              options: ['Manuscript', 'Scribble', 'Describe'],
              correctIndex: 0
            },
            {
              prompt: 'The root GEO means "Earth". Which word means "the scientific study of the Earth\'s physical structure"? 🌍',
              options: ['Geography', 'Geology', 'Geometry'],
              correctIndex: 1
            }
          ]
        },
        {
          id: 'cloze-master',
          title: 'Context Cloze Challenge',
          icon: Book,
          description: 'Fill the blank inside complex context sentences using the absolute best fitting word.',
          rounds: [
            {
              prompt: 'Select the word to complete: "The team built an __________ sandcastle that towered over the shoreline." 🏰',
              options: ['enormous', 'invisible', 'ancient'],
              correctIndex: 0
            },
            {
              prompt: 'Select the word to complete: "A rainbow is a natural __________ that occurs when light passes through water drops."',
              options: ['phenomenon', 'calamity', 'illusion'],
              correctIndex: 0
            },
            {
              prompt: 'Select the word to complete: "The doctor used a stethoscope to carefully __________ the patient\'s steady heartbeat." 🩺',
              options: ['ignore', 'diagnose', 'manipulate'],
              correctIndex: 1
            },
            {
              prompt: 'Select the word to complete: "Our space crew traveled past __________ planets to reach the edge of orbit." 🪐',
              options: ['distant', 'microscopic', 'shattered'],
              correctIndex: 0
            }
          ]
        },
        {
          id: 'cryptogram-syllable',
          title: 'Phonetic Cryptogram',
          icon: Target,
          description: 'Identify the word matching the specific phonetic syllable breakdown.',
          rounds: [
            {
              prompt: 'Identify the word with the syllable breakdown: "di - no - saur" 🦕',
              options: ['dinosaur', 'crocodile', 'dragonfly'],
              correctIndex: 0
            },
            {
              prompt: 'Identify the word with the syllable breakdown: "steth - o - scope" 🩺',
              options: ['stethoscope', 'telescope', 'microscope'],
              correctIndex: 0
            },
            {
              prompt: 'Identify the word with the syllable breakdown: "play - ful - ly" 🐶',
              options: ['playful', 'playfully', 'playground'],
              correctIndex: 1
            },
            {
              prompt: 'Identify the word with the syllable breakdown: "tem - per - a - ture" 🌡️',
              options: ['temporary', 'temperate', 'temperature'],
              correctIndex: 2
            }
          ]
        }
      ]
    },
    '16+': {
      id: 'epic-mythforgers',
      name: 'Epic Myth-Forgers',
      range: 'Ages 16+ / Adults 🌌',
      badge: '🌌 Grand Legendary',
      color: 'bg-amber-500/10 text-amber-300',
      borderColor: 'border-amber-500/20',
      accentColor: 'text-amber-400',
      motto: 'Philology, advanced GRE lexicons, and the AI Story Weaver!',
      description: 'A brand-new premium guild room crafted for high-school students and adults! Tests advanced etymological roots, SAT/GRE vocabulary, and lets you craft creative narratives using advanced keywords.',
      activities: [
        {
          id: 'philology-decipher',
          title: 'Advanced Philology Forge',
          icon: Brain,
          description: 'Deconstruct complex classical roots and prefixes to solve advanced spellings!',
          rounds: [
            {
              prompt: 'Greek roots PHIL ("love") + SOPHIA ("wisdom") weld together to define which classical subject? 🎓',
              options: ['Philosophy', 'Philanthropy', 'Sophistication'],
              correctIndex: 0
            },
            {
              prompt: 'Latin roots MAGN ("great") + ANIMUS ("mind/spirit") weld together to mean: 🦁',
              options: ['Magnanimous', 'Magnificent', 'Magnetize'],
              correctIndex: 0
            },
            {
              prompt: 'Greek roots CACO ("harsh/bad") + PHONE ("sound") weld together to spell: 🔊',
              options: ['Cacography', 'Symphony', 'Cacophony'],
              correctIndex: 2
            },
            {
              prompt: 'Latin roots BEN ("good") + VOL ("wish/will") weld together to form a word meaning "kind and generous": 🤝',
              options: ['Benevolent', 'Beneficial', 'Voluntary'],
              correctIndex: 0
            }
          ]
        },
        {
          id: 'gre-scramble',
          title: 'Legendary Lexicon Alchemist',
          icon: Lightbulb,
          description: 'Unscramble the letters to forge a highly advanced vocabulary word!',
          rounds: [
            {
              prompt: 'Unscramble this word meaning "a harsh, discordant mixture of sounds": C A O C H Y P O N 🔊',
              word: 'CACOPHONY',
              clue: 'Root words: caco (harsh) + phone (sound).'
            },
            {
              prompt: 'Unscramble this word meaning "extremely expressive, fluent, or persuasive in speech": Q U E L T O E N 🗣️',
              word: 'ELOQUENT',
              clue: 'Root: loqui (to speak).'
            },
            {
              prompt: 'Unscramble this word meaning "generous or forgiving, especially toward a rival": M I N A U S O M A N G 🤝',
              word: 'MAGNANIMOUS',
              clue: 'Root: magna (great) + animus (soul).'
            },
            {
              prompt: 'Unscramble this word meaning "lasting for a very short time; fleeting": H E M E R A P E L ⏳',
              word: 'EPHEMERAL',
              clue: 'Root: epi (upon) + hemera (day).'
            }
          ]
        },
        {
          id: 'story-weaver',
          title: 'Story Weaver Workshop',
          icon: Feather,
          description: 'Weld advanced vocabulary words together to weave an epic fantasy story lore paragraph! Check if you can spell and place all terms correctly.',
          rounds: [
            {
              prompt: 'Place the correct vocabulary word: "The marketplace was filled with a loud, chaotic _________ of clanging hammers and shouting merchants." 🔊',
              options: ['cacophony', 'harmony', 'silence'],
              correctIndex: 0
            },
            {
              prompt: 'Place the correct vocabulary word: "The high elf king spoke in an _________ voice, swaying the entire council with his powerful words." 🗣️',
              options: ['ephemeral', 'eloquent', 'cacophonous'],
              correctIndex: 1
            },
            {
              prompt: 'Place the correct vocabulary word: "The ancient dragon proved to be _________, sparing the town and offering them a chest of gold." 🐉',
              options: ['ephemeral', 'benevolent', 'hostile'],
              correctIndex: 1
            },
            {
              prompt: 'Place the correct vocabulary word: "The glowing dust of the stars is _________, shining for only a single brief second before fading." ⏳',
              options: ['magnanimous', 'ancient', 'ephemeral'],
              correctIndex: 2
            }
          ]
        }
      ]
    }
  };

  const currentGroup = AGE_GROUPS_CONFIG[selectedAgeGroup] || AGE_GROUPS_CONFIG['9-11'];
  const activeActivity = currentGroup.activities[activeActivityIdx] || currentGroup.activities[0];
  const activeRound = activeActivity.rounds[gameState.currentRound] || activeActivity.rounds[0];

  // Initialize/Reset game state when switching age groups or activities
  const handleResetActivity = (groupKey: string, actIdx: number) => {
    const group = AGE_GROUPS_CONFIG[groupKey] || AGE_GROUPS_CONFIG['9-11'];
    const act = group.activities[actIdx] || group.activities[0];
    const round0 = act.rounds[0];

    let scrambled: string[] = [];
    if (round0.word) {
      scrambled = round0.word.split('').sort(() => Math.random() - 0.5);
    }

    setGameState({
      currentRound: 0,
      selectedOption: null,
      scrambledInput: [],
      isCorrect: null,
      completed: false,
      score: 0
    });
  };

  const handleNextRound = () => {
    playAcademySound('click');
    const nextRoundIndex = gameState.currentRound + 1;
    if (nextRoundIndex < activeActivity.rounds.length) {
      const nextRound = activeActivity.rounds[nextRoundIndex];
      setGameState({
        ...gameState,
        currentRound: nextRoundIndex,
        selectedOption: null,
        scrambledInput: [],
        isCorrect: null
      });
    } else {
      // Activity Completed!
      // Award stars based on score
      const starsToAward = Math.max(1, gameState.score);
      const updatedStats = {
        ...stats,
        totalStars: stats.totalStars + starsToAward,
        wordsPracticed: stats.wordsPracticed + 1
      };
      onUpdateStats(updatedStats);
      localStorage.setItem('sound-bridges-stats', JSON.stringify(updatedStats));

      setGameState({
        ...gameState,
        completed: true
      });

      playAcademySound('success');
      showToast(`🏆 Activity complete! You earned +${starsToAward} Stars!`, 'success');
    }
  };

  const handleMultipleChoiceSelect = (optIdx: number) => {
    if (gameState.isCorrect !== null) return; // Already selected

    const correctIdx = activeRound.correctIndex ?? 0;
    const isCorrect = optIdx === correctIdx;

    if (isCorrect) {
      playAcademySound('success');
      setGameState({
        ...gameState,
        selectedOption: optIdx,
        isCorrect: true,
        score: gameState.score + 1
      });
    } else {
      playAcademySound('fail');
      setGameState({
        ...gameState,
        selectedOption: optIdx,
        isCorrect: false
      });
    }
  };

  // Scrambled letters helpers
  const handleTileClick = (char: string, index: number, originalScrambled: string[]) => {
    playAcademySound('click');
    const currentInput = [...gameState.scrambledInput, char];
    setGameState({
      ...gameState,
      scrambledInput: currentInput
    });

    // Check if word is fully built
    const targetWord = activeRound.word || '';
    if (currentInput.length === targetWord.length) {
      const builtWord = currentInput.join('');
      if (builtWord === targetWord) {
        playAcademySound('success');
        setGameState({
          ...gameState,
          scrambledInput: currentInput,
          isCorrect: true,
          score: gameState.score + 1
        });
      } else {
        playAcademySound('fail');
        setGameState({
          ...gameState,
          scrambledInput: currentInput,
          isCorrect: false
        });
      }
    }
  };

  const handleBackspaceTile = () => {
    if (gameState.scrambledInput.length === 0 || gameState.isCorrect === true) return;
    playAcademySound('click');
    setGameState({
      ...gameState,
      scrambledInput: gameState.scrambledInput.slice(0, -1),
      isCorrect: null
    });
  };

  const handleResetScramble = () => {
    playAcademySound('click');
    setGameState({
      ...gameState,
      scrambledInput: [],
      isCorrect: null
    });
  };

  // Helper to trigger voice pronunciation
  const handlePronounce = (phrase: string) => {
    speakWord(phrase, settings.pronunciationSpeed);
  };

  // Render sticker icons based on the chosen age group to make them feel highly authentic!
  const getGuildIcon = (groupId: string) => {
    switch (groupId) {
      case 'early-explorers': return '🐾';
      case 'junior-blacksmiths': return '⚒️';
      case 'word-craftmasters': return '⚔️';
      case 'steel-scribes': return '📜';
      case 'epic-mythforgers': return '🌌';
      default: return '🎓';
    }
  };

  return (
    <div className="space-y-8">
      {/* Academy Guild Header Dashboard */}
      <div className="relative p-6 md:p-8 rounded-3xl border-2 bg-slate-900 border-slate-700/80 text-slate-100 shadow-2xl overflow-hidden">
        {/* Pulse effect overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl animate-pulse" />
        </div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl p-3.5 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl w-16 h-16 flex items-center justify-center select-none shadow-inner text-amber-400">
              {getGuildIcon(currentGroup.id)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className={`text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full ${currentGroup.color} border border-slate-850`}>
                  {currentGroup.badge}
                </span>
                <span className="text-xs font-bold text-amber-400 font-mono">
                  {currentGroup.range}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black font-fredoka text-slate-100 mt-1 uppercase tracking-tight">
                {currentGroup.name} Guild
              </h2>
              <p className="text-xs text-slate-400 mt-1 italic">
                "{currentGroup.motto}"
              </p>
            </div>
          </div>

          {/* Age Selection Quick-Toggles to explore other age groups! */}
          <div className="bg-slate-950/80 p-2 border border-slate-850 rounded-2xl w-full md:w-auto">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5 px-2">
              Explore Age-Group Activities:
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {Object.keys(AGE_GROUPS_CONFIG).map((groupKey) => {
                const isActive = selectedAgeGroup === groupKey;
                const cfg = AGE_GROUPS_CONFIG[groupKey];
                return (
                  <button
                    key={groupKey}
                    onClick={() => {
                      setSelectedAgeGroup(groupKey);
                      setActiveActivityIdx(0);
                      handleResetActivity(groupKey, 0);
                      playAcademySound('click');
                    }}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-850'
                    }`}
                    title={cfg.name}
                  >
                    {groupKey}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Informative summary card */}
        <div className="mt-6 p-4 bg-slate-950/40 rounded-2xl border border-slate-850/60 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
          <BookOpen size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p>{currentGroup.description}</p>
        </div>
      </div>

      {/* Main Activity Play Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Activity List Toggles */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-3xl border-2 bg-slate-900 border-slate-700/80 shadow-xl space-y-3">
            <h3 className="font-fredoka font-black text-slate-200 text-base border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Crown size={16} className="text-amber-500" />
              Guild Challenges ({currentGroup.activities.length})
            </h3>

            <div className="space-y-2">
              {currentGroup.activities.map((act, idx) => {
                const isSelected = activeActivityIdx === idx;
                const ActIcon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={() => {
                      setActiveActivityIdx(idx);
                      handleResetActivity(selectedAgeGroup, idx);
                      playAcademySound('click');
                    }}
                    className={`w-full p-3.5 rounded-2xl border-2 transition-all text-left flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-slate-950 shadow-md shadow-amber-500/5'
                        : 'border-slate-850 bg-slate-950 hover:bg-slate-850/60'
                    }`}
                  >
                    <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-amber-500/80'
                    }`}>
                      <ActIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-200 truncate">{act.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight line-clamp-2">{act.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Active Playground Stage */}
        <div className="lg:col-span-8">
          <div className="p-6 md:p-8 rounded-3xl border-2 bg-slate-900 border-slate-700/80 shadow-2xl relative text-slate-100 flex flex-col justify-between min-h-[460px]">
            <AnimatePresence mode="wait">
              {!gameState.completed ? (
                <motion.div
                  key={`${activeActivity.id}-${gameState.currentRound}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 flex-grow flex flex-col justify-between"
                >
                  {/* Activity play header */}
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={16} className="text-amber-400 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-fredoka">
                          {activeActivity.title}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-400">
                        Round {gameState.currentRound + 1} of {activeActivity.rounds.length}
                      </div>
                    </div>

                    {/* Round Prompt Phrase & Speech trigger */}
                    <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-850 text-center space-y-3 relative overflow-hidden">
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => handlePronounce(activeRound.prompt.replace(/[🐾⚒️⚔️📜🌌🐱🐶🧁☀️🛏️🌲🔴🌧️🥛🏠⭐🌍🦖🫧🌸🛝)/]/g, ''))}
                          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 transition-colors border border-slate-800 cursor-pointer"
                          title="Speak Prompt Aloud"
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>
                      
                      <p className="text-base md:text-lg font-black leading-relaxed text-slate-200">
                        {activeRound.prompt}
                      </p>

                      {activeRound.clue && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[11px] text-amber-400 font-bold">
                          <Lightbulb size={12} />
                          <span>Clue: {activeRound.clue}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interactive input selectors based on activity content type */}
                  <div className="my-6 flex-grow flex items-center justify-center">
                    {/* TYPE A: Multiple Choice Question (options exist) */}
                    {activeRound.options ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mx-auto">
                        {activeRound.options.map((option, idx) => {
                          const isSelected = gameState.selectedOption === idx;
                          const isCorrectChoice = idx === activeRound.correctIndex;
                          const wasChecked = gameState.isCorrect !== null;

                          let btnStyle = 'border-slate-800 bg-slate-950 hover:bg-slate-850/80';
                          if (wasChecked) {
                            if (isCorrectChoice) {
                              btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-300 ring-2 ring-emerald-500/20';
                            } else if (isSelected) {
                              btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-300 ring-2 ring-rose-500/20';
                            } else {
                              btnStyle = 'border-slate-850 bg-slate-950 opacity-50';
                            }
                          } else if (isSelected) {
                            btnStyle = 'border-amber-500 bg-amber-500/10 text-amber-300';
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => handleMultipleChoiceSelect(idx)}
                              disabled={wasChecked}
                              className={`p-4 rounded-2xl border-2 font-bold text-sm md:text-base text-left transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                            >
                              <span>{option}</span>
                              {wasChecked && isCorrectChoice && (
                                <Check size={18} className="text-emerald-400 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* TYPE B: Jumbled letters/Scrambled words (word field exists) */
                      <div className="space-y-6 w-full max-w-lg">
                        {/* Current User Spell Input */}
                        <div className="flex justify-center gap-1.5 flex-wrap min-h-12 py-2.5 px-4 bg-slate-950 border border-slate-850 rounded-2xl items-center relative">
                          <AnimatePresence>
                            {gameState.scrambledInput.map((char, index) => (
                              <motion.span
                                key={index}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-amber-500 text-slate-950 border border-amber-300 text-base md:text-lg font-black flex items-center justify-center uppercase shadow-sm"
                              >
                                {char}
                              </motion.span>
                            ))}
                          </AnimatePresence>

                          {gameState.scrambledInput.length === 0 && (
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider select-none animate-pulse">
                              Tap letters below to weld the word!
                            </span>
                          )}

                          {gameState.scrambledInput.length > 0 && gameState.isCorrect !== true && (
                            <button
                              onClick={handleBackspaceTile}
                              className="absolute right-3 p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-rose-400 transition-colors text-xs font-black uppercase tracking-wider cursor-pointer select-none"
                            >
                              ←
                            </button>
                          )}
                        </div>

                        {/* Interactive Tiles to Select */}
                        <div className="flex gap-2 justify-center flex-wrap">
                          {activeRound.word?.split('').map((char, idx) => {
                            // Find out if we can click it (how many times has it been selected vs exist)
                            const timesUsed = gameState.scrambledInput.filter(c => c === char).length;
                            const totalExists = activeRound.word?.split('').filter(c => c === char).length ?? 0;
                            const isExhausted = timesUsed >= totalExists;

                            return (
                              <button
                                key={`${char}-${idx}`}
                                onClick={() => handleTileClick(char, idx, activeRound.word?.split('') || [])}
                                disabled={isExhausted || gameState.isCorrect === true}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl text-base md:text-lg font-black border-2 flex items-center justify-center uppercase transition-all cursor-pointer ${
                                  isExhausted
                                    ? 'bg-slate-950/40 text-slate-700 border-slate-900 scale-90 cursor-not-allowed opacity-30'
                                    : 'bg-slate-900 text-slate-100 border-slate-750 hover:border-amber-500 hover:scale-105 active:scale-95 shadow-md'
                                }`}
                              >
                                {char}
                              </button>
                            );
                          })}
                        </div>

                        {/* Reset scramble helper */}
                        {gameState.scrambledInput.length > 0 && gameState.isCorrect !== true && (
                          <div className="text-center">
                            <button
                              onClick={handleResetScramble}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                            >
                              <RefreshCw size={12} />
                              <span>Clear Weld</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Feedback Message Panel & Next Trigger */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between min-h-14">
                    <div>
                      {gameState.isCorrect === true && (
                        <div className="text-emerald-400 font-extrabold text-sm md:text-base flex items-center gap-1.5 animate-bounce">
                          <span>✨ Perfect! Splendidly Weld! (+1 Score)</span>
                        </div>
                      )}
                      {gameState.isCorrect === false && (
                        <div className="text-rose-400 font-extrabold text-sm md:text-base">
                          <span>❌ Try again! Let's check the letters.</span>
                        </div>
                      )}
                    </div>

                    <div>
                      {gameState.isCorrect === true && (
                        <button
                          onClick={handleNextRound}
                          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer uppercase font-fredoka"
                        >
                          <span>Next Round</span>
                          <ArrowRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* TYPE C: Completion Banner */
                <motion.div
                  key="completion-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-8 flex flex-col justify-center items-center h-full flex-grow"
                >
                  <div className="relative w-20 h-20 bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 rounded-3xl flex items-center justify-center select-none shadow-inner animate-bounce">
                    <Award size={48} className="animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-100 font-fredoka uppercase">
                      Guild Challenge Complete!
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      You conquered all challenges with magnificent knowledge! Your stats have been saved inside your personal profile dictionary.
                    </p>
                  </div>

                  {/* Stats score card */}
                  <div className="flex gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-850">
                    <div className="text-center px-4 py-1 border-r border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Final Score</div>
                      <div className="text-lg font-black text-amber-400">{gameState.score} / {activeActivity.rounds.length}</div>
                    </div>
                    <div className="text-center px-4 py-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Stars Earned</div>
                      <div className="text-lg font-black text-amber-400">+{Math.max(1, gameState.score)} ⭐</div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleResetActivity(selectedAgeGroup, activeActivityIdx)}
                      className="px-5 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={14} />
                      <span>Replay</span>
                    </button>
                    <button
                      onClick={() => {
                        const nextIdx = (activeActivityIdx + 1) % currentGroup.activities.length;
                        setActiveActivityIdx(nextIdx);
                        handleResetActivity(selectedAgeGroup, nextIdx);
                        playAcademySound('click');
                      }}
                      className="px-5 py-2.5 bg-amber-500 text-slate-950 hover:bg-amber-400 font-black text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer uppercase"
                    >
                      <span>Next Challenge</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Floating interactive toast notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-950 border-2 border-amber-500 text-amber-300 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 max-w-sm"
          >
            <Sparkles size={14} className="text-amber-400 shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
