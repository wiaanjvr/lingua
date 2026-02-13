"use client";

import React, { useState, useRef } from "react";
import {
  Lesson,
  ComprehensionResponse,
  ComprehensionEvaluation,
} from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Square,
  Play,
  Trash2,
  ArrowRight,
  MessageCircle,
  Lightbulb,
  CheckCircle2,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptionFeedback {
  isValid: boolean;
  isSilence: boolean;
  isRelevant: boolean;
  englishWords: Array<{ english: string; translation: string }>;
  message?: string;
}

interface VerbalCheckPhaseProps {
  lesson: Lesson;
  onResponse: (response: ComprehensionResponse) => void;
  onPhaseComplete: () => void;
}

export function VerbalCheckPhase({
  lesson,
  onResponse,
  onPhaseComplete,
}: VerbalCheckPhaseProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<TranscriptionFeedback | null>(null);
  const [acknowledgedFeedback, setAcknowledgedFeedback] = useState(false);

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

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Transcribe and analyze audio
        await transcribeAudio(blob);
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

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    setFeedback(null);
    setAcknowledgedFeedback(false);

    try {
      // Send to Whisper API for transcription and analysis
      const formData = new FormData();
      formData.append("audio", blob);
      formData.append("language", lesson.language || "fr");
      formData.append(
        "questionContext",
        "What is happening in the audio? Describe what you heard.",
      );

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      setTranscript(data.text || "");
      setFeedback(data.feedback || null);
    } catch (error) {
      console.error("Transcription error:", error);
      setTranscript("[Transcription failed - please try again]");
    } finally {
      setIsTranscribing(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setTranscript("");
    setHasSubmitted(false);
    setFeedback(null);
    setAcknowledgedFeedback(false);
  };

  const handleSubmit = () => {
    if (!audioBlob) return;

    // Check if feedback requires re-recording
    if (feedback && !feedback.isValid && !acknowledgedFeedback) {
      setAcknowledgedFeedback(true);
      return;
    }

    const response: ComprehensionResponse = {
      id: `response-${Date.now()}`,
      lessonId: lesson.id,
      userId: lesson.userId,
      phase: "verbal-check",
      audioBlob,
      audioUrl: audioUrl || undefined,
      transcript,
      createdAt: new Date().toISOString(),
    };

    setHasSubmitted(true);
    onResponse(response);
  };

  // Check if we need to force re-recording
  const needsReRecord = feedback && !feedback.isValid && !acknowledgedFeedback;
  const canSubmit =
    audioBlob &&
    !isTranscribing &&
    !hasSubmitted &&
    (!feedback || feedback.isValid || acknowledgedFeedback);

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            Phase 2: Comprehension Check
          </span>
        </div>
        <h1 className="text-2xl font-light">What did you understand?</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Describe what's happening in the audio. Use any language you're
          comfortable with. French is encouraged but not required.
        </p>
      </div>

      {/* Question Prompt */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">
                "What is happening in the audio?"
              </p>
              <p className="text-sm text-muted-foreground">
                Try to describe the main idea, characters, or situation you
                heard. Any details you remember are valuable!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recording Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Response</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recording Controls */}
          <div className="flex flex-col items-center gap-4">
            {!isRecording && !audioBlob && (
              <Button
                size="lg"
                onClick={startRecording}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full"
              >
                <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            )}

            {isRecording && (
              <div className="flex flex-col items-center gap-4">
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopRecording}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-full animate-pulse"
                >
                  <Square className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>

                {/* Recording indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">
                    Recording...
                  </span>
                </div>

                {/* Audio visualizer */}
                <div className="flex items-center gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-red-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 30 + 10}px`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {!isRecording && !audioBlob && (
              <p className="text-sm text-muted-foreground">
                Tap to start recording
              </p>
            )}
          </div>

          {/* Audio Playback */}
          {audioBlob && audioUrl && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <audio src={audioUrl} controls className="w-full" />
              </div>

              {/* Transcript */}
              {isTranscribing ? (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Analyzing your response...
                  </span>
                </div>
              ) : (
                transcript && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Transcript:
                    </p>
                    <p className="text-sm">{transcript}</p>
                  </div>
                )
              )}

              {/* Feedback - Silence or Irrelevant */}
              {feedback && !feedback.isValid && (
                <Card className="border-orange-500/50 bg-orange-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                      <div className="space-y-2 flex-1">
                        <p className="font-medium text-orange-700 dark:text-orange-400">
                          {feedback.isSilence
                            ? "No Speech Detected"
                            : "Please Try Again"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {feedback.message}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Remember: Try to answer completely in French, but it's
                          okay to use some English words if needed.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Feedback - English Words Detected */}
              {feedback &&
                feedback.isValid &&
                feedback.englishWords.length > 0 && (
                  <Card className="border-blue-500/50 bg-blue-500/5">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-blue-500" />
                          <p className="font-medium text-blue-700 dark:text-blue-400">
                            {feedback.message ||
                              "Great effort! Here are some French words to help you:"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          {feedback.englishWords.map((word, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-white/50 dark:bg-black/20 rounded-lg px-4 py-3"
                            >
                              <span className="text-sm font-medium">
                                {word.english}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                →
                              </span>
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {word.translation}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Try using these French words in your next response!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={deleteRecording}
                  className="flex-1"
                  disabled={hasSubmitted}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {needsReRecord ? "Try Again" : "Re-record"}
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={!canSubmit}
                >
                  {hasSubmitted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Submitted
                    </>
                  ) : needsReRecord ? (
                    "Record Again"
                  ) : (
                    "Submit Response"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-medium mb-2">Tips for your response:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Try to answer completely in French</li>
          <li>
            • Using a few English words is okay - we'll help you learn them
          </li>
          <li>• Don't worry about perfect grammar or pronunciation</li>
          <li>• Describe the overall situation or feeling</li>
        </ul>
      </div>

      {/* Continue Button */}
      <Button
        size="lg"
        className="w-full h-14"
        onClick={onPhaseComplete}
        disabled={!hasSubmitted}
      >
        {hasSubmitted ? (
          <>
            Continue to Conversation
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        ) : (
          "Record and submit your response first"
        )}
      </Button>
    </div>
  );
}
