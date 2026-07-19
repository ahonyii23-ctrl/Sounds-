import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { splitIntoSyllables } from './syllableSplitter';
import { UserStats, WordProgress, SpellingWord } from '../types';

// Initialize Firebase once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Add required Gmail scopes
provider.addScope('https://mail.google.com/');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.modify');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // If we already have the token cached, trigger success immediately
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // Since we are resuming or reloading, we need to prompt the user or await their explicit trigger
        // In SPA popups, we cache the token during the sign-in flow.
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Decode Base64Url
function decodeBase64Url(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.error('Failed to decode base64url content', e);
    return '';
  }
}

// Extract Plaintext Body from Gmail Message
function getMessageBody(message: any): string {
  if (!message.payload) return '';
  
  function findPart(part: any): string {
    if (part.mimeType === 'text/plain' && part.body && part.body.data) {
      return part.body.data;
    }
    if (part.mimeType === 'text/html' && part.body && part.body.data) {
      return part.body.data;
    }
    if (part.parts) {
      for (const subPart of part.parts) {
        const found = findPart(subPart);
        if (found) return found;
      }
    }
    return '';
  }

  if (message.payload.body && message.payload.body.data) {
    return decodeBase64Url(message.payload.body.data);
  }

  const partData = findPart(message.payload);
  if (partData) {
    return decodeBase64Url(partData);
  }

  return '';
}

/**
 * Sends a beautiful spelling practice progress report email using Gmail API.
 */
export const sendProgressEmail = async (
  recipientEmail: string,
  stats: UserStats,
  progressList: WordProgress[]
): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const subject = `🏆 Sound Bridges Spelling Progress Report for ${auth.currentUser?.displayName || 'Learner'}!`;
  
  // Format practiced words rows
  const wordRowsHtml = progressList.map(p => {
    const stars = '⭐'.repeat(p.starsEarned) + '☆'.repeat(Math.max(0, 3 - p.starsEarned));
    const gradeText = p.bestGrade === 'perfect' ? 'Perfect! 🌟' : p.bestGrade === 'close' ? 'So Close 💖' : 'Good Try 👍';
    const gradeColor = p.bestGrade === 'perfect' ? '#059669' : p.bestGrade === 'close' ? '#D97706' : '#2563EB';

    return `
      <tr style="border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 10px 8px; font-weight: bold; font-size: 15px; color: #1F2937;">${p.word}</td>
        <td style="padding: 10px 8px; font-weight: bold; font-size: 14px; color: ${gradeColor}">${gradeText}</td>
        <td style="padding: 10px 8px; font-size: 15px; color: #D97706; text-align: center;">${stars}</td>
        <td style="padding: 10px 8px; font-size: 13px; color: #6B7280; text-align: right;">${p.attemptsCount} try${p.attemptsCount > 1 ? 'ies' : 'y'}</td>
      </tr>
    `;
  }).join('');

  const bodyHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Spelling Progress Report</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #F4F7F2; margin: 0; padding: 20px; color: #374151;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 2px solid #E1E8DB; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header Banner -->
        <div style="background-color: #7FB069; padding: 24px; text-align: center; color: #ffffff;">
          <span style="font-size: 48px; display: block; margin-bottom: 8px;">🌉</span>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Sound Bridges Spelling Practice</h1>
          <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.05em;">Certificate of Spelling Effort & Stars!</p>
        </div>

        <!-- Content -->
        <div style="padding: 24px;">
          <h2 style="font-size: 20px; color: #2D4A22; text-align: center; margin-top: 0;">Look what we achieved! 🌈</h2>
          <p style="font-size: 15px; line-height: 1.5; text-align: center; color: #4B5563; margin-bottom: 24px;">
            Here is a summary of spelling practice milestones reached by <strong>${auth.currentUser?.displayName || 'our learner'}</strong>. Every syllable split and spelling attempt makes our mind grow stronger!
          </p>

          <!-- Scoreboard Grid -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
            <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
              <tr>
                <td width="50%" style="padding: 10px;">
                  <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 12px; padding: 12px; text-align: center;">
                    <span style="font-size: 20px; display: block; margin-bottom: 4px;">⭐</span>
                    <span style="font-size: 20px; font-weight: bold; color: #92400E; display: block;">${stats.totalStars}</span>
                    <span style="font-size: 11px; color: #92400E; font-weight: bold; text-transform: uppercase;">Stars Earned</span>
                  </div>
                </td>
                <td width="50%" style="padding: 10px;">
                  <div style="background-color: #DBEAFE; border: 1px solid #BFDBFE; border-radius: 12px; padding: 12px; text-align: center;">
                    <span style="font-size: 20px; display: block; margin-bottom: 4px;">🔥</span>
                    <span style="font-size: 20px; font-weight: bold; color: #1E40AF; display: block;">${stats.streakDays} Days</span>
                    <span style="font-size: 11px; color: #1E40AF; font-weight: bold; text-transform: uppercase;">Active Streak</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td width="50%" style="padding: 10px;">
                  <div style="background-color: #D1FAE5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 12px; text-align: center;">
                    <span style="font-size: 20px; display: block; margin-bottom: 4px;">🏆</span>
                    <span style="font-size: 20px; font-weight: bold; color: #065F46; display: block;">${stats.wordsPerfect}</span>
                    <span style="font-size: 11px; color: #065F46; font-weight: bold; text-transform: uppercase;">Perfect Words</span>
                  </div>
                </td>
                <td width="50%" style="padding: 10px;">
                  <div style="background-color: #E0F2FE; border: 1px solid #BAE6FD; border-radius: 12px; padding: 12px; text-align: center;">
                    <span style="font-size: 20px; display: block; margin-bottom: 4px;">📚</span>
                    <span style="font-size: 20px; font-weight: bold; color: #075985; display: block;">${progressList.length}</span>
                    <span style="font-size: 11px; color: #075985; font-weight: bold; text-transform: uppercase;">Words Practiced</span>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Practiced Words Table -->
          <h3 style="font-size: 16px; border-bottom: 2px solid #E1E8DB; padding-bottom: 6px; color: #2D4A22; margin-top: 24px; margin-bottom: 12px;">Word Practice Logs</h3>
          <table width="100%" style="border-collapse: collapse; text-align: left; margin-bottom: 24px;">
            <thead>
              <tr style="border-bottom: 2px solid #E5E7EB; color: #6B7280; font-size: 12px; text-transform: uppercase;">
                <th style="padding-bottom: 8px;">Word</th>
                <th style="padding-bottom: 8px;">Best Grade</th>
                <th style="padding-bottom: 8px; text-align: center;">Stars</th>
                <th style="padding-bottom: 8px; text-align: right;">Attempts</th>
              </tr>
            </thead>
            <tbody>
              ${wordRowsHtml || '<tr><td colspan="4" style="padding: 16px; text-align: center; color: #9CA3AF;">No spelling words completed yet! Start practicing on the board!</td></tr>'}
            </tbody>
          </table>

          <!-- Footer encouragement -->
          <div style="background-color: #F9FAFB; padding: 16px; border-radius: 12px; border: 1px dashed #E5E7EB; text-align: center; font-size: 13px; color: #4B5563;">
            <p style="margin: 0 0 6px 0; font-weight: bold; color: #2D4A22;">🌟 Keep Bridging Vowels and Syllables!</p>
            <p style="margin: 0; line-height: 1.4;">"Practice makes spelling fluent, fun, and easy! Have another spelling practice board session soon!"</p>
          </div>
        </div>

        <div style="background-color: #F3F4F6; padding: 16px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB;">
          Sent with love from Sound Bridges Spelling Practice Applet.
        </div>
      </div>
    </body>
    </html>
  `;

  // Build raw email MIME representation
  const emailLines = [
    `To: ${recipientEmail}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    bodyHtml
  ];

  const email = emailLines.join("\r\n");
  const raw = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw })
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error('Failed to send progress email through Gmail:', errorDetails);
    throw new Error('Gmail API send request failed');
  }

  return true;
};

/**
 * Searches for custom word list emails from user's Gmail box, parses them and returns custom speller words.
 */
export const fetchSpellingListsFromGmail = async (): Promise<SpellingWord[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  // Search for emails with subject "Sound Bridges Spelling List" or subject containing "Sound Bridges Custom"
  const q = 'subject:("Sound Bridges Spelling List" OR "[Sound Bridges]")';
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=5`;

  const searchRes = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!searchRes.ok) {
    throw new Error('Failed to search messages in Gmail');
  }

  const searchData = await searchRes.json();
  if (!searchData.messages || searchData.messages.length === 0) {
    return [];
  }

  const newWordsList: SpellingWord[] = [];

  for (const msgSummary of searchData.messages) {
    const msgId = msgSummary.id;
    const msgUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}`;
    
    const msgRes = await fetch(msgUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!msgRes.ok) continue;
    const msgData = await msgRes.json();
    const emailBodyText = getMessageBody(msgData);
    if (!emailBodyText) continue;

    const parsedWords = parseEmailBodyForWords(emailBodyText, msgId);
    newWordsList.push(...parsedWords);
  }

  // Filter duplicate words
  const seenWords = new Set<string>();
  const uniqueImportedWords: SpellingWord[] = [];

  for (const w of newWordsList) {
    if (!seenWords.has(w.word.toLowerCase())) {
      seenWords.add(w.word.toLowerCase());
      uniqueImportedWords.push(w);
    }
  }

  return uniqueImportedWords;
};

/**
 * Robust email body text parser that can extract raw custom word lists.
 */
function parseEmailBodyForWords(text: string, msgId: string): SpellingWord[] {
  const words: SpellingWord[] = [];
  const lines = text.split(/\r?\n/);

  let currentWord: Partial<SpellingWord> | null = null;

  const flushWord = () => {
    if (currentWord && currentWord.word) {
      const finalWordString = currentWord.word.trim().toLowerCase();
      if (/^[a-zA-Z]+$/.test(finalWordString)) { // Valid english word only
        const wordId = `g-${msgId.slice(0, 4)}-${finalWordString}`;
        const finalWord: SpellingWord = {
          id: wordId,
          word: finalWordString,
          chunks: currentWord.chunks || splitIntoSyllables(finalWordString),
          level: currentWord.level || (finalWordString.length <= 4 ? 'easy' : finalWordString.length <= 7 ? 'medium' : 'hard'),
          category: currentWord.category || 'Imported 📩',
          sentence: currentWord.sentence || `Let's practice spelling the word ${finalWordString}!`,
          hint: currentWord.hint || `A wonderful vocabulary word: ${finalWordString}.`,
          emoji: currentWord.emoji || '📝'
        };
        words.push(finalWord);
      }
    }
    currentWord = null;
  };

  // 1. First parse block-structured custom formats:
  // Word: balloon
  // Category: Fun
  // Level: easy
  // Sentence: The yellow balloon floated up.
  // Hint: A bag filled with air or helium.
  // Emoji: 🎈
  let isParsingBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (isParsingBlock) {
        flushWord();
        isParsingBlock = false;
      }
      continue;
    }

    const wordMatch = trimmed.match(/^word:\s*(.*)$/i);
    const categoryMatch = trimmed.match(/^category:\s*(.*)$/i);
    const levelMatch = trimmed.match(/^level:\s*(.*)$/i);
    const sentenceMatch = trimmed.match(/^sentence:\s*(.*)$/i);
    const hintMatch = trimmed.match(/^hint:\s*(.*)$/i);
    const emojiMatch = trimmed.match(/^emoji:\s*(.*)$/i);

    if (wordMatch) {
      if (isParsingBlock) flushWord();
      isParsingBlock = true;
      currentWord = { word: wordMatch[1].trim() };
    } else if (isParsingBlock && categoryMatch) {
      currentWord!.category = categoryMatch[1].trim();
    } else if (isParsingBlock && levelMatch) {
      const lvl = levelMatch[1].trim().toLowerCase();
      currentWord!.level = (lvl === 'easy' || lvl === 'medium' || lvl === 'hard') ? lvl : 'easy';
    } else if (isParsingBlock && sentenceMatch) {
      currentWord!.sentence = sentenceMatch[1].trim();
    } else if (isParsingBlock && hintMatch) {
      currentWord!.hint = hintMatch[1].trim();
    } else if (isParsingBlock && emojiMatch) {
      currentWord!.emoji = emojiMatch[1].trim();
    }
  }
  if (isParsingBlock) {
    flushWord();
  }

  // If we found words in Format A, let's stop and return them!
  if (words.length > 0) {
    return words;
  }

  // 2. Otherwise parse simple word listings, e.g. bullet points or comma-separated raw words:
  // "balloon, pocket, bubble" or list lines:
  // - pencil
  // - rainbow
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.toLowerCase().startsWith('subject:') || trimmed.toLowerCase().startsWith('to:') || trimmed.toLowerCase().startsWith('hi ')) {
      continue;
    }

    // Bullet points like: - word, * word, 1. word
    const bulletMatch = trimmed.match(/^[-*•]\s*([a-zA-Z]+)$/) || trimmed.match(/^\d+\.\s*([a-zA-Z]+)$/);
    if (bulletMatch) {
      const w = bulletMatch[1].trim().toLowerCase();
      if (w.length >= 2) {
        words.push({
          id: `g-${msgId.slice(0, 4)}-${w}`,
          word: w,
          chunks: splitIntoSyllables(w),
          level: w.length <= 4 ? 'easy' : w.length <= 7 ? 'medium' : 'hard',
          category: 'Imported 📩',
          sentence: `Let's practice spelling the word ${w}!`,
          hint: `Spelling practice for ${w}.`,
          emoji: '📝'
        });
      }
    } else if (trimmed.includes(',')) {
      // Comma-separated line: "balloon, pocket, bubble"
      const candidates = trimmed.split(',');
      for (const rawCand of candidates) {
        const w = rawCand.trim().toLowerCase();
        if (/^[a-zA-Z]+$/.test(w) && w.length >= 2 && w.length <= 15) {
          words.push({
            id: `g-${msgId.slice(0, 4)}-${w}`,
            word: w,
            chunks: splitIntoSyllables(w),
            level: w.length <= 4 ? 'easy' : w.length <= 7 ? 'medium' : 'hard',
            category: 'Imported 📩',
            sentence: `Let's practice spelling the word ${w}!`,
            hint: `Spelling practice for ${w}.`,
            emoji: '📝'
          });
        }
      }
    } else if (/^[a-zA-Z]+$/.test(trimmed) && trimmed.length >= 2 && trimmed.length <= 15) {
      // Single raw word line
      const w = trimmed.toLowerCase();
      words.push({
        id: `g-${msgId.slice(0, 4)}-${w}`,
        word: w,
        chunks: splitIntoSyllables(w),
        level: w.length <= 4 ? 'easy' : w.length <= 7 ? 'medium' : 'hard',
        category: 'Imported 📩',
        sentence: `Let's practice spelling the word ${w}!`,
        hint: `Spelling practice for ${w}.`,
        emoji: '📝'
      });
    }
  }

  return words;
}
