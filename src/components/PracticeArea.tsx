import React, { useState, useEffect, useRef } from 'react';
import { SpellingWord, UserSettings, GradingResult } from '../types';
import { TEXT_SIZE_PRESETS, SPACING_PRESETS, FONT_PRESETS } from '../data';
import { evaluateSpelling, speakWord } from '../utils';
import { SoundBridges } from './SoundBridges';
import { Volume2, Sparkles, ArrowRight, Lightbulb, HelpCircle, RefreshCw, Star, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PracticeAreaProps {
  word: SpellingWord;
  settings: UserSettings;
  onGradeSubmitted: (wordId: string, input: string, starsEarned: number, grade: 'perfect' | 'close' | 'try') => void;
  onNextWord: () => void;
}

export const PracticeArea: React.FC<PracticeAreaProps> = ({
  word,
  settings,
  onGradeSubmitted,
  onNextWord,
}) => {
  const [practiceMode, setPracticeMode] = useState<'word' | 'sentence'>('sentence');
  const [userInput, setUserInput] = useState<string>('');
  const [showChunks, setShowChunks] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isSpeakingSentence, setIsSpeakingSentence] = useState<boolean>(false);
  const [slowVoice, setSlowVoice] = useState<boolean>(true);
  
  // Grading state
  const [evaluation, setEvaluation] = useState<GradingResult | null>(null);
  const [submittedInput, setSubmittedInput] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically on mount or word change
  useEffect(() => {
    setUserInput('');
    setEvaluation(null);
    setShowChunks(false);
    setShowHint(false);
    
    // Auto speak the word if enabled
    if (settings.speakAutomatically) {
      handleSpeakWord();
    }
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [word]);

  const activeTextSize = TEXT_SIZE_PRESETS[settings.textSize];
  const activeSpacing = SPACING_PRESETS[settings.spacing];
  const activeFont = FONT_PRESETS[settings.font];

  const handleSpeakWord = () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    const speed = slowVoice ? settings.pronunciationSpeed : 1.0;
    speakWord(word.word, speed, () => {
      setIsSpeaking(false);
    });
  };

  const handleSpeakSentence = () => {
    if (isSpeakingSentence) return;
    setIsSpeakingSentence(true);
    // Sentences speak at a slightly faster pace than words for natural hearing
    speakWord(word.sentence, 0.85, () => {
      setIsSpeakingSentence(false);
    });
  };

  // Convert "The fluffy rabbit hopped..." to "The fluffy ______ hopped..."
  const renderSentenceWithBlanks = () => {
    const parts = word.sentence.split(new RegExp(`(${word.word})`, 'gi'));
    return (
      <p className="inline">
        {parts.map((part, index) => {
          if (part.toLowerCase() === word.word.toLowerCase()) {
            // Draw a series of underscored blanks equal to the word size
            const blanks = Array(word.word.length).fill('_').join(' ');
            return (
              <span
                key={index}
                className="mx-1 px-3 py-1 bg-amber-950/60 border-b-3 border-amber-500 rounded-lg font-bold text-amber-300 transition-all duration-300 inline-block animate-pulse"
                style={{ letterSpacing: '0.1em' }}
              >
                {blanks}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </p>
    );
  };

  const handleSubmitSpelling = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const result = evaluateSpelling(userInput, word.word);
    setEvaluation(result);
    setSubmittedInput(userInput);

    // Track statistics and notify parent
    onGradeSubmitted(word.id, userInput, result.stars, result.grade);

    // Speak a positive sound / word or TTS congrats if it's perfect
    if (result.grade === 'perfect') {
      speakWord("Perfect spelling!", 0.9);
    } else if (result.grade === 'close') {
      speakWord("So close! Keep going!", 0.9);
    } else {
      speakWord("Good try! You can do it!", 0.9);
    }
  };

  const handleRetryWord = () => {
    setEvaluation(null);
    setUserInput('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleGoNext = () => {
    onNextWord();
  };

  return (
    <div className="space-y-6">
      {/* Mode selectors */}
      <div className="flex justify-center items-center p-1.5 bg-slate-900 border border-slate-800 rounded-2xl max-w-sm mx-auto shadow-lg">
        <button
          onClick={() => setPracticeMode('sentence')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-extrabold font-fredoka transition-all cursor-pointer ${
            practiceMode === 'sentence'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="btn-mode-sentence"
        >
          Sentence Mode 📖
        </button>
        <button
          onClick={() => setPracticeMode('word')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-extrabold font-fredoka transition-all cursor-pointer ${
            practiceMode === 'word'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="btn-mode-word"
        >
          Just the Word ✏️
        </button>
      </div>

      {/* Main card */}
      <div className="p-6 rounded-3xl border-2 border-slate-700/80 bg-slate-900 shadow-xl transition-all duration-300 text-slate-100">
        <div className="flex flex-col items-center text-center space-y-6">
          
          {/* Emojis & Word Info */}
          <div className="relative group">
            {word.imageUrl ? (
              <div className="relative w-36 h-36 rounded-3xl overflow-hidden border-4 border-slate-750 bg-slate-950 shadow-2xl transition-transform duration-300 hover:scale-105">
                <img
                  src={word.imageUrl}
                  alt={word.word}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
              </div>
            ) : (
              <span className="text-6xl select-none filter drop-shadow-md animate-pulse-slow inline-block">
                {word.emoji}
              </span>
            )}
            <div className="absolute -top-1.5 -right-4 bg-slate-950 border-2 border-slate-800 text-amber-400 text-[10px] font-extrabold px-3 py-1 rounded-full select-none shadow-lg">
              {word.category}
            </div>
          </div>

          {/* Interactive Hearing Box */}
          <div className="w-full max-w-md bg-slate-950/80 border border-slate-850 p-5 rounded-2xl flex flex-col items-center space-y-4 shadow-inner">
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* BIG Hear the Word Button */}
              <button
                onClick={handleSpeakWord}
                className={`py-3 px-6 rounded-2xl font-fredoka font-black text-base flex items-center gap-2 shadow-lg hover:scale-103 active:scale-97 cursor-pointer transition-all ${
                  isSpeaking 
                    ? 'bg-slate-850 text-slate-500 cursor-not-allowed shadow-none border border-slate-800'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 border-t border-amber-300'
                }`}
                disabled={isSpeaking}
                id="btn-hear-word"
              >
                <Volume2 size={20} className={isSpeaking ? 'animate-bounce' : ''} />
                {isSpeaking ? 'Listening...' : 'Hear Word!'}
              </button>

              {/* Hear the Sentence Button */}
              {practiceMode === 'sentence' && (
                <button
                  onClick={handleSpeakSentence}
                  className={`py-3 px-5 rounded-2xl font-fredoka font-bold text-xs flex items-center gap-2 border-2 transition-all cursor-pointer hover:bg-slate-850 hover:text-white active:scale-97 ${
                    isSpeakingSentence
                      ? 'border-slate-800 bg-slate-950 text-slate-600 cursor-not-allowed'
                      : 'border-slate-700 text-slate-300 bg-slate-900'
                  }`}
                  disabled={isSpeakingSentence}
                  id="btn-hear-sentence"
                >
                  <Volume2 size={16} className={isSpeakingSentence ? 'animate-pulse' : ''} />
                  Hear Sentence
                </button>
              )}
            </div>

            {/* Pronunciation controls */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={slowVoice}
                  onChange={(e) => setSlowVoice(e.target.checked)}
                  className="rounded text-amber-500 w-4 h-4 border-slate-700 bg-slate-950 accent-amber-500"
                  id="chk-slow-voice"
                />
                <span>Slow pronunciation speed (🐢)</span>
              </label>
            </div>
          </div>

          {/* Core mode visuals */}
          <div className="w-full py-4 min-h-16 flex items-center justify-center">
            {practiceMode === 'sentence' ? (
              <div 
                className={`text-center max-w-xl text-slate-200 ${activeTextSize.body} ${activeFont.fontClass}`}
              >
                {renderSentenceWithBlanks()}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Target Word Length</p>
                <div className="flex gap-1.5 justify-center">
                  {Array.from({ length: word.word.length }).map((_, i) => (
                    <div key={i} className="w-6 h-1.5 bg-slate-800 border border-slate-750 rounded-full" />
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2 font-semibold">It has {word.word.length} letters!</p>
              </div>
            )}
          </div>

          {/* Form Spelling Entry Area */}
          <form onSubmit={handleSubmitSpelling} className="w-full max-w-lg space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider opacity-85 text-slate-300">Type your spelling here:</label>
                <span className="text-[10px] bg-slate-950 border border-slate-800 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                  {userInput.length} / {word.word.length} letters
                </span>
              </div>
              <input
                ref={inputRef}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                disabled={evaluation !== null}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.replace(/[^a-zA-Z]/g, ''))} // only allow alphabets for child friendliness
                placeholder="Start typing..."
                className={`w-full text-center font-bold tracking-wide rounded-2xl border-2 shadow-inner bg-slate-950 text-amber-400 placeholder-slate-800 border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all ${
                  evaluation !== null
                    ? 'border-slate-850 text-slate-500 bg-slate-950'
                    : ''
                } ${activeTextSize.input} ${activeSpacing.trackingClass} ${activeFont.fontClass}`}
                id="input-spelling-entry"
              />
            </div>

            {/* Hint & Tools trigger row */}
            {evaluation === null && (
              <div className="flex flex-wrap justify-center items-center gap-3">
                {/* Show Syllables bridge */}
                <button
                  type="button"
                  onClick={() => setShowChunks(!showChunks)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showChunks
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border border-slate-850 hover:border-slate-750 hover:text-slate-200'
                  }`}
                  id="btn-toggle-chunks"
                >
                  <Lightbulb size={14} className={showChunks ? 'text-amber-400' : 'text-slate-400'} style={{ fill: showChunks ? '#f59e0b' : 'none' }} />
                  {showChunks ? 'Hide sound chunks' : 'Show me the sound chunks! ✨'}
                </button>

                {/* Show hint */}
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showHint
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-950 text-slate-400 border border-slate-850 hover:border-slate-750 hover:text-slate-200'
                  }`}
                  id="btn-toggle-hint"
                >
                  <HelpCircle size={14} className={showHint ? 'text-amber-400' : 'text-slate-400'} style={{ fill: showHint ? '#f59e0b' : 'none' }} />
                  {showHint ? 'Hide Clue' : 'Give me a clue 💡'}
                </button>
              </div>
            )}

            {/* Clue box */}
            <AnimatePresence>
              {showHint && evaluation === null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-amber-950/30 border border-amber-800/40 text-amber-200 rounded-2xl text-xs text-left leading-relaxed flex gap-2.5">
                    <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-amber-400">Clue:</span> {word.hint}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animated Sound Bridges */}
            <AnimatePresence>
              {showChunks && evaluation === null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  <SoundBridges word={word} settings={settings} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button when active */}
            {evaluation === null && (
              <button
                type="submit"
                disabled={!userInput.trim()}
                className={`w-full py-4 rounded-2xl font-fredoka font-black text-lg flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-102 active:scale-98 cursor-pointer ${
                  userInput.trim()
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.25)] border-t border-amber-300'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none border-none'
                }`}
                id="btn-submit-spelling"
              >
                <span>Check My Spelling!</span>
                <ArrowRight size={20} />
              </button>
            )}
          </form>

          {/* FORGIVING GRADER DIALOG (Shows up after check) */}
          <AnimatePresence>
            {evaluation !== null && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full max-w-lg mt-4"
              >
                <div className={`p-6 rounded-2xl border-2 text-center space-y-4 shadow-xl relative ${
                  evaluation.grade === 'perfect'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                    : evaluation.grade === 'close'
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-100'
                    : 'bg-slate-900 border-slate-750 text-slate-200'
                }`}>
                  
                  {/* Decorative Confetti Pop when perfect */}
                  {evaluation.grade === 'perfect' && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                      {/* Simple cute stars that pop out */}
                      <span className="absolute text-xl animate-bounce top-2 left-6">✨</span>
                      <span className="absolute text-xl animate-bounce top-10 right-8">🎉</span>
                      <span className="absolute text-xl animate-bounce bottom-4 left-10">🎈</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <h4 className="text-xl font-black font-fredoka">
                      {evaluation.message}
                    </h4>
                    <p className="text-sm font-semibold opacity-90 leading-relaxed">
                      {evaluation.subMessage}
                    </p>
                  </div>

                  {/* Feedback comparison (especially helpful when close/try) */}
                  {evaluation.grade !== 'perfect' && (
                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5">
                      <p className="text-xs">
                        <span className="font-bold text-slate-400">You wrote:</span>{' '}
                        <span className="font-mono text-sm line-through text-rose-400">{submittedInput}</span>
                      </p>
                      <p className="text-xs">
                        <span className="font-bold text-slate-400">Correct spelling:</span>{' '}
                        <span className="font-mono text-sm font-bold text-emerald-400 uppercase tracking-wider">
                          {word.word}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Star reward display */}
                  <div className="flex flex-col items-center space-y-1.5">
                    <span className="text-xs uppercase tracking-widest font-extrabold opacity-75 text-slate-400">
                      Star Reward!
                    </span>
                    <div className="flex justify-center gap-1.5">
                      {Array.from({ length: evaluation.stars }).map((_, i) => (
                        <motion.div
                          key={`star-${i}`}
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: i * 0.15, type: 'spring' }}
                          className="text-amber-400 filter drop-shadow-sm"
                        >
                          <Star size={36} fill="currentColor" />
                        </motion.div>
                      ))}
                      {Array.from({ length: 3 - evaluation.stars }).map((_, i) => (
                        <div key={`empty-star-${i}`} className="text-slate-800">
                          <Star size={36} fill="none" stroke="currentColor" strokeWidth={2} />
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-bold mt-1 block text-slate-300">
                      +{evaluation.stars} star{evaluation.stars > 1 ? 's' : ''} earned for effort! ⭐
                    </span>
                  </div>

                  {/* CTAs */}
                  <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                    {evaluation.grade !== 'perfect' && (
                      <button
                        onClick={handleRetryWord}
                        className="py-2.5 px-5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-fredoka font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                        id="btn-retry-try"
                      >
                        <RefreshCw size={16} />
                        <span>Keep Trying!</span>
                      </button>
                    )}

                    <button
                      onClick={handleGoNext}
                      className="py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-fredoka font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:scale-102 transition-all cursor-pointer"
                      id="btn-next-word"
                    >
                      <span>On to the Next Word!</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
