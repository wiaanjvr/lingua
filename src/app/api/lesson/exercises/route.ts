import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Exercise } from "@/types/lesson";

/**
 * POST /api/lesson/exercises - Generate exercises for a lesson using OpenAI
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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 },
      );
    }

    const {
      lessonId,
      targetText,
      translation,
      level,
      count = 6,
    } = await request.json();

    if (!targetText) {
      return NextResponse.json(
        { error: "Target text is required" },
        { status: 400 },
      );
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `Generate ${count} multiple-choice exercises for a ${level || "A1"} French learner based on this text:

French text: "${targetText}"
English translation: "${translation || "Not provided"}"

Generate questions that test:
1. Reading comprehension (2-3 questions about the content/meaning)
2. Vocabulary (2-3 questions about word meanings)
3. Grammar (1-2 questions about verb forms, articles, etc.)

Return a JSON array with exactly ${count} exercises. Each exercise must have:
- id: unique string (use format "ex-{number}")
- type: "multiple-choice"
- question: the question in English
- options: array of exactly 4 answer choices (mix French and English as appropriate)
- correctAnswer: index (0-3) of the correct answer
- explanation: brief explanation of why this answer is correct
- focusArea: "comprehension" | "vocabulary" | "grammar"
- difficulty: "easy" | "medium" | "hard"

IMPORTANT: Return ONLY valid JSON array, no markdown formatting or extra text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a French language teacher creating exercises. Return only valid JSON arrays without markdown code blocks.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content?.trim() || "[]";

    // Parse the response, handling potential markdown wrapping
    let exercises: Exercise[];
    try {
      // Remove markdown code block if present
      const jsonContent = content.replace(/^```json?\n?|\n?```$/g, "").trim();
      exercises = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse exercises:", content);
      return NextResponse.json(
        { error: "Failed to parse exercise response" },
        { status: 500 },
      );
    }

    // Validate and add lessonId to each exercise
    exercises = exercises.map((ex, index) => ({
      ...ex,
      id: ex.id || `ex-${lessonId}-${index}`,
      lessonId: lessonId || "temp",
    }));

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error("Error generating exercises:", error);
    return NextResponse.json(
      { error: "Failed to generate exercises" },
      { status: 500 },
    );
  }
}
