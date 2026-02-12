/**
 * Comprehension Evaluation Service
 *
 * Evaluates user's UNDERSTANDING of content, NOT pronunciation or grammar.
 * The goal is to assess comprehension accuracy.
 */

import {
  ComprehensionEvaluation,
  VocabularyHint,
  Lesson,
  LessonWord,
} from "@/types/lesson";

// ===== EVALUATION CONSTANTS =====

const COMPREHENSION_WEIGHT = 0.6; // Main focus
const DETAIL_WEIGHT = 0.3; // Supporting details
const LANGUAGE_USE_WEIGHT = 0.1; // Bonus for target language use (not penalty)

// ===== MAIN EVALUATION FUNCTION =====

/**
 * Evaluate user's comprehension based on their verbal response
 *
 * @param transcript - What the user said (transcribed)
 * @param lesson - The lesson content
 * @param phase - Whether this is the initial check or final assessment
 */
export function evaluateComprehension(
  transcript: string,
  lesson: Lesson,
  phase: "verbal-check" | "final-assessment",
): ComprehensionEvaluation {
  const normalizedResponse = normalizeText(transcript);

  // Extract key concepts from lesson
  const keyConcepts = extractKeyConcepts(lesson);

  // Check which concepts user mentioned
  const understoodConcepts = keyConcepts.filter((concept) =>
    conceptMentioned(normalizedResponse, concept),
  );

  const missedConcepts = keyConcepts.filter(
    (concept) => !conceptMentioned(normalizedResponse, concept),
  );

  // Check for vocabulary usage
  const targetWords = lesson.words
    .filter((w) => w.isNew || w.isDueForReview)
    .map((w) => w.word.toLowerCase());

  const vocabularyUsed = targetWords.filter((word) =>
    normalizedResponse.includes(word),
  );

  // Calculate scores
  const comprehensionScore = calculateComprehensionScore(
    understoodConcepts.length,
    keyConcepts.length,
  );

  const detailScore = calculateDetailScore(normalizedResponse, lesson);
  const languageUseScore = calculateLanguageUseScore(
    normalizedResponse,
    lesson.language,
  );

  // Overall score (weighted)
  const overallScore = Math.round(
    comprehensionScore * COMPREHENSION_WEIGHT +
      detailScore * DETAIL_WEIGHT +
      languageUseScore * LANGUAGE_USE_WEIGHT,
  );

  // Generate follow-up questions for conversation phase
  const followUpQuestions = generateFollowUpQuestions(missedConcepts, lesson);

  // Generate vocabulary hints
  const vocabularyHints = generateVocabularyHintsFromMissed(
    lesson.words.filter((w) => w.isNew),
    understoodConcepts,
  );

  // Generate feedback message
  const feedbackMessage = generateFeedbackMessage(
    comprehensionScore,
    understoodConcepts,
    missedConcepts,
    phase,
  );

  const encouragement = generateEncouragement(overallScore, phase);

  return {
    comprehensionScore,
    detailScore,
    languageUseScore,
    understoodConcepts,
    missedConcepts,
    vocabularyUsed,
    suggestedVocabulary: getSuggestedVocabulary(missedConcepts, lesson),
    followUpQuestions,
    vocabularyHints,
    feedbackMessage,
    encouragement,
  };
}

// ===== HELPER FUNCTIONS =====

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents for matching
    .trim();
}

/**
 * Extract key concepts from the lesson for comprehension checking
 */
function extractKeyConcepts(lesson: Lesson): string[] {
  // In production, this would use NLP/AI to extract key concepts
  // For now, use a simple approach based on content analysis

  const concepts: string[] = [];
  const text = lesson.targetText.toLowerCase();

  // Extract nouns and verbs as potential concepts
  const sentences = text.split(/[.!?]+/);

  for (const sentence of sentences) {
    if (sentence.trim().length > 10) {
      // Add simplified concept for each meaningful sentence
      const simplified = sentence.trim().slice(0, 50);
      concepts.push(simplified);
    }
  }

  // Also track new words as concepts
  for (const word of lesson.words.filter((w) => w.isNew)) {
    concepts.push(word.word.toLowerCase());
  }

  return concepts.slice(0, 5); // Top 5 concepts
}

/**
 * Check if a concept was mentioned (fuzzy matching)
 */
function conceptMentioned(response: string, concept: string): boolean {
  const conceptWords = concept.split(/\s+/).filter((w) => w.length > 3);

  // Check if at least 50% of concept words are mentioned
  const mentionedCount = conceptWords.filter((word) =>
    response.includes(word),
  ).length;

  return mentionedCount >= Math.ceil(conceptWords.length * 0.5);
}

function calculateComprehensionScore(
  understood: number,
  total: number,
): number {
  if (total === 0) return 50; // Default if no concepts extracted
  return Math.round((understood / total) * 100);
}

function calculateDetailScore(response: string, lesson: Lesson): number {
  // Longer, more detailed responses get higher scores
  const wordCount = response.split(/\s+/).length;
  const expectedMinWords = 10;
  const expectedMaxWords = 50;

  if (wordCount < expectedMinWords) {
    return Math.round((wordCount / expectedMinWords) * 60);
  }
  if (wordCount > expectedMaxWords) {
    return 100;
  }

  return Math.round(
    60 +
      ((wordCount - expectedMinWords) / (expectedMaxWords - expectedMinWords)) *
        40,
  );
}

function calculateLanguageUseScore(
  response: string,
  targetLanguage: string,
): number {
  // Bonus points for using target language
  // This is NOT a penalty - any language is acceptable

  const frenchIndicators = [
    "le",
    "la",
    "les",
    "un",
    "une",
    "des",
    "de",
    "du",
    "je",
    "tu",
    "il",
    "elle",
    "nous",
    "vous",
    "ils",
    "elles",
    "est",
    "sont",
    "a",
    "ont",
    "fait",
    "va",
    "vont",
    "très",
    "bien",
    "mais",
    "et",
    "ou",
    "que",
    "qui",
  ];

  const responseWords = response.toLowerCase().split(/\s+/);
  const frenchWordCount = responseWords.filter((w) =>
    frenchIndicators.includes(w),
  ).length;

  // Give bonus for French usage, max 100
  return Math.min(100, frenchWordCount * 20);
}

/**
 * Generate follow-up questions for the conversation phase
 */
function generateFollowUpQuestions(
  missedConcepts: string[],
  lesson: Lesson,
): string[] {
  const questions: string[] = [];

  if (missedConcepts.length > 0) {
    // Ask about missed concepts
    questions.push(
      "Can you tell me more about what you heard?",
      "What details do you remember from the audio?",
    );
  }

  // Always include some guiding questions
  questions.push(
    "What was the main idea or situation?",
    "Were there any words you didn't understand?",
    "How would you summarize what happened?",
  );

  return questions.slice(0, 3);
}

function generateVocabularyHintsFromMissed(
  newWords: LessonWord[],
  understoodConcepts: string[],
): VocabularyHint[] {
  return newWords.slice(0, 3).map((word) => ({
    word: word.word,
    translation: word.translation || "See dictionary",
    context: `This word appeared in the lesson`,
    hint: `Focus on how "${word.word}" connects to the meaning`,
  }));
}

function getSuggestedVocabulary(
  missedConcepts: string[],
  lesson: Lesson,
): string[] {
  // Suggest vocabulary related to missed concepts
  return lesson.words
    .filter((w) => w.isNew || w.isDueForReview)
    .map((w) => w.word)
    .slice(0, 5);
}

function generateFeedbackMessage(
  score: number,
  understood: string[],
  missed: string[],
  phase: "verbal-check" | "final-assessment",
): string {
  if (phase === "verbal-check") {
    if (score >= 80) {
      return "Excellent! You understood the main points very well. Let's explore some details together.";
    } else if (score >= 60) {
      return "Good job! You got the general idea. Let's work through some parts together to fill in the gaps.";
    } else if (score >= 40) {
      return "You're on the right track! Let me help you understand more through our conversation.";
    } else {
      return "Let's work through this together. I'll ask some guiding questions to help you understand.";
    }
  } else {
    // Final assessment
    if (score >= 80) {
      return "Outstanding! Your comprehension has really improved. You've mastered this content!";
    } else if (score >= 60) {
      return "Great progress! You've learned a lot from this lesson. Keep up the excellent work!";
    } else {
      return "Good effort! Each lesson builds your understanding. Review this content again soon.";
    }
  }
}

function generateEncouragement(score: number, phase: string): string {
  const encouragements = {
    high: [
      "Your listening skills are impressive!",
      "You're developing excellent comprehension!",
      "Keep up this amazing progress!",
    ],
    medium: [
      "You're making steady progress!",
      "Each lesson strengthens your understanding!",
      "Great job pushing through the challenge!",
    ],
    low: [
      "Learning takes time - you're doing great!",
      "Every attempt builds your skills!",
      "Persistence is key - keep going!",
    ],
  };

  const level = score >= 70 ? "high" : score >= 40 ? "medium" : "low";
  const options = encouragements[level];
  return options[Math.floor(Math.random() * options.length)];
}

// ===== CONVERSATION RESPONSE GENERATION =====

/**
 * Generate a conversational response based on what user said
 */
export function generateConversationResponse(
  userMessage: string,
  lesson: Lesson,
  previousEvaluation?: ComprehensionEvaluation,
): {
  message: string;
  vocabularyHint?: VocabularyHint;
  questionType: "comprehension" | "clarification" | "vocabulary" | "expansion";
} {
  const normalizedMessage = normalizeText(userMessage);

  // Check if user is asking for help
  if (containsHelpRequest(normalizedMessage)) {
    const hint = getNextVocabularyHint(lesson, previousEvaluation);
    return {
      message: hint
        ? `Here's a helpful word: "${hint.word}" means "${hint.translation}". ${hint.hint}`
        : "Let me rephrase: What was the main thing happening in the audio?",
      vocabularyHint: hint || undefined,
      questionType: "vocabulary",
    };
  }

  // Check if user gave a short response
  if (normalizedMessage.split(/\s+/).length < 5) {
    return {
      message: "Can you tell me more? What details do you remember hearing?",
      questionType: "expansion",
    };
  }

  // Evaluate their response and provide guidance
  const evaluation = evaluateComprehension(userMessage, lesson, "verbal-check");

  if (evaluation.missedConcepts.length > 0) {
    const followUp =
      evaluation.followUpQuestions[0] || "What else did you notice?";
    return {
      message: `Good! ${followUp}`,
      questionType: "comprehension",
    };
  }

  return {
    message:
      "Excellent understanding! You've grasped the key points. Ready to continue?",
    questionType: "comprehension",
  };
}

function containsHelpRequest(text: string): boolean {
  const helpWords = [
    "help",
    "hint",
    "aide",
    "don't understand",
    "ne comprends pas",
    "what does",
    "meaning",
  ];
  return helpWords.some((word) => text.includes(word));
}

function getNextVocabularyHint(
  lesson: Lesson,
  previousEvaluation?: ComprehensionEvaluation,
): VocabularyHint | null {
  const newWords = lesson.words.filter((w) => w.isNew);
  if (newWords.length === 0) return null;

  const word = newWords[0];
  return {
    word: word.word,
    translation: word.translation || "unknown",
    context: "From this lesson",
    hint: "Listen for this word in context",
  };
}
