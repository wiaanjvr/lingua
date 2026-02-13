"use client";

import React, { useState } from "react";
import { TranscriptWithHighlights, HighlightedWord } from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptRevealPhaseProps {
  transcript: TranscriptWithHighlights;
  onComplete: () => void;
}

export function TranscriptRevealPhase({
  transcript,
  onComplete,
}: TranscriptRevealPhaseProps) {
  const [revealed, setRevealed] = useState(false);
  const [selectedWord, setSelectedWord] = useState<HighlightedWord | null>(
    null,
  );

  const renderHighlightedText = () => {
    const { storyText, highlightedWords } = transcript;

    if (highlightedWords.length === 0) {
      return <p className="text-lg leading-relaxed">{storyText}</p>;
    }

    // Sort highlights by position
    const sortedHighlights = [...highlightedWords].sort(
      (a, b) => a.startIndex - b.startIndex,
    );

    const elements: React.ReactNode[] = [];
    let lastEnd = 0;

    sortedHighlights.forEach((highlight, idx) => {
      // Add text before this highlight
      if (highlight.startIndex > lastEnd) {
        elements.push(
          <span key={`text-${idx}`}>
            {storyText.slice(lastEnd, highlight.startIndex)}
          </span>,
        );
      }

      // Add the highlighted word
      elements.push(
        <span
          key={`highlight-${idx}`}
          onClick={() => setSelectedWord(highlight)}
          className={cn(
            "cursor-pointer rounded px-1 transition-colors",
            highlight.highlightType === "new"
              ? "bg-purple-200 dark:bg-purple-800/50 text-purple-900 dark:text-purple-100 font-medium underline decoration-purple-400 decoration-2"
              : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
            selectedWord?.word === highlight.word &&
              "ring-2 ring-offset-1 ring-purple-500",
          )}
        >
          {highlight.word}
        </span>,
      );

      lastEnd = highlight.endIndex;
    });

    // Add remaining text
    if (lastEnd < storyText.length) {
      elements.push(<span key="text-end">{storyText.slice(lastEnd)}</span>);
    }

    return <p className="text-lg leading-relaxed">{elements}</p>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
          <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <CardTitle className="text-xl">Transcript Reveal</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Now see the text with vocabulary highlighted
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {!revealed ? (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Ready to see the text? Compare it with what you heard and
              understood.
            </p>
            <Button onClick={() => setRevealed(true)} className="w-full">
              Reveal Transcript
              <FileText className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            {/* Legend */}
            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-purple-200 dark:bg-purple-800/50 rounded" />
                <span>
                  New word <Sparkles className="inline h-3 w-3" />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded" />
                <span>
                  Review word <RefreshCw className="inline h-3 w-3" />
                </span>
              </div>
            </div>

            {/* Transcript */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {renderHighlightedText()}
            </div>

            {/* Selected word info */}
            {selectedWord && (
              <div
                className={cn(
                  "p-4 rounded-lg transition-all",
                  selectedWord.highlightType === "new"
                    ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
                    : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {selectedWord.highlightType === "new" ? (
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  ) : (
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="font-bold text-lg">{selectedWord.word}</span>
                  <span className="text-muted-foreground">
                    ({selectedWord.lemma})
                  </span>
                </div>
                {selectedWord.translation && (
                  <p className="text-sm">
                    <span className="font-medium">Meaning:</span>{" "}
                    {selectedWord.translation}
                  </p>
                )}
              </div>
            )}

            <p className="text-sm text-center text-muted-foreground">
              Tap on any highlighted word to see its meaning
            </p>

            <Button onClick={onComplete} className="w-full">
              Continue to Vocabulary Study
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
