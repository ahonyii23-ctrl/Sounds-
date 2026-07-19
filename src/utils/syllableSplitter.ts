export function splitIntoSyllables(word: string): string[] {
  const clean = word.toLowerCase().trim();
  if (clean.length <= 3) return [clean];

  // Manual overrides for common words that might be imported
  const overrides: Record<string, string[]> = {
    balloon: ['bal', 'loon'],
    pencil: ['pen', 'cil'],
    teacher: ['teach', 'er'],
    school: ['schoo', 'l'],
    rainbow: ['rain', 'bow'],
    rocket: ['rock', 'et'],
    dinosaur: ['di', 'no', 'saur'],
    family: ['fam', 'i', 'ly'],
    friend: ['fri', 'end'],
    purple: ['pur', 'ple'],
    monkey: ['mon', 'key'],
    cookie: ['coo', 'kie'],
    nature: ['na', 'ture'],
    feather: ['feath', 'er'],
    pocket: ['pock', 'et']
  };

  if (overrides[clean]) {
    return overrides[clean];
  }

  // Fallback rule-based syllable splitter
  // We can split after vowel-consonant combinations, or double consonants.
  const vowels = 'aeiouy';
  const chunks: string[] = [];
  let currentChunk = '';

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];
    const nextNextChar = clean[i + 2];
    currentChunk += char;

    const isVowel = (c: string) => c && vowels.includes(c);

    // Double consonant split (e.g. bb, pp, tt, nn, dd, gg, mm, rr, ss, cc, ll, zz)
    if (nextChar && nextChar === char && !isVowel(char)) {
      chunks.push(currentChunk);
      currentChunk = '';
      continue;
    }

    // Split after vowel if next is consonant and next-next is vowel (e.g. ba-na-na, ti-ger)
    if (isVowel(char) && nextChar && !isVowel(nextChar) && nextNextChar && isVowel(nextNextChar)) {
      // Don't split single character suffix or prefix too aggressively
      if (i > 0 && i < clean.length - 2) {
        chunks.push(currentChunk);
        currentChunk = '';
        continue;
      }
    }

    // Split on vowel transitions if they don't form a diphthong
    if (isVowel(char) && nextChar && isVowel(nextChar)) {
      const pair = char + nextChar;
      const diphthongs = ['ee', 'oo', 'ea', 'ou', 'ai', 'ay', 'oy', 'oi', 'au', 'aw', 'ie', 'oa'];
      if (!diphthongs.includes(pair) && i < clean.length - 1) {
        chunks.push(currentChunk);
        currentChunk = '';
        continue;
      }
    }

    // Split before 'le' at the end of word if preceded by consonant (e.g. bub-ble, pur-ple, ap-ple)
    if (nextChar === 'l' && nextNextChar === 'e' && i === clean.length - 3 && !isVowel(char)) {
      chunks.push(currentChunk);
      currentChunk = '';
      continue;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  // Filter empty chunks and check if we have too small chunks, merge them if needed
  const finalChunks = chunks.filter(Boolean);
  if (finalChunks.length === 0) return [clean];

  // If a chunk is single letter at the end or start, let's merge it to avoid weird segments
  const result: string[] = [];
  for (let i = 0; i < finalChunks.length; i++) {
    const chunk = finalChunks[i];
    if (i > 0 && chunk.length === 1 && !vowels.includes(chunk)) {
      result[result.length - 1] += chunk;
    } else {
      result.push(chunk);
    }
  }

  return result.length > 0 ? result : [clean];
}
