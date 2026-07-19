import React from 'react';
import { UserStats, WordProgress, SpellingWord, UserSettings } from '../types';
import { TINT_PRESETS } from '../data';
import { Award, Star, Flame, BookOpen, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { GmailDashboard } from './GmailDashboard';

interface ProgressViewProps {
  stats: UserStats;
  progressList: WordProgress[];
  onSelectWord: (wordId: string) => void;
  settings: UserSettings;
  wordsList: SpellingWord[];
  onWordsImported: (words: SpellingWord[]) => void;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: string;
  isUnlocked: boolean;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  stats,
  progressList,
  onSelectWord,
  settings,
  wordsList,
  onWordsImported,
}) => {
  const activeTint = TINT_PRESETS[settings.tint];

  // Derive achievements
  const badges: Badge[] = [
    {
      id: 'b1',
      name: 'First Step',
      description: 'Awarded for starting your very first word practice!',
      emoji: '🎈',
      requirement: 'Practice 1 word',
      isUnlocked: progressList.length >= 1,
    },
    {
      id: 'b2',
      name: 'Star Collector',
      description: 'Earn 10 or more stars in your practice!',
      emoji: '🌟',
      requirement: 'Earn 10 stars',
      isUnlocked: stats.totalStars >= 10,
    },
    {
      id: 'b3',
      name: 'Double Digit Speller',
      description: 'Show extreme focus by exploring 10 unique words!',
      emoji: '📚',
      requirement: 'Practice 10 words',
      isUnlocked: progressList.length >= 10,
    },
    {
      id: 'b4',
      name: 'Word Wizard',
      description: 'Perfectly spell 5 words during your exercises!',
      emoji: '🧙‍♂️',
      requirement: 'Spelled 5 words perfectly',
      isUnlocked: stats.wordsPerfect >= 5,
    },
    {
      id: 'b5',
      name: 'Syllable Explorer',
      description: 'Master a hard level spelling word!',
      emoji: '🚀',
      requirement: 'Perfect on a Hard word',
      isUnlocked: progressList.some(p => {
        const wordData = wordsList.find(w => w.id === p.wordId);
        return wordData?.level === 'hard' && p.bestGrade === 'perfect';
      }),
    },
    {
      id: 'b6',
      name: 'Super Streak',
      description: 'Log in and play to build a super learning streak!',
      emoji: '🔥',
      requirement: 'Have a active daily streak',
      isUnlocked: stats.streakDays >= 1,
    }
  ];

  const unlockedBadgesCount = badges.filter(b => b.isUnlocked).length;

  return (
    <div className="space-y-8">
      {/* Celebration Header */}
      <div className="text-center py-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-6 border-2 border-yellow-200">
        <div className="flex justify-center mb-2">
          <Award size={48} className="text-yellow-500 animate-bounce" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold font-fredoka text-yellow-800">
          Your Creative Journey! 🌈
        </h2>
        <p className="text-sm text-yellow-700/90 mt-1 max-w-lg mx-auto">
          Every spelling attempt makes your brain stronger. Look at how much amazing effort you have put in!
        </p>
      </div>

      {/* Positive Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Star counter */}
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex flex-col items-center justify-center text-center">
          <div className="p-2 bg-amber-100 rounded-full text-amber-600 mb-1.5">
            <Star size={24} fill="currentColor" />
          </div>
          <span className="text-2xl md:text-3xl font-black font-fredoka text-amber-700">
            {stats.totalStars}
          </span>
          <span className="text-xs font-bold text-amber-800/80">Stars Awarded</span>
        </div>

        {/* Words Practiced */}
        <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 flex flex-col items-center justify-center text-center">
          <div className="p-2 bg-blue-100 rounded-full text-blue-600 mb-1.5">
            <BookOpen size={24} />
          </div>
          <span className="text-2xl md:text-3xl font-black font-fredoka text-blue-700">
            {progressList.length} / {wordsList.length}
          </span>
          <span className="text-xs font-bold text-blue-800/80">Words Practiced</span>
        </div>

        {/* Perfect Spellings */}
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex flex-col items-center justify-center text-center">
          <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 mb-1.5">
            <CheckCircle2 size={24} />
          </div>
          <span className="text-2xl md:text-3xl font-black font-fredoka text-emerald-700">
            {stats.wordsPerfect}
          </span>
          <span className="text-xs font-bold text-emerald-800/80">Perfect Hits</span>
        </div>

        {/* Current Streak */}
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 flex flex-col items-center justify-center text-center">
          <div className="p-2 bg-rose-100 rounded-full text-rose-500 mb-1.5">
            <Flame size={24} fill="currentColor" />
          </div>
          <span className="text-2xl md:text-3xl font-black font-fredoka text-rose-700">
            {stats.streakDays}
          </span>
          <span className="text-xs font-bold text-rose-800/80">Day Streak</span>
        </div>
      </div>

      {/* Badges Section */}
      <div className={`p-6 rounded-3xl border-2 ${activeTint.cardClass} ${activeTint.textClass}`}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-indigo-500" />
          <h3 className="text-xl font-bold font-fredoka">Effort Badges ({unlockedBadgesCount}/{badges.length})</h3>
        </div>
        <p className="text-xs mb-6 opacity-80 leading-relaxed">
          Unlock badges as you practice, make attempts, and spell correct words.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-300 ${
                badge.isUnlocked
                  ? 'border-emerald-200 bg-emerald-50/20 opacity-100 shadow-sm'
                  : 'border-gray-200 bg-gray-50/50 opacity-60'
              }`}
              id={`badge-card-${badge.id}`}
            >
              <div className="text-3xl p-2.5 bg-white rounded-xl shadow-inner select-none">
                {badge.isUnlocked ? badge.emoji : '🔒'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-bold ${badge.isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                    {badge.name}
                  </span>
                  {badge.isUnlocked && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full uppercase">
                      Unlocked
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 line-clamp-1 leading-normal">
                  {badge.description}
                </p>
                <span className="text-[10px] font-semibold text-gray-400 mt-1 block">
                  Req: {badge.requirement}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practiced Words Log */}
      <div className={`p-6 rounded-3xl border-2 ${activeTint.cardClass} ${activeTint.textClass}`}>
        <h3 className="text-xl font-bold font-fredoka mb-4">Words You've Explored</h3>

        {progressList.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No words practiced yet. Let's start spelling to see your logs!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold uppercase opacity-70">
                  <th className="pb-3 pr-2">Word</th>
                  <th className="pb-3 px-2">Level</th>
                  <th className="pb-3 px-2">Best Grade</th>
                  <th className="pb-3 px-2 text-center">Stars Won</th>
                  <th className="pb-3 pl-2 text-right">Try Again</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {progressList.map((progress) => {
                  const wordData = wordsList.find(w => w.id === progress.wordId);
                  const isPerfect = progress.bestGrade === 'perfect';
                  const isClose = progress.bestGrade === 'close';

                  return (
                    <tr key={progress.wordId} className="group hover:bg-gray-50/50 transition-colors">
                      {/* Word text */}
                      <td className="py-3.5 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg select-none">{wordData?.emoji || '📝'}</span>
                          <span className="font-bold text-base capitalize" style={{ fontFamily: settings.font === 'lexend' ? 'Lexend' : settings.font === 'atkinson' ? 'Atkinson Hyperlegible' : 'Fredoka' }}>
                            {progress.word}
                          </span>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="py-3.5 px-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          wordData?.level === 'easy'
                            ? 'bg-green-100 text-green-800'
                            : wordData?.level === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {wordData?.level || 'easy'}
                        </span>
                      </td>

                      {/* Best Grade */}
                      <td className="py-3.5 px-2">
                        <span className={`text-xs font-bold ${
                          isPerfect
                            ? 'text-emerald-600'
                            : isClose
                            ? 'text-orange-500'
                            : 'text-blue-500'
                        }`}>
                          {isPerfect ? 'Perfect! 🌟' : isClose ? 'So Close 💖' : 'Good Try 👍'}
                        </span>
                      </td>

                      {/* Stars Won */}
                      <td className="py-3.5 px-2 text-center">
                        <div className="flex justify-center gap-0.5 text-amber-400">
                          {Array.from({ length: progress.starsEarned }).map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                          {Array.from({ length: 3 - progress.starsEarned }).map((_, i) => (
                            <Star key={i} size={14} className="text-gray-200" />
                          ))}
                        </div>
                      </td>

                      {/* Try Again CTA */}
                      <td className="py-3.5 pl-2 text-right">
                        <button
                          onClick={() => onSelectWord(progress.wordId)}
                          className="p-1.5 rounded-xl hover:bg-indigo-100 text-indigo-600 hover:text-indigo-800 transition-all cursor-pointer"
                          title="Practice this word again!"
                          id={`retry-word-btn-${progress.wordId}`}
                        >
                          <RefreshCw size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Gmail Parent & Teacher Hub */}
      <GmailDashboard
        stats={stats}
        progressList={progressList}
        settings={settings}
        onWordsImported={onWordsImported}
      />
    </div>
  );
};
