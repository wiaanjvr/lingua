"use client";

import React, { useState, useEffect } from "react";
import {
  Lesson,
  Exercise,
  ExerciseAttempt,
  ExerciseType,
} from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  BookOpen,
  Brain,
  Zap,
  Trophy,
  RefreshCw,
  Lightbulb,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateExercisesForLesson } from "@/lib/lesson/engine";

interface InteractiveExercisesPhaseProps {
  lesson: Lesson;
  onExerciseAttempt: (attempt: ExerciseAttempt) => void;
  onPhaseComplete: () => void;
}

interface ExerciseResult {
  exerciseId: string;
  isCorrect: boolean;
  selectedAnswer: number;
  correctAnswer: number;
}

export function InteractiveExercisesPhase({
  lesson,
  onExerciseAttempt,
  onPhaseComplete,
}: InteractiveExercisesPhaseProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Generate exercises on mount
  useEffect(() => {
    const generated = generateExercisesForLesson(lesson, 6);
    setExercises(generated);
  }, [lesson]);

  const currentExercise = exercises[currentIndex];
  const isLastExercise = currentIndex === exercises.length - 1;
  const isComplete = currentIndex >= exercises.length;
  const score = results.filter((r) => r.isCorrect).length;
  const progress = (currentIndex / Math.max(exercises.length, 1)) * 100;

  const handleAnswer = (answerIndex: number) => {
    if (showFeedback) return;

    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    const isCorrect = answerIndex === currentExercise.correctAnswer;
    const timeSpent = Date.now() - startTime;

    const result: ExerciseResult = {
      exerciseId: currentExercise.id,
      isCorrect,
      selectedAnswer: answerIndex,
      correctAnswer: currentExercise.correctAnswer,
    };

    setResults((prev) => [...prev, result]);

    const attempt: ExerciseAttempt = {
      exerciseId: currentExercise.id,
      selectedAnswer: answerIndex,
      isCorrect,
      timeSpentMs: timeSpent,
    };

    onExerciseAttempt(attempt);
  };

  const handleNext = () => {
    if (isLastExercise) {
      setCurrentIndex(exercises.length); // Move to complete state
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setStartTime(Date.now());
    }
  };

  const getExerciseIcon = (type: ExerciseType) => {
    switch (type) {
      case "multiple-choice":
        return <Brain className="h-4 w-4" />;
      case "word-definition":
        return <BookOpen className="h-4 w-4" />;
      case "fill-blank":
        return <Zap className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getExerciseTypeLabel = (type: ExerciseType) => {
    switch (type) {
      case "multiple-choice":
        return "Comprehension";
      case "word-definition":
        return "Vocabulary";
      case "fill-blank":
        return "Fill in the Blank";
      case "grammar-choice":
        return "Grammar";
      case "word-match":
        return "Matching";
      case "sentence-order":
        return "Sentence Order";
      case "listening-select":
        return "Listening";
      default:
        return "Exercise";
    }
  };

  // Loading state
  if (exercises.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Generating exercises...</p>
        </div>
      </div>
    );
  }

  // Complete state
  if (isComplete) {
    const percentage = Math.round((score / exercises.length) * 100);

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-medium">Exercises Complete!</span>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="text-6xl font-bold text-primary">{percentage}%</div>
            <div className="text-xl font-medium">
              {score} of {exercises.length} correct
            </div>
            <p className="text-muted-foreground">
              {percentage >= 80
                ? "Excellent work! You've mastered this content."
                : percentage >= 60
                  ? "Good job! Keep practicing to improve."
                  : "Nice effort! Review the lesson to strengthen your understanding."}
            </p>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {exercises.length - score}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {exercises.length}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button size="lg" className="w-full h-14" onClick={onPhaseComplete}>
          Continue to Final Assessment
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    );
  }

  // Active exercise
  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Brain className="h-4 w-4" />
          <span className="text-sm font-medium">
            Phase 5: Practice Exercises
          </span>
        </div>
        <h1 className="text-2xl font-light">Test Your Understanding</h1>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {exercises.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />

          {/* Score indicator */}
          <div className="flex items-center justify-end gap-4 mt-2 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-4 w-4" /> {score}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <XCircle className="h-4 w-4" /> {results.length - score}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Current Exercise */}
      <Card
        className={cn(
          showFeedback &&
            selectedAnswer !== null &&
            (selectedAnswer === currentExercise.correctAnswer
              ? "border-green-500/50"
              : "border-red-500/50"),
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {getExerciseIcon(currentExercise.type)}
              {getExerciseTypeLabel(currentExercise.type)}
            </CardTitle>
            {currentExercise.targetWord && (
              <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium">
                {currentExercise.targetWord}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="text-lg font-medium text-center py-4">
            {currentExercise.question}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentExercise.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentExercise.correctAnswer;
              const showCorrect = showFeedback && isCorrect;
              const showIncorrect = showFeedback && isSelected && !isCorrect;

              return (
                <Button
                  key={index}
                  variant="outline"
                  className={cn(
                    "w-full h-auto py-4 justify-start text-left whitespace-normal",
                    isSelected &&
                      !showFeedback &&
                      "border-primary bg-primary/5",
                    showCorrect &&
                      "border-green-500 bg-green-50 dark:bg-green-950/30",
                    showIncorrect &&
                      "border-red-500 bg-red-50 dark:bg-red-950/30",
                  )}
                  onClick={() => handleAnswer(index)}
                  disabled={showFeedback}
                >
                  <span
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0",
                      isSelected &&
                        !showFeedback &&
                        "bg-primary text-primary-foreground",
                      showCorrect && "bg-green-500 text-white",
                      showIncorrect && "bg-red-500 text-white",
                      !isSelected && !showCorrect && "bg-muted",
                    )}
                  >
                    {showCorrect ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : showIncorrect ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </span>
                  <span>{option}</span>
                </Button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div
              className={cn(
                "p-4 rounded-lg",
                selectedAnswer === currentExercise.correctAnswer
                  ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800",
              )}
            >
              <div className="flex items-start gap-3">
                {selectedAnswer === currentExercise.correctAnswer ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p
                    className={cn(
                      "font-medium",
                      selectedAnswer === currentExercise.correctAnswer
                        ? "text-green-800 dark:text-green-200"
                        : "text-red-800 dark:text-red-200",
                    )}
                  >
                    {selectedAnswer === currentExercise.correctAnswer
                      ? "Correct!"
                      : "Not quite right"}
                  </p>
                  {currentExercise.explanation && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentExercise.explanation}
                    </p>
                  )}
                  {currentExercise.grammarNote && (
                    <div className="mt-2 flex items-start gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{currentExercise.grammarNote}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          {showFeedback && (
            <Button size="lg" className="w-full" onClick={handleNext}>
              {isLastExercise ? "See Results" : "Next Question"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
