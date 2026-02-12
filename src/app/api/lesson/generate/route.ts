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
 * Generate TTS audio for a lesson text and upload to Supabase Storage
 */
async function generateTTSAudio(
  openai: OpenAI,
  text: string,
  lessonId: string,
  userId: string,
): Promise<string> {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova", // Good for French
    input: text,
    speed: 0.9, // Slightly slower for learners
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());

  // Upload to Supabase Storage
  const supabase = await createClient();
  const fileName = `${userId}/${lessonId}.mp3`;

  const { error: uploadError } = await supabase.storage
    .from("lesson-audio")
    .upload(fileName, buffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload audio: ${uploadError.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("lesson-audio").getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Generate lesson text using OpenAI
 */
async function generateLessonText(
  openai: OpenAI,
  wordSelection: ReturnType<typeof selectWordsForLesson>,
  options: {
    wordCount: number;
    newWordPct: number;
    prioritizeReview: boolean;
    topic?: string;
  },
  level: ProficiencyLevel,
  language: string,
): Promise<{ title: string; text: string; translation: string }> {
  const prompt = generateLessonPrompt(
    wordSelection,
    {
      targetWordCount: options.wordCount,
      newWordPercentage: options.newWordPct,
      reviewWordPriority: options.prioritizeReview,
      topicPreference: options.topic,
    },
    level,
    language,
  );

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Generate natural ${language} lessons for ${level} learners. 
        Output JSON with format: {"title": "Lesson Title", "text": "The lesson text...", "translation": "English translation..."}`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: Math.min(options.wordCount * 4, 1000),
  });

  const response = JSON.parse(completion.choices[0]?.message?.content || "{}");

  if (!response.text) {
    throw new Error("Failed to generate lesson text");
  }

  return {
    title: response.title || `${language.toUpperCase()} Lesson`,
    text: response.text,
    translation: response.translation || "",
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

    // Require OpenAI API key - no local fallbacks
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey || openaiApiKey === "your_openai_api_key") {
      return NextResponse.json(
        {
          error:
            "OpenAI API key is required for lesson generation. Please configure OPENAI_API_KEY in your environment.",
        },
        { status: 503 },
      );
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

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

    // Generate lesson text using OpenAI
    const {
      title: lessonTitle,
      text: lessonText,
      translation,
    } = await generateLessonText(
      openai,
      wordSelection,
      {
        wordCount,
        newWordPct,
        prioritizeReview,
        topic,
      },
      userLevel,
      targetLanguage,
    );

    // Analyze text to identify words
    const analyzedWords = analyzeTextWords(
      lessonText,
      userWords || [],
      targetLanguage,
    );
    const comprehension = calculateComprehension(analyzedWords);

    // Generate lesson ID
    const lessonId = `lesson-${Date.now()}`;

    // Generate TTS audio and upload to Supabase Storage
    const audioUrl = await generateTTSAudio(
      openai,
      lessonText,
      lessonId,
      user.id,
    );

    // Create lesson object
    const lesson: Lesson = {
      id: lessonId,
      userId: user.id,
      targetText: lessonText,
      translation,
      audioUrl,
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

    // Save lesson to Supabase database
    const { data: insertedLesson, error: insertError } = await supabase
      .from("lessons")
      .insert({
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
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving lesson to database:", insertError);
      // Log helpful message about missing table
      if (
        insertError.code === "42P01" ||
        insertError.message?.includes("does not exist")
      ) {
        console.error(
          "The 'lessons' table may not exist. Run add_lessons_table.sql migration.",
        );
      }
      // Still return the lesson but warn the client
      return NextResponse.json({
        lesson,
        warning:
          "Lesson generated but not saved to database. Progress will not persist.",
        wordStats: {
          newWords: wordSelection.newWords,
          reviewWords: wordSelection.reviewWords,
          knownWords: wordSelection.knownWords,
        },
      });
    }

    console.log("Lesson saved to database:", insertedLesson?.id);

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
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
