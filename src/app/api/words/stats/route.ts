import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/words/stats - Get user's vocabulary statistics
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const language = searchParams.get("language") || "fr";

    // Get all user words for the language
    const { data: words, error } = await supabase
      .from("user_words")
      .select("*")
      .eq("user_id", user.id)
      .eq("language", language);

    if (error) {
      console.error("Error fetching words:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate statistics
    const total = words.length;
    const newCount = words.filter((w) => w.status === "new").length;
    const learningCount = words.filter((w) => w.status === "learning").length;
    const knownCount = words.filter((w) => w.status === "known").length;
    const masteredCount = words.filter((w) => w.status === "mastered").length;

    const now = new Date();
    const dueCount = words.filter((w) => new Date(w.next_review) <= now).length;

    const stats = {
      total,
      new: newCount,
      learning: learningCount,
      known: knownCount,
      mastered: masteredCount,
      dueForReview: dueCount,
      percentageKnown:
        total > 0 ? ((knownCount + masteredCount) / total) * 100 : 0,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error in GET /api/words/stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
