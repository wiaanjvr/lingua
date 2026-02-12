/**
 * Speech validation utilities for comparing spoken input with expected phrases
 */

/**
 * Normalize French text for comparison
 * - Convert to lowercase
 * - Remove accents
 * - Remove punctuation
 * - Trim whitespace
 */
export function normalizeFrenchText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[.,!?;:]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Calculate Levenshtein distance between two strings
 * (minimum number of single-character edits required to change one word into the other)
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity score between two strings (0-100%)
 */
export function calculateSimilarity(spoken: string, expected: string): number {
  const normalizedSpoken = normalizeFrenchText(spoken);
  const normalizedExpected = normalizeFrenchText(expected);

  if (normalizedSpoken === normalizedExpected) {
    return 100;
  }

  const maxLength = Math.max(
    normalizedSpoken.length,
    normalizedExpected.length,
  );
  const distance = levenshteinDistance(normalizedSpoken, normalizedExpected);

  const similarity = ((maxLength - distance) / maxLength) * 100;
  return Math.max(0, Math.round(similarity));
}

/**
 * Validate spoken input against expected phrase
 */
export interface ValidationResult {
  isCorrect: boolean;
  similarity: number;
  feedback: string;
  normalizedSpoken: string;
  normalizedExpected: string;
}

export function validateSpeechInput(
  spoken: string,
  expected: string,
  threshold: number = 80,
): ValidationResult {
  const similarity = calculateSimilarity(spoken, expected);
  const isCorrect = similarity >= threshold;

  let feedback = "";

  if (similarity >= 95) {
    feedback = "Perfect! You nailed it! 🎉";
  } else if (similarity >= 85) {
    feedback = "Excellent! Very close! ✨";
  } else if (similarity >= 75) {
    feedback = "Good attempt! Try again for better pronunciation. 👍";
  } else if (similarity >= 60) {
    feedback = "Not quite right. Listen carefully and try again. 🎧";
  } else if (similarity >= 40) {
    feedback = "That's quite different. Take your time and listen again. 🔄";
  } else {
    feedback = "I didn't catch that. Try speaking more clearly. 🎤";
  }

  return {
    isCorrect,
    similarity,
    feedback,
    normalizedSpoken: normalizeFrenchText(spoken),
    normalizedExpected: normalizeFrenchText(expected),
  };
}

/**
 * Check if the spoken text contains all key words from the expected phrase
 */
export function containsKeyWords(
  spoken: string,
  expected: string,
  threshold: number = 0.7,
): boolean {
  const normalizedSpoken = normalizeFrenchText(spoken);
  const normalizedExpected = normalizeFrenchText(expected);

  const expectedWords = normalizedExpected.split(" ");
  const spokenWords = normalizedSpoken.split(" ");

  const matchedWords = expectedWords.filter((word) =>
    spokenWords.some((spokenWord) => {
      const wordSimilarity = calculateSimilarity(spokenWord, word);
      return wordSimilarity >= threshold * 100;
    }),
  );

  return matchedWords.length / expectedWords.length >= threshold;
}
