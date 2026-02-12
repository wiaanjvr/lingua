/**
 * Lesson Engine - Generates comprehensible input lessons
 *
 * Core principle: ~95% known words + ~5% new words = optimal comprehension
 * Prioritizes words due for review per spaced repetition schedule
 */

import {
  Lesson,
  LessonWord,
  LessonGenerationParams,
  Exercise,
  ExerciseType,
  VocabularyHint,
} from "@/types/lesson";
import { UserWord, ProficiencyLevel } from "@/types";
import { lemmatize, tokenize, handleContractions } from "@/lib/srs/word-utils";
import { isWordDue, getWordPriority } from "@/lib/srs/algorithm";
import commonFrenchWords from "@/data/common-french-words.json";

// Common French words ordered by frequency (from JSON data)
export const COMMON_FRENCH_WORDS_ORDERED = commonFrenchWords.words.map(
  (w) => w.word,
);

// ===== WORD COUNT RECOMMENDATIONS BY LEVEL =====

export const WORD_COUNT_BY_LEVEL: Record<ProficiencyLevel, number> = {
  A0: 15, // Very short phrases
  A1: 30, // Short paragraphs
  A2: 50, // Medium paragraphs
  B1: 80, // Longer paragraphs
  B2: 120, // Multiple paragraphs
  C1: 180, // Full passages
  C2: 250, // Complex passages
};

export const NEW_WORD_PERCENTAGE_BY_LEVEL: Record<ProficiencyLevel, number> = {
  A0: 0.1, // 10% - more new words for beginners
  A1: 0.08,
  A2: 0.06,
  B1: 0.05,
  B2: 0.04,
  C1: 0.03,
  C2: 0.02,
};

// ===== LESSON GENERATION =====

export interface WordSelection {
  knownWords: string[]; // Words user knows well (mastered/known)
  reviewWords: string[]; // Words due for SRS review
  newWords: string[]; // Brand new words to introduce
  learningWords: string[]; // Words in learning phase
}

/**
 * Select words for lesson generation based on user's vocabulary
 */
export function selectWordsForLesson(
  userWords: UserWord[],
  params: LessonGenerationParams,
): WordSelection {
  const { targetWordCount, newWordPercentage, reviewWordPriority } = params;

  // Calculate target counts
  const newWordTarget = Math.max(
    1,
    Math.floor(targetWordCount * newWordPercentage),
  );
  const reviewWordTarget = Math.floor(targetWordCount * 0.15); // 15% review words
  const knownWordTarget = targetWordCount - newWordTarget - reviewWordTarget;

  // Categorize user's words
  const knownWords = userWords.filter(
    (w) => w.status === "known" || w.status === "mastered",
  );
  const learningWords = userWords.filter((w) => w.status === "learning");
  const dueWords = userWords.filter((w) => isWordDue(w));
  const totalKnownWords = knownWords.length + learningWords.length;

  // Special case: Complete beginner with 0 known words - use only 5 simple words
  if (totalKnownWords === 0) {
    const existingLemmas = new Set(userWords.map((w) => w.lemma.toLowerCase()));
    const newWordCandidates = COMMON_FRENCH_WORDS_ORDERED.filter(
      (word) => !existingLemmas.has(word.toLowerCase()),
    );
    const selectedNewWords = newWordCandidates.slice(0, 5);

    return {
      knownWords: [],
      reviewWords: [],
      newWords: selectedNewWords,
      learningWords: [],
    };
  }

  // Sort by priority for selection
  const sortedDueWords = [...dueWords].sort(
    (a, b) => getWordPriority(b) - getWordPriority(a),
  );

  // Select review words (most overdue first)
  const selectedReviewWords = sortedDueWords
    .slice(0, Math.min(reviewWordTarget, sortedDueWords.length))
    .map((w) => w.lemma);

  // Select known words (random selection for variety)
  const availableKnown = knownWords.filter(
    (w) => !selectedReviewWords.includes(w.lemma),
  );
  const shuffledKnown = shuffleArray(availableKnown);
  const selectedKnownWords = shuffledKnown
    .slice(0, Math.min(knownWordTarget, shuffledKnown.length))
    .map((w) => w.lemma);

  // Get lemmas we already have
  const existingLemmas = new Set(userWords.map((w) => w.lemma.toLowerCase()));

  // Select new words from common words list
  const newWordCandidates = COMMON_FRENCH_WORDS_ORDERED.filter(
    (word) => !existingLemmas.has(word.toLowerCase()),
  );
  const selectedNewWords = newWordCandidates.slice(0, newWordTarget);

  return {
    knownWords: selectedKnownWords,
    reviewWords: selectedReviewWords,
    newWords: selectedNewWords,
    learningWords: learningWords.map((w) => w.lemma),
  };
}

/**
 * Analyze a text and identify words by user knowledge
 */
export function analyzeTextWords(
  text: string,
  userWords: UserWord[],
  language: string = "fr",
): LessonWord[] {
  const tokens = tokenize(text);
  const userWordMap = new Map(userWords.map((w) => [w.lemma.toLowerCase(), w]));

  const lessonWords: LessonWord[] = [];
  let position = 0;

  for (const token of tokens) {
    // Skip punctuation and whitespace
    if (/^[\s.,;:!?'"()]+$/.test(token)) {
      position++;
      continue;
    }

    // Handle contractions
    const expanded = handleContractions(token);

    for (const word of expanded) {
      if (word.length < 2) continue;

      const lemma = lemmatize(word, language);
      const userWord = userWordMap.get(lemma.toLowerCase());

      const lessonWord: LessonWord = {
        word,
        lemma,
        isNew: !userWord,
        isDueForReview: userWord ? isWordDue(userWord) : false,
        userKnowledge: userWord?.status,
        frequencyRank: userWord?.frequency_rank,
        position,
      };

      lessonWords.push(lessonWord);
      position++;
    }
  }

  return lessonWords;
}

/**
 * Calculate comprehension percentage based on word analysis
 */
export function calculateComprehension(words: LessonWord[]): number {
  if (words.length === 0) return 0;

  const knownCount = words.filter(
    (w) =>
      w.userKnowledge === "known" ||
      w.userKnowledge === "mastered" ||
      w.userKnowledge === "learning",
  ).length;

  return Math.round((knownCount / words.length) * 100);
}

/**
 * Generate the prompt for AI story/lesson generation
 */
export function generateLessonPrompt(
  wordSelection: WordSelection,
  params: LessonGenerationParams,
  level: ProficiencyLevel,
  language: string,
): string {
  const { targetWordCount, topicPreference, grammarFocus } = params;

  // Build word requirements
  const mustUseWords = [
    ...wordSelection.reviewWords,
    ...wordSelection.newWords,
  ];
  const canUseWords = wordSelection.knownWords;

  // Special case: Complete beginner with 0 known words
  if (canUseWords.length === 0 && wordSelection.learningWords.length === 0) {
    const simpleWords = wordSelection.newWords.slice(0, 5);

    const prompt = `Generate a single simple sentence in ${language} for an absolute beginner.

**🚨 CRITICAL: COMPLETE BEGINNER - SINGLE SENTENCE ONLY 🚨**

**REQUIREMENTS:**
- Generate ONLY ONE sentence
- Use MAXIMUM 5 words total (including articles)
- Use ONLY the most basic, common words from this list: ${simpleWords.join(", ")}
- The sentence must be extremely simple and clear
- Use present tense only
- Example structure: "Je suis Marie" or "Le chat dort"
- Level: ${level} (${getLevelDescription(level)})

**FORBIDDEN:**
- Do NOT write a story or paragraph
- Do NOT use multiple sentences
- Do NOT use complex grammar
- Do NOT use words not in the provided list

Write the single sentence now. Return ONLY the sentence in ${language}, nothing else.`;

    return prompt;
  }

  // Calculate exact word distribution for 95%/5% ratio
  const targetKnownWordOccurrences = Math.floor(targetWordCount * 0.95);
  const targetNewWordOccurrences = Math.ceil(targetWordCount * 0.05);

  let prompt = `Generate a natural ${language} text for ${level} learners.

🚨 CRITICAL: 95% KNOWN / 5% NEW WORD RATIO 🚨
This is COMPREHENSIBLE INPUT - the learner MUST understand 95% of the content!

EXACT WORD COUNT REQUIREMENTS:
- Total length: ~${targetWordCount} words
- Words from KNOWN list: ~${targetKnownWordOccurrences} words (95%)
- Words from NEW/REVIEW lists: ~${targetNewWordOccurrences} words MAXIMUM (5%)

ABSOLUTE VOCABULARY RESTRICTION:
You are STRICTLY FORBIDDEN from using words outside these lists:
${canUseWords.length > 0 ? `- KNOWN words (USE FOR 95%): ${canUseWords.slice(0, 50).join(", ")}${canUseWords.length > 50 ? `... (${canUseWords.length} total)` : ""}` : ""}
${mustUseWords.length > 0 ? `- NEW/REVIEW words (USE FOR ONLY 5%): ${mustUseWords.join(", ")}` : ""}

DO NOT use synonyms, DO NOT use related words not in the lists above.
Exception: Basic articles (le/la/les/un/une/des) and conjunctions (et/ou/mais) are allowed.

REQUIREMENTS:
- Level: ${level} (${getLevelDescription(level)})
${topicPreference ? `- Topic: ${topicPreference}` : "- Topic: everyday situations"}
${grammarFocus?.length ? `- Grammar focus: ${grammarFocus.join(", ")}` : ""}
- Write engaging, natural content with a complete narrative
- Use simple sentence structures appropriate for ${level}
- Make new words understandable from context
- Include each new/review word 2-3 times naturally

VERIFICATION:
✓ Count every content word
✓ Verify 95% from KNOWN list
✓ Verify only 5% from NEW/REVIEW list
✓ No words outside the provided lists

OUTPUT: Only the ${language} text, nothing else.`;

  return prompt;
}

/**
 * Get level description for prompts
 */
function getLevelDescription(level: ProficiencyLevel): string {
  const descriptions: Record<ProficiencyLevel, string> = {
    A0: "absolute beginner - very basic phrases",
    A1: "beginner - simple present tense, basic vocabulary",
    A2: "elementary - simple past, common expressions",
    B1: "intermediate - various tenses, opinions and feelings",
    B2: "upper intermediate - complex sentences, abstract topics",
    C1: "advanced - nuanced expression, professional topics",
    C2: "mastery - sophisticated language, cultural references",
  };
  return descriptions[level];
}

// ===== EXERCISE GENERATION =====

/**
 * Generate exercises for a lesson
 */
export function generateExercisesForLesson(
  lesson: Lesson,
  count: number = 8,
): Exercise[] {
  const exercises: Exercise[] = [];

  // Comprehension questions (3)
  const comprehensionExercises = generateComprehensionExercises(lesson, 3);
  exercises.push(...comprehensionExercises);

  // Vocabulary exercises (3)
  const vocabularyExercises = generateVocabularyExercises(lesson, 3);
  exercises.push(...vocabularyExercises);

  // Grammar exercises (2)
  const grammarExercises = generateGrammarExercises(lesson, 2);
  exercises.push(...grammarExercises);

  return shuffleArray(exercises).slice(0, count);
}

/**
 * Shuffles options array and returns new correct answer index
 */
function shuffleOptions(
  options: string[],
  correctAnswer: number,
): {
  shuffledOptions: string[];
  newCorrectAnswer: number;
} {
  const correctOption = options[correctAnswer];
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  const newIndex = shuffled.indexOf(correctOption);

  return {
    shuffledOptions: shuffled,
    newCorrectAnswer: newIndex,
  };
}

function generateComprehensionExercises(
  lesson: Lesson,
  count: number,
): Exercise[] {
  // These would ideally be generated by AI based on the lesson content
  // For now, returning template exercises
  const options = ["Option A", "Option B", "Option C", "Option D"];
  const { shuffledOptions, newCorrectAnswer } = shuffleOptions(options, 0);

  return [
    {
      id: `comp-${Date.now()}-1`,
      lessonId: lesson.id,
      type: "multiple-choice",
      question: "What is the main topic of this passage?",
      options: shuffledOptions,
      correctAnswer: newCorrectAnswer,
      explanation: "Based on the content of the passage.",
      focusArea: "comprehension",
      difficulty: "medium",
    },
  ];
}

function generateVocabularyExercises(
  lesson: Lesson,
  count: number,
): Exercise[] {
  const exercises: Exercise[] = [];
  const newWords = lesson.words.filter((w) => w.isNew || w.isDueForReview);

  for (const word of newWords.slice(0, count)) {
    const options = [
      word.translation || "meaning",
      "wrong1",
      "wrong2",
      "wrong3",
    ];
    const { shuffledOptions, newCorrectAnswer } = shuffleOptions(options, 0);

    exercises.push({
      id: `vocab-${Date.now()}-${word.position}`,
      lessonId: lesson.id,
      type: "word-definition",
      question: `What does "${word.word}" mean?`,
      targetWord: word.word,
      options: shuffledOptions,
      correctAnswer: newCorrectAnswer,
      focusArea: "vocabulary",
      difficulty: "easy",
    });
  }

  return exercises;
}

function generateGrammarExercises(lesson: Lesson, count: number): Exercise[] {
  const options = ["Option A", "Option B", "Option C"];
  const { shuffledOptions, newCorrectAnswer } = shuffleOptions(options, 0);

  return [
    {
      id: `grammar-${Date.now()}-1`,
      lessonId: lesson.id,
      type: "grammar-choice",
      question: "Select the grammatically correct option:",
      options: shuffledOptions,
      correctAnswer: newCorrectAnswer,
      grammarNote: "Grammar explanation here.",
      focusArea: "grammar",
      difficulty: "medium",
    },
  ];
}

// ===== VOCABULARY HINTS =====

/**
 * Generate vocabulary hints for words user struggled with
 */
export function generateVocabularyHints(
  words: LessonWord[],
  lessonText: string,
): VocabularyHint[] {
  const newWords = words.filter((w) => w.isNew);

  return newWords.map((word) => ({
    word: word.word,
    translation: word.translation || "unknown",
    context: extractWordContext(lessonText, word.word),
    hint: generateMemoryHint(word.word),
  }));
}

function extractWordContext(text: string, word: string): string {
  const sentences = text.split(/[.!?]+/);
  const sentence = sentences.find((s) =>
    s.toLowerCase().includes(word.toLowerCase()),
  );
  return sentence?.trim() || "";
}

function generateMemoryHint(word: string): string {
  // This would ideally use AI or a database of memory techniques
  return `Focus on the sound and how it's used in context.`;
}

// ===== UTILITY FUNCTIONS =====

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
