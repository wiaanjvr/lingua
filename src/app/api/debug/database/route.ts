import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/debug/database - Check database status
 *
 * This endpoint verifies that required tables and columns exist
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

    const diagnostics: Record<string, unknown> = {
      userId: user.id,
      email: user.email,
      checks: {},
    };

    // Check if profiles table exists and has expected columns
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, email, proficiency_level, streak, last_lesson_date, total_practice_minutes, sessions_completed",
      )
      .eq("id", user.id)
      .single();

    diagnostics.checks = {
      ...(diagnostics.checks as object),
      profiles: {
        exists: !profileError || profileError.code !== "42P01",
        error: profileError?.message,
        hasMetricsColumns: profile?.streak !== undefined,
        data: profile,
      },
    };

    // Check if lessons table exists
    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("id, title, completed, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    diagnostics.checks = {
      ...(diagnostics.checks as object),
      lessons: {
        exists: !lessonsError || lessonsError.code !== "42P01",
        error: lessonsError?.message,
        count: lessons?.length || 0,
        recent: lessons,
      },
    };

    // Check if user_words table exists
    const { data: userWords, error: userWordsError } = await supabase
      .from("user_words")
      .select("id, word, rating")
      .eq("user_id", user.id)
      .limit(5);

    diagnostics.checks = {
      ...(diagnostics.checks as object),
      user_words: {
        exists: !userWordsError || userWordsError.code !== "42P01",
        error: userWordsError?.message,
        count: userWords?.length || 0,
      },
    };

    // Check audio storage bucket
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();
    const lessonAudioBucket = buckets?.find((b) => b.name === "lesson-audio");

    diagnostics.checks = {
      ...(diagnostics.checks as object),
      storage: {
        lessonAudioBucket: !!lessonAudioBucket,
        error: bucketsError?.message,
      },
    };

    // Summary
    const checks = diagnostics.checks as Record<
      string,
      { exists?: boolean; error?: string }
    >;
    diagnostics.summary = {
      profilesTableOk: checks.profiles?.exists && !checks.profiles?.error,
      lessonsTableOk: checks.lessons?.exists && !checks.lessons?.error,
      metricsColumnsOk: (
        diagnostics.checks as { profiles?: { hasMetricsColumns?: boolean } }
      ).profiles?.hasMetricsColumns,
      userWordsTableOk: checks.user_words?.exists && !checks.user_words?.error,
      storageOk: (
        diagnostics.checks as { storage?: { lessonAudioBucket?: boolean } }
      ).storage?.lessonAudioBucket,
    };

    const allOk = Object.values(
      diagnostics.summary as Record<string, boolean>,
    ).every((v) => v === true);

    return NextResponse.json({
      status: allOk ? "ok" : "issues_found",
      ...diagnostics,
      recommendations: allOk
        ? []
        : getRecommendations(diagnostics.summary as Record<string, boolean>),
    });
  } catch (error) {
    console.error("Error in database diagnostics:", error);
    return NextResponse.json(
      {
        error: "Failed to run diagnostics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function getRecommendations(summary: Record<string, boolean>): string[] {
  const recommendations: string[] = [];

  if (!summary.profilesTableOk) {
    recommendations.push(
      "Run supabase/schema.sql to create the profiles table",
    );
  }
  if (!summary.lessonsTableOk) {
    recommendations.push(
      "Run supabase/migrations/add_lessons_table.sql to create the lessons table",
    );
  }
  if (!summary.metricsColumnsOk) {
    recommendations.push(
      "Run supabase/migrations/add_lesson_metrics.sql to add streak/metrics columns to profiles",
    );
  }
  if (!summary.userWordsTableOk) {
    recommendations.push(
      "Run supabase/migrations/add_word_tracking_srs.sql to create the user_words table",
    );
  }
  if (!summary.storageOk) {
    recommendations.push(
      "Create 'lesson-audio' storage bucket in Supabase Storage",
    );
  }

  return recommendations;
}
