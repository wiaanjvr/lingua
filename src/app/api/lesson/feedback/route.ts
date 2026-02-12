import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * POST /api/lesson/feedback - Generate conversational feedback using OpenAI
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
      targetText,
      translation,
      userResponse,
      conversationHistory,
      level,
    } = await request.json();

    if (!targetText || !userResponse) {
      return NextResponse.json(
        { error: "Target text and user response are required" },
        { status: 400 },
      );
    }

    const openai = new OpenAI({ apiKey });

    // Build conversation context
    const historyContext = conversationHistory?.length
      ? conversationHistory
          .map(
            (turn: { role: string; text: string }) =>
              `${turn.role}: ${turn.text}`,
          )
          .join("\n")
      : "";

    const prompt = `You are a supportive French language tutor helping a ${level || "A1"} learner understand a listening exercise.

The student listened to this French text (without seeing it):
"${targetText}"

Translation: "${translation || "Not provided"}"

${historyContext ? `Previous conversation:\n${historyContext}\n` : ""}

The student just said: "${userResponse}"

Provide a brief, encouraging response that:
1. Acknowledges what they understood correctly (if anything)
2. Gently clarifies any misunderstandings
3. Offers a hint about vocabulary or context if helpful
4. Asks a follow-up question to deepen understanding
5. Uses simple language appropriate for their level

Keep your response concise (2-4 sentences). Be warm and encouraging.

Return a JSON object with:
- response: your feedback text
- questionType: "comprehension" | "vocabulary" | "encouragement"
- vocabularyHint: (optional) { word: string, translation: string, context: string }
- comprehensionScore: 0-100 estimate of how much they understood

IMPORTANT: Return ONLY valid JSON, no markdown formatting.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a warm, encouraging French language tutor. Return only valid JSON without markdown code blocks.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content?.trim() || "{}";

    let feedback;
    try {
      const jsonContent = content.replace(/^```json?\n?|\n?```$/g, "").trim();
      feedback = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse feedback:", content);
      // Fallback response
      feedback = {
        response:
          "Thank you for your response! Keep practicing - you're doing great. What else did you notice about the audio?",
        questionType: "encouragement",
        comprehensionScore: 50,
      };
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 },
    );
  }
}
