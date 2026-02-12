/**
 * Placement Test Scoring Logic
 *
 * Determines user's proficiency level based on test performance
 */

import { ProficiencyLevel } from "@/types";
import {
  TestResponse,
  PlacementTestResults,
  TestDifficulty,
  LEVEL_THRESHOLDS,
} from "@/types/placement-test";

interface ResponseWithDifficulty extends TestResponse {
  difficulty: TestDifficulty;
  section: "audio" | "reading";
}

/**
 * Calculate placement test results and determine proficiency level
 */
export function calculatePlacementResults(
  audioResponses: TestResponse[],
  readingResponses: TestResponse[],
  audioDifficulties: TestDifficulty[],
  readingDifficulties: TestDifficulty[],
): PlacementTestResults {
  // Count correct answers
  const audioScore = audioResponses.filter((r) => r.isCorrect).length;
  const readingScore = readingResponses.filter((r) => r.isCorrect).length;
  const totalScore = audioScore + readingScore;

  // Build breakdown with difficulty info
  const breakdown: PlacementTestResults["breakdown"] = [
    ...audioResponses.map((r, i) => ({
      difficulty: audioDifficulties[i],
      correct: r.isCorrect,
      section: "audio" as const,
    })),
    ...readingResponses.map((r, i) => ({
      difficulty: readingDifficulties[i],
      correct: r.isCorrect,
      section: "reading" as const,
    })),
  ];

  // Determine level using weighted scoring
  const determinedLevel = calculateLevel(breakdown, totalScore);

  return {
    audioScore,
    readingScore,
    totalScore,
    determinedLevel,
    breakdown,
  };
}

/**
 * Calculate proficiency level with weighted difficulty scoring
 *
 * Scoring logic:
 * - Getting harder questions right is more indicative of higher level
 * - Getting easier questions wrong is more indicative of lower level
 * - Balance determines the appropriate level
 */
function calculateLevel(
  breakdown: PlacementTestResults["breakdown"],
  totalScore: number,
): ProficiencyLevel {
  // Calculate weighted score based on difficulty
  const difficultyWeights: Record<TestDifficulty, number> = {
    A1: 1,
    A2: 2,
    B1: 3,
    B2: 4,
    C1: 5,
  };

  // Calculate weighted score (correct answers only)
  let weightedScore = 0;
  let maxPossibleScore = 0;

  for (const item of breakdown) {
    const weight = difficultyWeights[item.difficulty];
    maxPossibleScore += weight;
    if (item.correct) {
      weightedScore += weight;
    }
  }

  // Normalize to percentage
  const weightedPercentage = (weightedScore / maxPossibleScore) * 100;

  // Find highest difficulty level where user got the answer correct
  const correctDifficulties = breakdown
    .filter((b) => b.correct)
    .map((b) => b.difficulty);

  const highestCorrect = getHighestDifficulty(correctDifficulties);

  // Determine level based on combination of:
  // 1. Total raw score
  // 2. Weighted percentage
  // 3. Highest difficulty answered correctly

  // Use raw score thresholds as baseline
  let baseLevel: ProficiencyLevel = "A0";
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalScore >= threshold.minScore) {
      baseLevel = threshold.level;
      break;
    }
  }

  // Adjust based on weighted performance and highest correct
  if (highestCorrect) {
    // If they got C1 right, they're at least B2
    if (highestCorrect === "C1" && weightedPercentage >= 50) {
      return "B2";
    }
    // If they got B2 right and good overall, they're at least B1
    if (highestCorrect === "B2" && weightedPercentage >= 45) {
      return Math.max(getLevelIndex(baseLevel), getLevelIndex("B1")) ===
        getLevelIndex("B1")
        ? "B1"
        : baseLevel;
    }
    // If they got B1 right and decent overall, they're at least A2
    if (highestCorrect === "B1" && weightedPercentage >= 40) {
      return Math.max(getLevelIndex(baseLevel), getLevelIndex("A2")) ===
        getLevelIndex("A2")
        ? "A2"
        : baseLevel;
    }
  }

  // If weighted percentage is high but raw score suggests lower level,
  // they may have gotten harder questions right - adjust up
  if (weightedPercentage >= 60 && totalScore >= 4) {
    const levelIndex = getLevelIndex(baseLevel);
    if (levelIndex < 3) {
      // Don't go above B1 based on percentage alone
      return getLevelFromIndex(Math.min(levelIndex + 1, 3)) as ProficiencyLevel;
    }
  }

  return baseLevel;
}

/**
 * Get highest difficulty level from a list
 */
function getHighestDifficulty(
  difficulties: TestDifficulty[],
): TestDifficulty | null {
  if (difficulties.length === 0) return null;

  const order: TestDifficulty[] = ["A1", "A2", "B1", "B2", "C1"];
  let highest: TestDifficulty = difficulties[0];

  for (const diff of difficulties) {
    if (order.indexOf(diff) > order.indexOf(highest)) {
      highest = diff;
    }
  }

  return highest;
}

/**
 * Convert level to numeric index for comparison
 */
function getLevelIndex(level: ProficiencyLevel): number {
  const levels: ProficiencyLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
  return levels.indexOf(level);
}

/**
 * Convert numeric index back to level
 */
function getLevelFromIndex(index: number): string {
  const levels: ProficiencyLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
  return levels[Math.max(0, Math.min(index, levels.length - 1))];
}

/**
 * Get human-readable level description
 */
export function getLevelDescription(level: ProficiencyLevel): string {
  const descriptions: Record<ProficiencyLevel, string> = {
    A0: "Complete Beginner - You're just starting your journey!",
    A1: "Beginner - You can understand basic phrases and expressions.",
    A2: "Elementary - You can handle simple, routine tasks.",
    B1: "Intermediate - You can deal with most everyday situations.",
    B2: "Upper Intermediate - You can interact with fluency and spontaneity.",
    C1: "Advanced - You can express yourself fluently and precisely.",
    C2: "Proficient - You have near-native command of the language.",
  };

  return descriptions[level];
}

/**
 * Get encouragement message based on test performance
 */
export function getResultsMessage(results: PlacementTestResults): string {
  const { totalScore, determinedLevel } = results;

  if (totalScore >= 8) {
    return "Excellent performance! You have a strong foundation in French.";
  } else if (totalScore >= 6) {
    return "Great job! You've demonstrated solid comprehension skills.";
  } else if (totalScore >= 4) {
    return "Good effort! You're ready to build on your existing knowledge.";
  } else {
    return "Perfect starting point! We'll help you build a strong foundation.";
  }
}
