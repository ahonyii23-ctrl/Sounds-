import React, { useState, useEffect, useRef } from 'react';
import { SpellingWord, UserSettings, GradingResult } from '../types';
import { TINT_PRESETS, TEXT_SIZE_PRESETS, SPACING_PRESETS, FONT_PRESETS, WORD_DATABASE } from '../data';
import { evaluateSpelling, speakWord } from '../utils';
import { SoundBridges } from './SoundBridges';
import { Volume2, Sparkles, ArrowRight, Lightbulb, HelpCircle, RefreshCw, Star, Info, VolumeX } from 'lucide-react';
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

  const activeTint = TINT_PRESETS[settings.tint];
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
                className="mx-1 px-3 py-1 bg-yellow-100 border-b-3 border-amber-400 rounded-lg font-bold text-amber-800 transition-all duration-300 inline-block animate-pulse"
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
      <div className="flex justify-center items-center p-1.5 bg-gray-100 rounded-2xl max-w-sm mx-auto">
        <button
          onClick={() => setPracticeMode('sentence')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-extrabold font-fredoka transition-all cursor-pointer ${
            practiceMode === 'sentence'
              ? 'bg-white shadow-md text-indigo-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          id="btn-mode-sentence"
        >
          Sentence Mode 📖
        </button>
        <button
          onClick={() => setPracticeMode('word')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-extrabold font-fredoka transition-all cursor-pointer ${
            practiceMode === 'word'
              ? 'bg-white shadow-md text-indigo-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          id="btn-mode-word"
        >
          Just the Word ✏️
        </button>
      </div>

      {/* Main card */}
      <div className={`p-6 rounded-3xl border-3 shadow-xl transition-all duration-300 ${activeTint.cardClass} ${activeTint.textClass}`}>
        <div className="flex flex-col items-center text-center space-y-6">
          
          {/* Emojis & Word Info */}
          <div className="relative group">
            <span className="text-6xl select-none filter drop-shadow-md animate-pulse-slow inline-block">
              {word.emoji}
            </span>
            <div className="absolute -top-1 -right-4 bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full select-none">
              {word.category}
            </div>
          </div>

          {/* Interactive Hearing Box */}
          <div className="w-full max-w-md bg-gray-50/70 border border-gray-100 p-5 rounded-2xl flex flex-col items-center space-y-4">
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* BIG Hear the Word Button */}
              <button
                onClick={handleSpeakWord}
                className={`py-3 px-6 rounded-2xl font-fredoka font-extrabold text-base flex items-center gap-2 shadow-md hover:scale-103 active:scale-97 cursor-pointer transition-all ${
                  isSpeaking 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : activeTint.buttonClass
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
                  className={`py-3 px-5 rounded-2xl font-fredoka font-extrabold text-xs flex items-center gap-2 border-2 transition-all cursor-pointer hover:bg-gray-100/80 active:scale-97 ${
                    isSpeakingSentence
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-indigo-200 text-indigo-700 bg-white'
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
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={slowVoice}
                  onChange={(e) => setSlowVoice(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 border-gray-300"
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
                className={`text-center max-w-xl text-gray-800 ${activeTextSize.body}`}
                style={{ fontFamily: activeFont.fontClass }}
              >
                {renderSentenceWithBlanks()}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Target Word Length</p>
                <div className="flex gap-1.5 justify-center">
                  {Array.from({ length: word.word.length }).map((_, i) => (
                    <div key={i} className="w-6 h-1 bg-indigo-200 rounded-full" />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 font-semibold">It has {word.word.length} letters!</p>
              </div>
            )}
          </div>

          {/* Form Spelling Entry Area */}
          <form onSubmit={handleSubmitSpelling} className="w-full max-w-lg space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider opacity-85">Type your spelling here:</label>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
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
                className={`w-full text-center font-bold tracking-wide rounded-2xl border-3 shadow-inner bg-white focus:outline-none transition-all ${
                  evaluation !== null
                    ? 'border-gray-200 text-gray-400 bg-gray-50'
                    : 'border-indigo-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100'
                } ${activeTextSize.input} ${activeSpacing.trackingClass}`}
                style={{ fontFamily: activeFont.fontClass }}
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
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm'
                      : 'bg-white border border-gray-200 hover:border-indigo-200 hover:text-indigo-700'
                  }`}
                  id="btn-toggle-chunks"
                >
                  <Lightbulb size={14} className={showChunks ? 'text-indigo-600 fill-indigo-200' : ''} />
                  {showChunks ? 'Hide sound chunks' : 'Show me the sound chunks! ✨'}
                </button>

                {/* Show hint */}
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showHint
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-white border border-gray-200 hover:border-amber-200 hover:text-amber-700'
                  }`}
                  id="btn-toggle-hint"
                >
                  <HelpCircle size={14} className={showHint ? 'text-amber-500' : ''} />
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
                  <div className="p-4 bg-amber-50/60 border border-amber-100 text-amber-900 rounded-2xl text-xs text-left leading-relaxed flex gap-2.5">
                    <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Clue:</span> {word.hint}
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
                className={`w-full py-4 rounded-2xl font-fredoka font-extrabold text-lg flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-102 active:scale-98 cursor-pointer ${
                  userInput.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
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
                <div className={`p-6 rounded-2xl border-3 text-center space-y-4 shadow-xl ${
                  evaluation.grade === 'perfect'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : evaluation.grade === 'close'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-blue-50 border-blue-300 text-blue-950'
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
                    <div className="p-3 bg-white/70 border border-gray-200/50 rounded-xl space-y-1.5">
                      <p className="text-xs">
                        <span className="font-bold text-gray-600">You wrote:</span>{' '}
                        <span className="font-mono text-sm line-through text-rose-500">{submittedInput}</span>
                      </p>
                      <p className="text-xs">
                        <span className="font-bold text-gray-600">Correct spelling:</span>{' '}
                        <span className="font-mono text-sm font-bold text-emerald-600 uppercase tracking-wider">
                          {word.word}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Star reward display */}
                  <div className="flex flex-col items-center space-y-1.5">
                    <span className="text-xs uppercase tracking-widest font-extrabold opacity-75">
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
                        <div key={`empty-star-${i}`} className="text-gray-200">
                          <Star size={36} fill="none" stroke="currentColor" strokeWidth={2} />
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-bold mt-1 block">
                      +{evaluation.stars} star{evaluation.stars > 1 ? 's' : ''} earned for effort! ⭐
                    </span>
                  </div>

                  {/* CTAs */}
                  <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                    {evaluation.grade !== 'perfect' && (
                      <button
                        onClick={handleRetryWord}
                        className="py-2.5 px-5 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-fredoka font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                        id="btn-retry-try"
                      >
                        <RefreshCw size={16} />
                        <span>Keep Trying!</span>
                      </button>
                    )}

                    <button
                      onClick={handleGoNext}
                      className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-fredoka font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:scale-102 transition-all cursor-pointer"
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
