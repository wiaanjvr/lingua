"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VocabularyExercise {
  word: string;
  definition: string;
  options: string[];
  correctAnswer: number;
}

interface VocabularyPracticeProps {
  vocabulary: VocabularyExercise[];
  onComplete: () => void;
}

export function VocabularyPractice({
  vocabulary,
  onComplete,
}: VocabularyPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentExercise = vocabulary[currentIndex];

  const handleSelect = (index: number) => {
    if (hasAnswered) return;

    setSelectedAnswer(index);
    setHasAnswered(true);

    if (index === currentExercise.correctAnswer) {
      setCorrectCount((prev) => prev + 1);
    }

    // Auto advance after delay
    setTimeout(() => {
      if (currentIndex < vocabulary.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setHasAnswered(false);
      } else {
        // Completed all exercises
        setTimeout(onComplete, 1500);
      }
    }, 2000);
  };

  const progress = ((currentIndex + 1) / vocabulary.length) * 100;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-muted-foreground">
              Vocabulary {currentIndex + 1} of {vocabulary.length}
            </p>
            <p className="text-sm text-muted-foreground">
              Score: {correctCount}/{currentIndex + (hasAnswered ? 1 : 0)}
            </p>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2 font-serif">
            {currentExercise.word}
          </h3>
          <p className="text-muted-foreground">What does this word mean?</p>
        </div>

        <div className="space-y-3">
          {currentExercise.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentExercise.correctAnswer;
            const showCorrect = hasAnswered && isCorrect;
            const showIncorrect = hasAnswered && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={hasAnswered}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all",
                  "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                  {
                    "border-green-500 bg-green-50": showCorrect,
                    "border-red-500 bg-red-50": showIncorrect,
                    "border-muted": !isSelected && !hasAnswered,
                    "cursor-not-allowed opacity-60":
                      hasAnswered && !isSelected && !isCorrect,
                  },
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showCorrect && <Check className="h-5 w-5 text-green-600" />}
                  {showIncorrect && <X className="h-5 w-5 text-red-600" />}
                </div>
              </button>
            );
          })}
        </div>

        {hasAnswered && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm">
              <strong>Definition:</strong> {currentExercise.definition}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
