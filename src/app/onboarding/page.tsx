"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { INTEREST_TOPICS, ProficiencyLevel } from "@/types";
import {
  TestResponse,
  PlacementTestResults,
  AudioTestItem,
  ReadingTestItem,
} from "@/types/placement-test";
import {
  AudioListeningTest,
  ReadingComprehensionTest,
} from "@/components/placement";
import {
  calculatePlacementResults,
  getLevelDescription,
  getResultsMessage,
} from "@/lib/placement/scoring";
import placementTestData from "@/data/placement-test.json";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  seedUserVocabulary,
  LEVEL_WORD_ALLOCATION,
} from "@/lib/srs/seed-vocabulary";
import {
  Loader2,
  Headphones,
  BookOpen,
  Trophy,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

type OnboardingStep =
  | "welcome"
  | "audio-test"
  | "reading-test"
  | "results"
  | "interests"
  | "complete";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [audioIndex, setAudioIndex] = useState(0);
  const [readingIndex, setReadingIndex] = useState(0);
  const [audioResponses, setAudioResponses] = useState<TestResponse[]>([]);
  const [readingResponses, setReadingResponses] = useState<TestResponse[]>([]);
  const [testResults, setTestResults] = useState<PlacementTestResults | null>(
    null,
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioItems = placementTestData.audioItems as AudioTestItem[];
  const readingItems = placementTestData.readingItems as ReadingTestItem[];

  const totalSteps = 5;
  const currentStepNumber = {
    welcome: 1,
    "audio-test": 2,
    "reading-test": 3,
    results: 4,
    interests: 5,
    complete: 5,
  }[step];

  // Handle audio test answer
  const handleAudioAnswer = (response: TestResponse) => {
    const newResponses = [...audioResponses, response];
    setAudioResponses(newResponses);

    if (audioIndex < audioItems.length - 1) {
      setAudioIndex(audioIndex + 1);
    } else {
      // Move to reading test
      setStep("reading-test");
    }
  };

  // Handle reading test answer
  const handleReadingAnswer = (response: TestResponse) => {
    const newResponses = [...readingResponses, response];
    setReadingResponses(newResponses);

    if (readingIndex < readingItems.length - 1) {
      setReadingIndex(readingIndex + 1);
    } else {
      // Calculate results
      const audioDifficulties = audioItems.map((item) => item.difficulty);
      const readingDifficulties = readingItems.map((item) => item.difficulty);

      const results = calculatePlacementResults(
        newResponses.length > 0 ? [...audioResponses] : audioResponses,
        newResponses,
        audioDifficulties as any,
        readingDifficulties as any,
      );

      // Recalculate with all audio responses
      const finalResults = calculatePlacementResults(
        audioResponses,
        newResponses,
        audioDifficulties as any,
        readingDifficulties as any,
      );

      setTestResults(finalResults);
      setStep("results");
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleComplete = async () => {
    if (!testResults) return;

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Save user preferences to Supabase
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          proficiency_level: testResults.determinedLevel,
          interests: selectedInterests,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error saving preferences:", updateError);
        setError("Failed to save preferences. Please try again.");
        return;
      }

      // Seed vocabulary based on placement level
      // This gives users known words proportional to their assessed level
      try {
        const wordCount = await seedUserVocabulary(
          user.id,
          testResults.determinedLevel,
          "fr",
        );
        console.log(
          `Seeded ${wordCount} words for level ${testResults.determinedLevel}`,
        );
      } catch (seedError) {
        // Non-fatal: log but continue to dashboard
        console.error("Error seeding vocabulary:", seedError);
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getLevelColor = (level: ProficiencyLevel) => {
    const colors: Record<ProficiencyLevel, string> = {
      A0: "text-slate-500",
      A1: "text-green-500",
      A2: "text-emerald-500",
      B1: "text-blue-500",
      B2: "text-indigo-500",
      C1: "text-purple-500",
      C2: "text-pink-500",
    };
    return colors[level];
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to Lingua</h1>
          <p className="text-muted-foreground">
            {step === "welcome" && "Let's find your perfect starting point"}
            {step === "audio-test" && "Listen carefully and answer"}
            {step === "reading-test" && "Read and answer"}
            {step === "results" && "Your assessment is complete!"}
            {step === "interests" && "Almost there!"}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-16 rounded-full transition-colors",
                i + 1 === currentStepNumber
                  ? "bg-primary"
                  : i + 1 < currentStepNumber
                    ? "bg-primary/50"
                    : "bg-muted",
              )}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === "welcome" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Placement Assessment</CardTitle>
              <CardDescription className="text-base">
                We'll assess your French level with a quick 10-question test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <Headphones className="h-5 w-5 text-primary" />
                    <span>5 Listening Questions</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Listen to short audio clips and answer comprehension
                    questions
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span>5 Reading Questions</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Read short passages and answer questions about them
                  </p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Note:</strong> All questions are in French at varying
                  difficulty levels. Don't worry if some seem challenging—that's
                  how we determine your level!
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => setStep("audio-test")}
                className="w-full"
              >
                Start Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Audio Listening Test */}
        {step === "audio-test" && (
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Question {audioIndex + 1} of {audioItems.length}
            </div>
            <AudioListeningTest
              item={audioItems[audioIndex]}
              itemIndex={audioIndex}
              totalItems={audioItems.length}
              onAnswer={handleAudioAnswer}
            />
          </div>
        )}

        {/* Step 3: Reading Comprehension Test */}
        {step === "reading-test" && (
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Question {readingIndex + 1} of {readingItems.length}
            </div>
            <ReadingComprehensionTest
              item={readingItems[readingIndex]}
              itemIndex={readingIndex}
              totalItems={readingItems.length}
              onAnswer={handleReadingAnswer}
            />
          </div>
        )}

        {/* Step 4: Results */}
        {step === "results" && testResults && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
              <CardDescription>
                {getResultsMessage(testResults)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Level Result */}
              <div className="text-center p-6 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">
                  Your determined level
                </p>
                <div
                  className={cn(
                    "text-5xl font-bold mb-2",
                    getLevelColor(testResults.determinedLevel),
                  )}
                >
                  {testResults.determinedLevel}
                </div>
                <p className="text-sm text-muted-foreground">
                  {getLevelDescription(testResults.determinedLevel)}
                </p>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Headphones className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">
                      Listening
                    </span>
                  </div>
                  <div className="text-2xl font-semibold">
                    {testResults.audioScore}/{audioItems.length}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">
                      Reading
                    </span>
                  </div>
                  <div className="text-2xl font-semibold">
                    {testResults.readingScore}/{readingItems.length}
                  </div>
                </div>
              </div>

              {/* Question Breakdown */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Question Breakdown</p>
                <div className="flex flex-wrap gap-2">
                  {testResults.breakdown.map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded text-xs",
                        item.correct
                          ? "bg-green-500/10 text-green-600"
                          : "bg-red-500/10 text-red-600",
                      )}
                    >
                      {item.correct ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <span className="h-3 w-3 rounded-full border-2 border-current" />
                      )}
                      {item.section === "audio" ? "L" : "R"}
                      {item.difficulty}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => setStep("interests")}
                className="w-full"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Interests */}
        {step === "interests" && (
          <Card>
            <CardHeader>
              <CardTitle>What are you interested in?</CardTitle>
              <CardDescription>
                Select 3-5 topics. You'll learn through content you actually
                care about.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {INTEREST_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleInterest(topic)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all capitalize",
                      "hover:border-primary/50",
                      selectedInterests.includes(topic)
                        ? "border-primary bg-primary/5"
                        : "border-muted",
                    )}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep("results")}
                  className="w-full"
                  disabled={saving}
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={selectedInterests.length < 3 || saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Complete Setup
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
