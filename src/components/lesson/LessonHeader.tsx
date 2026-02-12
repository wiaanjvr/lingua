"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Lesson, LessonPhase } from "@/types/lesson";
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

const PHASE_ORDER: LessonPhase[] = [
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
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  const config = PHASE_CONFIG[currentPhase];
  const Icon = config.icon;

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
        <div className="flex items-center justify-between px-4 pb-3">
          {PHASE_ORDER.map((phase, index) => {
            const phaseConfig = PHASE_CONFIG[phase];
            const PhaseIcon = phaseConfig.icon;
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div
                key={phase}
                className={cn(
                  "flex flex-col items-center gap-1",
                  isActive && "opacity-100",
                  isCompleted && "opacity-60",
                  !isActive && !isCompleted && "opacity-30",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted && "bg-green-500 text-white",
                    !isActive && !isCompleted && "bg-muted",
                  )}
                >
                  <PhaseIcon className="h-4 w-4" />
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
