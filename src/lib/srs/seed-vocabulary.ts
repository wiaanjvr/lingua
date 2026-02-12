/**
 * Seed script to populate user's initial French vocabulary
 * Run this to give new users a head start with common words
 *
 * Usage (in browser console or as API endpoint):
 * - Navigate to /learn/srs
 * - Open browser console
 * - Copy and paste this script
 * - Or create an API endpoint that calls these functions
 */

import { createClient } from "@/lib/supabase/client";

/**
 * Most common 200 French words for beginners
 * These are high-frequency words that appear in everyday conversation
 */
export const COMMON_FRENCH_WORDS_A0_A1 = [
  // Articles & Pronouns (20)
  "le",
  "la",
  "les",
  "un",
  "une",
  "des",
  "je",
  "tu",
  "il",
  "elle",
  "nous",
  "vous",
  "ils",
  "elles",
  "on",
  "ce",
  "qui",
  "que",
  "quoi",
  "dont",

  // Essential Verbs (30)
  "être",
  "avoir",
  "faire",
  "dire",
  "aller",
  "voir",
  "savoir",
  "pouvoir",
  "vouloir",
  "venir",
  "falloir",
  "devoir",
  "prendre",
  "donner",
  "mettre",
  "parler",
  "passer",
  "demander",
  "trouver",
  "aimer",
  "regarder",
  "appeler",
  "laisser",
  "suivre",
  "vivre",
  "tenir",
  "porter",
  "arriver",
  "croire",
  "penser",

  // Common Nouns (50)
  "homme",
  "femme",
  "enfant",
  "personne",
  "ami",
  "famille",
  "jour",
  "année",
  "temps",
  "heure",
  "moment",
  "fois",
  "chose",
  "vie",
  "monde",
  "pays",
  "ville",
  "maison",
  "chambre",
  "porte",
  "main",
  "œil",
  "tête",
  "corps",
  "cœur",
  "voix",
  "mot",
  "nom",
  "question",
  "réponse",
  "travail",
  "école",
  "livre",
  "table",
  "chaise",
  "rue",
  "eau",
  "pain",
  "café",
  "argent",
  "monsieur",
  "madame",
  "père",
  "mère",
  "fils",
  "fille",
  "frère",
  "sœur",
  "chat",
  "chien",

  // Adjectives (30)
  "bon",
  "mauvais",
  "grand",
  "petit",
  "jeune",
  "vieux",
  "beau",
  "joli",
  "nouveau",
  "autre",
  "même",
  "tout",
  "bien",
  "mal",
  "mieux",
  "pire",
  "facile",
  "difficile",
  "important",
  "possible",
  "impossible",
  "nécessaire",
  "heureux",
  "triste",
  "content",
  "fâché",
  "fatigué",
  "chaud",
  "froid",
  "blanc",
  "noir",

  // Prepositions & Conjunctions (25)
  "de",
  "à",
  "dans",
  "pour",
  "sur",
  "avec",
  "sans",
  "sous",
  "entre",
  "devant",
  "derrière",
  "avant",
  "après",
  "pendant",
  "depuis",
  "jusqu'à",
  "vers",
  "chez",
  "et",
  "ou",
  "mais",
  "donc",
  "car",
  "parce",
  "que",

  // Adverbs & Others (25)
  "très",
  "bien",
  "mal",
  "beaucoup",
  "peu",
  "plus",
  "moins",
  "assez",
  "trop",
  "aussi",
  "encore",
  "déjà",
  "toujours",
  "jamais",
  "souvent",
  "parfois",
  "maintenant",
  "aujourd'hui",
  "hier",
  "demain",
  "ici",
  "là",
  "où",
  "comment",
  "pourquoi",

  // Numbers (20)
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
  "dix",
  "vingt",
  "trente",
  "cent",
  "mille",
  "premier",
  "deuxième",
  "dernier",
  "prochain",
  "suivant",
  "autre",
];

/**
 * A2-B1 intermediate words
 */
export const COMMON_FRENCH_WORDS_A2_B1 = [
  // Verbs
  "comprendre",
  "expliquer",
  "commencer",
  "finir",
  "continuer",
  "réussir",
  "échouer",
  "apprendre",
  "enseigner",
  "étudier",
  "travailler",
  "jouer",
  "gagner",
  "perdre",
  "acheter",
  "vendre",
  "payer",
  "coûter",
  "manger",
  "boire",

  // Nouns
  "problème",
  "solution",
  "idée",
  "pensée",
  "sentiment",
  "raison",
  "exemple",
  "manière",
  "façon",
  "fois",
  "début",
  "fin",
  "milieu",
  "centre",
  "côté",
  "partie",
  "endroit",
  "place",
  "lieu",
  "espace",

  // Adjectives
  "intéressant",
  "important",
  "différent",
  "pareil",
  "même",
  "simple",
  "compliqué",
  "facile",
  "difficile",
  "rapide",
  "lent",
  "fort",
  "faible",
  "plein",
  "vide",
];

/**
 * Word frequency rankings (approximate)
 * Lower number = more common
 */
const WORD_FREQUENCIES: Record<string, number> = {
  // Top 50 most common
  le: 1,
  de: 2,
  un: 3,
  être: 4,
  et: 5,
  à: 6,
  il: 7,
  avoir: 8,
  ne: 9,
  je: 10,
  // ... (simplified for brevity)
};

/**
 * Seed user vocabulary with common words
 */
export async function seedUserVocabulary(
  userId: string,
  level: "A0" | "A1" | "A2" | "B1" = "A1",
  language: string = "fr",
) {
  const supabase = createClient();

  let wordsToSeed: string[] = [];

  // Select words based on level
  switch (level) {
    case "A0":
      wordsToSeed = COMMON_FRENCH_WORDS_A0_A1.slice(0, 50);
      break;
    case "A1":
      wordsToSeed = COMMON_FRENCH_WORDS_A0_A1.slice(0, 100);
      break;
    case "A2":
      wordsToSeed = [
        ...COMMON_FRENCH_WORDS_A0_A1,
        ...COMMON_FRENCH_WORDS_A2_B1.slice(0, 50),
      ];
      break;
    case "B1":
      wordsToSeed = [
        ...COMMON_FRENCH_WORDS_A0_A1,
        ...COMMON_FRENCH_WORDS_A2_B1,
      ];
      break;
  }

  // Prepare insert data
  const now = new Date().toISOString();
  const wordsData = wordsToSeed.map((word, index) => ({
    user_id: userId,
    word: word,
    lemma: word,
    language: language,
    easiness_factor: 2.5,
    repetitions: 0,
    interval_days: 0,
    next_review: now,
    status: "new",
    times_seen: 0,
    times_rated: 0,
    first_seen: now,
    last_seen: now,
    frequency_rank: WORD_FREQUENCIES[word] || 1000 + index,
  }));

  // Insert in batches to avoid timeout
  const batchSize = 50;
  for (let i = 0; i < wordsData.length; i += batchSize) {
    const batch = wordsData.slice(i, i + batchSize);

    const { error } = await supabase.from("user_words").upsert(batch, {
      onConflict: "user_id,word,language",
      ignoreDuplicates: true,
    });

    if (error) {
      console.error(`Error seeding batch ${i / batchSize + 1}:`, error);
      throw error;
    }
  }

  console.log(
    `Successfully seeded ${wordsData.length} words for user ${userId}`,
  );
  return wordsData.length;
}

/**
 * Mark certain words as "known" to simulate learning progress
 */
export async function markWordsAsKnown(
  userId: string,
  words: string[],
  language: string = "fr",
) {
  const supabase = createClient();

  for (const word of words) {
    const { error } = await supabase
      .from("user_words")
      .update({
        status: "known",
        repetitions: 5,
        easiness_factor: 2.5,
        interval_days: 30,
        next_review: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        times_rated: 5,
      })
      .eq("user_id", userId)
      .eq("word", word)
      .eq("language", language);

    if (error) {
      console.error(`Error updating word ${word}:`, error);
    }
  }

  console.log(`Marked ${words.length} words as known`);
}

/**
 * Example usage in a Next.js API route
 */
export const seedExample = {
  async handler(userId: string) {
    try {
      // Seed initial vocabulary
      await seedUserVocabulary(userId, "A1", "fr");

      // Mark most common 20 words as already known
      const knownWords = COMMON_FRENCH_WORDS_A0_A1.slice(0, 20);
      await markWordsAsKnown(userId, knownWords, "fr");

      return { success: true };
    } catch (error) {
      console.error("Seeding error:", error);
      return { success: false, error };
    }
  },
};
