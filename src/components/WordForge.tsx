import React, { useState, useEffect } from 'react';
import { UserSettings, UserStats } from '../types';
import { TINT_PRESETS, FONT_PRESETS } from '../data';
import { 
  Flame, Hammer, Sparkles, Award, Shield, Archive, Info, 
  HelpCircle, RefreshCw, Volume2, VolumeX, CheckCircle, ArrowRight, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WordForgeProps {
  settings: UserSettings;
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

interface LetterItem {
  char: string;
  isBroken: boolean;
  status: 'broken' | 'heating' | 'hammering' | 'forged';
  angle: number; // in degrees, representing "bent/mirrored"
  scaleX: number; // -1 for mirrored, 1 for normal
  scaleY: number; // -1 for upside down, 1 for normal
  personality: string;
  forgedPersonality: string;
  progress: number; // forging progress 0 to 100
}

interface Quest {
  id: string;
  word: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'boss';
  completed: boolean;
  letters: LetterItem[];
}

interface MuseumArtifact {
  id: string;
  name: string;
  description: string;
  emoji: string;
  timestamp: string;
}

// Sound generator using Web Audio API for highly responsive gameplay feel
const playSynthSound = (type: 'heat' | 'hammer' | 'success' | 'click' | 'fail') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'heat') {
      // White noise for steam/fire
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.4);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } else if (type === 'hammer') {
      // Low metallic thud + high metallic ring
      const oscLow = ctx.createOscillator();
      const oscHigh = ctx.createOscillator();
      const gainLow = ctx.createGain();
      const gainHigh = ctx.createGain();

      oscLow.type = 'sawtooth';
      oscLow.frequency.setValueAtTime(80, ctx.currentTime);
      oscLow.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      gainLow.gain.setValueAtTime(0.2, ctx.currentTime);
      gainLow.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscHigh.type = 'sine';
      oscHigh.frequency.setValueAtTime(1200, ctx.currentTime);
      oscHigh.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
      gainHigh.gain.setValueAtTime(0.08, ctx.currentTime);
      gainHigh.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      // Low pass filter on thud
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(200, ctx.currentTime);

      oscLow.connect(lp);
      lp.connect(gainLow);
      oscHigh.connect(gainHigh);

      gainLow.connect(ctx.destination);
      gainHigh.connect(ctx.destination);

      oscLow.start();
      oscHigh.start();
      oscLow.stop(ctx.currentTime + 0.15);
      oscHigh.stop(ctx.currentTime + 0.3);
    } else if (type === 'success') {
      // Sparkly arpeggio
      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.1, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.3);
      });
    } else if (type === 'fail') {
      // Disappointing buzz/clang
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(130, ctx.currentTime);
      osc2.frequency.setValueAtTime(135, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    }
  } catch (err) {
    console.error('AudioContext sound failed to trigger', err);
  }
};

const QUEST_PRESETS: Quest[] = [
  {
    id: 'forge-q1',
    word: 'CAT',
    title: 'Quest 1: The Wandering Cat',
    difficulty: 'easy',
    completed: false,
    letters: [
      { char: 'C', isBroken: true, status: 'broken', angle: 180, scaleX: -1, scaleY: 1, personality: "Ugh, I feel inside out... Help!", forgedPersonality: "Purr-fect! Nice and rounded now!", progress: 0 },
      { char: 'A', isBroken: false, status: 'forged', angle: 0, scaleX: 1, scaleY: 1, personality: "I am fine!", forgedPersonality: "I'm always ready to lead!", progress: 100 },
      { char: 'T', isBroken: true, status: 'broken', angle: 90, scaleX: 1, scaleY: -1, personality: "Gravity is broken! My roof is my floor!", forgedPersonality: "Hooray! T stands tall again!", progress: 0 }
    ]
  },
  {
    id: 'forge-q2',
    word: 'SUN',
    title: 'Quest 2: Bring back the Sun',
    difficulty: 'medium',
    completed: false,
    letters: [
      { char: 'S', isBroken: true, status: 'broken', angle: 45, scaleX: -1, scaleY: 1, personality: "I'm sliding backward into the mud!", forgedPersonality: "Shiny and curvy, like a beautiful slide!", progress: 0 },
      { char: 'U', isBroken: true, status: 'broken', angle: 180, scaleX: 1, scaleY: -1, personality: "I'm upside down, all my soup spilled!", forgedPersonality: "A perfect cup to catch matching stars!", progress: 0 },
      { char: 'N', isBroken: false, status: 'forged', angle: 0, scaleX: 1, scaleY: 1, personality: "Standing proud!", forgedPersonality: "Strong iron pillars!", progress: 100 }
    ]
  },
  {
    id: 'forge-q3',
    word: 'BRIDGE',
    title: 'Quest 3: Boss Word: The Sound Bridge',
    difficulty: 'boss',
    completed: false,
    letters: [
      { char: 'B', isBroken: true, status: 'broken', angle: 0, scaleX: -1, scaleY: 1, personality: "Ugh, not B again! I'm completely backward!", forgedPersonality: "Double round shield is locked in front!", progress: 0 },
      { char: 'R', isBroken: true, status: 'broken', angle: 120, scaleX: 1, scaleY: 1, personality: "My kickstand is bent sideways!", forgedPersonality: "Ready to run and roll!", progress: 0 },
      { char: 'I', isBroken: false, status: 'forged', angle: 0, scaleX: 1, scaleY: 1, personality: "Tiny but shiny!", forgedPersonality: "A solid straight metal rod!", progress: 100 },
      { char: 'D', isBroken: true, status: 'broken', angle: 0, scaleX: -1, scaleY: 1, personality: "No! Am I a 'D' or a 'B'? Help me forge my side!", forgedPersonality: "My big copper dome is facing right!", progress: 0 },
      { char: 'G', isBroken: true, status: 'broken', angle: 270, scaleX: 1, scaleY: -1, personality: "My hook is twisted into my throat!", forgedPersonality: "Looking good, sharp and ready!", progress: 0 },
      { char: 'E', isBroken: true, status: 'broken', angle: 180, scaleX: -1, scaleY: 1, personality: "My three metal shelves are backwards!", forgedPersonality: "Excellent! Three steady metal branches!", progress: 0 }
    ]
  }
];

const SIL_ARTIFACTS = [
  { name: "The Melted Copper Cup", emoji: "🧪", desc: "A distorted goblet created when heating a letter slightly too long." },
  { name: "Slightly Crooked Anchor", emoji: "⚓", desc: "Forged with love but bent at 12 degrees. Excellent for catching mud." },
  { name: "The Spiky Iron Horseshoe", emoji: "🧲", desc: "Too many hammer strikes created extra spikes. Keeps shoes from slipping!" },
  { name: "Bubble of Unfired Glass", emoji: "🔮", desc: "A magical orb of letters that fused together on the heavy anvil." },
  { name: "Wobbly Bronze Crown", emoji: "👑", desc: "Created during a boss-fight hammer session. Fits a very silly elf." },
  { name: "The Bent S-Spoon", emoji: "🥄", desc: "Perfect for eating letters, but terrible for sipping warm alphabet soup." }
];

export function WordForge({ settings, stats, onUpdateStats }: WordForgeProps) {
  const activeTint = TINT_PRESETS[settings.tint];
  const activeFont = FONT_PRESETS[settings.font];

  // Sound active settings
  const [muted, setMuted] = useState<boolean>(false);

  // Load state
  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem('sound-bridges-forge-quests');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return QUEST_PRESETS;
  });

  const [museum, setMuseum] = useState<MuseumArtifact[]>(() => {
    const saved = localStorage.getItem('sound-bridges-forge-museum');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [activeLetterIndex, setActiveLetterIndex] = useState<number | null>(null);
  const [heatLevel, setHeatLevel] = useState<number>(0); // 0 (cold) to 100 (super hot glowing!)
  const [isHeating, setIsHeating] = useState<boolean>(false);
  const [anvilLetter, setAnvilLetter] = useState<LetterItem | null>(null);
  
  // Game states
  const [showCompletedSplash, setShowCompletedSplash] = useState<boolean>(false);
  const [gameUnlockedBadge, setGameUnlockedBadge] = useState<boolean>(() => {
    return localStorage.getItem('sound-bridges-unlocked-forge-master') === 'true';
  });

  // Help info state
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  // Save quests and museum changes
  useEffect(() => {
    localStorage.setItem('sound-bridges-forge-quests', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem('sound-bridges-forge-museum', JSON.stringify(museum));
  }, [museum]);

  // Click handler wrapper
  const handleActionSound = (type: 'heat' | 'hammer' | 'success' | 'click' | 'fail') => {
    if (!muted) {
      playSynthSound(type);
    }
  };

  // Select quest to start
  const handleSelectQuest = (quest: Quest) => {
    handleActionSound('click');
    setActiveQuest(quest);
    // Find first broken letter and place on anvil
    const firstBrokenIdx = quest.letters.findIndex(l => l.isBroken && l.status !== 'forged');
    if (firstBrokenIdx !== -1) {
      setActiveLetterIndex(firstBrokenIdx);
      setAnvilLetter({ ...quest.letters[firstBrokenIdx] });
    } else {
      setActiveLetterIndex(null);
      setAnvilLetter(null);
    }
    setHeatLevel(0);
    setIsHeating(false);
  };

  // Heat the letter
  const startHeating = () => {
    if (!anvilLetter || anvilLetter.status === 'forged' || isHeating) return;
    setIsHeating(true);
    handleActionSound('heat');

    const interval = setInterval(() => {
      setHeatLevel(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsHeating(false);
          setAnvilLetter(curr => curr ? { ...curr, status: 'heating' } : null);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  // Hammer the letter
  const handleHammerStrike = () => {
    if (!anvilLetter || anvilLetter.status === 'forged') return;
    if (anvilLetter.status !== 'heating' && anvilLetter.status !== 'hammering') {
      // Trying to hammer cold metal! Sarcastic reaction or failure artifact
      handleActionSound('fail');
      addRandomArtifactToMuseum(`Unheated ${anvilLetter.char}`);
      return;
    }

    handleActionSound('hammer');
    setAnvilLetter(curr => {
      if (!curr) return null;
      const nextProgress = Math.min(100, curr.progress + 25);
      
      // Calculate interpolation for visual rotation/flip to correct state
      const currentRotationProgress = nextProgress / 100;
      const angleLeft = curr.angle * (1 - currentRotationProgress);
      const currentScaleX = curr.scaleX + (1 - curr.scaleX) * currentRotationProgress;
      const currentScaleY = curr.scaleY + (1 - curr.scaleY) * currentRotationProgress;

      const isCompleted = nextProgress >= 100;

      return {
        ...curr,
        status: isCompleted ? 'forged' : 'hammering',
        progress: nextProgress,
        angle: isCompleted ? 0 : angleLeft,
        scaleX: isCompleted ? 1 : currentScaleX,
        scaleY: isCompleted ? 1 : currentScaleY,
      };
    });
  };

  // Add random funny item to mistake museum
  const addRandomArtifactToMuseum = (failedOn: string) => {
    const randomPreset = SIL_ARTIFACTS[Math.floor(Math.random() * SIL_ARTIFACTS.length)];
    const dateStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newArtifact: MuseumArtifact = {
      id: `art-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${randomPreset.name} (from ${failedOn})`,
      description: randomPreset.desc,
      emoji: randomPreset.emoji,
      timestamp: dateStr
    };
    
    setMuseum(prev => [newArtifact, ...prev].slice(0, 30)); // limit to 30 artifacts
  };

  // Finishes forging a letter and updates state
  const handleAcceptForgedLetter = () => {
    if (!activeQuest || activeLetterIndex === null || !anvilLetter) return;

    handleActionSound('success');

    const updatedLetters = [...activeQuest.letters];
    updatedLetters[activeLetterIndex] = {
      ...anvilLetter,
      status: 'forged',
      isBroken: false,
      progress: 100,
      angle: 0,
      scaleX: 1,
      scaleY: 1
    };

    const updatedQuest = {
      ...activeQuest,
      letters: updatedLetters
    };

    // Check if entire quest is complete
    const allForged = updatedLetters.every(l => !l.isBroken);
    if (allForged) {
      updatedQuest.completed = true;
    }

    // Update global list of quests
    const updatedQuests = quests.map(q => q.id === activeQuest.id ? updatedQuest : q);
    setQuests(updatedQuests);
    setActiveQuest(updatedQuest);

    // If all forged, award stellar points!
    if (allForged) {
      const isFirstTime = !quests.find(q => q.id === activeQuest.id)?.completed;
      if (isFirstTime) {
        const stars = activeQuest.difficulty === 'easy' ? 10 : activeQuest.difficulty === 'medium' ? 15 : 25;
        const updatedStats = {
          ...stats,
          totalStars: stats.totalStars + stars
        };
        onUpdateStats(updatedStats);
        localStorage.setItem('sound-bridges-stats', JSON.stringify(updatedStats));
      }
      
      // Clear anvil
      setAnvilLetter(null);
      setActiveLetterIndex(null);
      
      // Check if total game completed (World 1: all 3 quests completed)
      const allCompleted = updatedQuests.every(q => q.completed);
      if (allCompleted && !gameUnlockedBadge) {
        localStorage.setItem('sound-bridges-unlocked-forge-master', 'true');
        setGameUnlockedBadge(true);
        setShowCompletedSplash(true);
      }
    } else {
      // Find next broken letter
      const nextBrokenIdx = updatedLetters.findIndex((l, idx) => l.isBroken && idx !== activeLetterIndex);
      if (nextBrokenIdx !== -1) {
        setActiveLetterIndex(nextBrokenIdx);
        setAnvilLetter({ ...updatedLetters[nextBrokenIdx] });
        setHeatLevel(0);
        setIsHeating(false);
      } else {
        setAnvilLetter(null);
        setActiveLetterIndex(null);
      }
    }
  };

  // Reset the forge quest to try again
  const handleResetQuest = (questId: string) => {
    handleActionSound('click');
    const resetPres = QUEST_PRESETS.find(q => q.id === questId);
    if (resetPres) {
      const updated = quests.map(q => q.id === questId ? { ...resetPres, completed: false, letters: resetPres.letters.map(l => ({...l})) } : q);
      setQuests(updated);
      if (activeQuest && activeQuest.id === questId) {
        setActiveQuest(null);
        setAnvilLetter(null);
        setActiveLetterIndex(null);
      }
    }
  };

  return (
    <div className="text-gray-100 min-h-[500px]" id="word-forge-outer">
      
      {/* Intro visual header & info switch */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-5 mb-8 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 bg-gradient-to-l from-orange-500 to-transparent pointer-events-none rounded-r-3xl" />
        
        <div className="flex items-center gap-3.5 z-10">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white shadow-lg animate-pulse">
            <Hammer size={24} className="rotate-[-10deg]" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black font-fredoka text-amber-400 flex items-center gap-2">
              The Word Forge
              <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest">
                World 1
              </span>
            </h2>
            <p className="text-xs text-slate-300 leading-snug mt-1 font-medium">
              Letters are broken, twisted, and backwards. Hammer them on the steel anvil to fix them!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 z-10 w-full md:w-auto shrink-0">
          <button
            onClick={() => setMuted(!muted)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 cursor-pointer transition-all"
            title={muted ? 'Unmute metallic forging sounds' : 'Mute sounds'}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={() => setShowHowToPlay(!showHowToPlay)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black font-fredoka shadow transition-all cursor-pointer"
            id="forge-how-to-play-btn"
          >
            <Info size={14} />
            <span>How to Play</span>
          </button>
        </div>
      </div>

      {/* Tutorial panel drawer if toggled */}
      {showHowToPlay && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-slate-800/90 border-2 border-slate-700 rounded-3xl p-5 mb-6 space-y-3 text-xs leading-relaxed max-w-3xl mx-auto text-slate-200"
        >
          <h4 className="font-fredoka font-black text-amber-400 text-sm flex items-center gap-1.5">
            <HelpCircle size={16} />
            How to Forge Broken Words:
          </h4>
          <ol className="list-decimal list-inside space-y-2 font-medium">
            <li>Select a Quest (broken word) from the dashboard map below.</li>
            <li>Select a crooked/backwards letter to place it onto the hot steel anvil.</li>
            <li>Press <span className="font-bold text-orange-400">🔥 Heat Metal</span> to stoke the embers. The metal will glow hot-orange!</li>
            <li>Press <span className="font-bold text-sky-400">🔨 Hammer Shape</span> to strike. Watch sparks fly as the letter rotates and snaps closer to its true form!</li>
            <li>Forging mistakes are safe! Any early cold-hammer strikes are saved inside the <span className="font-bold text-amber-400">🏛️ Mistake Museum</span> as silly historical artifacts!</li>
          </ol>
        </motion.div>
      )}

      {/* REWARD COMPLETE CELEBRATION MODAL SCREEN */}
      <AnimatePresence>
        {showCompletedSplash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-b from-slate-900 to-slate-950 border-4 border-amber-500 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 p-4 bg-amber-500 rounded-full border-4 border-white shadow-xl">
                <Shield size={42} className="text-slate-950 animate-pulse" />
              </div>

              <div className="pt-6 space-y-2">
                <span className="text-xs bg-amber-500/20 text-amber-400 font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                  Victory Achieved
                </span>
                <h3 className="text-2xl font-black font-fredoka text-amber-400">
                  World 1 Forged!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  The Cracked Alphabet is fixed! You successfully repaired CAT, SUN, and the legendary 6-letter Sound BRIDGE.
                </p>
              </div>

              {/* Glowing Rewards display */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Rewards Unlocked</p>
                <div className="flex gap-4 justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center font-black shadow-md border-2 border-white">
                      🛡️
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 mt-1">Forge Master Badge</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center font-black shadow-md border-2 border-white">
                      🧤
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 mt-1">Steel Gauntlet Skin</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  handleActionSound('click');
                  setShowCompletedSplash(false);
                }}
                className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black font-fredoka rounded-xl shadow-md cursor-pointer transition-all active:scale-97"
              >
                Claim Legendary Rewards
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GAMEPLAY LAYOUT GRID */}
      {activeQuest ? (
        
        /* ---------------- ACTIVE FORGING SCREEN ---------------- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="forge-gameplay-root">
          
          {/* Active forge room controls */}
          <div className="lg:col-span-8 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative flex flex-col justify-between">
            
            {/* Header: return and word indicators */}
            <div className="flex justify-between items-center border-b border-slate-700/80 pb-4">
              <button
                onClick={() => {
                  handleActionSound('click');
                  setActiveQuest(null);
                  setAnvilLetter(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 rounded-xl cursor-pointer transition-all"
              >
                ← Return to Map
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black font-fredoka uppercase text-slate-400 tracking-wider">Active Word:</span>
                <div className="flex gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  {activeQuest.letters.map((letter, idx) => {
                    const isAnvil = idx === activeLetterIndex;
                    return (
                      <span 
                        key={idx}
                        className={`w-6 h-6 flex items-center justify-center rounded text-xs font-black ${
                          letter.status === 'forged' 
                            ? 'bg-amber-500 text-slate-950'
                            : isAnvil
                            ? 'bg-orange-500 text-white animate-pulse'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {letter.char}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* THE FORGE ZONE WITH METALLIC ANVIL EMBERS */}
            {anvilLetter ? (
              <div className="flex flex-col items-center py-6 relative">
                
                {/* Forge glowing sparks background animation indicator */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center">
                  {isHeating && (
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-48 h-48 rounded-full bg-orange-600/30 blur-2xl"
                    />
                  )}
                  {anvilLetter.progress > 0 && anvilLetter.progress < 100 && (
                    <div className="absolute bottom-1/4 w-32 h-1 bg-amber-400/25 blur-sm animate-pulse" />
                  )}
                </div>

                {/* Letters talking back with humorous bubble */}
                <div className="mb-6 min-h-12 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={anvilLetter.progress}
                      initial={{ opacity: 0, scale: 0.9, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -5 }}
                      className="bg-slate-950/90 text-slate-200 border-2 border-slate-700 px-4 py-2.5 rounded-2xl text-xs font-black font-fredoka tracking-wide text-center max-w-xs relative shadow-md"
                    >
                      <span className="text-amber-400">"{anvilLetter.progress >= 100 ? anvilLetter.forgedPersonality : anvilLetter.personality}"</span>
                      {/* Little chat bubble anchor arrow */}
                      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-slate-950" />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* THE PHYSICAL ANVIL AND METAL SHAPE TO HAMMER */}
                <div className="relative w-64 h-64 flex flex-col items-center justify-end">
                  
                  {/* Glowing letter shape on anvil */}
                  <motion.div
                    animate={
                      anvilLetter.status === 'hammering' 
                        ? { scale: [1, 0.85, 1.1, 1], rotate: [anvilLetter.angle, anvilLetter.angle - 10, anvilLetter.angle + 5, anvilLetter.angle] }
                        : {}
                    }
                    transition={{ duration: 0.2 }}
                    style={{ 
                      transform: `rotate(${anvilLetter.angle}deg) scaleX(${anvilLetter.scaleX}) scaleY(${anvilLetter.scaleY})`,
                      color: heatLevel > 0 && anvilLetter.status !== 'forged' ? `rgb(251, 146, 60)` : 'rgb(241, 245, 249)'
                    }}
                    className={`text-8xl font-black select-none tracking-normal z-20 font-fredoka flex items-center justify-center transition-all duration-300 drop-shadow-lg ${
                      anvilLetter.status === 'forged' 
                        ? 'text-yellow-400 font-extrabold filter drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                        : heatLevel >= 80
                        ? 'animate-pulse'
                        : ''
                    }`}
                  >
                    {anvilLetter.char}
                  </motion.div>

                  {/* Hot heat aura indicator */}
                  {heatLevel > 0 && anvilLetter.status !== 'forged' && (
                    <div 
                      className="absolute inset-0 m-auto w-36 h-36 rounded-full blur-2xl pointer-events-none -z-10 transition-all duration-300"
                      style={{ 
                        background: `radial-gradient(circle, rgba(249,115,22,${heatLevel / 200}) 0%, rgba(249,115,22,0) 70%)` 
                      }}
                    />
                  )}

                  {/* Anvil Base asset */}
                  <div className="w-56 h-20 bg-gradient-to-b from-slate-600 to-slate-800 rounded-t-3xl border-t-4 border-slate-400 shadow-xl flex flex-col items-center justify-center pt-2 select-none relative">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      HEAVY ANVIL
                    </span>
                    <div className="w-full px-4 mt-1 flex justify-between">
                      <div className="w-3 h-3 bg-slate-950/40 rounded-full" />
                      <div className="w-3 h-3 bg-slate-950/40 rounded-full" />
                    </div>
                    {/* Glowing active embers below */}
                    <div className="absolute inset-x-0 -bottom-1 h-3 bg-orange-600 blur-sm rounded-full opacity-60 animate-pulse" />
                  </div>

                </div>

                {/* Progress stats for the forged letter */}
                <div className="w-full max-w-xs mt-6 space-y-1.5 text-center">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <span>Forge Completion</span>
                    <span>{anvilLetter.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        anvilLetter.status === 'forged' 
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500' 
                          : 'bg-gradient-to-r from-orange-500 to-red-600 animate-pulse'
                      }`}
                      style={{ width: `${anvilLetter.progress}%` }}
                    />
                  </div>
                </div>

              </div>
            ) : (
              // All word letters complete celebration step
              <div className="flex flex-col items-center py-12 space-y-4">
                <div className="w-16 h-16 bg-amber-500 rounded-full text-slate-950 flex items-center justify-center font-black text-3xl shadow-lg">
                  🏆
                </div>
                <h3 className="text-xl font-black font-fredoka text-amber-400">
                  Quest Words Fully Repaired!
                </h3>
                <p className="text-xs text-slate-300 max-w-sm text-center font-medium leading-relaxed">
                  Congratulations! You fixed every twisted letter for <span className="font-extrabold text-white">"{activeQuest.word}"</span> perfectly.
                </p>

                <button
                  onClick={() => {
                    handleActionSound('click');
                    setActiveQuest(null);
                  }}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black font-fredoka rounded-xl shadow-md cursor-pointer transition-all active:scale-97"
                >
                  Return to World Map
                </button>
              </div>
            )}

            {/* FORGING WORKBENCH BUTTONS */}
            {anvilLetter && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-6 border-t border-slate-700/80">
                
                {/* Fire heating trigger */}
                <button
                  onClick={startHeating}
                  disabled={isHeating || anvilLetter.status === 'heating' || anvilLetter.status === 'forged'}
                  className={`py-3.5 px-4 rounded-xl font-fredoka font-extrabold text-xs flex items-center justify-center gap-2 border-2 transition-all cursor-pointer shadow-md select-none ${
                    anvilLetter.status === 'heating' || anvilLetter.status === 'forged'
                      ? 'border-slate-800 bg-slate-800 text-slate-500 cursor-not-allowed'
                      : isHeating
                      ? 'border-orange-500 bg-orange-600 text-white animate-pulse'
                      : 'border-orange-900 bg-orange-950/70 text-orange-400 hover:bg-orange-900 hover:text-white'
                  }`}
                  id="forge-heat-btn"
                >
                  <Flame size={15} className={isHeating ? 'animate-bounce' : ''} />
                  <span>{anvilLetter.status === 'heating' ? 'Metal is Hot!' : isHeating ? 'Stoking...' : '🔥 Heat Metal'}</span>
                </button>

                {/* Hammer strike trigger */}
                <button
                  onClick={handleHammerStrike}
                  disabled={anvilLetter.status === 'forged'}
                  className={`py-3.5 px-4 rounded-xl font-fredoka font-extrabold text-xs flex items-center justify-center gap-2 border-2 transition-all cursor-pointer shadow-md select-none ${
                    anvilLetter.status === 'forged'
                      ? 'border-slate-800 bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'border-sky-900 bg-sky-950/70 text-sky-400 hover:bg-sky-900 hover:text-white'
                  }`}
                  id="forge-hammer-btn"
                >
                  <Hammer size={15} />
                  <span>🔨 Hammer Shape</span>
                </button>

                {/* Snap shape locks forged letters back */}
                <button
                  onClick={handleAcceptForgedLetter}
                  disabled={anvilLetter.progress < 100}
                  className={`col-span-2 md:col-span-1 py-3.5 px-4 rounded-xl font-fredoka font-extrabold text-xs flex items-center justify-center gap-2 border-2 transition-all cursor-pointer shadow-md select-none ${
                    anvilLetter.progress < 100
                      ? 'border-slate-800 bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'border-green-600 bg-green-500 text-slate-950 font-black'
                  }`}
                  id="forge-cool-btn"
                >
                  <CheckCircle size={15} />
                  <span>Lock In Correct Form</span>
                </button>

              </div>
            )}

          </div>

          {/* Right sidebar: select letter list of active quest */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Active letter checklist */}
            <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-5 space-y-4">
              <h3 className="font-fredoka font-black text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles size={16} className="text-amber-400" />
                Select a Broken Letter
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
                {activeQuest.letters.map((letter, idx) => {
                  const isActive = idx === activeLetterIndex;
                  const isCompleted = letter.status === 'forged' || !letter.isBroken;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        handleActionSound('click');
                        setActiveLetterIndex(idx);
                        setAnvilLetter({ ...letter });
                        setHeatLevel(0);
                        setIsHeating(false);
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer text-left overflow-hidden ${
                        isActive
                          ? 'border-orange-500 bg-orange-950/35'
                          : isCompleted
                          ? 'border-emerald-900 bg-emerald-950/20 opacity-80'
                          : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                      }`}
                      id={`letter-select-btn-${idx}`}
                    >
                      <div className="flex items-center gap-3">
                        <span 
                          style={{ 
                            transform: isCompleted ? 'none' : `rotate(${letter.angle}deg) scaleX(${letter.scaleX}) scaleY(${letter.scaleY})` 
                          }}
                          className={`text-xl font-black font-fredoka flex items-center justify-center w-8 h-8 rounded-lg bg-slate-950 text-slate-200 ${
                            isCompleted ? 'text-amber-400 border border-amber-500' : 'border border-slate-800'
                          }`}
                        >
                          {letter.char}
                        </span>
                        <div>
                          <span className="block font-black text-xs text-slate-200">Letter {letter.char}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            {isCompleted ? 'Forged' : 'Broken'}
                          </span>
                        </div>
                      </div>

                      {/* Tick check badge */}
                      {isCompleted && (
                        <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick failure Museum display in sidebar */}
            <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-5 space-y-4">
              <h3 className="font-fredoka font-black text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
                <Archive size={16} className="text-amber-400" />
                Forge Mistake Artifacts ({museum.length})
              </h3>
              
              {museum.length === 0 ? (
                <p className="text-[11px] text-slate-400 leading-relaxed py-2 text-center italic">
                  Museum is empty. Try hammering a cold letter shape to discover a magical steel artifact!
                </p>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {museum.map((item) => (
                    <div key={item.id} className="p-2.5 bg-slate-850 border border-slate-800 rounded-xl flex items-start gap-2.5 text-[11px]">
                      <span className="text-xl select-none shrink-0">{item.emoji}</span>
                      <div className="leading-snug">
                        <span className="block font-black text-slate-300">{item.name}</span>
                        <span className="text-slate-400">{item.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        
        /* ---------------- MAP / QUEST SELECTION SCREEN ---------------- */
        <div className="space-y-8" id="forge-map-root">
          
          <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Visual design: connecting bridges and nodes of Word Forge World 1 Map */}
            <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
              <div className="w-full h-1 bg-amber-500 border-2 border-dashed border-amber-600" />
            </div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="font-fredoka font-black text-slate-200 text-lg flex items-center gap-2">
                <Play size={18} className="text-amber-400" />
                The Cracked Alphabet: Game Levels
              </h3>
              
              {/* Badge progression status indicator */}
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 text-xs font-bold text-slate-300">
                <Award size={14} className={gameUnlockedBadge ? 'text-amber-400' : 'text-slate-500'} />
                <span>Status: {quests.filter(q => q.completed).length} / 3 Fixed</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {quests.map((quest, index) => {
                const isCompleted = quest.completed;
                const difficultyColor = 
                  quest.difficulty === 'easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-800' :
                  quest.difficulty === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-800' :
                  'text-rose-400 bg-rose-500/10 border-rose-800';

                return (
                  <div 
                    key={quest.id} 
                    className="p-5 bg-slate-850 border-2 border-slate-800 hover:border-slate-700 rounded-3xl flex flex-col justify-between space-y-4 shadow-lg hover:scale-102 active:scale-99 transition-all duration-300 relative"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${difficultyColor}`}>
                          {quest.difficulty} Level
                        </span>
                        {isCompleted && (
                          <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-900 flex items-center gap-1">
                            ✓ Fixed
                          </span>
                        )}
                      </div>

                      <h4 className="font-fredoka font-black text-slate-200 text-base">
                        {quest.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-snug font-medium">
                        Forge twisted alphabet chunks to craft the word: <span className="font-black text-slate-200 tracking-wide">"{quest.word}"</span>.
                      </p>
                    </div>

                    {/* Word display mockup */}
                    <div className="flex justify-center gap-1.5 py-2.5 bg-slate-900 rounded-2xl border border-slate-800">
                      {quest.letters.map((letObj, idx) => (
                        <span 
                          key={idx}
                          className={`w-6 h-6 flex items-center justify-center rounded text-xs font-black select-none ${
                            letObj.status === 'forged' 
                              ? 'bg-amber-500 text-slate-950 font-black' 
                              : 'bg-slate-800 text-slate-500 border border-slate-750'
                          }`}
                        >
                          {letObj.char}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectQuest(quest)}
                        className={`flex-1 py-2.5 rounded-xl font-fredoka font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all ${
                          isCompleted
                            ? 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                            : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                        }`}
                        id={`start-forge-btn-${quest.id}`}
                      >
                        {isCompleted ? 'Replay Quest' : 'Start Forging'}
                        <ArrowRight size={13} />
                      </button>

                      {isCompleted && (
                        <button
                          onClick={() => handleResetQuest(quest.id)}
                          className="p-2.5 bg-slate-800 hover:bg-red-950/40 border border-slate-700 hover:border-red-900 text-slate-400 hover:text-red-400 rounded-xl cursor-pointer transition-all"
                          title="Reset and Lock Letters Again"
                          id={`reset-quest-btn-${quest.id}`}
                        >
                          <RefreshCw size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* LOWER MISTAKE MUSEUM EXPLAINER BOARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="forge-bottom-boards">
            
            {/* Museum Artifacts panel */}
            <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Archive size={18} className="text-amber-400" />
                <h3 className="font-fredoka font-black text-slate-200 text-sm">
                  The Mistake Museum Collection
                </h3>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Dyslexia is just thinking in 3D! When letters are misaligned or hammered cold, we catch the extra energy and turn it into funny steel-bound historical relics instead of a "Red X Fail".
              </p>

              {museum.length === 0 ? (
                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center text-[11px] text-slate-500 font-medium italic">
                  🏛️ Museum display case is currently empty.<br />Explore quests and hammer cold letters to seed your collection!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  {museum.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-850 border border-slate-850 hover:border-slate-800 rounded-2xl flex items-start gap-2.5 text-[11px] transition-all">
                      <span className="text-2xl select-none shrink-0">{item.emoji}</span>
                      <div className="leading-snug">
                        <span className="block font-black text-slate-200">{item.name}</span>
                        <span className="text-slate-400 text-[10px] block mt-0.5">{item.description}</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Discovered {item.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Differences vs other spelling systems cards */}
            <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Shield size={18} className="text-amber-400" />
                  <h3 className="font-fredoka font-black text-slate-200 text-sm">
                    Why the Word Forge is Different
                  </h3>
                </div>

                <div className="space-y-3 font-medium text-slate-300 text-xs">
                  <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800">
                    <span className="font-extrabold text-amber-400 block mb-0.5">🚀 The Storytelling Introduction</span>
                    "The letters are broken and trapped in the hot coals. You are the ONLY one who can fix them!"
                  </div>
                  <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800">
                    <span className="font-extrabold text-amber-400 block mb-0.5">💖 Beautiful Failure Handling</span>
                    No red crosses or buzzy alarms. Mistakes become funny "Museum Artifacts" to enjoy and share.
                  </div>
                  <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800">
                    <span className="font-extrabold text-amber-400 block mb-0.5">🏆 Master Progression Badge</span>
                    Finishing World 1 unlocks the Forge Master cosmetic badge on your steel-cladded scoreboard!
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 text-[10px] text-slate-400 leading-snug">
                <span className="font-black text-slate-300 block mb-0.5">💡 Educator Insight:</span>
                Engaging fine-motor visual actions like dragging and hammering letters helps reinforce phonetic letter recognition for kids with spatial-processing dyslexia.
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
