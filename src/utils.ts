import { GradingResult } from './types';

export function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export function evaluateSpelling(input: string, correctWord: string): GradingResult {
  const cleanInput = input.trim().toLowerCase();
  const cleanCorrect = correctWord.trim().toLowerCase();

  if (cleanInput === cleanCorrect) {
    const perfectMessages = [
      "Spot on! Outstanding spelling! 🌟",
      "Perfect! You got every letter right! 🎉",
      "Amazing job! You spelled it beautifully! 🚀",
      "Wow! You are a super speller! 🏆",
      "Hurrah! That is absolutely correct! ⭐"
    ];
    return {
      grade: 'perfect',
      message: perfectMessages[Math.floor(Math.random() * perfectMessages.length)],
      subMessage: "You earned 3 shining stars for perfect spelling!",
      stars: 3
    };
  }

  const distance = getLevenshteinDistance(cleanInput, cleanCorrect);

  // Check for common child spelling errors if distance is 1
  if (distance === 1) {
    let specificFeedback = "You're almost there! Just one tiny letter is different.";

    // Case 1: Missing a letter in double letter word
    // E.g. "rabit" for "rabbit"
    const hasDoubleLetter = /(.)\1/.test(cleanCorrect);
    if (hasDoubleLetter) {
      // Find what double letter is missing
      const match = cleanCorrect.match(/(.)\1/);
      if (match) {
        const char = match[1];
        if (cleanInput.indexOf(char) !== -1 && cleanInput.indexOf(char + char) === -1) {
          specificFeedback = `So close! Remember, this word has a double letter '${char + char}' in the middle!`;
        }
      }
    }

    // Case 2: Transposition (swapped letters), e.g. "penicl" for "pencil"
    if (cleanInput.length === cleanCorrect.length) {
      let swappedIndices: number[] = [];
      for (let i = 0; i < cleanCorrect.length; i++) {
        if (cleanInput[i] !== cleanCorrect[i]) {
          swappedIndices.push(i);
        }
      }
      if (swappedIndices.length === 2 && 
          cleanInput[swappedIndices[0]] === cleanCorrect[swappedIndices[1]] && 
          cleanInput[swappedIndices[1]] === cleanCorrect[swappedIndices[0]]) {
        specificFeedback = `You have all the right letters! Just swap '${cleanInput[swappedIndices[0]]}' and '${cleanInput[swappedIndices[1]]}' around.`;
      }
    }

    // Case 3: Missing the last letter, e.g. "happ" for "happy"
    if (cleanCorrect.startsWith(cleanInput)) {
      const missingChar = cleanCorrect.slice(cleanInput.length);
      specificFeedback = `So close! You just need to add the letter '${missingChar}' at the very end.`;
    }

    // Case 4: Extra letter at the end, e.g. "rabbity" for "rabbit"
    if (cleanInput.startsWith(cleanCorrect)) {
      specificFeedback = "So close! Try trimming off that last extra letter.";
    }

    return {
      grade: 'close',
      message: "So, so close! 💖",
      subMessage: specificFeedback,
      stars: 2
    };
  }

  // Edit distance 2 is "Good Try"
  if (distance === 2) {
    return {
      grade: 'try',
      message: "Good try! 🌈",
      subMessage: "You are getting warmer! Listen to the sound chunks and try again.",
      stars: 1
    };
  }

  // Any attempt still gets a star!
  return {
    grade: 'try',
    message: "Great effort! 🌟",
    subMessage: "Spelling is a journey! Try using 'Show me the sound chunks' to guide you.",
    stars: 1
  };
}

/**
 * Text-to-Speech function slowed down for children's accessibility.
 */
export function speakWord(text: string, speed: number = 0.7, callback?: () => void) {
  if (!('speechSynthesis' in window)) {
    console.warn("Speech synthesis is not supported in this browser.");
    if (callback) callback();
    return;
  }

  // Cancel any current speaking
  window.speechSynthesis.cancel();

  // Clean the text slightly for cleaner speech (especially remove emojis or punctuation for speed)
  const cleanText = text.replace(/[🐾🌱🍌🎒🚀😊🏡❄️🎨🏃🍇🪶👖]/g, '').trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = speed; // Slower rate e.g. 0.7
  utterance.pitch = 1.1; // Slightly higher pitch to sound friendlier for kids

  // Find a clear english voice, preferably Google or standard natural voices
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) ||
                       voices.find(v => v.lang.startsWith('en-US')) ||
                       voices.find(v => v.lang.startsWith('en')) ||
                       voices[0];

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  if (callback) {
    utterance.onend = () => {
      callback();
    };
    utterance.onerror = () => {
      callback();
    };
  }

  window.speechSynthesis.speak(utterance);
}
