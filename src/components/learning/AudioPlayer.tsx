"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioUrl: string;
  transcript?: string;
  showTranscript?: boolean;
  onPlaybackComplete?: () => void;
  className?: string;
}

export function AudioPlayer({
  audioUrl,
  transcript,
  showTranscript = false,
  onPlaybackComplete,
  className,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onPlaybackComplete?.();
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onPlaybackComplete]);

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
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const changePlaybackSpeed = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const speedOptions = [0.75, 1.0, 1.25, 1.5];

  return (
    <div className={cn("space-y-4", className)}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlayPause}
          className="h-12 w-12"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <div className="flex-1 space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatDuration(Math.floor(currentTime))}</span>
            <span>{formatDuration(Math.floor(duration))}</span>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={handleRestart}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Playback Speed Controls */}
      <div className="flex items-center justify-center gap-1">
        <span className="text-xs text-muted-foreground mr-2">Speed:</span>
        {speedOptions.map((speed) => (
          <Button
            key={speed}
            variant={playbackRate === speed ? "default" : "outline"}
            size="sm"
            onClick={() => changePlaybackSpeed(speed)}
            className="h-7 px-3 text-xs"
          >
            {speed}x
          </Button>
        ))}
      </div>

      {showTranscript && transcript && (
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <Volume2 className="h-4 w-4" />
            <span>Transcript</span>
          </div>
          <p className="text-sm leading-relaxed font-serif">{transcript}</p>
        </div>
      )}
    </div>
  );
}
