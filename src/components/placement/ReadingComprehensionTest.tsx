"use client";

import React, { useState, useEffect } from "react";
import { ReadingTestItem, TestResponse } from "@/types/placement-test";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

interface ReadingComprehensionTestProps {
  item: ReadingTestItem;
  itemIndex: number;
  totalItems: number;
  onAnswer: (response: TestResponse) => void;
}

export function ReadingComprehensionTest({
  item,
  itemIndex,
  totalItems,
  onAnswer,
}: ReadingComprehensionTestProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // Reset state when item changes
    setSelectedIndex(null);
  }, [item.id]);

  const handleSelectOption = (index: number) => {
    setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex === null) return;

    const response: TestResponse = {
      itemId: item.id,
      selectedIndex,
      isCorrect: selectedIndex === item.correctIndex,
      timeSpentMs: Date.now() - startTime,
    };

    onAnswer(response);
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
      A1: "Beginner",
      A2: "Elementary",
      B1: "Intermediate",
      B2: "Upper Intermediate",
      C1: "Advanced",
    };
    return labels[difficulty] || difficulty;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              Reading {itemIndex + 1} of {totalItems}
            </CardTitle>
          </div>
          <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded">
            {getDifficultyLabel(item.difficulty)}
          </span>
        </div>

        {/* Passage */}
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-lg leading-relaxed">{item.passage}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-2">
          <h3 className="font-medium text-lg">{item.question}</h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {item.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectOption(index)}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all",
                "hover:border-primary/50",
                selectedIndex === index
                  ? "border-primary bg-primary/5"
                  : "border-muted",
              )}
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-sm font-medium mr-3">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={selectedIndex === null}
          className="w-full"
          size="lg"
        >
          Submit Answer
        </Button>
      </CardContent>
    </Card>
  );
}
