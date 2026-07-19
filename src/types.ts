export interface SpellingWord {
  id: string;
  word: string;
  chunks: string[]; // Syllable chunks, e.g. ["rab", "bit"]
  level: 'easy' | 'medium' | 'hard';
  category: string;
  sentence: string;
  hint: string;
  emoji: string;
}

export type BackgroundTint = 'cream' | 'mint' | 'sky' | 'lavender' | 'buttercup';

export type TextSize = 'md' | 'lg' | 'xl' | 'huge';

export type LetterSpacing = 'normal' | 'wide' | 'extra';

export type SelectedFont = 'lexend' | 'atkinson' | 'fredoka';

export interface UserSettings {
  tint: BackgroundTint;
  textSize: TextSize;
  spacing: LetterSpacing;
  font: SelectedFont;
  pronunciationSpeed: number; // e.g. 0.65 or 0.8
  speakAutomatically: boolean;
}

export interface WordProgress {
  wordId: string;
  word: string;
  attemptsCount: number;
  bestGrade: 'perfect' | 'close' | 'try' | 'none';
  starsEarned: number;
  lastAttemptedAt: string;
  history: {
    input: string;
    grade: 'perfect' | 'close' | 'try';
    timestamp: string;
  }[];
}

export interface UserStats {
  totalStars: number;
  wordsPracticed: number;
  wordsPerfect: number;
  streakDays: number;
  lastActiveDate: string | null;
}

export interface GradingResult {
  grade: 'perfect' | 'close' | 'try';
  message: string;
  subMessage: string;
  stars: number;
}

