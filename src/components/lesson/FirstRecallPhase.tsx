"use client";

import React, { useState, useRef, useEffect } from "react";
import { FirstRecallPrompt } from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, ArrowRight, MessageSquare, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FirstRecallPhaseProps {
  prompt: FirstRecallPrompt;
  onComplete: (response: { text?: string; audioUrl?: string }) => void;
}

export function FirstRecallPhase({
  prompt,
  onComplete,
}: FirstRecallPhaseProps) {
  const [mode, setMode] = useState<"choose" | "text" | "voice">("choose");
  const [textResponse, setTextResponse] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setHasRecorded(true);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "text") {
      onComplete({ text: textResponse });
    } else if (mode === "voice" && audioUrl) {
      onComplete({ audioUrl });
    }
  };

  if (mode === "choose") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
            <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-xl">First Recall</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {prompt.instruction}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-center text-sm text-muted-foreground">
            {prompt.encouragement}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => setMode("voice")}
            >
              <Mic className="h-8 w-8" />
              <span>Speak</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => setMode("text")}
            >
              <MessageSquare className="h-8 w-8" />
              <span>Type</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => onComplete({})}
          >
            Skip this step
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
          {mode === "voice" ? (
            <Mic className="h-6 w-6 text-green-600 dark:text-green-400" />
          ) : (
            <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
          )}
        </div>
        <CardTitle className="text-xl">
          {mode === "voice" ? "Record Your Summary" : "Write Your Summary"}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {prompt.encouragement}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {mode === "voice" ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className={cn(
                  "w-24 h-24 rounded-full",
                  isRecording && "animate-pulse",
                )}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
            </div>

            <p className="text-center text-sm">
              {isRecording
                ? "Recording... Click to stop"
                : hasRecorded
                  ? "Recording saved! Click to re-record"
                  : "Click to start recording"}
            </p>

            {audioUrl && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Volume2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Preview:</span>
                </div>
                <audio src={audioUrl} controls className="w-full" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              value={textResponse}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setTextResponse(e.target.value)
              }
              placeholder="Describe what you heard in your own words..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-center">
              You can write in any language. Just share what you understood!
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setMode("choose")}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              (mode === "text" && !textResponse.trim()) ||
              (mode === "voice" && !audioUrl)
            }
            className="flex-1"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
