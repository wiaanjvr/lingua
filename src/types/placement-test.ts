/**
 * Placement Test Types
 *
 * Used to assess new user's language proficiency level through:
 * 1. Audio listening comprehension (5 clips, ~10 seconds each)
 * 2. Reading comprehension questions (5 passages with questions)
 */

import { ProficiencyLevel } from "./index";

// Difficulty levels for test questions
export type TestDifficulty = "A1" | "A2" | "B1" | "B2" | "C1";

// Audio listening test item
export interface AudioTestItem {
  id: string;
  difficulty: TestDifficulty;
  audioUrl: string;
  durationSeconds: number;
  transcript: string; // For reference, not shown to user
  question: string; // Question in target language
  options: string[]; // 4 options in target language
  correctIndex: number;
}

// Reading comprehension test item
export interface ReadingTestItem {
  id: string;
  difficulty: TestDifficulty;
  passage: string; // Short text in target language (<50 words)
  question: string; // Question in target language
  options: string[]; // 4 options in target language
  correctIndex: number;
}

// Test response tracking
export interface TestResponse {
  itemId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeSpentMs: number;
}

// Complete placement test data structure
export interface PlacementTestData {
  language: string;
  audioItems: AudioTestItem[];
  readingItems: ReadingTestItem[];
}

// Test session state
export interface PlacementTestSession {
  currentSection: "audio" | "reading" | "complete";
  currentItemIndex: number;
  audioResponses: TestResponse[];
  readingResponses: TestResponse[];
  startTime: number;
  itemStartTime: number;
}

// Test results
export interface PlacementTestResults {
  audioScore: number; // 0-5
  readingScore: number; // 0-5
  totalScore: number; // 0-10
  determinedLevel: ProficiencyLevel;
  breakdown: {
    difficulty: TestDifficulty;
    correct: boolean;
    section: "audio" | "reading";
  }[];
}

// Scoring thresholds for level determination
export const LEVEL_THRESHOLDS: { minScore: number; level: ProficiencyLevel }[] =
  [
    { minScore: 9, level: "B2" },
    { minScore: 7, level: "B1" },
    { minScore: 5, level: "A2" },
    { minScore: 3, level: "A1" },
    { minScore: 0, level: "A0" },
  ];
