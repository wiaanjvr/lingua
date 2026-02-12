/**
 * Story Generation Algorithm
 * Generates comprehensible input stories using 95% known words + 5% new words
 * Integrates with spaced repetition for optimal learning
 */

import { UserWord, ProficiencyLevel, StoryGenerationParams } from "@/types";
import { selectWordsForStory, isWordDue } from "./algorithm";

/**
 * Common French words by frequency (top 1000)
 * Used for generating stories when user has limited vocabulary
 */
const COMMON_FRENCH_WORDS = [
  "le",
  "de",
  "un",
  "être",
  "et",
  "à",
  "il",
  "avoir",
  "ne",
  "je",
  "son",
  "que",
  "se",
  "qui",
  "ce",
  "dans",
  "en",
  "du",
  "elle",
  "au",
  "pour",
  "pas",
  "que",
  "vous",
  "par",
  "sur",
  "faire",
  "plus",
  "dire",
  "me",
  "on",
  "mon",
  "lui",
  "nous",
  "comme",
  "mais",
  "pouvoir",
  "avec",
  "tout",
  "y",
  "aller",
  "voir",
  "en",
  "bien",
  "où",
  "sans",
  "tu",
  "ou",
  "leur",
  "homme",
  "si",
  "deux",
  "moi",
  "autre",
  "notre",
  "savoir",
  "on",
  "aussi",
  "leur",
  "très",
  "dire",
  "elle",
  "si",
  "ces",
  "celui",
  "nouveau",
  "an",
  "monde",
  "année",
  "temps",
  "jour",
  "voir",
  "chose",
  "même",
  "vie",
  "sortir",
  "trois",
  "venir",
  "tout",
  "alors",
  "après",
  "vouloir",
  "français",
  "chez",
  "grand",
  "encore",
  "main",
  "partir",
  "ville",
  "croire",
  "demander",
  "fille",
  "quelque",
  "trouver",
  "rendre",
  "petit",
  "heure",
  "semaine",
  "œil",
  "poser",
  "cas",
  "bout",
  "prendre",
  "certain",
  "question",
  "premier",
  "fois",
];

export interface WordSelection {
  knownWords: string[]; // Words user already knows well
  reviewWords: string[]; // Words due for review
  newWords: string[]; // Brand new words to introduce
  allWords: string[]; // Combined list
}

/**
 * Select words for story generation based on user's vocabulary and SRS data
 */
export function selectWordsForGeneration(
  userWords: UserWord[],
  params: StoryGenerationParams,
): WordSelection {
  const { word_count_target, new_word_percentage, prioritize_review } = params;

  // Separate words by status
  const masteredAndKnown = userWords.filter(
    (w) => w.status === "known" || w.status === "mastered",
  );
  const learning = userWords.filter((w) => w.status === "learning");
  const dueWords = userWords.filter((w) => isWordDue(w));
  const totalKnownWords = masteredAndKnown.length + learning.length;

  // For beginners with few/no words, use all new words
  if (totalKnownWords < 10) {
    const existingLemmas = new Set(userWords.map((w) => w.lemma.toLowerCase()));
    const newWordCandidates = COMMON_FRENCH_WORDS.filter(
      (word) => !existingLemmas.has(word.toLowerCase()),
    );
    const newWords = newWordCandidates.slice(0, word_count_target);

    return {
      knownWords: [],
      reviewWords: [],
      newWords: newWords,
      allWords: newWords,
    };
  }

  // Calculate word counts
  const newWordCount = Math.floor(word_count_target * new_word_percentage);
  const knownWordCount = word_count_target - newWordCount;

  // Select review words (prioritize overdue words)
  let reviewWords: UserWord[] = [];
  if (prioritize_review && dueWords.length > 0) {
    const reviewCount = Math.min(
      Math.floor(knownWordCount * 0.4), // 40% of known words should be reviews
      dueWords.length,
    );
    reviewWords = selectWordsForStory(dueWords, reviewCount, true);
  }

  // Select known words
  const remainingKnownCount = knownWordCount - reviewWords.length;
  const availableKnown = [...masteredAndKnown, ...learning].filter(
    (w) => !reviewWords.find((r) => r.id === w.id),
  );
  const knownWords = selectWordsForStory(
    availableKnown,
    remainingKnownCount,
    false, // Random selection for variety
  );

  // If we don't have enough known words, add more new words to compensate
  const actualKnownCount = knownWords.length + reviewWords.length;
  const shortfall = word_count_target - actualKnownCount;
  const adjustedNewWordCount = Math.max(newWordCount, shortfall);

  // Select new words from common words not yet learned
  const existingLemmas = new Set(userWords.map((w) => w.lemma.toLowerCase()));
  const newWordCandidates = COMMON_FRENCH_WORDS.filter(
    (word) => !existingLemmas.has(word.toLowerCase()),
  );
  const newWords = newWordCandidates.slice(0, adjustedNewWordCount);

  return {
    knownWords: knownWords.map((w) => w.lemma),
    reviewWords: reviewWords.map((w) => w.lemma),
    newWords: newWords,
    allWords: [
      ...knownWords.map((w) => w.lemma),
      ...reviewWords.map((w) => w.lemma),
      ...newWords,
    ],
  };
}

/**
 * Generate story prompt for AI (OpenAI, Claude, etc.)
 */
export function generateStoryPrompt(
  wordSelection: WordSelection,
  params: StoryGenerationParams,
): string {
  const { level, topic, word_count_target, language } = params;

  // If no words selected (beginner case), use top common words
  const vocabularyToUse =
    wordSelection.allWords.length > 0
      ? wordSelection.allWords
      : COMMON_FRENCH_WORDS.slice(0, word_count_target);

  const prompt = `Generate a short story in ${language} for a ${level} language learner.

**Requirements:**
- Word count: approximately ${word_count_target} words
- Use ONLY words from the provided vocabulary list
- The story should be engaging and natural
- Topic: ${topic || "any interesting topic"}
${wordSelection.newWords.length > 0 ? `- Include ALL new words naturally in the story` : ""}

**Vocabulary to use (REQUIRED):**
${vocabularyToUse.join(", ")}

${
  wordSelection.newWords.length > 0
    ? `**New words to introduce (must appear in story):**
${wordSelection.newWords.join(", ")}`
    : ""
}

**Important guidelines:**
1. Use simple sentence structures appropriate for ${level} level
2. Each new word should appear at least once, ideally 2-3 times
3. New words should be understandable from context
4. The story should be coherent and interesting
5. Use only the vocabulary provided - do not add complex words
6. Make the story relevant and engaging for adult learners

Please write the story now. Return ONLY the story text in ${language}, no additional commentary.`;

  return prompt;
}

/**
 * Generate story metadata for database storage
 */
export function createStoryMetadata(
  wordSelection: WordSelection,
  storyText: string,
  params: StoryGenerationParams,
) {
  // Count actual words in story
  const wordCount = storyText.split(/\s+/).length;

  return {
    language: params.language,
    level: params.level,
    word_count: wordCount,
    new_words: wordSelection.newWords,
    review_words: wordSelection.reviewWords,
    known_words: wordSelection.knownWords,
    generation_params: {
      target_word_count: params.word_count_target,
      new_word_percentage: params.new_word_percentage,
      prioritize_review: params.prioritize_review,
      topic: params.topic,
    },
  };
}

/**
 * Validate that generated story meets requirements
 */
export function validateGeneratedStory(
  storyText: string,
  wordSelection: WordSelection,
  targetWordCount: number,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check word count
  const actualWordCount = storyText.split(/\s+/).length;
  if (
    actualWordCount < targetWordCount * 0.7 ||
    actualWordCount > targetWordCount * 1.5
  ) {
    errors.push(
      `Word count ${actualWordCount} is outside acceptable range (${Math.floor(targetWordCount * 0.7)}-${Math.floor(targetWordCount * 1.5)})`,
    );
  }

  // Check that new words are present
  const storyLower = storyText.toLowerCase();
  const missingNewWords = wordSelection.newWords.filter(
    (word) => !storyLower.includes(word.toLowerCase()),
  );

  if (missingNewWords.length > 0) {
    errors.push(`Missing new words: ${missingNewWords.join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parse story text and identify words for interactive highlighting
 */
export function parseStoryWords(
  storyText: string,
  userWords: UserWord[],
  newWords: string[],
): Array<{
  word: string;
  isNew: boolean;
  isDueForReview: boolean;
  index: number;
}> {
  // Simple word tokenization (can be improved with proper NLP)
  const words = storyText.split(/(\s+|[.,;:!?'"()])/);

  const userWordMap = new Map(userWords.map((w) => [w.lemma.toLowerCase(), w]));
  const newWordSet = new Set(newWords.map((w) => w.toLowerCase()));

  return words
    .map((word, index) => {
      const cleanWord = word.trim().toLowerCase();
      if (!cleanWord || /^\s*$/.test(word)) {
        return null;
      }

      const userWord = userWordMap.get(cleanWord);
      const isNew = newWordSet.has(cleanWord);
      const isDueForReview = userWord ? isWordDue(userWord) : false;

      return {
        word,
        isNew,
        isDueForReview,
        index,
      };
    })
    .filter((w): w is NonNullable<typeof w> => w !== null);
}

/**
 * Get recommended word count based on proficiency level
 */
export function getRecommendedWordCount(level: ProficiencyLevel): number {
  const wordCounts: Record<ProficiencyLevel, number> = {
    A0: 50,
    A1: 75,
    A2: 100,
    B1: 150,
    B2: 200,
    C1: 250,
    C2: 300,
  };

  return wordCounts[level] || 100;
}

/**
 * Get recommended new word percentage based on proficiency level
 */
export function getRecommendedNewWordPercentage(
  level: ProficiencyLevel,
): number {
  const percentages: Record<ProficiencyLevel, number> = {
    A0: 0.1, // 10% new words for absolute beginners
    A1: 0.08,
    A2: 0.05,
    B1: 0.05,
    B2: 0.03,
    C1: 0.02,
    C2: 0.02,
  };

  return percentages[level] || 0.05;
}
