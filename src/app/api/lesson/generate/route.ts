import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Lesson, LessonWord, GenerateLessonRequest } from "@/types/lesson";
import { ProficiencyLevel } from "@/types";
import OpenAI from "openai";
import {
  selectWordsForLesson,
  generateLessonPrompt,
  analyzeTextWords,
  calculateComprehension,
  WORD_COUNT_BY_LEVEL,
  NEW_WORD_PERCENTAGE_BY_LEVEL,
} from "@/lib/lesson/engine";

/**
 * Generate a mock lesson for development/fallback
 */
function generateMockLesson(
  userId: string,
  language: string,
  level: ProficiencyLevel,
): Omit<Lesson, "words"> {
  const mockTexts: Record<
    string,
    { title: string; text: string; translation: string }
  > = {
    A0: {
      title: "À la boulangerie",
      text: "Bonjour! Je voudrais un croissant, s'il vous plaît. C'est combien? Deux euros. Merci, au revoir!",
      translation:
        "Hello! I would like a croissant, please. How much is it? Two euros. Thank you, goodbye!",
    },
    A1: {
      title: "Une journée au parc",
      text: "Aujourd'hui, il fait beau. Marie va au parc avec son chien. Le chien s'appelle Max. Ils marchent sous les arbres. Marie voit un ami. Elle dit bonjour. Ils parlent un peu. Le chien joue avec une balle. Quelle belle journée!",
      translation:
        "Today, the weather is nice. Marie goes to the park with her dog. The dog is called Max. They walk under the trees. Marie sees a friend. She says hello. They talk a little. The dog plays with a ball. What a beautiful day!",
    },
    A2: {
      title: "Le restaurant",
      text: "Hier soir, je suis allé au restaurant avec ma famille. Nous avons choisi un restaurant italien près de chez nous. J'ai commandé des pâtes à la carbonara et mon frère a pris une pizza. Le serveur était très gentil. Après le repas, nous avons mangé une glace au chocolat. C'était délicieux!",
      translation:
        "Last night, I went to the restaurant with my family. We chose an Italian restaurant near our house. I ordered carbonara pasta and my brother had a pizza. The waiter was very nice. After the meal, we ate chocolate ice cream. It was delicious!",
    },
  };

  const content = mockTexts[level] || mockTexts["A1"];

  return {
    id: `lesson-${Date.now()}`,
    userId,
    targetText: content.text,
    translation: content.translation,
    audioUrl: "/audio/sample.mp3", // Would be TTS generated
    language,
    level,
    title: content.title,
    totalWords: content.text.split(/\s+/).length,
    newWordCount: 0,
    reviewWordCount: 0,
    knownWordCount: 0,
    comprehensionPercentage: 0,
    currentPhase: "audio-comprehension",
    listenCount: 0,
    completed: false,
    createdAt: new Date().toISOString(),
    generationParams: {
      targetWordCount: WORD_COUNT_BY_LEVEL[level],
      newWordPercentage: NEW_WORD_PERCENTAGE_BY_LEVEL[level],
      reviewWordPriority: true,
    },
  };
}

/**
 * POST /api/lesson/generate - Generate a new comprehensible input lesson
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      language = "fr",
      level,
      topic,
      wordCountTarget,
      prioritizeReview = true,
    } = body as GenerateLessonRequest;

    // Get user's profile for defaults
    const { data: profile } = await supabase
      .from("profiles")
      .select("proficiency_level, target_language")
      .eq("id", user.id)
      .single();

    const userLevel = (level ||
      profile?.proficiency_level ||
      "A1") as ProficiencyLevel;
    const targetLanguage = language || profile?.target_language || "fr";
    const wordCount = wordCountTarget || WORD_COUNT_BY_LEVEL[userLevel];
    const newWordPct = NEW_WORD_PERCENTAGE_BY_LEVEL[userLevel];

    // Fetch user's known words
    const { data: userWords, error: wordsError } = await supabase
      .from("user_words")
      .select("*")
      .eq("user_id", user.id)
      .eq("language", targetLanguage);

    if (wordsError) {
      console.error("Error fetching user words:", wordsError);
    }

    // Select words for the lesson
    const wordSelection = selectWordsForLesson(userWords || [], {
      targetWordCount: wordCount,
      newWordPercentage: newWordPct,
      reviewWordPriority: prioritizeReview,
    });

    let lessonText: string;
    let lessonTitle: string;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    // Generate lesson using OpenAI or fallback to mock
    if (openaiApiKey && openaiApiKey !== "your_openai_api_key") {
      try {
        const openai = new OpenAI({ apiKey: openaiApiKey });

        const prompt = generateLessonPrompt(
          wordSelection,
          {
            targetWordCount: wordCount,
            newWordPercentage: newWordPct,
            reviewWordPriority: prioritizeReview,
            topicPreference: topic,
          },
          userLevel,
          targetLanguage,
        );

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Generate natural ${targetLanguage} lessons for ${userLevel} learners. 
              Output JSON with format: {"title": "Lesson Title", "text": "The lesson text...", "translation": "English translation..."}`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: Math.min(wordCount * 4, 1000),
        });

        const response = JSON.parse(
          completion.choices[0]?.message?.content || "{}",
        );

        lessonText =
          response.text ||
          generateMockLesson(user.id, targetLanguage, userLevel).targetText;
        lessonTitle = response.title || "Lesson";
      } catch (aiError) {
        console.error("OpenAI error, using mock:", aiError);
        const mock = generateMockLesson(user.id, targetLanguage, userLevel);
        lessonText = mock.targetText;
        lessonTitle = mock.title;
      }
    } else {
      const mock = generateMockLesson(user.id, targetLanguage, userLevel);
      lessonText = mock.targetText;
      lessonTitle = mock.title;
    }

    // Analyze text to identify words
    const analyzedWords = analyzeTextWords(
      lessonText,
      userWords || [],
      targetLanguage,
    );
    const comprehension = calculateComprehension(analyzedWords);

    // Create lesson object
    const lesson: Lesson = {
      id: `lesson-${Date.now()}`,
      userId: user.id,
      targetText: lessonText,
      translation: "", // Would be generated or fetched
      audioUrl: "/audio/foundation/bonjour.mp3", // Placeholder - would be TTS
      language: targetLanguage,
      level: userLevel,
      title: lessonTitle,
      words: analyzedWords,
      totalWords: analyzedWords.length,
      newWordCount: analyzedWords.filter((w) => w.isNew).length,
      reviewWordCount: analyzedWords.filter((w) => w.isDueForReview).length,
      knownWordCount: analyzedWords.filter((w) => !w.isNew && !w.isDueForReview)
        .length,
      comprehensionPercentage: comprehension,
      currentPhase: "audio-comprehension",
      listenCount: 0,
      completed: false,
      createdAt: new Date().toISOString(),
      generationParams: {
        targetWordCount: wordCount,
        newWordPercentage: newWordPct,
        reviewWordPriority: prioritizeReview,
        topicPreference: topic,
      },
    };

    // Save lesson to database
    const { error: insertError } = await supabase.from("lessons").insert({
      id: lesson.id,
      user_id: user.id,
      title: lesson.title,
      target_text: lesson.targetText,
      translation: lesson.translation,
      audio_url: lesson.audioUrl,
      language: lesson.language,
      level: lesson.level,
      words: lesson.words,
      total_words: lesson.totalWords,
      new_word_count: lesson.newWordCount,
      review_word_count: lesson.reviewWordCount,
      known_word_count: lesson.knownWordCount,
      comprehension_percentage: lesson.comprehensionPercentage,
      current_phase: lesson.currentPhase,
      listen_count: lesson.listenCount,
      completed: lesson.completed,
      generation_params: lesson.generationParams,
    });

    if (insertError) {
      console.error("Error saving lesson:", insertError);
      // Return lesson anyway for immediate use
    }

    return NextResponse.json({
      lesson,
      wordStats: {
        newWords: wordSelection.newWords,
        reviewWords: wordSelection.reviewWords,
        knownWords: wordSelection.knownWords,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/lesson/generate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
