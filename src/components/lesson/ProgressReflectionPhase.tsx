"use client";

import React, { useState } from "react";
import { ProgressReflection } from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, ArrowRight, Check, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressReflectionPhaseProps {
  reflection: ProgressReflection;
  onComplete: (responses: Record<string, string>) => void;
}

export function ProgressReflectionPhase({
  reflection,
  onComplete,
}: ProgressReflectionPhaseProps) {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentResponse, setCurrentResponse] = useState("");

  const currentQuestion = reflection.questions[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === reflection.questions.length - 1;
  const answeredCount = Object.keys(responses).length;

  const handleSubmit = () => {
    const newResponses = {
      ...responses,
      [currentQuestion]: currentResponse,
    };
    setResponses(newResponses);

    if (isLastQuestion) {
      // Don't navigate away yet - show completion
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentResponse("");
    }
  };

  const handleComplete = () => {
    onComplete(responses);
  };

  // Show completion screen after all questions answered
  if (answeredCount === reflection.questions.length) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-3">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Lesson Complete!</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Great work on your reflection
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Summary of reflections */}
          <div className="space-y-3">
            {reflection.questions.map((question, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {question}
                </p>
                <p className="text-sm">{responses[question]}</p>
              </div>
            ))}
          </div>

          {/* Encouragement */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg text-center">
            <Sparkles className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-green-700 dark:text-green-300 font-medium">
              Noticing improvement is key to learning!
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Keep tracking your progress and you'll see steady gains.
            </p>
          </div>

          <Button onClick={handleComplete} className="w-full" size="lg">
            Finish Lesson
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-3">
          <TrendingUp className="h-6 w-6 text-rose-600 dark:text-rose-400" />
        </div>
        <CardTitle className="text-xl">Progress Reflection</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Think about your learning
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="flex justify-center gap-2">
          {reflection.questions.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                idx < currentQuestionIndex
                  ? "bg-green-500"
                  : idx === currentQuestionIndex
                    ? "bg-rose-500"
                    : "bg-gray-200 dark:bg-gray-700",
              )}
            />
          ))}
        </div>

        {/* Current question */}
        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
          <p className="text-lg font-medium text-center">{currentQuestion}</p>
        </div>

        {/* Response input */}
        <Textarea
          value={currentResponse}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setCurrentResponse(e.target.value)
          }
          placeholder="Take a moment to reflect..."
          rows={3}
          className="resize-none"
        />

        {/* Tip */}
        <p className="text-xs text-center text-muted-foreground">
          There's no wrong answer - honest reflection helps you learn better
        </p>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!currentResponse.trim()}
          className="w-full"
        >
          {isLastQuestion ? (
            <>
              Complete Reflection
              <Check className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Next Question
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
