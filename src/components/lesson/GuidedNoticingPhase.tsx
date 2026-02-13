"use client";

import React, { useState } from "react";
import { GuidedNoticing, GuidedNoticingItem } from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, ArrowRight, Check, Lightbulb, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuidedNoticingPhaseProps {
  noticing: GuidedNoticing;
  onComplete: (inferences: Record<string, string>) => void;
}

export function GuidedNoticingPhase({
  noticing,
  onComplete,
}: GuidedNoticingPhaseProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [inferences, setInferences] = useState<Record<string, string>>({});
  const [currentInference, setCurrentInference] = useState("");
  const [step, setStep] = useState<"infer" | "reveal" | "example">("infer");

  const currentItem = noticing.items[currentWordIndex];
  const isLastWord = currentWordIndex === noticing.items.length - 1;

  const handleSubmitInference = () => {
    setInferences({
      ...inferences,
      [currentItem.word]: currentInference,
    });
    setStep("reveal");
  };

  const handleNextStep = () => {
    if (step === "reveal") {
      setStep("example");
    } else if (step === "example") {
      if (isLastWord) {
        onComplete(inferences);
      } else {
        setCurrentWordIndex(currentWordIndex + 1);
        setCurrentInference("");
        setStep("infer");
      }
    }
  };

  if (noticing.items.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No new words to study in this lesson.
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
        <div className="mx-auto w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-3">
          <Eye className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        </div>
        <CardTitle className="text-xl">Guided Noticing</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Discover new words from context
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="flex justify-center gap-2">
          {noticing.items.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                idx < currentWordIndex
                  ? "bg-green-500"
                  : idx === currentWordIndex
                    ? "bg-teal-500"
                    : "bg-gray-200 dark:bg-gray-700",
              )}
            />
          ))}
        </div>

        {/* Current word */}
        <div className="text-center">
          <span className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-lg font-bold text-purple-700 dark:text-purple-300">
            {currentItem.word}
          </span>
        </div>

        {/* Context sentence */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Context:</p>
          <p className="text-lg italic">"{currentItem.contextSentence}"</p>
        </div>

        {step === "infer" && (
          <div className="space-y-4">
            <p className="text-center font-medium">
              {currentItem.inferencePrompt}
            </p>
            <Input
              value={currentInference}
              onChange={(e) => setCurrentInference(e.target.value)}
              placeholder="What do you think it means?"
              className="text-center"
              onKeyDown={(e) => {
                if (e.key === "Enter" && currentInference.trim()) {
                  handleSubmitInference();
                }
              }}
            />
            <Button
              onClick={handleSubmitInference}
              disabled={!currentInference.trim()}
              className="w-full"
            >
              Check My Guess
              <Lightbulb className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === "reveal" && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium">Meaning:</span>
              </div>
              <p className="text-lg">{currentItem.meaning}</p>
            </div>

            {inferences[currentItem.word] && (
              <p className="text-sm text-muted-foreground text-center">
                Your guess: "{inferences[currentItem.word]}"
              </p>
            )}

            <Button onClick={handleNextStep} className="w-full">
              See Example
              <BookOpen className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === "example" && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Additional example:</span>
              </div>
              <p className="text-lg italic">{currentItem.microExample}</p>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <p className="text-green-700 dark:text-green-300 font-medium">
                <span className="text-lg">{currentItem.word}</span> ={" "}
                {currentItem.meaning}
              </p>
            </div>

            <Button onClick={handleNextStep} className="w-full">
              {isLastWord ? "Continue to Practice" : "Next Word"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
