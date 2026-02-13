/**
 * Seed script to populate user's initial French vocabulary
 * Seeds known words based on placement test level:
 * - A0: 0 words, A1: 100 words, A2: 500 words, B1+: 1000 words (max available)
 *
 * Run automatically after placement test completion
 */

import { createClient } from "@/lib/supabase/client";
import commonFrenchWords from "@/data/common-french-words.json";
import { ProficiencyLevel } from "@/types";

/**
 * Level to word count allocation
 * Based on placement test results, users get this many known words
 * Aligned with PROFICIENCY_THRESHOLDS in proficiency-calculator.ts
 */
export const LEVEL_WORD_ALLOCATION: Record<ProficiencyLevel, number> = {
  A0: 0, // Complete beginners start with no known words
  A1: 100, // Matches A1 threshold
  A2: 500, // Matches A2 threshold
  B1: 1000, // Matches B1 threshold (capped to available words)
  B2: 1000, // Limited by common-french-words.json (1000 words max)
  C1: 1000, // Limited by common-french-words.json (1000 words max)
  C2: 1000, // Limited by common-french-words.json (1000 words max)
};

/**
 * Get words for a specific level from the common words list
 */
export function getWordsForLevel(
  level: ProficiencyLevel,
): typeof commonFrenchWords.words {
  const wordCount = LEVEL_WORD_ALLOCATION[level] || 0;
  return commonFrenchWords.words.slice(0, wordCount);
}

/**
 * Get all 1000 common French words
 */
export function getAllCommonWords(): typeof commonFrenchWords.words {
  return commonFrenchWords.words;
}

/**
 * Get just the word strings for a level (useful for story generation)
 */
export function getWordStringsForLevel(level: ProficiencyLevel): string[] {
  return getWordsForLevel(level).map((w) => w.word);
}

// Legacy exports for backwards compatibility
export const COMMON_FRENCH_WORDS_A0_A1 = commonFrenchWords.words
  .slice(0, 200)
  .map((w) => w.word);
export const COMMON_FRENCH_WORDS_A2_B1 = commonFrenchWords.words
  .slice(200, 350)
  .map((w) => w.word);

/**
 * Seed user vocabulary with known words based on placement level
 * Words are marked as "known" status with proper SRS data
 */
export async function seedUserVocabulary(
  userId: string,
  level: ProficiencyLevel,
  language: string = "fr",
) {
  const supabase = createClient();
  const wordsToSeed = getWordsForLevel(level);

  if (wordsToSeed.length === 0) {
    console.log(`Level ${level} has no words to seed`);
    return 0;
  }

  // Prepare insert data - these are KNOWN words from placement
  const now = new Date().toISOString();
  // Set next review far in the future since these are already known
  const futureReview = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const wordsData = wordsToSeed.map((wordData) => ({
    user_id: userId,
    word: wordData.word,
    lemma: wordData.lemma,
    language: language,
    part_of_speech: wordData.pos,
    frequency_rank: wordData.rank,
    // Mark as known with solid SRS data
    status: "known",
    easiness_factor: 2.5,
    repetitions: 5, // Already known means they've effectively reviewed it
    interval_days: 30,
    next_review: futureReview,
    times_seen: 5,
    times_rated: 5,
    first_seen: now,
    last_seen: now,
  }));

  // Insert in batches to avoid timeout
  const batchSize = 100;
  let totalInserted = 0;

  for (let i = 0; i < wordsData.length; i += batchSize) {
    const batch = wordsData.slice(i, i + batchSize);

    const { error, data } = await supabase.from("user_words").upsert(batch, {
      onConflict: "user_id,word,language",
      ignoreDuplicates: true,
    });

    if (error) {
      console.error(`Error seeding batch ${i / batchSize + 1}:`, error);
      throw error;
    }

    totalInserted += batch.length;
  }

  console.log(
    `Successfully seeded ${totalInserted} known words for user ${userId} at level ${level}`,
  );
  return totalInserted;
}

/**
 * Mark specific words as known (for manual updates)
 */
export async function markWordsAsKnown(
  userId: string,
  words: string[],
  language: string = "fr",
) {
  const supabase = createClient();
  const futureReview = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { error } = await supabase
    .from("user_words")
    .update({
      status: "known",
      repetitions: 5,
      easiness_factor: 2.5,
      interval_days: 30,
      next_review: futureReview,
      times_rated: 5,
    })
    .eq("user_id", userId)
    .eq("language", language)
    .in("word", words);

  if (error) {
    console.error("Error marking words as known:", error);
    throw error;
  }

  console.log(`Marked ${words.length} words as known`);
  return words.length;
}

/**
 * Get user's known words count
 */
export async function getKnownWordCount(
  userId: string,
  language: string = "fr",
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("user_words")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("language", language)
    .in("status", ["known", "mastered"]);

  if (error) {
    console.error("Error getting known word count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Get user's known word strings (for story generation)
 */
export async function getUserKnownWords(
  userId: string,
  language: string = "fr",
): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_words")
    .select("word")
    .eq("user_id", userId)
    .eq("language", language)
    .in("status", ["known", "mastered", "learning"]);

  if (error) {
    console.error("Error getting known words:", error);
    return [];
  }

  return data?.map((w) => w.word) || [];
}
