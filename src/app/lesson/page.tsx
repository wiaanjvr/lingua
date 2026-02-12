"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Lesson,
  LessonPhase,
  LessonSessionState,
  ComprehensionResponse,
  VocabularyRating,
  Exercise,
  ExerciseAttempt,
} from "@/types/lesson";
import { WordRating } from "@/types";

// Phase Components - Import from index
import {
  AudioComprehensionPhase,
  VerbalCheckPhase,
  ConversationFeedbackPhase,
  TextRevealPhase,
  InteractiveExercisesPhase,
  FinalAssessmentPhase,
  LessonComplete,
  LessonHeader,
  LessonLoading,
} from "@/components/lesson";

import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

// Phase order
const PHASE_ORDER: LessonPhase[] = [
  "audio-comprehension",
  "verbal-check",
  "conversation-feedback",
  "text-reveal",
  "interactive-exercises",
  "final-assessment",
];

export default function LessonPage() {
  const router = useRouter();
  const supabase = createClient();

  // Main state
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>(
    "audio-comprehension",
  );
  const [completed, setCompleted] = useState(false);

  // Phase-specific state
  const [listenCount, setListenCount] = useState(0);
  const [initialResponse, setInitialResponse] =
    useState<ComprehensionResponse | null>(null);
  const [vocabularyRatings, setVocabularyRatings] = useState<
    VocabularyRating[]
  >([]);
  const [exerciseAttempts, setExerciseAttempts] = useState<ExerciseAttempt[]>(
    [],
  );
  const [finalResponse, setFinalResponse] =
    useState<ComprehensionResponse | null>(null);

  // Progress tracking
  const [overallProgress, setOverallProgress] = useState(0);

  // Load user and check for existing lesson
  useEffect(() => {
    loadUserAndLesson();
  }, []);

  const loadUserAndLesson = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/auth/login");
        return;
      }

      // Check for incomplete lesson
      const { data: incompleteLessons } = await supabase
        .from("lessons")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", false)
        .order("created_at", { ascending: false })
        .limit(1);

      if (incompleteLessons && incompleteLessons.length > 0) {
        const existingLesson = incompleteLessons[0] as Lesson;
        setLesson(existingLesson);
        setCurrentPhase(existingLesson.currentPhase || "audio-comprehension");
        setListenCount(existingLesson.listenCount || 0);
      }
    } catch (error) {
      console.error("Error loading lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate a new lesson
  const handleGenerateLesson = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/lesson/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prioritizeReview: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate lesson");
      }

      const data = await response.json();
      setLesson(data.lesson);
      setCurrentPhase("audio-comprehension");
      setListenCount(0);
      setOverallProgress(0);
    } catch (error) {
      console.error("Error generating lesson:", error);
      alert("Failed to generate lesson. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Phase navigation
  const handlePhaseComplete = useCallback(
    (phase: LessonPhase) => {
      const currentIndex = PHASE_ORDER.indexOf(phase);
      const progress = ((currentIndex + 1) / PHASE_ORDER.length) * 100;
      setOverallProgress(progress);

      if (currentIndex < PHASE_ORDER.length - 1) {
        const nextPhase = PHASE_ORDER[currentIndex + 1];
        setCurrentPhase(nextPhase);

        // Save progress to database
        if (lesson) {
          updateLessonProgress(nextPhase);
        }
      } else {
        // Lesson complete!
        setCompleted(true);
        if (lesson) {
          completeLessonInDatabase();
        }
      }
    },
    [lesson],
  );

  const updateLessonProgress = async (phase: LessonPhase) => {
    if (!lesson) return;

    try {
      await supabase
        .from("lessons")
        .update({
          current_phase: phase,
          listen_count: listenCount,
        })
        .eq("id", lesson.id);
    } catch (error) {
      console.error("Error updating lesson progress:", error);
    }
  };

  const completeLessonInDatabase = async () => {
    if (!lesson) return;

    try {
      await supabase
        .from("lessons")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", lesson.id);
    } catch (error) {
      console.error("Error completing lesson:", error);
    }
  };

  // Phase 1: Audio comprehension handlers
  const handleListenComplete = useCallback(() => {
    setListenCount((prev) => prev + 1);
  }, []);

  const handleAudioPhaseComplete = useCallback(() => {
    handlePhaseComplete("audio-comprehension");
  }, [handlePhaseComplete]);

  // Phase 2: Verbal check handlers
  const handleVerbalResponse = useCallback(
    async (response: ComprehensionResponse) => {
      setInitialResponse(response);

      // Save to database
      try {
        await fetch("/api/lesson/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: lesson?.id,
            phase: "verbal-check",
            transcript: response.transcript,
            audioUrl: response.audioUrl,
          }),
        });
      } catch (error) {
        console.error("Error saving verbal response:", error);
      }

      handlePhaseComplete("verbal-check");
    },
    [lesson, handlePhaseComplete],
  );

  // Phase 3: Conversation feedback - handled by component

  // Phase 4: Vocabulary rating handlers
  const handleWordRating = useCallback(
    async (rating: VocabularyRating) => {
      setVocabularyRatings((prev) => [...prev, rating]);

      // Update SRS
      try {
        await fetch("/api/words/rate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            word: rating.word,
            lemma: rating.lemma,
            rating: rating.rating,
            language: lesson?.language || "fr",
            context_sentence: rating.context,
          }),
        });
      } catch (error) {
        console.error("Error rating word:", error);
      }
    },
    [lesson],
  );

  // Phase 5: Exercise handlers
  const handleExerciseAttempt = useCallback((attempt: ExerciseAttempt) => {
    setExerciseAttempts((prev) => [...prev, attempt]);
  }, []);

  // Phase 6: Final assessment
  const handleFinalResponse = useCallback(
    async (response: ComprehensionResponse) => {
      setFinalResponse(response);

      try {
        await fetch("/api/lesson/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: lesson?.id,
            phase: "final-assessment",
            transcript: response.transcript,
            audioUrl: response.audioUrl,
          }),
        });
      } catch (error) {
        console.error("Error saving final response:", error);
      }

      handlePhaseComplete("final-assessment");
    },
    [lesson, handlePhaseComplete],
  );

  // Handle exit
  const handleExit = () => {
    router.push("/dashboard");
  };

  // Handle new lesson after completion
  const handleStartNewLesson = () => {
    setLesson(null);
    setCompleted(false);
    setCurrentPhase("audio-comprehension");
    setListenCount(0);
    setInitialResponse(null);
    setVocabularyRatings([]);
    setExerciseAttempts([]);
    setFinalResponse(null);
    setOverallProgress(0);
    handleGenerateLesson();
  };

  // Loading state
  if (loading) {
    return <LessonLoading />;
  }

  // No lesson - show generation screen
  if (!lesson && !completed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-light tracking-tight">
              Ready to <span className="font-serif italic">Learn</span>?
            </h1>
            <p className="text-muted-foreground">
              Generate a personalized lesson based on your vocabulary and
              progress.
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleGenerateLesson}
            disabled={generating}
            className="w-full h-14 text-lg"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Your Lesson...
              </>
            ) : (
              <>Start New Lesson</>
            )}
          </Button>

          <Button variant="outline" onClick={handleExit} className="w-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Lesson complete
  if (completed) {
    return (
      <LessonComplete
        lesson={lesson!}
        vocabularyRatings={vocabularyRatings}
        exerciseAttempts={exerciseAttempts}
        initialResponse={initialResponse}
        finalResponse={finalResponse}
        onStartNewLesson={handleStartNewLesson}
        onExit={handleExit}
      />
    );
  }

  // Main lesson phases
  return (
    <div className="min-h-screen bg-background">
      <LessonHeader
        lesson={lesson!}
        currentPhase={currentPhase}
        progress={overallProgress}
        onExit={handleExit}
      />

      <main className="container max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Phase 1: Audio-Only Comprehension */}
        {currentPhase === "audio-comprehension" && (
          <AudioComprehensionPhase
            lesson={lesson!}
            listenCount={listenCount}
            onListenComplete={handleListenComplete}
            onPhaseComplete={handleAudioPhaseComplete}
          />
        )}

        {/* Phase 2: Verbal Comprehension Check */}
        {currentPhase === "verbal-check" && (
          <VerbalCheckPhase
            lesson={lesson!}
            onResponse={handleVerbalResponse}
            onPhaseComplete={() => handlePhaseComplete("verbal-check")}
          />
        )}

        {/* Phase 3: Conversational Feedback Loop */}
        {currentPhase === "conversation-feedback" && (
          <ConversationFeedbackPhase
            lesson={lesson!}
            initialEvaluation={initialResponse?.evaluation}
            onPhaseComplete={() => handlePhaseComplete("conversation-feedback")}
          />
        )}

        {/* Phase 4: Text Reveal + Vocabulary Marking */}
        {currentPhase === "text-reveal" && (
          <TextRevealPhase
            lesson={lesson!}
            onWordRating={handleWordRating}
            vocabularyRatings={vocabularyRatings}
            onPhaseComplete={() => handlePhaseComplete("text-reveal")}
          />
        )}

        {/* Phase 5: Interactive Exercises */}
        {currentPhase === "interactive-exercises" && (
          <InteractiveExercisesPhase
            lesson={lesson!}
            onExerciseAttempt={handleExerciseAttempt}
            onPhaseComplete={() => handlePhaseComplete("interactive-exercises")}
          />
        )}

        {/* Phase 6: Final Verbal Assessment */}
        {currentPhase === "final-assessment" && (
          <FinalAssessmentPhase
            lesson={lesson!}
            onResponse={handleFinalResponse}
            onPhaseComplete={() => handlePhaseComplete("final-assessment")}
          />
        )}
      </main>
    </div>
  );
}
