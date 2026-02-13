"use client";

import React, { useState } from "react";
import { PredictionStage } from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictionStagePhaseProps {
  stage: PredictionStage;
  onComplete: (prediction: string) => void;
}

export function PredictionStagePhase({
  stage,
  onComplete,
}: PredictionStagePhaseProps) {
  const [prediction, setPrediction] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleContinue = () => {
    onComplete(prediction);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
          <Lightbulb className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <CardTitle className="text-xl">Prediction Stage</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Activate your brain before listening
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Keywords */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-center text-muted-foreground">
            Here are some keywords from the upcoming story:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {stage.keywords.map((keyword, idx) => (
              <span
                key={idx}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium",
                  idx === 0
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-2 ring-purple-300 dark:ring-purple-700"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                )}
              >
                {keyword}
                {idx === 0 && <Sparkles className="inline ml-1 h-3 w-3" />}
              </span>
            ))}
          </div>
          {stage.keywords.length > 0 && (
            <p className="text-xs text-center text-purple-600 dark:text-purple-400">
              <Sparkles className="inline h-3 w-3 mr-1" />
              New word
            </p>
          )}
        </div>

        {/* Prediction prompt */}
        <div className="space-y-3">
          <p className="text-center font-medium">{stage.predictionPrompt}</p>

          {!submitted ? (
            <>
              <Textarea
                value={prediction}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setPrediction(e.target.value)
                }
                placeholder="What do you think will happen? Write in any language..."
                rows={3}
                className="resize-none"
              />
              <Button
                onClick={handleSubmit}
                disabled={!prediction.trim()}
                className="w-full"
              >
                Share My Prediction
              </Button>
              <Button
                variant="ghost"
                onClick={() => onComplete("")}
                className="w-full text-muted-foreground"
              >
                Skip prediction
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <span className="font-medium">Your prediction:</span>{" "}
                  {prediction}
                </p>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Let's see how close you were! Listen carefully to the audio.
              </p>
              <Button onClick={handleContinue} className="w-full">
                Listen to the Story
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
