"use client";

import React from "react";
import {
  Check,
  Headphones,
  MessageCircle,
  BookOpen,
  Book,
  RotateCcw,
  Mic,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SessionPhase =
  | "initial-listening"
  | "conversation"
  | "speech-feedback"
  | "vocabulary"
  | "reading"
  | "re-listening"
  | "final-speaking"
  | "complete";

interface PhaseIndicatorProps {
  currentPhase: SessionPhase;
}

const phases = [
  { id: "initial-listening", label: "Listen", Icon: Headphones },
  { id: "conversation", label: "Converse", Icon: MessageCircle },
  { id: "speech-feedback", label: "Feedback", Icon: Award },
  { id: "vocabulary", label: "Vocab", Icon: BookOpen },
  { id: "reading", label: "Read", Icon: Book },
  { id: "re-listening", label: "Re-listen", Icon: RotateCcw },
  { id: "final-speaking", label: "Retell", Icon: Mic },
];

export function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  const currentIndex = phases.findIndex((p) => p.id === currentPhase);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(currentIndex / (phases.length - 1)) * 100}%` }}
          />
        </div>

        {/* Phase Steps */}
        <div className="relative flex justify-between">
          {phases.map((phase, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isUpcoming = index > currentIndex;

            return (
              <div key={phase.id} className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 border-2 relative z-10",
                    isCompleted &&
                      "bg-primary border-primary text-primary-foreground scale-100",
                    isCurrent &&
                      "bg-background border-primary ring-4 ring-primary/20 scale-110 shadow-lg",
                    isUpcoming &&
                      "bg-background border-muted-foreground/20 text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <phase.Icon className="h-5 w-5" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs mt-2 font-medium transition-colors hidden sm:block",
                    isCurrent && "text-primary font-semibold",
                    isCompleted && "text-foreground",
                    isUpcoming && "text-muted-foreground",
                  )}
                >
                  {phase.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
