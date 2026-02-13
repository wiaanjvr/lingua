"use client";

import React, { useState } from "react";
import { SpacedRetrievalWarmup, RetrievalPrompt } from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Check, ArrowRight, Mic, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpacedRetrievalWarmupPhaseProps {
  warmup: SpacedRetrievalWarmup;
  onComplete: (responses: Record<string, string>) => void;
}

export function SpacedRetrievalWarmupPhase({
  warmup,
  onComplete,
}: SpacedRetrievalWarmupPhaseProps) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentResponse, setCurrentResponse] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const currentPrompt = warmup.prompts[currentPromptIndex];
  const isLastPrompt = currentPromptIndex === warmup.prompts.length - 1;

  const handleSubmit = () => {
    const newResponses = {
      ...responses,
      [currentPrompt.id]: currentResponse,
    };
    setResponses(newResponses);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (isLastPrompt) {
      onComplete(responses);
    } else {
      setCurrentPromptIndex(currentPromptIndex + 1);
      setCurrentResponse("");
      setShowFeedback(false);
    }
  };

  if (warmup.prompts.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No warmup items for this lesson.
          </p>
          <Button onClick={() => onComplete({})} className="mt-4">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
          <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <CardTitle className="text-xl">Spaced Retrieval Warmup</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Quick recall of previous vocabulary
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2">
          {warmup.prompts.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                idx < currentPromptIndex
                  ? "bg-green-500"
                  : idx === currentPromptIndex
                    ? "bg-purple-500"
                    : "bg-gray-200 dark:bg-gray-700",
              )}
            />
          ))}
        </div>

        {/* Current prompt */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {currentPrompt.type === "comprehension" ? (
              <MessageSquare className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            <span>
              {currentPrompt.type === "comprehension"
                ? "Comprehension"
                : "Production"}
            </span>
          </div>

          <p className="text-lg font-medium">{currentPrompt.prompt}</p>

          {!showFeedback ? (
            <div className="space-y-3">
              <Input
                value={currentResponse}
                onChange={(e) => setCurrentResponse(e.target.value)}
                placeholder="Type your answer..."
                className="text-center"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && currentResponse.trim()) {
                    handleSubmit();
                  }
                }}
              />
              <Button
                onClick={handleSubmit}
                disabled={!currentResponse.trim()}
                className="w-full"
              >
                Check
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-2">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Great recall!</span>
                </div>
                {currentPrompt.expectedResponse && (
                  <p className="text-sm text-muted-foreground">
                    Example: {currentPrompt.expectedResponse}
                  </p>
                )}
              </div>
              <Button onClick={handleNext} className="w-full">
                {isLastPrompt ? "Start Lesson" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
