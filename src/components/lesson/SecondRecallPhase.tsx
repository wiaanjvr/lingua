"use client";

import React, { useState, useRef } from "react";
import { SecondRecallPrompt } from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Mic,
  MicOff,
  ArrowRight,
  Volume2,
  Check,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SecondRecallPhaseProps {
  prompt: SecondRecallPrompt;
  onComplete: (response: { text?: string; audioUrl?: string }) => void;
}

export function SecondRecallPhase({
  prompt,
  onComplete,
}: SecondRecallPhaseProps) {
  const [mode, setMode] = useState<"choose" | "text" | "voice">("choose");
  const [textResponse, setTextResponse] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Check if required words are present in the text response
  const checkRequiredWords = (text: string) => {
    const lowerText = text.toLowerCase();
    const newWordsPresent = prompt.requiredNewWords.filter((w) =>
      lowerText.includes(w.toLowerCase()),
    );
    const reviewWordsPresent = prompt.requiredReviewWords.filter((w) =>
      lowerText.includes(w.toLowerCase()),
    );
    return {
      newWordsPresent,
      reviewWordsPresent,
      allNewPresent: newWordsPresent.length >= 2,
      allReviewPresent: reviewWordsPresent.length >= 1,
    };
  };

  const wordCheck = checkRequiredWords(textResponse);

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
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
            <MessageSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-xl">Second Recall</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {prompt.instruction}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Required words */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">
              Try to include these words:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {prompt.requiredNewWords.map((word, idx) => (
                <span
                  key={`new-${idx}`}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                >
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  {word}
                </span>
              ))}
              {prompt.requiredReviewWords.map((word, idx) => (
                <span
                  key={`review-${idx}`}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                >
                  <RefreshCw className="inline h-3 w-3 mr-1" />
                  {word}
                </span>
              ))}
            </div>
          </div>

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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
          {mode === "voice" ? (
            <Mic className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <MessageSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          )}
        </div>
        <CardTitle className="text-xl">
          {mode === "voice" ? "Record Your Retelling" : "Write Your Retelling"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Required words tracker */}
        <div className="flex flex-wrap justify-center gap-2">
          {prompt.requiredNewWords.map((word, idx) => (
            <span
              key={`new-${idx}`}
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                mode === "text" &&
                  textResponse.toLowerCase().includes(word.toLowerCase())
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
              )}
            >
              {word}
              {mode === "text" &&
                textResponse.toLowerCase().includes(word.toLowerCase()) && (
                  <Check className="inline ml-1 h-3 w-3" />
                )}
            </span>
          ))}
          {prompt.requiredReviewWords.map((word, idx) => (
            <span
              key={`review-${idx}`}
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                mode === "text" &&
                  textResponse.toLowerCase().includes(word.toLowerCase())
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
              )}
            >
              {word}
              {mode === "text" &&
                textResponse.toLowerCase().includes(word.toLowerCase()) && (
                  <Check className="inline ml-1 h-3 w-3" />
                )}
            </span>
          ))}
        </div>

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
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Volume2 className="h-4 w-4 text-emerald-600" />
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
              placeholder="Retell the story using the highlighted words..."
              rows={4}
              className="resize-none"
            />

            {/* Word usage feedback */}
            {textResponse.trim() && (
              <div className="text-sm text-center">
                {wordCheck.allNewPresent && wordCheck.allReviewPresent ? (
                  <span className="text-green-600 dark:text-green-400">
                    <Check className="inline h-4 w-4 mr-1" />
                    Great! You've used all the required words!
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Try to include{" "}
                    {!wordCheck.allNewPresent && "more new words"}
                    {!wordCheck.allNewPresent &&
                      !wordCheck.allReviewPresent &&
                      " and "}
                    {!wordCheck.allReviewPresent && "a review word"}
                  </span>
                )}
              </div>
            )}
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
