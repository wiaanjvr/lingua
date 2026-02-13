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
  BookOpen,
  Star,
  Sparkles,
  Brain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getLevelLabel } from "@/lib/placement/scoring";
import { ProficiencyLevel, WordStatus } from "@/types";
import {
  checkProficiencyUpdate,
  getProficiencyProgress,
} from "@/lib/srs/proficiency-calculator";
import { cn } from "@/lib/utils";

interface VocabularyWord {
  id: string;
  word: string;
  lemma: string;
  status: WordStatus;
  rating: number;
  next_review: string;
}

interface VocabularyStats {
  new: number;
  learning: number;
  known: number;
  mastered: number;
  total: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [sessionsToday, setSessionsToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const maxSessionsFree = 1;

  const [stats, setStats] = useState({
    totalSessions: 0,
    currentLevel: "A1",
    streak: 0,
    totalTime: 0,
    avgComprehension: 0,
    wordsEncountered: 0,
  });
  const [vocabularyStats, setVocabularyStats] = useState<VocabularyStats>({
    new: 0,
    learning: 0,
    known: 0,
    mastered: 0,
    total: 0,
  });
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [vocabFilter, setVocabFilter] = useState<WordStatus | "all">("all");
  const [proficiencyProgress, setProficiencyProgress] = useState<{
    nextLevel: ProficiencyLevel | null;
    wordsNeeded: number;
    progress: number;
  } | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.replace("/auth/login");
          return;
        }

        // Check if user just completed onboarding (prevents redirect loop)
        const justCompletedOnboarding =
          typeof window !== "undefined" &&
          sessionStorage.getItem("onboarding_completed") === "true";

        if (justCompletedOnboarding) {
          console.log("Dashboard: User just completed onboarding, clearing flag");
          sessionStorage.removeItem("onboarding_completed");
          // Skip the interests check this time, let the user through
          setAuthChecked(true);
        }

        // Fetch profile with metrics AND interests to check onboarding status
        // Force fresh data to avoid cache issues after onboarding
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select(
            "streak, total_practice_minutes, sessions_completed, proficiency_level, interests",
          )
          .eq("id", user.id)
          .single();

        console.log("Dashboard: Profile query result:", { profile, profileError });

        if (profileError) {
          console.error("Error fetching profile:", profileError);

          // Handle missing profile - create one and redirect to onboarding
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
              setAuthChecked(true);
            } else {
              // Profile created, redirect to onboarding immediately
              router.replace("/onboarding");
              return;
            }
          } else if (
            profileError.message?.includes("column") ||
            profileError.code === "PGRST204"
          ) {
            setDbError(
              "Database migration needed. Please run the add_lesson_metrics.sql migration.",
            );
            setAuthChecked(true);
          } else {
            setDbError(profileError.message);
            setAuthChecked(true);
          }
        } else {
          // Profile exists - check if onboarding was completed (unless we just came from there)
          if (!justCompletedOnboarding) {
            // Onboarding requires 3+ interests, so check for that
            const interests = profile?.interests || [];
            console.log("Dashboard: Loaded profile interests:", interests);
            
            if (!interests || interests.length < 3) {
              // User hasn't completed onboarding (placement test + interests)
              console.log(
                "Dashboard: Interests incomplete, redirecting to onboarding",
              );
              router.replace("/onboarding");
              return;
            }
          }
          console.log("Dashboard: Onboarding complete, loading dashboard");
          setAuthChecked(true);
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
        const { data: allWords, error: wordsError } = await supabase
          .from("user_words")
          .select("id, word, lemma, status, rating, next_review")
          .eq("user_id", user.id)
          .order("status", { ascending: false })
          .order("word", { ascending: true });

        const wordsCount = allWords?.length || 0;

        // Calculate vocabulary stats by status
        const vocabStats: VocabularyStats = {
          new: 0,
          learning: 0,
          known: 0,
          mastered: 0,
          total: wordsCount,
        };

        if (allWords) {
          allWords.forEach((word) => {
            const status = word.status as WordStatus;
            if (status in vocabStats) {
              vocabStats[status]++;
            }
          });
          setVocabularyWords(allWords as VocabularyWord[]);
        }

        setVocabularyStats(vocabStats);

        // Check if proficiency level should be updated based on vocabulary
        const currentLevel = (profile?.proficiency_level ||
          "A1") as ProficiencyLevel;
        const newLevel = checkProficiencyUpdate(
          currentLevel,
          vocabStats.known,
          vocabStats.mastered,
        );

        // If proficiency should be updated, update it in the database
        let finalLevel = currentLevel;
        if (newLevel) {
          await supabase
            .from("profiles")
            .update({ proficiency_level: newLevel })
            .eq("id", user.id);
          finalLevel = newLevel;
        }

        // Get progress to next level (using the actual profile level)
        const progress = getProficiencyProgress(
          finalLevel,
          vocabStats.known,
          vocabStats.mastered,
        );
        setProficiencyProgress({
          nextLevel: progress.nextLevel,
          wordsNeeded: progress.wordsNeeded,
          progress: progress.progress,
        });

        setStats({
          totalSessions: profile?.sessions_completed || 0,
          currentLevel: finalLevel,
          streak: profile?.streak || 0,
          totalTime: profile?.total_practice_minutes || 0,
          avgComprehension,
          wordsEncountered: wordsCount,
        });

        setSessionsToday(todayCount || 0);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setDbError(error instanceof Error ? error.message : "Unknown error");
        setAuthChecked(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [supabase, router]);

  // Show loading state until auth and onboarding status are checked
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-light">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 dark:from-zinc-800 dark:via-zinc-900 dark:to-black text-white shadow-luxury-lg p-10 min-h-[420px]">
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
                {getLevelLabel(stats.currentLevel as ProficiencyLevel)}
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

        {/* Vocabulary Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-light tracking-tight">
              Your Vocabulary
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVocabulary(!showVocabulary)}
              className="gap-2"
            >
              {showVocabulary ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide Words
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show All Words
                </>
              )}
            </Button>
          </div>

          {/* Vocabulary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() =>
                setVocabFilter(vocabFilter === "mastered" ? "all" : "mastered")
              }
              className={cn(
                "card-luxury p-4 transition-all duration-300 hover:shadow-luxury-lg text-left",
                vocabFilter === "mastered" && "ring-2 ring-primary",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground font-light">
                  Mastered
                </span>
              </div>
              <div className="text-2xl font-light">
                {vocabularyStats.mastered}
              </div>
            </button>

            <button
              onClick={() =>
                setVocabFilter(vocabFilter === "known" ? "all" : "known")
              }
              className={cn(
                "card-luxury p-4 transition-all duration-300 hover:shadow-luxury-lg text-left",
                vocabFilter === "known" && "ring-2 ring-primary",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-green-500" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground font-light">
                  Known
                </span>
              </div>
              <div className="text-2xl font-light">{vocabularyStats.known}</div>
            </button>

            <button
              onClick={() =>
                setVocabFilter(vocabFilter === "learning" ? "all" : "learning")
              }
              className={cn(
                "card-luxury p-4 transition-all duration-300 hover:shadow-luxury-lg text-left",
                vocabFilter === "learning" && "ring-2 ring-primary",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-blue-500" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground font-light">
                  Learning
                </span>
              </div>
              <div className="text-2xl font-light">
                {vocabularyStats.learning}
              </div>
            </button>

            <button
              onClick={() =>
                setVocabFilter(vocabFilter === "new" ? "all" : "new")
              }
              className={cn(
                "card-luxury p-4 transition-all duration-300 hover:shadow-luxury-lg text-left",
                vocabFilter === "new" && "ring-2 ring-primary",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground font-light">
                  New
                </span>
              </div>
              <div className="text-2xl font-light">{vocabularyStats.new}</div>
            </button>
          </div>

          {/* Progress to Next Level */}
          {proficiencyProgress?.nextLevel && (
            <div className="card-luxury p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-light">
                  Progress to {proficiencyProgress.nextLevel}
                </span>
                <span className="text-sm text-muted-foreground font-light">
                  {proficiencyProgress.wordsNeeded} words needed
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${proficiencyProgress.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Word List */}
          {showVocabulary && (
            <div className="card-luxury p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground font-light">
                  {vocabFilter === "all"
                    ? "All Words"
                    : `${vocabFilter.charAt(0).toUpperCase() + vocabFilter.slice(1)} Words`}
                </span>
                {vocabFilter !== "all" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVocabFilter("all")}
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {vocabularyWords.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 font-light">
                    No words yet. Start a lesson to build your vocabulary!
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {vocabularyWords
                      .filter(
                        (word) =>
                          vocabFilter === "all" || word.status === vocabFilter,
                      )
                      .map((word) => (
                        <div
                          key={word.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full",
                                word.status === "mastered" && "bg-yellow-500",
                                word.status === "known" && "bg-green-500",
                                word.status === "learning" && "bg-blue-500",
                                word.status === "new" && "bg-gray-400",
                              )}
                            />
                            <span className="font-medium">{word.word}</span>
                            {word.lemma && word.lemma !== word.word && (
                              <span className="text-xs text-muted-foreground">
                                ({word.lemma})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                word.status === "mastered" &&
                                  "bg-yellow-500/10 text-yellow-600",
                                word.status === "known" &&
                                  "bg-green-500/10 text-green-600",
                                word.status === "learning" &&
                                  "bg-blue-500/10 text-blue-600",
                                word.status === "new" &&
                                  "bg-gray-500/10 text-gray-600",
                              )}
                            >
                              {word.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
