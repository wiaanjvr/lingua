/**
 * Word utilities for text processing and lemmatization
 *
 * Note: This is a basic implementation. For production, consider using:
 * - spaCy (Python) via API
 * - Compromise.js for NLP
 * - External lemmatization service
 */

/**
 * Basic French word lemmatization
 * Removes common endings to get approximate base form
 */
export function lemmatize(word: string, language: string = "fr"): string {
  if (language !== "fr") {
    return word.toLowerCase();
  }

  const cleaned = word.toLowerCase().trim();

  // Common French verb endings
  const verbEndings = [
    "ais",
    "ait",
    "ions",
    "iez",
    "aient",
    "ai",
    "as",
    "a",
    "ons",
    "ez",
    "ont",
    "erai",
    "eras",
    "era",
    "erons",
    "erez",
    "eront",
    "erais",
    "erait",
    "erions",
    "eriez",
    "eraient",
  ];

  // Common noun/adjective endings
  const nounEndings = ["s", "x", "es"];

  // Try verb endings first (longer to shorter)
  for (const ending of verbEndings.sort((a, b) => b.length - a.length)) {
    if (cleaned.endsWith(ending) && cleaned.length > ending.length + 2) {
      const base = cleaned.slice(0, -ending.length);
      // Common verb infinitive endings
      if (
        !base.endsWith("er") &&
        !base.endsWith("ir") &&
        !base.endsWith("re")
      ) {
        return base + "er"; // Most common
      }
      return base;
    }
  }

  // Try noun/adjective endings
  for (const ending of nounEndings) {
    if (cleaned.endsWith(ending) && cleaned.length > ending.length + 2) {
      return cleaned.slice(0, -ending.length);
    }
  }

  return cleaned;
}

/**
 * Tokenize French text into words
 * Handles contractions and punctuation
 */
export function tokenize(text: string): string[] {
  // Split on whitespace and punctuation, keeping contractions intact
  const tokens = text.split(/\s+/);

  return tokens
    .map((token) => {
      // Remove trailing punctuation
      return token.replace(/[.,;:!?'"()]+$/g, "");
    })
    .filter((token) => token.length > 0);
}

/**
 * Handle French contractions (l', d', c', etc.)
 */
export function handleContractions(word: string): string[] {
  const contractions = [
    ["l'", "le"],
    ["d'", "de"],
    ["c'", "ce"],
    ["s'", "se"],
    ["n'", "ne"],
    ["m'", "me"],
    ["t'", "te"],
    ["qu'", "que"],
    ["j'", "je"],
  ];

  for (const [contraction, full] of contractions) {
    if (word.toLowerCase().startsWith(contraction)) {
      const rest = word.slice(contraction.length);
      return [full, rest];
    }
  }

  return [word];
}

/**
 * Extract all unique words from text
 */
export function extractWords(
  text: string,
  language: string = "fr",
): Set<string> {
  const tokens = tokenize(text);
  const words = new Set<string>();

  for (const token of tokens) {
    // Handle contractions
    const expanded = handleContractions(token);

    for (const word of expanded) {
      // Skip very short words (likely articles)
      if (word.length < 2) continue;

      // Skip pure numbers
      if (/^\d+$/.test(word)) continue;

      const lemma = lemmatize(word, language);
      if (lemma.length >= 2) {
        words.add(lemma);
      }
    }
  }

  return words;
}

/**
 * Calculate text difficulty based on word frequency
 */
export function calculateDifficulty(
  text: string,
  knownWords: Set<string>,
  language: string = "fr",
): {
  totalWords: number;
  knownWords: number;
  unknownWords: number;
  comprehensionPercentage: number;
  difficulty: "easy" | "medium" | "hard" | "very-hard";
} {
  const words = extractWords(text, language);
  const total = words.size;
  const known = Array.from(words).filter((w) => knownWords.has(w)).length;
  const unknown = total - known;
  const percentage = total > 0 ? (known / total) * 100 : 0;

  let difficulty: "easy" | "medium" | "hard" | "very-hard";
  if (percentage >= 98) difficulty = "easy";
  else if (percentage >= 95) difficulty = "medium";
  else if (percentage >= 90) difficulty = "hard";
  else difficulty = "very-hard";

  return {
    totalWords: total,
    knownWords: known,
    unknownWords: unknown,
    comprehensionPercentage: percentage,
    difficulty,
  };
}

/**
 * Common French stop words (articles, prepositions, etc.)
 * These are usually not tracked individually
 */
export const FRENCH_STOP_WORDS = new Set([
  "le",
  "la",
  "les",
  "un",
  "une",
  "des",
  "de",
  "du",
  "au",
  "aux",
  "à",
  "et",
  "ou",
  "mais",
  "donc",
  "or",
  "ni",
  "car",
  "ce",
  "cet",
  "cette",
  "ces",
  "mon",
  "ma",
  "mes",
  "ton",
  "ta",
  "tes",
  "son",
  "sa",
  "ses",
  "je",
  "tu",
  "il",
  "elle",
  "on",
  "nous",
  "vous",
  "ils",
  "elles",
  "me",
  "te",
  "se",
  "le",
  "la",
  "les",
  "en",
  "y",
]);

/**
 * Check if word is important enough to track
 */
export function shouldTrackWord(
  word: string,
  language: string = "fr",
): boolean {
  if (language !== "fr") return true;

  const lemma = lemmatize(word, language);

  // Don't track stop words
  if (FRENCH_STOP_WORDS.has(lemma)) return false;

  // Don't track very short words
  if (lemma.length < 3) return false;

  // Don't track numbers
  if (/^\d+$/.test(lemma)) return false;

  return true;
}
