/**
 * Proficiency Level Calculator
 *
 * Determines user's proficiency level based on mastered vocabulary count
 * Research-based thresholds:
 * - A0: Complete beginner (< 100 words)
 * - A1: 100-500 words (basic phrases)
 * - A2: 500-1000 words (simple conversations)
 * - B1: 1000-2500 words (most everyday situations)
 * - B2: 2500-5000 words (complex discussions)
 * - C1: 5000-10000 words (professional fluency)
 * - C2: 10000+ words (near-native)
 */

import { ProficiencyLevel } from "@/types";

// Word count thresholds for each level
// Based on known + mastered words
export const PROFICIENCY_THRESHOLDS: {
  level: ProficiencyLevel;
  minWords: number;
}[] = [
  { level: "C2", minWords: 10000 },
  { level: "C1", minWords: 5000 },
  { level: "B2", minWords: 2500 },
  { level: "B1", minWords: 1000 },
  { level: "A2", minWords: 500 },
  { level: "A1", minWords: 100 },
  { level: "A0", minWords: 0 },
];

/**
 * Calculate proficiency level based on mastered/known word count
 */
export function calculateProficiencyFromVocabulary(
  knownCount: number,
  masteredCount: number,
): ProficiencyLevel {
  // Count both known and mastered words toward proficiency
  const totalProficientWords = knownCount + masteredCount;

  for (const threshold of PROFICIENCY_THRESHOLDS) {
    if (totalProficientWords >= threshold.minWords) {
      return threshold.level;
    }
  }

  return "A0";
}

/**
 * Get progress toward next proficiency level
 * Uses the actual profile level (from placement test) as the baseline
 */
export function getProficiencyProgress(
  currentProfileLevel: ProficiencyLevel,
  knownCount: number,
  masteredCount: number,
): {
  currentLevel: ProficiencyLevel;
  nextLevel: ProficiencyLevel | null;
  wordsNeeded: number;
  progress: number;
} {
  const totalWords = knownCount + masteredCount;

  // Use the profile level (from placement test) as current
  // Not the vocabulary-calculated level
  const currentLevel = currentProfileLevel;

  // Find current and next threshold
  const currentIndex = PROFICIENCY_THRESHOLDS.findIndex(
    (t) => t.level === currentLevel,
  );
  const nextThreshold =
    currentIndex > 0 ? PROFICIENCY_THRESHOLDS[currentIndex - 1] : null;
  const currentThreshold = PROFICIENCY_THRESHOLDS[currentIndex];

  if (!nextThreshold) {
    // Already at max level
    return {
      currentLevel,
      nextLevel: null,
      wordsNeeded: 0,
      progress: 100,
    };
  }

  const wordsNeeded = Math.max(0, nextThreshold.minWords - totalWords);
  const rangeSize = nextThreshold.minWords - currentThreshold.minWords;
  const wordsInRange = totalWords - currentThreshold.minWords;
  const progress = Math.round((wordsInRange / rangeSize) * 100);

  return {
    currentLevel,
    nextLevel: nextThreshold.level,
    wordsNeeded,
    progress: Math.min(100, Math.max(0, progress)),
  };
}

/**
 * Convert level to numeric index for comparison
 */
function getLevelIndex(level: ProficiencyLevel): number {
  const levels: ProficiencyLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
  return levels.indexOf(level);
}

/**
 * Check if user's proficiency should be updated and return new level if higher
 *
 * IMPORTANT: Proficiency can only go UP based on vocabulary, never down.
 * The placement test sets the baseline; vocabulary growth can increase it.
 */
export function checkProficiencyUpdate(
  currentLevel: ProficiencyLevel,
  knownCount: number,
  masteredCount: number,
): ProficiencyLevel | null {
  const calculatedLevel = calculateProficiencyFromVocabulary(
    knownCount,
    masteredCount,
  );

  // Only upgrade, never downgrade - placement test is the floor
  const currentIndex = getLevelIndex(currentLevel);
  const calculatedIndex = getLevelIndex(calculatedLevel);

  if (calculatedIndex > currentIndex) {
    return calculatedLevel;
  }

  return null;
}
