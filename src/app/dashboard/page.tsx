"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Play,
  Settings,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [sessionsToday, setSessionsToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const maxSessionsFree = 1;

  const [stats, setStats] = useState({
    totalSessions: 0,
    currentLevel: "A1",
    streak: 0,
    totalTime: 0,
    avgComprehension: 0,
    wordsEncountered: 0,
  });
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }

        // Fetch profile with metrics
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select(
            "streak, total_practice_minutes, sessions_completed, proficiency_level",
          )
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);

          // Handle missing profile - create one
          if (profileError.code === "PGRST116") {
            // Profile doesn't exist, create it
            const { error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                email: user.email,
                full_name:
                  user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  "",
                avatar_url:
                  user.user_metadata?.avatar_url ||
                  user.user_metadata?.picture ||
                  "",
              });

            if (insertError) {
              console.error("Error creating profile:", insertError);
              setDbError(`Profile creation failed: ${insertError.message}`);
            } else {
              // Profile created, redirect to onboarding
              router.push("/onboarding");
              return;
            }
          } else if (
            profileError.message?.includes("column") ||
            profileError.code === "PGRST204"
          ) {
            setDbError(
              "Database migration needed. Please run the add_lesson_metrics.sql migration.",
            );
          } else {
            setDbError(profileError.message);
          }
        }

        // Count sessions completed today
        const today = new Date().toISOString().split("T")[0];
        const { count: todayCount, error: lessonsError } = await supabase
          .from("lessons")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("completed", true)
          .gte("completed_at", today);

        if (lessonsError && lessonsError.code === "42P01") {
          setDbError(
            "Lessons table not found. Please run the add_lessons_table.sql migration.",
          );
        }

        // Calculate average comprehension from completed lessons
        let avgComprehension = 0;
        const { data: completedLessons } = await supabase
          .from("lessons")
          .select("final_comprehension_score, comprehension_percentage")
          .eq("user_id", user.id)
          .eq("completed", true);

        if (completedLessons && completedLessons.length > 0) {
          const scores = completedLessons
            .map(
              (l) =>
                l.final_comprehension_score ?? l.comprehension_percentage ?? 0,
            )
            .filter((s) => s > 0);
          if (scores.length > 0) {
            avgComprehension = Math.round(
              scores.reduce((a, b) => a + b, 0) / scores.length,
            );
          }
        }

        // Get words encountered count from user_words table
        const { count: wordsCount } = await supabase
          .from("user_words")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        setStats({
          totalSessions: profile?.sessions_completed || 0,
          currentLevel: profile?.proficiency_level || "A1",
          streak: profile?.streak || 0,
          totalTime: profile?.total_practice_minutes || 0,
          avgComprehension,
          wordsEncountered: wordsCount || 0,
        });

        setSessionsToday(todayCount || 0);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setDbError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [supabase, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Luxury Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background font-serif font-bold text-lg">
                  L
                </span>
              </div>
              <span className="text-xl font-light tracking-tight">Lingua</span>
            </Link>

            <div className="flex items-center gap-6">
              <span className="text-sm text-muted-foreground font-light">
                Free Plan
              </span>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Database Error Banner */}
        {dbError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
            <p className="font-medium mb-1">Database Setup Required</p>
            <p className="text-sm">{dbError}</p>
            <p className="text-sm mt-2">
              Visit{" "}
              <code className="bg-amber-500/20 px-1 rounded">
                /api/debug/database
              </code>{" "}
              to see detailed diagnostics.
            </p>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-light mb-3 tracking-tight">
            Welcome back
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Ready to embrace the struggle?
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Session Card */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 dark:from-zinc-800 dark:via-zinc-900 dark:to-black text-white shadow-luxury-lg p-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs font-light">Today's Session</span>
                </div>

                <div>
                  <h2 className="text-3xl font-light mb-2">
                    {sessionsToday >= maxSessionsFree
                      ? "Daily session complete"
                      : "Begin your lesson"}
                  </h2>
                  <p className="text-white/70 font-light">
                    {sessionsToday >= maxSessionsFree
                      ? "Upgrade to Premium for unlimited daily sessions and advanced features."
                      : "Listen without text. Speak before reading. Embrace the productive discomfort."}
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  {sessionsToday >= maxSessionsFree ? (
                    <>
                      <Button
                        disabled
                        className="bg-white/20 text-white border border-white/20 hover:bg-white/20 rounded-xl h-12 px-6 font-light"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Session Complete
                      </Button>
                      <Button className="bg-white text-zinc-900 hover:bg-white/90 rounded-xl h-12 px-6 font-light">
                        Upgrade to Premium
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => router.push("/lesson")}
                      className="bg-white text-zinc-900 hover:bg-white/90 rounded-xl h-12 px-6 font-light"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Lesson
                    </Button>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <span className="font-light">
                      Free tier: {sessionsToday}/{maxSessionsFree} sessions used
                      today
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="flex flex-col gap-3">
            <div className="card-luxury p-5 transition-all duration-300 hover:shadow-luxury-lg hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wide text-muted-foreground font-light">
                  Current Level
                </span>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-light mb-1">
                {stats.currentLevel}
              </div>
              <p className="text-xs text-muted-foreground font-light">
                Beginner
              </p>
            </div>

            <div className="card-luxury p-5 transition-all duration-300 hover:shadow-luxury-lg hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wide text-muted-foreground font-light">
                  Learning Streak
                </span>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-light mb-1">{stats.streak}</div>
              <p className="text-xs text-muted-foreground font-light">
                days consecutive
              </p>
            </div>

            <div className="card-luxury p-5 transition-all duration-300 hover:shadow-luxury-lg hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wide text-muted-foreground font-light">
                  Total Time
                </span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-light mb-1">{stats.totalTime}</div>
              <p className="text-xs text-muted-foreground font-light">
                minutes practiced
              </p>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-light mb-6 tracking-tight">
            Your Progress
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-luxury p-6">
              <div className="mb-4">
                <span className="text-sm text-muted-foreground font-light">
                  Total Sessions
                </span>
              </div>
              <div className="text-3xl font-light mb-2">
                {stats.totalSessions}
              </div>
              <p className="text-sm text-muted-foreground font-light">
                {stats.totalSessions === 0
                  ? "The struggle begins today"
                  : "Keep up the momentum"}
              </p>
            </div>

            <div className="card-luxury p-6">
              <div className="mb-4">
                <span className="text-sm text-muted-foreground font-light">
                  Comprehension
                </span>
              </div>
              <div className="text-3xl font-light mb-2">
                {stats.avgComprehension}%
              </div>
              <p className="text-sm text-muted-foreground font-light">
                {stats.avgComprehension === 0
                  ? "Track your understanding"
                  : "Average accuracy"}
              </p>
            </div>

            <div className="card-luxury p-6">
              <div className="mb-4">
                <span className="text-sm text-muted-foreground font-light">
                  Vocabulary
                </span>
              </div>
              <div className="text-3xl font-light mb-2">
                {stats.wordsEncountered}
              </div>
              <p className="text-sm text-muted-foreground font-light">
                Words encountered
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
