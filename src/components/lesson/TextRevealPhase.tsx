"use client";

import React, { useState, useRef, useEffect } from "react";
import { Lesson, LessonWord, VocabularyRating } from "@/types/lesson";
import { WordRating } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  CheckCircle2,
  BookOpen,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TextRevealPhaseProps {
  lesson: Lesson;
  onWordRating: (rating: VocabularyRating) => void;
  vocabularyRatings: VocabularyRating[];
  onPhaseComplete: () => void;
}

// Word rating descriptions
const RATING_LABELS: Record<
  WordRating,
  { label: string; description: string; color: string }
> = {
  0: {
    label: "Don't Know",
    description: "Never seen this word",
    color: "bg-red-500",
  },
  1: {
    label: "Barely",
    description: "Vaguely familiar",
    color: "bg-orange-500",
  },
  2: {
    label: "Hard",
    description: "Know it but struggle",
    color: "bg-amber-500",
  },
  3: { label: "Good", description: "Know it well", color: "bg-lime-500" },
  4: { label: "Easy", description: "Very comfortable", color: "bg-green-500" },
  5: {
    label: "Perfect",
    description: "Instant recall",
    color: "bg-emerald-500",
  },
};

export function TextRevealPhase({
  lesson,
  onWordRating,
  vocabularyRatings,
  onPhaseComplete,
}: TextRevealPhaseProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedWord, setSelectedWord] = useState<LessonWord | null>(null);
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get words that need rating (new or due for review)
  const wordsToRate = lesson.words.filter((w) => w.isNew || w.isDueForReview);
  const ratedWordLemmas = new Set(vocabularyRatings.map((r) => r.lemma));
  const allWordsRated = wordsToRate.every((w) => ratedWordLemmas.has(w.lemma));
  const progress =
    (vocabularyRatings.length / Math.max(wordsToRate.length, 1)) * 100;

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleWordClick = (word: LessonWord) => {
    if (word.isNew || word.isDueForReview) {
      setSelectedWord(word);
    }
  };

  const handleRating = (rating: WordRating) => {
    if (!selectedWord) return;

    const vocabRating: VocabularyRating = {
      lessonId: lesson.id,
      word: selectedWord.word,
      lemma: selectedWord.lemma,
      rating,
      context: extractContext(lesson.targetText, selectedWord.word),
    };

    onWordRating(vocabRating);
    setRevealedWords((prev) => new Set(prev).add(selectedWord.lemma));
    setSelectedWord(null);
  };

  const extractContext = (text: string, word: string): string => {
    const sentences = text.split(/[.!?]+/);
    const sentence = sentences.find((s) =>
      s.toLowerCase().includes(word.toLowerCase()),
    );
    return sentence?.trim() || "";
  };

  const renderWord = (word: LessonWord, index: number) => {
    const isRated = ratedWordLemmas.has(word.lemma);
    const isTargetWord = word.isNew || word.isDueForReview;
    const isSelected = selectedWord?.position === word.position;

    // Whitespace and punctuation
    if (/^[\s]+$/.test(word.word)) {
      return <span key={index}> </span>;
    }
    if (/^[.,;:!?'"()]+$/.test(word.word)) {
      return <span key={index}>{word.word}</span>;
    }

    let className = "transition-all duration-200 inline px-0.5 rounded ";

    if (isTargetWord) {
      if (isRated) {
        // Already rated - show green
        className +=
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 ";
      } else if (word.isNew) {
        // New word - highlight yellow, clickable
        className +=
          "bg-amber-200 dark:bg-amber-700/50 text-amber-900 dark:text-amber-100 cursor-pointer hover:bg-amber-300 dark:hover:bg-amber-600/50 font-medium ";
      } else {
        // Review word - highlight blue, clickable
        className +=
          "bg-blue-200 dark:bg-blue-700/50 text-blue-900 dark:text-blue-100 cursor-pointer hover:bg-blue-300 dark:hover:bg-blue-600/50 ";
      }
    }

    if (isSelected) {
      className += "ring-2 ring-primary ring-offset-2 ";
    }

    return (
      <span
        key={index}
        className={className}
        onClick={() => isTargetWord && !isRated && handleWordClick(word)}
      >
        {word.word}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">
            Phase 4: Text & Vocabulary
          </span>
        </div>
        <h1 className="text-2xl font-light">Read & Rate Your Knowledge</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Now you can see the text! Highlighted words are new or due for review.
          Click each one to rate how well you know it.
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Vocabulary Progress</span>
            <span className="text-sm text-muted-foreground">
              {vocabularyRatings.length} / {wordsToRate.length} words
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Audio Player */}
      <Card className="border-primary/20">
        <CardContent className="pt-4 pb-4">
          <audio
            ref={audioRef}
            src={lesson.audioUrl}
            onEnded={() => setIsPlaying(false)}
          />
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlayPause}
              className="h-12 w-12"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <div>
              <p className="font-medium">Listen while reading</p>
              <p className="text-sm text-muted-foreground">
                Follow along with the audio
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {lesson.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg leading-relaxed font-serif">
            {lesson.words.map((word, index) => renderWord(word, index))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-amber-200 dark:bg-amber-700/50" />
              <span>New word (click to rate)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-blue-200 dark:bg-blue-700/50" />
              <span>Review word</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30" />
              <span>Rated</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Word Rating Modal */}
      {selectedWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="border-primary shadow-lg w-full max-w-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl text-center">
                How well do you know:{" "}
                <span className="text-primary">"{selectedWord.word}"</span>?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedWord.translation && (
                <p className="text-center text-muted-foreground">
                  Translation: {selectedWord.translation}
                </p>
              )}

              {/* Rating Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {([0, 1, 2, 3, 4, 5] as WordRating[]).map((rating) => (
                  <Button
                    key={rating}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-1"
                    onClick={() => handleRating(rating)}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-3 h-3 rounded-full",
                          RATING_LABELS[rating].color,
                        )}
                      />
                      <span className="font-medium">
                        {RATING_LABELS[rating].label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {RATING_LABELS[rating].description}
                    </span>
                  </Button>
                ))}
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setSelectedWord(null)}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Translation (collapsed by default) */}
      <details className="group">
        <summary className="cursor-pointer list-none">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Show Translation</span>
                <span className="text-sm text-muted-foreground group-open:hidden">
                  Click to reveal
                </span>
                <span className="text-sm text-muted-foreground hidden group-open:inline">
                  Translation shown
                </span>
              </div>
            </CardContent>
          </Card>
        </summary>
        <Card className="mt-2 bg-muted/30">
          <CardContent className="pt-4 pb-4">
            <p className="text-muted-foreground">{lesson.translation}</p>
          </CardContent>
        </Card>
      </details>

      {/* Continue Button */}
      <Button
        size="lg"
        className="w-full h-14"
        onClick={onPhaseComplete}
        disabled={!allWordsRated}
      >
        {allWordsRated ? (
          <>
            Continue to Exercises
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        ) : (
          <>
            Rate {wordsToRate.length - vocabularyRatings.length} more word
            {wordsToRate.length - vocabularyRatings.length > 1 ? "s" : ""}
          </>
        )}
      </Button>
    </div>
  );
}
