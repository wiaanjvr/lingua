"use client";

import React from "react";
import { Loader2, BookOpen, Brain, Sparkles } from "lucide-react";

export function LessonLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-4">
        {/* Animated icon */}
        <div className="relative">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <div className="absolute inset-0 animate-ping">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/20" />
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-light">
            Preparing Your <span className="font-serif italic">Lesson</span>
          </h2>
          <p className="text-muted-foreground">
            Loading personalized content based on your vocabulary...
          </p>
        </div>

        {/* Spinner */}
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />

        {/* Tips carousel (could be animated) */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p>
              <strong>Tip:</strong> Focus on understanding the overall meaning
              first. You don't need to catch every word!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
