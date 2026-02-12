"use client";

import React, { useState, useRef, useEffect } from "react";
import { Lesson } from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Volume2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioComprehensionPhaseProps {
  lesson: Lesson;
  listenCount: number;
  onListenComplete: () => void;
  onPhaseComplete: () => void;
}

const MIN_LISTENS = 2; // Minimum listens before proceeding

export function AudioComprehensionPhase({
  lesson,
  listenCount,
  onListenComplete,
  onPhaseComplete,
}: AudioComprehensionPhaseProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      onListenComplete();
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onListenComplete]);

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

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play();
    setIsPlaying(true);
  };

  const changeSpeed = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const canProceed = listenCount >= MIN_LISTENS;

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <Headphones className="h-4 w-4" />
          <span className="text-sm font-medium">
            Phase 1: Listen & Understand
          </span>
        </div>
        <h1 className="text-2xl font-light">Listen to the Audio</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Focus on understanding the meaning. Don't worry about every word.
          Listen at least {MIN_LISTENS} times before continuing.
        </p>
      </div>

      {/* Audio Player Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg font-medium">{lesson.title}</span>
            <span className="text-sm text-muted-foreground capitalize">
              Level: {lesson.level}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <audio ref={audioRef} src={lesson.audioUrl} preload="metadata" />

          {/* Visualizer placeholder */}
          <div className="h-24 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
            <div
              className={cn(
                "flex items-center gap-1",
                isPlaying && "animate-pulse",
              )}
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 bg-primary/60 rounded-full transition-all duration-300",
                    isPlaying ? "animate-bounce" : "h-4",
                  )}
                  style={{
                    height: isPlaying ? `${Math.random() * 40 + 20}px` : "16px",
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRestart}
              className="h-10 w-10"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              size="lg"
              onClick={togglePlayPause}
              className="h-14 w-14 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => changeSpeed(playbackRate === 1 ? 0.75 : 1)}
              className="h-10 w-10"
            >
              <span className="text-xs font-medium">{playbackRate}x</span>
            </Button>
          </div>

          {/* Speed options */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Speed:</span>
            {[0.5, 0.75, 1.0, 1.25].map((speed) => (
              <Button
                key={speed}
                variant={playbackRate === speed ? "default" : "ghost"}
                size="sm"
                onClick={() => changeSpeed(speed)}
                className="h-7 px-2 text-xs"
              >
                {speed}x
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Listen Counter */}
      <Card
        className={cn(
          "transition-colors",
          canProceed
            ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
            : "",
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  canProceed ? "bg-green-500 text-white" : "bg-muted",
                )}
              >
                {canProceed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {canProceed ? "Ready to continue!" : "Keep listening..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  Listened {listenCount} of {MIN_LISTENS} times
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {[...Array(MIN_LISTENS)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full transition-colors",
                    i < listenCount ? "bg-green-500" : "bg-muted",
                  )}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-medium mb-2">Listening Tips:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Focus on the overall meaning, not individual words</li>
          <li>• Try to identify: Who? What? Where? When?</li>
          <li>• Use the slower speed if needed</li>
          <li>• Don't worry if you miss some details</li>
        </ul>
      </div>

      {/* Continue Button */}
      <Button
        size="lg"
        className="w-full h-14"
        onClick={onPhaseComplete}
        disabled={!canProceed}
      >
        {canProceed ? (
          <>
            Continue to Speaking
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        ) : (
          <>
            Listen {MIN_LISTENS - listenCount} more time
            {MIN_LISTENS - listenCount > 1 ? "s" : ""}
          </>
        )}
      </Button>
    </div>
  );
}
