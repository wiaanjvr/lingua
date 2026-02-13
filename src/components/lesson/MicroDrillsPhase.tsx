"use client";

import React, { useState } from "react";
import {
  MicroDrills,
  MicroDrill,
  SentenceReconstructionDrill,
  ParaphraseDrill,
  ConstrainedOutputDrill,
} from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dumbbell,
  ArrowRight,
  Check,
  Shuffle,
  MessageSquare,
  PenTool,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MicroDrillsPhaseProps {
  drills: MicroDrills;
  onComplete: (
    results: Record<number, { response: string; correct: boolean }>,
  ) => void;
}

export function MicroDrillsPhase({
  drills,
  onComplete,
}: MicroDrillsPhaseProps) {
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [results, setResults] = useState<
    Record<number, { response: string; correct: boolean }>
  >({});
  const [currentResponse, setCurrentResponse] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const currentDrill = drills.drills[currentDrillIndex];
  const isLastDrill = currentDrillIndex === drills.drills.length - 1;

  const handleSubmit = () => {
    const response =
      currentDrill.type === "reconstruction"
        ? selectedWords.join(" ")
        : currentResponse;

    setResults({
      ...results,
      [currentDrillIndex]: { response, correct: true }, // Simplified - always "correct" for open exercises
    });
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (isLastDrill) {
      onComplete(results);
    } else {
      setCurrentDrillIndex(currentDrillIndex + 1);
      setCurrentResponse("");
      setSelectedWords([]);
      setShowFeedback(false);
    }
  };

  const toggleWord = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const resetWords = () => {
    setSelectedWords([]);
  };

  const getDrillIcon = (type: string) => {
    switch (type) {
      case "reconstruction":
        return <Shuffle className="h-6 w-6" />;
      case "paraphrase":
        return <MessageSquare className="h-6 w-6" />;
      case "constrained-output":
        return <PenTool className="h-6 w-6" />;
      default:
        return <Dumbbell className="h-6 w-6" />;
    }
  };

  const getDrillTitle = (type: string) => {
    switch (type) {
      case "reconstruction":
        return "Sentence Reconstruction";
      case "paraphrase":
        return "Paraphrase";
      case "constrained-output":
        return "Creative Output";
      default:
        return "Exercise";
    }
  };

  if (drills.drills.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No drills for this lesson.</p>
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
        <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3 text-orange-600 dark:text-orange-400">
          {getDrillIcon(currentDrill.type)}
        </div>
        <CardTitle className="text-xl">Micro Drills</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {getDrillTitle(currentDrill.type)}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="flex justify-center gap-2">
          {drills.drills.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                idx < currentDrillIndex
                  ? "bg-green-500"
                  : idx === currentDrillIndex
                    ? "bg-orange-500"
                    : "bg-gray-200 dark:bg-gray-700",
              )}
            />
          ))}
        </div>

        {/* Drill content */}
        {currentDrill.type === "reconstruction" && (
          <ReconstructionDrill
            drill={currentDrill as SentenceReconstructionDrill}
            selectedWords={selectedWords}
            onToggleWord={toggleWord}
            onReset={resetWords}
            showFeedback={showFeedback}
          />
        )}

        {currentDrill.type === "paraphrase" && (
          <ParaphraseDrillComponent
            drill={currentDrill as ParaphraseDrill}
            response={currentResponse}
            onResponseChange={setCurrentResponse}
            showFeedback={showFeedback}
          />
        )}

        {currentDrill.type === "constrained-output" && (
          <ConstrainedOutputDrillComponent
            drill={currentDrill as ConstrainedOutputDrill}
            response={currentResponse}
            onResponseChange={setCurrentResponse}
            showFeedback={showFeedback}
          />
        )}

        {/* Actions */}
        {!showFeedback ? (
          <Button
            onClick={handleSubmit}
            disabled={
              (currentDrill.type === "reconstruction" &&
                selectedWords.length === 0) ||
              (currentDrill.type !== "reconstruction" &&
                !currentResponse.trim())
            }
            className="w-full"
          >
            Check
            <Check className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleNext} className="w-full">
            {isLastDrill ? "Continue to Shadowing" : "Next Drill"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Sub-components for each drill type

interface ReconstructionDrillProps {
  drill: SentenceReconstructionDrill;
  selectedWords: string[];
  onToggleWord: (word: string) => void;
  onReset: () => void;
  showFeedback: boolean;
}

function ReconstructionDrill({
  drill,
  selectedWords,
  onToggleWord,
  onReset,
  showFeedback,
}: ReconstructionDrillProps) {
  const availableWords = drill.scrambledWords.filter(
    (w) => !selectedWords.includes(w),
  );

  return (
    <div className="space-y-4">
      <p className="text-center text-muted-foreground">
        Arrange the words to form the correct sentence:
      </p>

      {/* Selected words area */}
      <div className="min-h-[60px] p-4 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800/50">
        {selectedWords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedWords.map((word, idx) => (
              <Button
                key={idx}
                variant="secondary"
                size="sm"
                onClick={() => !showFeedback && onToggleWord(word)}
                disabled={showFeedback}
              >
                {word}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm">
            Click words below to build the sentence
          </p>
        )}
      </div>

      {/* Available words */}
      {!showFeedback && (
        <div className="flex flex-wrap justify-center gap-2">
          {availableWords.map((word, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => onToggleWord(word)}
            >
              {word}
            </Button>
          ))}
        </div>
      )}

      {/* Reset button */}
      {!showFeedback && selectedWords.length > 0 && (
        <Button variant="ghost" size="sm" onClick={onReset} className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      )}

      {/* Feedback */}
      {showFeedback && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
            Original sentence:
          </p>
          <p className="italic">{drill.originalSentence}</p>
        </div>
      )}

      {drill.hint && !showFeedback && (
        <p className="text-xs text-center text-muted-foreground">
          Hint: {drill.hint}
        </p>
      )}
    </div>
  );
}

interface ParaphraseDrillProps {
  drill: ParaphraseDrill;
  response: string;
  onResponseChange: (value: string) => void;
  showFeedback: boolean;
}

function ParaphraseDrillComponent({
  drill,
  response,
  onResponseChange,
  showFeedback,
}: ParaphraseDrillProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Original:</p>
        <p className="text-lg italic">"{drill.originalSentence}"</p>
      </div>

      <p className="text-center font-medium">{drill.instruction}</p>

      <Textarea
        value={response}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onResponseChange(e.target.value)
        }
        placeholder="Write your paraphrase..."
        rows={2}
        disabled={showFeedback}
        className="resize-none"
      />

      {showFeedback && drill.sampleAnswer && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
            Sample answer:
          </p>
          <p className="italic">{drill.sampleAnswer}</p>
        </div>
      )}
    </div>
  );
}

interface ConstrainedOutputDrillProps {
  drill: ConstrainedOutputDrill;
  response: string;
  onResponseChange: (value: string) => void;
  showFeedback: boolean;
}

function ConstrainedOutputDrillComponent({
  drill,
  response,
  onResponseChange,
  showFeedback,
}: ConstrainedOutputDrillProps) {
  return (
    <div className="space-y-4">
      <p className="text-center font-medium">{drill.instruction}</p>

      <div className="flex flex-wrap justify-center gap-2">
        {drill.requiredWords.map((word, idx) => (
          <span
            key={idx}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              response.toLowerCase().includes(word.toLowerCase())
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
            )}
          >
            {word}
            {response.toLowerCase().includes(word.toLowerCase()) && (
              <Check className="inline ml-1 h-3 w-3" />
            )}
          </span>
        ))}
      </div>

      {drill.context && (
        <p className="text-sm text-center text-muted-foreground">
          {drill.context}
        </p>
      )}

      <Textarea
        value={response}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onResponseChange(e.target.value)
        }
        placeholder="Write your sentence using the required words..."
        rows={2}
        disabled={showFeedback}
        className="resize-none"
      />

      {showFeedback && drill.sampleAnswer && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
            Sample answer:
          </p>
          <p className="italic">{drill.sampleAnswer}</p>
        </div>
      )}
    </div>
  );
}
