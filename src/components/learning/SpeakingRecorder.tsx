"use client";

import React, { useState, useRef } from "react";
import { Mic, Square, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SpeakingRecorderProps {
  prompt: string;
  onRecordingComplete: (audioBlob: Blob) => void;
  className?: string;
}

export function SpeakingRecorder({
  prompt,
  onRecordingComplete,
  className,
}: SpeakingRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        onRecordingComplete(blob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl">Speaking Practice</CardTitle>
        <CardDescription>{prompt}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          {!isRecording && !audioBlob && (
            <Button size="lg" onClick={startRecording} className="gap-2">
              <Mic className="h-5 w-5" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button
              size="lg"
              variant="default"
              onClick={stopRecording}
              className="gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <Square className="h-5 w-5" />
              Stop Recording
            </Button>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center justify-center">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 bg-red-500 rounded-full animate-pulse",
                    i === 0 && "h-4",
                    i === 1 && "h-6",
                    i === 2 && "h-4",
                  )}
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="ml-3 text-sm text-muted-foreground">
              Recording...
            </span>
          </div>
        )}

        {audioBlob && audioUrl && (
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <audio src={audioUrl} controls className="w-full" />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={deleteRecording}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete & Re-record
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
