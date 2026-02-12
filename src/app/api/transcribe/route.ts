import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * POST /api/transcribe - Transcribe audio using OpenAI Whisper
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

    const formData = await request.formData();
    const audioFile = formData.get("audio") as Blob | null;
    const language = (formData.get("language") as string) || "fr";

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 },
      );
    }

    const openai = new OpenAI({ apiKey });

    // Convert blob to File object for OpenAI SDK
    const file = new File([audioFile], "recording.webm", {
      type: audioFile.type || "audio/webm",
    });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language,
      response_format: "text",
    });

    return NextResponse.json({
      text: transcription.trim(),
      language,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 },
    );
  }
}
