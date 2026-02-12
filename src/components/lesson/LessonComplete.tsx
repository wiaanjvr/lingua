"use client";

import React from "react";
import {
  Lesson,
  VocabularyRating,
  ExerciseAttempt,
  ComprehensionResponse,
} from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  BookOpen,
  Brain,
  Target,
  ArrowRight,
  Home,
  Sparkles,
  Star,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonCompleteProps {
  lesson: Lesson;
  vocabularyRatings: VocabularyRating[];
  exerciseAttempts: ExerciseAttempt[];
  initialResponse: ComprehensionResponse | null;
  finalResponse: ComprehensionResponse | null;
  onStartNewLesson: () => void;
  onExit: () => void;
}

export function LessonComplete({
  lesson,
  vocabularyRatings,
  exerciseAttempts,
  initialResponse,
  finalResponse,
  onStartNewLesson,
  onExit,
}: LessonCompleteProps) {
  // Calculate stats
  const wordsLearned = vocabularyRatings.length;
  const wordsKnownWell = vocabularyRatings.filter((r) => r.rating >= 3).length;

  const exerciseScore =
    exerciseAttempts.length > 0
      ? Math.round(
          (exerciseAttempts.filter((a) => a.isCorrect).length /
            exerciseAttempts.length) *
            100,
        )
      : 0;

  // Overall performance score
  const overallScore = Math.round(
    (wordsKnownWell / Math.max(wordsLearned, 1)) * 50 +
      (exerciseScore / 100) * 50,
  );

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Outstanding performance!";
    if (score >= 80) return "Excellent work!";
    if (score >= 70) return "Great progress!";
    if (score >= 60) return "Good effort!";
    return "Keep practicing!";
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return "🌟";
    if (score >= 80) return "🎉";
    if (score >= 70) return "👏";
    if (score >= 60) return "💪";
    return "📚";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-12 space-y-8">
        {/* Celebration Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="h-10 w-10 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-light">
              Lesson <span className="font-serif italic">Complete!</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              {getScoreMessage(overallScore)} {getScoreEmoji(overallScore)}
            </p>
          </div>
        </div>

        {/* Overall Score Card */}
        <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-2">
              <div className="text-6xl font-bold text-primary">
                {overallScore}%
              </div>
              <p className="text-lg text-muted-foreground">
                Overall Performance
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Vocabulary Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Vocabulary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{wordsLearned}</div>
              <p className="text-sm text-muted-foreground">words practiced</p>
              <div className="mt-2 text-sm">
                <span className="text-green-600 font-medium">
                  {wordsKnownWell}
                </span>
                <span className="text-muted-foreground"> marked as known</span>
              </div>
            </CardContent>
          </Card>

          {/* Exercises Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Exercises
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{exerciseScore}%</div>
              <p className="text-sm text-muted-foreground">accuracy score</p>
              <div className="mt-2 text-sm">
                <span className="text-green-600 font-medium">
                  {exerciseAttempts.filter((a) => a.isCorrect).length}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  / {exerciseAttempts.length} correct
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Words Learned Section */}
        {vocabularyRatings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Words Practiced
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {vocabularyRatings.map((rating, index) => (
                  <span
                    key={index}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      rating.rating >= 4 &&
                        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
                      rating.rating === 3 &&
                        "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-200",
                      rating.rating === 2 &&
                        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
                      rating.rating <= 1 &&
                        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
                    )}
                  >
                    {rating.word}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Keep the momentum!</h3>
                <p className="text-sm text-muted-foreground">
                  Your vocabulary is growing. New words will be reviewed
                  according to the spaced repetition schedule for optimal
                  retention.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button size="lg" className="w-full h-14" onClick={onStartNewLesson}>
            <Sparkles className="h-5 w-5 mr-2" />
            Start Another Lesson
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onExit}
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>

        {/* Motivation Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4 border-t">
          <p className="flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            Consistency is key. Come back tomorrow to continue learning!
          </p>
        </div>
      </div>
    </div>
  );
}
