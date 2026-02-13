"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Lesson, LessonPhase, LESSON_PHASE_ORDER } from "@/types/lesson";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Headphones,
  MessageCircle,
  MessagesSquare,
  Eye,
  Brain,
  GraduationCap,
  RefreshCw,
  Sparkles,
  FileText,
  Lightbulb,
  Target,
  Mic,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonHeaderProps {
  lesson: Lesson;
  currentPhase: LessonPhase;
  progress: number;
  onExit: () => void;
}

const PHASE_CONFIG: Record<
  LessonPhase,
  { icon: React.ElementType; label: string; color: string }
> = {
  // New 10-phase structure
  "spaced-retrieval-warmup": {
    icon: RefreshCw,
    label: "Warmup",
    color: "text-cyan-500",
  },
  "prediction-stage": {
    icon: Sparkles,
    label: "Predict",
    color: "text-yellow-500",
  },
  "audio-text": {
    icon: Headphones,
    label: "Listen",
    color: "text-primary",
  },
  "first-recall": {
    icon: MessageCircle,
    label: "Recall",
    color: "text-blue-500",
  },
  "transcript-reveal": {
    icon: FileText,
    label: "Read",
    color: "text-emerald-500",
  },
  "guided-noticing": {
    icon: Lightbulb,
    label: "Notice",
    color: "text-orange-500",
  },
  "micro-drills": {
    icon: Target,
    label: "Drills",
    color: "text-red-500",
  },
  shadowing: {
    icon: Mic,
    label: "Shadow",
    color: "text-pink-500",
  },
  "second-recall": {
    icon: MessagesSquare,
    label: "Retell",
    color: "text-indigo-500",
  },
  "progress-reflection": {
    icon: TrendingUp,
    label: "Reflect",
    color: "text-purple-500",
  },
  // Legacy 6-phase structure
  "audio-comprehension": {
    icon: Headphones,
    label: "Listen",
    color: "text-primary",
  },
  "verbal-check": {
    icon: MessageCircle,
    label: "Speak",
    color: "text-blue-500",
  },
  "conversation-feedback": {
    icon: MessagesSquare,
    label: "Converse",
    color: "text-violet-500",
  },
  "text-reveal": {
    icon: Eye,
    label: "Read",
    color: "text-emerald-500",
  },
  "interactive-exercises": {
    icon: Brain,
    label: "Practice",
    color: "text-amber-500",
  },
  "final-assessment": {
    icon: GraduationCap,
    label: "Assess",
    color: "text-purple-500",
  },
};

// Legacy phase order
const LEGACY_PHASE_ORDER: LessonPhase[] = [
  "audio-comprehension",
  "verbal-check",
  "conversation-feedback",
  "text-reveal",
  "interactive-exercises",
  "final-assessment",
];

export function LessonHeader({
  lesson,
  currentPhase,
  progress,
  onExit,
}: LessonHeaderProps) {
  // Determine which phase order to use based on lesson structure
  const phaseOrder = lesson.content ? LESSON_PHASE_ORDER : LEGACY_PHASE_ORDER;
  const currentIndex = phaseOrder.indexOf(currentPhase);
  const config = PHASE_CONFIG[currentPhase];
  const Icon = config?.icon || Brain;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container max-w-4xl mx-auto">
        {/* Top Row */}
        <div className="flex items-center justify-between py-3 px-4">
          <Button variant="ghost" size="sm" onClick={onExit} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Exit Lesson</span>
          </Button>

          <div className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4", config.color)} />
            <span className="text-sm font-medium">{config.label}</span>
          </div>

          <span className="text-sm text-muted-foreground">{lesson.level}</span>
        </div>

        {/* Progress Bar */}
        <div className="pb-2 px-4">
          <Progress value={progress} className="h-1" />
        </div>

        {/* Phase Indicators */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 px-2 sm:px-4 pb-3 overflow-x-auto">
          {phaseOrder.map((phase, index) => {
            const phaseConfig = PHASE_CONFIG[phase];
            const PhaseIcon = phaseConfig?.icon || Brain;
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div
                key={phase}
                className={cn(
                  "flex flex-col items-center gap-1 flex-shrink-0",
                  isActive && "opacity-100",
                  isCompleted && "opacity-60",
                  !isActive && !isCompleted && "opacity-30",
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted && "bg-green-500 text-white",
                    !isActive && !isCompleted && "bg-muted",
                  )}
                >
                  <PhaseIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span
                  className={cn(
                    "text-[10px] hidden sm:block",
                    isActive && "font-medium",
                    !isActive && "text-muted-foreground",
                  )}
                >
                  {phaseConfig.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
