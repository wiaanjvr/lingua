"use client";

import React, { useState, useRef, useEffect } from "react";
import { AudioText } from "@/types/lesson";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioTextPhaseProps {
  audioText: AudioText;
  listenCount: number;
  onListenComplete: () => void;
  onPhaseComplete: () => void;
}

const MIN_LISTENS = 2;

export function AudioTextPhase({
  audioText,
  listenCount,
  onListenComplete,
  onPhaseComplete,
}: AudioTextPhaseProps) {
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
          <Headphones className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle className="text-xl">Listen to the Story</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Focus on understanding - no text yet!
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Hidden audio element */}
        <audio ref={audioRef} src={audioText.audioUrl} preload="metadata" />

        {/* Listen count */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Volume2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">
              Listened: {listenCount} / {MIN_LISTENS} times
            </span>
          </div>
        </div>

        {/* Story info */}
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span>{audioText.sentenceCount} sentences</span>
          <span>•</span>
          <span>{audioText.wordCount} words</span>
          <span>•</span>
          <span>{audioText.knownWordPercentage}% familiar</span>
        </div>

        {/* Audio controls */}
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRestart}
              title="Restart"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button size="lg" onClick={togglePlayPause} className="w-24 h-12">
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-1" />
              )}
            </Button>

            {/* Speed control */}
            <div className="flex items-center gap-1">
              {[0.75, 1.0, 1.25].map((rate) => (
                <Button
                  key={rate}
                  variant={playbackRate === rate ? "default" : "outline"}
                  size="sm"
                  onClick={() => changeSpeed(rate)}
                  className="text-xs"
                >
                  {rate}x
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200">
          <p className="font-medium mb-1">Tips:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Don't worry about catching every word</li>
            <li>Focus on the overall meaning</li>
            <li>Listen at least twice before continuing</li>
          </ul>
        </div>

        {/* Continue button */}
        <Button
          onClick={onPhaseComplete}
          disabled={!canProceed}
          className="w-full"
        >
          {canProceed ? (
            <>
              Share What I Heard
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            `Listen ${MIN_LISTENS - listenCount} more time${MIN_LISTENS - listenCount > 1 ? "s" : ""}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
