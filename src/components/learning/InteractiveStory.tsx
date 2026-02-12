"use client";

import { useState, useEffect, useRef } from "react";
import {
  GeneratedStory,
  StoryPhase,
  WordRating,
  InteractiveWord,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Volume2,
  Eye,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  SkipForward,
} from "lucide-react";
import { WordRatingPopover } from "./WordRatingPopover";

interface InteractiveStoryProps {
  story: GeneratedStory;
  onComplete: () => void;
  onWordRated: (word: string, rating: WordRating) => Promise<void>;
}

export function InteractiveStory({
  story,
  onComplete,
  onWordRated,
}: InteractiveStoryProps) {
  const [phase, setPhase] = useState<StoryPhase>("listen");
  const [isPlaying, setIsPlaying] = useState(false);
  const [listenCount, setListenCount] = useState(0);
  const [wordsRated, setWordsRated] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [ratedWords, setRatedWords] = useState<Set<string>>(new Set());

  const audioRef = useRef<HTMLAudioElement>(null);

  const totalNewWords = story.new_words.length;
  const progress = (wordsRated / totalNewWords) * 100;

  // Parse story into interactive words
  const [interactiveWords, setInteractiveWords] = useState<InteractiveWord[]>(
    [],
  );

  useEffect(() => {
    // Parse story text into words
    const words = story.content.split(/(\s+|[.,;:!?'"()])/);
    const newWordSet = new Set(story.new_words.map((w) => w.toLowerCase()));
    const reviewWordSet = new Set(
      story.review_words.map((w) => w.toLowerCase()),
    );

    const parsed = words.map((word, index) => {
      const cleanWord = word.trim().toLowerCase();
      return {
        text: word,
        lemma: cleanWord,
        isNew: newWordSet.has(cleanWord),
        isDueForReview: reviewWordSet.has(cleanWord),
        index,
      };
    });

    setInteractiveWords(parsed);
  }, [story]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      setListenCount((prev) => prev + 1);
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleStartReading = () => {
    setPhase("read");
  };

  const handleStartInteracting = () => {
    setPhase("interact");
  };

  const handleWordClick = (word: InteractiveWord) => {
    if (phase !== "interact") return;
    if (!word.isNew && !word.isDueForReview) return;

    setSelectedWord(word.lemma);
  };

  const handleWordRating = async (rating: WordRating) => {
    if (!selectedWord) return;

    await onWordRated(selectedWord, rating);

    // Update UI
    setRatedWords((prev) => new Set(prev).add(selectedWord));
    setWordsRated((prev) => prev + 1);
    setSelectedWord(null);

    // Check if all new words have been rated
    const newWordSet = new Set(story.new_words.map((w) => w.toLowerCase()));
    const allNewWordsRated = Array.from(newWordSet).every(
      (word) => ratedWords.has(word) || word === selectedWord,
    );

    if (allNewWordsRated && wordsRated + 1 >= totalNewWords) {
      setTimeout(() => {
        setPhase("completed");
      }, 500);
    }
  };

  const handleReset = () => {
    setPhase("listen");
    setListenCount(0);
    setWordsRated(0);
    setRatedWords(new Set());
  };

  const handleSkipRating = async () => {
    // Rate all unrated new words as 0 (don't know)
    const newWordSet = new Set(story.new_words.map((w) => w.toLowerCase()));
    const unratedWords = Array.from(newWordSet).filter(
      (word) => !ratedWords.has(word),
    );

    // Rate all unrated words as 0
    for (const word of unratedWords) {
      await onWordRated(word, 0);
    }

    // Move to completion
    setPhase("completed");
  };

  const renderWord = (word: InteractiveWord) => {
    const { text, lemma, isNew, isDueForReview } = word;

    // Don't style whitespace or punctuation
    if (/^\s+$/.test(text) || /^[.,;:!?'"()]+$/.test(text)) {
      return <span key={word.index}>{text}</span>;
    }

    const isRated = ratedWords.has(lemma);
    const isSelectable = phase === "interact" && (isNew || isDueForReview);

    let className = "transition-all duration-300 inline-block ";

    if (phase === "interact") {
      if (isNew) {
        className += isRated
          ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b-2 border-emerald-600 dark:border-emerald-400 px-1.5 py-0.5 rounded-sm font-medium text-emerald-900 dark:text-emerald-100"
          : "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 border-b-2 border-amber-500 dark:border-amber-400 px-1.5 py-0.5 rounded-sm cursor-pointer hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-900/50 dark:hover:to-yellow-900/50 hover:border-amber-600 dark:hover:border-amber-300 hover:shadow-md font-medium text-amber-900 dark:text-amber-100";
      } else if (isDueForReview) {
        className += isRated
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-2 border-blue-600 dark:border-blue-400 px-1.5 py-0.5 rounded-sm font-medium text-blue-900 dark:text-blue-100"
          : "bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/40 dark:to-red-950/40 border-b-2 border-orange-500 dark:border-orange-400 px-1.5 py-0.5 rounded-sm cursor-pointer hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/50 dark:hover:to-red-900/50 hover:border-orange-600 dark:hover:border-orange-300 hover:shadow-md font-medium text-orange-900 dark:text-orange-100";
      }
    } else if (phase === "read" && isNew) {
      className +=
        "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-b-2 border-amber-400 dark:border-amber-500 px-1.5 py-0.5 rounded-sm font-medium text-amber-900 dark:text-amber-100";
    }

    return (
      <span
        key={word.index}
        className={className}
        onClick={() => isSelectable && handleWordClick(word)}
      >
        {text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-neutral-50 dark:from-zinc-950 dark:via-neutral-950 dark:to-stone-950">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header with progress */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-luxury-lg border border-zinc-200/50 dark:border-zinc-800/50 p-6 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight bg-gradient-to-r from-zinc-900 via-stone-800 to-zinc-900 dark:from-zinc-100 dark:via-stone-200 dark:to-zinc-100 bg-clip-text text-transparent">
                {story.title}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light mt-2">
                Level {story.level} • {story.word_count} words
              </p>
            </div>
            {phase === "interact" && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-light bg-gradient-to-r from-zinc-900 via-stone-800 to-zinc-900 dark:from-zinc-100 dark:via-stone-200 dark:to-zinc-100 bg-clip-text text-transparent">
                    {wordsRated}/{totalNewWords}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
                    words rated
                  </div>
                </div>
              </div>
            )}
          </div>
          {phase === "interact" && (
            <div className="mt-4">
              <div className="h-2 bg-gradient-to-r from-zinc-100 via-stone-100 to-zinc-100 dark:from-zinc-800 dark:via-stone-800 dark:to-zinc-800 rounded-full overflow-hidden shadow-inner border border-zinc-200/50 dark:border-zinc-700/50">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 dark:from-amber-500 dark:via-yellow-600 dark:to-amber-500 transition-all duration-500 shadow-lg"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Phase: Listen */}
        {phase === "listen" && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-luxury-lg border border-zinc-200/50 dark:border-zinc-800/50 p-8 md:p-12 backdrop-blur-sm">
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-100 dark:from-amber-900/30 dark:via-yellow-900/30 dark:to-amber-900/30 rounded-full flex items-center justify-center shadow-luxury-lg border-2 border-amber-200 dark:border-amber-800/50">
                <Volume2 className="w-9 h-9 text-amber-700 dark:text-amber-400" />
              </div>
              <h3 className="text-3xl font-light tracking-tight bg-gradient-to-r from-zinc-900 via-stone-800 to-zinc-900 dark:from-zinc-100 dark:via-stone-200 dark:to-zinc-100 bg-clip-text text-transparent">
                First, listen
              </h3>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 font-light">
                \n Listen to the story at least once before reading. Focus on
                understanding the overall meaning.
              </p>

              {story.audio_url ? (
                <>
                  <audio
                    ref={audioRef}
                    src={story.audio_url}
                    onEnded={handleAudioEnded}
                  />

                  <div className="flex justify-center gap-4 pt-4">
                    <Button
                      size="lg"
                      onClick={handlePlayPause}
                      className="gap-3 px-8 py-6 text-lg rounded-xl font-light shadow-luxury-lg bg-gradient-to-r from-zinc-900 via-stone-900 to-zinc-900 hover:from-zinc-800 hover:via-stone-800 hover:to-zinc-800 dark:from-zinc-100 dark:via-stone-100 dark:to-zinc-100 dark:hover:from-zinc-200 dark:hover:via-stone-200 dark:hover:to-zinc-200 text-white dark:text-zinc-900 border border-zinc-800 dark:border-zinc-300"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-6 h-6" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-6 h-6" /> Play Story
                        </>
                      )}
                    </Button>
                  </div>

                  {listenCount > 0 && (
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800/50 shadow-md">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-light text-emerald-700 dark:text-emerald-300">
                        Listened {listenCount}{" "}
                        {listenCount === 1 ? "time" : "times"}
                      </span>
                    </div>
                  )}

                  <Button
                    onClick={handleStartReading}
                    size="lg"
                    variant="outline"
                    className="gap-2 mt-4 rounded-xl font-light border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-md"
                    disabled={listenCount === 0}
                  >
                    Continue to reading <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-zinc-600 dark:text-zinc-400 font-light mb-4">
                    No audio available for this story. You can skip directly to
                    reading.
                  </p>
                  <Button
                    onClick={handleStartReading}
                    size="lg"
                    className="gap-2 rounded-xl font-light shadow-luxury-lg bg-gradient-to-r from-zinc-900 via-stone-900 to-zinc-900 hover:from-zinc-800 hover:via-stone-800 hover:to-zinc-800 dark:from-zinc-100 dark:via-stone-100 dark:to-zinc-100 dark:hover:from-zinc-200 dark:hover:via-stone-200 dark:hover:to-zinc-200 text-white dark:text-zinc-900 border border-zinc-800 dark:border-zinc-300"
                  >
                    Continue to reading <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Phase: Read */}
        {phase === "read" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-luxury-lg border border-zinc-200/50 dark:border-zinc-800/50 p-8 md:p-10 backdrop-blur-sm text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-100 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mb-6 shadow-luxury-lg border-2 border-blue-200 dark:border-blue-800/50">
                <Eye className="w-9 h-9 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-light tracking-tight mb-3 bg-gradient-to-r from-zinc-900 via-stone-800 to-zinc-900 dark:from-zinc-100 dark:via-stone-200 dark:to-zinc-100 bg-clip-text text-transparent">
                Now, read along
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 font-light max-w-xl mx-auto">
                New words are highlighted. Try to understand them from context.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-luxury-lg border border-zinc-200/50 dark:border-zinc-800/50 p-8 md:p-12 backdrop-blur-sm">
              <div className="text-xl md:text-2xl leading-relaxed font-light space-y-1 text-zinc-800 dark:text-zinc-200">
                {interactiveWords.map(renderWord)}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleStartInteracting}
                size="lg"
                className="gap-2 px-8 py-6 text-lg rounded-xl font-light shadow-luxury-lg bg-gradient-to-r from-zinc-900 via-stone-900 to-zinc-900 hover:from-zinc-800 hover:via-stone-800 hover:to-zinc-800 dark:from-zinc-100 dark:via-stone-100 dark:to-zinc-100 dark:hover:from-zinc-200 dark:hover:via-stone-200 dark:hover:to-zinc-200 text-white dark:text-zinc-900 border border-zinc-800 dark:border-zinc-300"
              >
                Continue to practice <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Phase: Interact */}
        {phase === "interact" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-luxury-lg border border-zinc-200/50 dark:border-zinc-800/50 p-8 md:p-10 backdrop-blur-sm text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 via-fuchsia-100 to-purple-100 dark:from-purple-900/30 dark:via-fuchsia-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-6 shadow-luxury-lg border-2 border-purple-200 dark:border-purple-800/50">
                <Sparkles className="w-9 h-9 text-purple-700 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-light tracking-tight mb-3 bg-gradient-to-r from-zinc-900 via-stone-800 to-zinc-900 dark:from-zinc-100 dark:via-stone-200 dark:to-zinc-100 bg-clip-text text-transparent">
                Rate your knowledge
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 font-light max-w-xl mx-auto mb-6">
                Click on highlighted words to rate your knowledge. Or skip to
                continue.
              </p>
              <div className="flex flex-wrap gap-3 justify-center text-sm">
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 px-4 py-2 rounded-full border border-amber-200 dark:border-amber-800/50 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-sm"></div>
                  <span className="font-light text-amber-700 dark:text-amber-300">
                    New words
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 px-4 py-2 rounded-full border border-orange-200 dark:border-orange-800/50 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-sm"></div>
                  <span className="font-light text-orange-700 dark:text-orange-300">
                    Review words
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-sm"></div>
                  <span className="font-light text-emerald-700 dark:text-emerald-300">
                    Rated
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-luxury-lg border border-zinc-200/50 dark:border-zinc-800/50 p-8 md:p-12 backdrop-blur-sm">
              <div className="text-xl md:text-2xl leading-relaxed font-light space-y-1 text-zinc-800 dark:text-zinc-200">
                {interactiveWords.map(renderWord)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                onClick={handleSkipRating}
                size="lg"
                variant="outline"
                className="gap-2 px-6 py-6 text-base rounded-xl font-light border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-md"
              >
                <SkipForward className="w-5 h-5" />
                Skip Rating & Continue
              </Button>
              <Button
                onClick={() => {
                  if (wordsRated >= totalNewWords) {
                    setPhase("completed");
                  }
                }}
                size="lg"
                disabled={wordsRated < totalNewWords}
                className="gap-2 px-8 py-6 text-base rounded-xl font-light shadow-luxury-lg bg-gradient-to-r from-zinc-900 via-stone-900 to-zinc-900 hover:from-zinc-800 hover:via-stone-800 hover:to-zinc-800 dark:from-zinc-100 dark:via-stone-100 dark:to-zinc-100 dark:hover:from-zinc-200 dark:hover:via-stone-200 dark:hover:to-zinc-200 text-white dark:text-zinc-900 border border-zinc-800 dark:border-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {selectedWord && (
              <WordRatingPopover
                word={selectedWord}
                onRate={handleWordRating}
                onClose={() => setSelectedWord(null)}
              />
            )}
          </div>
        )}

        {/* Phase: Completed */}
        {phase === "completed" && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-luxury-lg border border-zinc-200/50 dark:border-zinc-800/50 p-8 md:p-12 backdrop-blur-sm">
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-100 via-teal-100 to-emerald-100 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center shadow-luxury-xl border-2 border-emerald-200 dark:border-emerald-800/50">
                <Check className="w-12 h-12 text-emerald-700 dark:text-emerald-400" />
              </div>
              <h3 className="text-3xl md:text-4xl font-light tracking-tight bg-gradient-to-r from-zinc-900 via-stone-800 to-zinc-900 dark:from-zinc-100 dark:via-stone-200 dark:to-zinc-100 bg-clip-text text-transparent">
                Great work!
              </h3>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 font-light">
                You've completed this story. Your progress has been saved.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                <Button
                  onClick={handleReset}
                  size="lg"
                  variant="outline"
                  className="gap-2 rounded-xl font-light border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-md"
                >
                  <RotateCcw className="w-5 h-5" /> Review again
                </Button>
                <Button
                  onClick={onComplete}
                  size="lg"
                  className="gap-2 rounded-xl font-light shadow-luxury-lg bg-gradient-to-r from-zinc-900 via-stone-900 to-zinc-900 hover:from-zinc-800 hover:via-stone-800 hover:to-zinc-800 dark:from-zinc-100 dark:via-stone-100 dark:to-zinc-100 dark:hover:from-zinc-200 dark:hover:via-stone-200 dark:hover:to-zinc-200 text-white dark:text-zinc-900 border border-zinc-800 dark:border-zinc-300"
                >
                  Continue learning <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
