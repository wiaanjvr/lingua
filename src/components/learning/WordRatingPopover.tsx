"use client";

import { WordRating } from "@/types";
import { Button } from "@/components/ui/button";
import { X, XCircle, Circle, CheckCircle, Star } from "lucide-react";

interface WordRatingPopoverProps {
  word: string;
  onRate: (rating: WordRating) => void;
  onClose: () => void;
}

const RATING_OPTIONS = [
  {
    rating: 0 as WordRating,
    label: "Don't Know",
    description: "Never seen it",
    icon: XCircle,
  },
  {
    rating: 2 as WordRating,
    label: "Familiar",
    description: "Seen it before",
    icon: Circle,
  },
  {
    rating: 4 as WordRating,
    label: "Know It",
    description: "I understand it",
    icon: CheckCircle,
  },
  {
    rating: 5 as WordRating,
    label: "Mastered",
    description: "Use it confidently",
    icon: Star,
  },
];

export function WordRatingPopover({
  word,
  onRate,
  onClose,
}: WordRatingPopoverProps) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-luxury-xl max-w-lg w-full border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-zinc-200/50 dark:border-zinc-800/50 bg-gradient-to-b from-zinc-50/50 to-white dark:from-zinc-900/50 dark:to-zinc-900 p-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </Button>
          <div className="pr-12">
            <h3 className="text-sm font-light text-zinc-500 dark:text-zinc-400 mb-3 tracking-wide">
              How well do you know:
            </h3>
            <div className="text-4xl font-light tracking-tight bg-gradient-to-r from-zinc-900 via-stone-800 to-zinc-900 dark:from-zinc-100 dark:via-stone-200 dark:to-zinc-100 bg-clip-text text-transparent">
              {word}
            </div>
          </div>
        </div>

        {/* Rating Options */}
        <div className="p-8 space-y-3">
          <p className="text-center text-zinc-500 dark:text-zinc-400 font-light text-sm mb-6">
            Be honest - this helps you learn better!
          </p>

          <div className="space-y-2">
            {RATING_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.rating}
                  onClick={() => onRate(option.rating)}
                  className="group w-full relative bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl p-4 text-left transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                      <Icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-light text-base text-zinc-900 dark:text-zinc-100 mb-0.5">
                        {option.label}
                      </div>
                      <div className="text-xs font-light text-zinc-500 dark:text-zinc-400">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-6 text-center">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 font-light"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
