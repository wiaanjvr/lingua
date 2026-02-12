"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { InteractiveStory } from "@/components/learning/InteractiveStory";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GeneratedStory, ProficiencyLevel, WordRating } from "@/types";
import {
  Loader2,
  Home,
  BarChart3,
  Trophy,
  Target,
  ChevronRight,
} from "lucide-react";

export default function LearnPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentStory, setCurrentStory] = useState<GeneratedStory | null>(null);
  const [userLevel, setUserLevel] = useState<ProficiencyLevel>("A1");
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("proficiency_level, target_language")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserLevel(profile.proficiency_level as ProficiencyLevel);
      }

      await loadStats();

      const { data: incompleteStories } = await supabase
        .from("generated_stories")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", false)
        .order("created_at", { ascending: false })
        .limit(1);

      if (incompleteStories && incompleteStories.length > 0) {
        setCurrentStory(incompleteStories[0] as GeneratedStory);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch("/api/words/stats");
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleGenerateStory = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/stories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: userLevel,
          prioritize_review: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate story");
      }

      const data = await response.json();
      setCurrentStory(data.story);
    } catch (error) {
      console.error("Error generating story:", error);
      alert("Failed to generate story. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleWordRated = async (word: string, rating: WordRating) => {
    try {
      const response = await fetch("/api/words/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word,
          lemma: word.toLowerCase(),
          rating,
          language: "fr",
          story_id: currentStory?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to rate word");
      }

      await loadStats();
    } catch (error) {
      console.error("Error rating word:", error);
      alert("Failed to save rating. Please try again.");
    }
  };

  const handleStoryComplete = async () => {
    if (!currentStory) return;

    try {
      await supabase
        .from("generated_stories")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", currentStory.id);

      setCurrentStory(null);
      await loadStats();
    } catch (error) {
      console.error("Error completing story:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-light">
            Loading your journey...
          </p>
        </div>
      </div>
    );
  }

  if (currentStory) {
    return (
      <InteractiveStory
        story={currentStory}
        onComplete={handleStoryComplete}
        onWordRated={handleWordRated}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-light tracking-tight mb-3">
              Learn <span className="font-serif italic">French</span>
            </h1>
            <p className="text-lg text-muted-foreground font-light">
              Immersive comprehension with intelligent repetition
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border-border/50 font-light"
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>

        {/* Vocabulary Stats */}
        {stats && (
          <div className="mb-12">
            <div className="card-luxury p-8">
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="w-6 h-6" />
                <h2 className="text-2xl font-light">Vocabulary Progress</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-6 rounded-xl bg-muted/30 border border-border/30">
                  <div className="text-3xl font-light mb-2">{stats.total}</div>
                  <div className="text-sm text-muted-foreground font-light">
                    Total Words
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-muted/30 border border-border/30">
                  <div className="text-3xl font-light mb-2">
                    {stats.learning}
                  </div>
                  <div className="text-sm text-muted-foreground font-light">
                    Learning
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-muted/30 border border-border/30">
                  <div className="text-3xl font-light mb-2">{stats.known}</div>
                  <div className="text-sm text-muted-foreground font-light">
                    Known
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-muted/30 border border-border/30">
                  <div className="text-3xl font-light mb-2">
                    {stats.mastered}
                  </div>
                  <div className="text-sm text-muted-foreground font-light flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    Mastered
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-muted/30 border border-border/30">
                  <div className="text-3xl font-light mb-2">
                    {stats.ignored || 0}
                  </div>
                  <div className="text-sm text-muted-foreground font-light">
                    Familiar
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate New Story */}
        <div className="card-luxury p-10 bg-foreground text-background relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-background/5 rounded-full -mr-48 -mt-48" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/10 backdrop-blur-sm border border-background/20">
              <Target className="h-3.5 w-3.5" />
              <span className="text-xs font-light">Ready to Learn</span>
            </div>

            <div>
              <h2 className="text-3xl font-light mb-3">Begin Your Session</h2>
              <p className="text-background/70 font-light max-w-2xl">
                Generate a personalized story at your level ({userLevel}).
                Curated with 95% familiar words and 5% new vocabulary,
                prioritizing words due for review.
              </p>
            </div>

            <Button
              onClick={handleGenerateStory}
              disabled={generating}
              className="bg-background text-foreground hover:bg-background/90 rounded-xl h-12 px-6 font-light"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating your story...
                </>
              ) : (
                <>
                  Generate New Story
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {stats && stats.total === 0 && (
              <div className="mt-6 p-4 rounded-xl bg-background/10 border border-background/20">
                <p className="text-sm font-light">
                  Welcome to your first story. We'll introduce common French
                  words and begin building your foundation.
                </p>
              </div>
            )}

            {stats && stats.dueForReview > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-background/10 border border-background/20">
                <p className="text-sm font-light">
                  You have{" "}
                  <span className="font-normal">{stats.dueForReview}</span> word
                  {stats.dueForReview !== 1 ? "s" : ""} ready for review. Your
                  next story will prioritize these for optimal retention.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* How it Works */}
        <div className="card-luxury p-8">
          <h3 className="text-2xl font-light mb-8">The Method</h3>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center">
                  <span className="text-lg font-light">01</span>
                </div>
              </div>
              <div className="pt-2">
                <h4 className="text-lg font-light mb-2">Listen First</h4>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Focus on comprehension through listening before reading. Train
                  your ear to absorb the natural flow of French.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center">
                  <span className="text-lg font-light">02</span>
                </div>
              </div>
              <div className="pt-2">
                <h4 className="text-lg font-light mb-2">Read Along</h4>
                <p className="text-muted-foreground font-light leading-relaxed">
                  New words are highlighted. Understand them from context
                  first—this strengthens natural comprehension.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center">
                  <span className="text-lg font-light">03</span>
                </div>
              </div>
              <div className="pt-2">
                <h4 className="text-lg font-light mb-2">Rate Your Knowledge</h4>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Honestly rate your familiarity with each word. Our spaced
                  repetition system delivers content at the optimal time for
                  retention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
