import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getProficiencyLabel(level: string): string {
  const labels: Record<string, string> = {
    A1: "Beginner",
    A2: "Elementary",
    B1: "Intermediate",
    B2: "Upper Intermediate",
    C1: "Advanced",
    C2: "Mastery",
  };
  return labels[level] || level;
}

export function calculateComprehensionScore(
  correctAnswers: number,
  totalQuestions: number,
): number {
  return Math.round((correctAnswers / totalQuestions) * 100);
}
