"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeacherPromptProps {
  text: string;
  language?: string;
  autoPlay?: boolean;
  onComplete?: () => void;
}

export function TeacherPrompt({
  text,
  language = "fr-FR",
  autoPlay = false,
  onComplete,
}: TeacherPromptProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [hasPlayed, setHasPlayed] = React.useState(false);

  const speak = React.useCallback(() => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.85;
      utterance.pitch = 1.0;

      // Try to find a French voice
      const voices = window.speechSynthesis.getVoices();
      const frenchVoice =
        voices.find(
          (v) =>
            v.lang.startsWith("fr") &&
            (v.name.includes("Google") || v.name.includes("Microsoft")),
        ) || voices.find((v) => v.lang.startsWith("fr"));

      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        setHasPlayed(true);
        onComplete?.();
      };

      window.speechSynthesis.speak(utterance);
    }
  }, [text, language, onComplete]);

  React.useEffect(() => {
    if (autoPlay && !hasPlayed) {
      // Small delay to ensure voices are loaded
      const timer = setTimeout(() => {
        speak();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, hasPlayed, speak]);

  return (
    <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-lg">
      <div className="flex items-start gap-3">
        <Volume2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-primary mb-1">
            Teacher Prompt
          </p>
          <p className="text-base mb-3">{text}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={speak}
            disabled={isPlaying}
            className="gap-2"
          >
            <Volume2 className="h-4 w-4" />
            {isPlaying
              ? "Speaking..."
              : hasPlayed
                ? "Hear Again"
                : "Hear Prompt"}
          </Button>
        </div>
      </div>
    </div>
  );
}
