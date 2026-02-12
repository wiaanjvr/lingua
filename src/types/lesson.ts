/**
 * Lesson Types - Core types for the 6-phase comprehension lesson flow
 *
 * Lesson Flow:
 * 1. Audio-only comprehension (multiple listens)
 * 2. Verbal comprehension check #1 (user describes what they heard)
 * 3. Conversational feedback loop (guided conversation with hints)
 * 4. Text reveal + vocabulary marking (highlight new words, user rates knowledge)
 * 5. Interactive exercises (comprehension, grammar, vocabulary games)
 * 6. Final verbal assessment (record summary, get feedback)
 */

import { WordStatus, WordRating, ProficiencyLevel } from "./index";

// ===== LESSON PHASES =====

export type LessonPhase =
  | "audio-comprehension" // Phase 1: Listen without text
  | "verbal-check" // Phase 2: Describe what you heard
  | "conversation-feedback" // Phase 3: Guided conversation
  | "text-reveal" // Phase 4: See text + mark vocabulary
  | "interactive-exercises" // Phase 5: Practice activities
  | "final-assessment"; // Phase 6: Final verbal summary

// ===== LESSON CONTENT =====

export interface LessonWord {
  word: string;
  lemma: string;
  translation?: string;
  partOfSpeech?: string;
  isNew: boolean; // User hasn't seen before
  isDueForReview: boolean; // Due per SRS schedule
  userKnowledge?: WordStatus;
  frequencyRank?: number;
  position: number; // Position in text
}

export interface Lesson {
  id: string;
  userId: string;

  // Content
  targetText: string; // The French (or target language) text
  translation: string; // English translation for reference
  audioUrl?: string; // TTS or recorded audio URL

  // Metadata
  language: string;
  level: ProficiencyLevel;
  topic?: string;
  title: string;

  // Word analysis
  words: LessonWord[];
  totalWords: number;
  newWordCount: number;
  reviewWordCount: number;
  knownWordCount: number;
  comprehensionPercentage: number; // Expected comprehension based on known words

  // Progress tracking
  currentPhase: LessonPhase;
  listenCount: number;
  completed: boolean;

  // Timestamps
  createdAt: string;
  startedAt?: string;
  completedAt?: string;

  // Generation metadata
  generationParams: LessonGenerationParams;
}

export interface LessonGenerationParams {
  targetWordCount: number;
  newWordPercentage: number; // Target ~5%
  reviewWordPriority: boolean; // Prioritize words due for review
  topicPreference?: string;
  grammarFocus?: string[];
}

// ===== COMPREHENSION EVALUATION =====

export interface ComprehensionResponse {
  id: string;
  lessonId: string;
  userId: string;
  phase: "verbal-check" | "final-assessment";

  // User's response
  audioBlob?: Blob;
  audioUrl?: string;
  transcript?: string; // Transcribed speech

  // Evaluation
  evaluation?: ComprehensionEvaluation;

  createdAt: string;
}

export interface ComprehensionEvaluation {
  // Core scores (0-100)
  comprehensionScore: number; // How well they understood the content
  detailScore: number; // How many details they captured
  languageUseScore: number; // Use of target language (bonus, not penalty)

  // Qualitative feedback
  understoodConcepts: string[]; // Key concepts they demonstrated understanding
  missedConcepts: string[]; // Important things they didn't mention
  vocabularyUsed: string[]; // Target words they used correctly
  suggestedVocabulary: string[]; // Words we want to teach based on their response

  // Follow-up for conversation phase
  followUpQuestions: string[]; // Questions to ask in conversational feedback
  vocabularyHints: VocabularyHint[]; // Hints for words they struggled with

  // Overall feedback message
  feedbackMessage: string;
  encouragement: string;
}

export interface VocabularyHint {
  word: string;
  translation: string;
  context: string; // How it appeared in the lesson
  hint: string; // Helpful hint for remembering
}

// ===== CONVERSATION FEEDBACK =====

export interface ConversationTurn {
  id: string;
  role: "assistant" | "user";

  // Content
  text: string;
  audioUrl?: string;

  // For assistant turns
  questionType?: "comprehension" | "clarification" | "vocabulary" | "expansion";
  vocabularyFocus?: string[]; // Words we're trying to teach in this turn

  timestamp: string;
}

export interface ConversationSession {
  id: string;
  lessonId: string;
  userId: string;

  turns: ConversationTurn[];

  // Tracking
  comprehensionImproved: boolean;
  newWordsIntroduced: string[];

  createdAt: string;
  completedAt?: string;
}

// ===== INTERACTIVE EXERCISES =====

export type ExerciseType =
  | "multiple-choice" // Comprehension questions
  | "fill-blank" // Fill in the blank with vocabulary
  | "word-match" // Match word to translation
  | "sentence-order" // Put words in correct order
  | "listening-select" // Listen and select correct option
  | "word-definition" // Select correct definition
  | "grammar-choice"; // Choose grammatically correct option

export interface Exercise {
  id: string;
  lessonId: string;
  type: ExerciseType;

  // Question
  question: string;
  audioUrl?: string; // For listening exercises
  targetWord?: string; // Word being practiced

  // Answer options
  options: string[];
  correctAnswer: number; // Index of correct option

  // Feedback
  explanation?: string;
  grammarNote?: string;

  // For tracking
  focusArea: "comprehension" | "vocabulary" | "grammar";
  difficulty: "easy" | "medium" | "hard";
}

export interface ExerciseAttempt {
  exerciseId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpentMs: number;
}

export interface ExerciseSession {
  id: string;
  lessonId: string;
  userId: string;

  exercises: Exercise[];
  attempts: ExerciseAttempt[];

  score: number; // Percentage correct
  completed: boolean;

  createdAt: string;
  completedAt?: string;
}

// ===== VOCABULARY RATING (Phase 4) =====

export interface VocabularyRating {
  lessonId: string;
  word: string;
  lemma: string;
  rating: WordRating; // 0-5 scale
  timeSpentMs?: number;
  context: string; // Sentence where word appeared
}

// ===== LESSON SESSION STATE =====

export interface LessonSessionState {
  lesson: Lesson;
  currentPhase: LessonPhase;

  // Phase 1 state
  listenCount: number;

  // Phase 2 state
  initialResponse?: ComprehensionResponse;

  // Phase 3 state
  conversation?: ConversationSession;

  // Phase 4 state
  vocabularyRatings: VocabularyRating[];
  revealedText: boolean;

  // Phase 5 state
  exerciseSession?: ExerciseSession;

  // Phase 6 state
  finalResponse?: ComprehensionResponse;

  // Overall progress
  phaseProgress: Record<LessonPhase, number>; // 0-100 for each phase
  overallProgress: number;

  startedAt: string;
  lastActivityAt: string;
}

// ===== API REQUEST/RESPONSE TYPES =====

export interface GenerateLessonRequest {
  language?: string;
  level?: ProficiencyLevel;
  topic?: string;
  wordCountTarget?: number;
  prioritizeReview?: boolean;
}

export interface GenerateLessonResponse {
  lesson: Lesson;
  wordStats: {
    newWords: string[];
    reviewWords: string[];
    knownWords: string[];
  };
}

export interface EvaluateComprehensionRequest {
  lessonId: string;
  phase: "verbal-check" | "final-assessment";
  audioUrl?: string;
  transcript?: string;
}

export interface EvaluateComprehensionResponse {
  evaluation: ComprehensionEvaluation;
  nextAction: "continue" | "retry" | "get-help";
}

export interface ConversationRequest {
  lessonId: string;
  sessionId?: string;
  userMessage: string;
  userAudioUrl?: string;
}

export interface ConversationResponse {
  assistantMessage: string;
  assistantAudioUrl?: string;
  vocabularyHints?: VocabularyHint[];
  sessionId: string;
  shouldContinue: boolean;
}

export interface GenerateExercisesRequest {
  lessonId: string;
  focusAreas?: ("comprehension" | "vocabulary" | "grammar")[];
  count?: number;
}

export interface GenerateExercisesResponse {
  exercises: Exercise[];
  sessionId: string;
}

// Simplified evaluation request/response for the evaluation API route
export interface EvaluationRequest {
  lessonId: string;
  phase: LessonPhase;
  targetText: string;
  userResponse?: string;
  language?: string;
  conversationHistory?: ConversationTurn[];
  vocabularyRatings?: VocabularyRating[];
  exerciseResults?: ExerciseAttempt[];
}

export interface EvaluationResponse {
  transcription: string;
  evaluation: ComprehensionEvaluation;
  conversationTurn?: {
    message: string;
    vocabularyHint?: VocabularyHint;
    questionType:
      | "comprehension"
      | "clarification"
      | "vocabulary"
      | "expansion";
  };
}
