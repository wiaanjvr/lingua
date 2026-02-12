"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeakingRecorder } from "./SpeakingRecorder";
import { TeacherPrompt } from "./TeacherPrompt";
import { MessageCircle, Check, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationQuestion {
  id: string;
  prompt: string;
  audioPrompt?: string;
  expectedTopics?: string[];
}

interface ConversationFlowProps {
  segmentId: string;
  onComplete: (recordings: Blob[]) => void;
}

// Generate conversation questions based on segment topics
const conversationQuestions: ConversationQuestion[] = [
  {
    id: "q1",
    prompt: "What was the main topic discussed? Try to answer in French.",
    audioPrompt: "De quoi parlait l'audio? What was it about?",
  },
  {
    id: "q2",
    prompt: "Can you describe one specific detail you remember?",
    audioPrompt: "Qu'est-ce que vous vous souvenez? What do you remember?",
  },
  {
    id: "q3",
    prompt: "How does this topic relate to your own experience?",
    audioPrompt: "Et vous? Quelle est votre expérience avec ce sujet?",
  },
];

export function ConversationFlow({
  segmentId,
  onComplete,
}: ConversationFlowProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordings, setRecordings] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const currentQuestion = conversationQuestions[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === conversationQuestions.length - 1;

  const handleRecordingComplete = (blob: Blob) => {
    const newRecordings = [...recordings, blob];
    setRecordings(newRecordings);
    setIsRecording(false);

    if (isLastQuestion) {
      // Wait a bit before completing to show the checkmark
      setTimeout(() => {
        onComplete(newRecordings);
      }, 1000);
    } else {
      // Move to next question after a short delay
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 1000);
    }
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Conversation Practice
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of{" "}
            {conversationQuestions.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex gap-2">
          {conversationQuestions.map((_, index) => (
            <div
              key={index}
              className={cn(
                "flex-1 h-2 rounded-full transition-all duration-300",
                index < currentQuestionIndex && "bg-green-500",
                index === currentQuestionIndex && "bg-primary",
                index > currentQuestionIndex && "bg-muted",
              )}
            />
          ))}
        </div>

        {/* Question */}
        <div className="space-y-4">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-lg font-medium mb-2">{currentQuestion.prompt}</p>
            {currentQuestion.audioPrompt && (
              <TeacherPrompt
                text={currentQuestion.audioPrompt}
                autoPlay={currentQuestionIndex === 0}
              />
            )}
          </div>

          {/* Speaking Recorder */}
          <SpeakingRecorder
            key={currentQuestion.id}
            prompt="Take your time. Speak naturally."
            onRecordingComplete={handleRecordingComplete}
          />

          {/* Tips */}
          <div className="p-3 bg-muted/50 rounded-lg flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5" />
            <p className="text-sm text-muted-foreground flex-1">
              <strong>Tip:</strong> Mix French and English as needed. The goal
              is communication, not perfection.
            </p>
          </div>
        </div>

        {/* Previous Recordings Indicator */}
        {recordings.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" />
            <span>
              {recordings.length} response{recordings.length > 1 ? "s" : ""}{" "}
              recorded
            </span>
          </div>
        )}

        {/* Navigation */}
        {!isLastQuestion && recordings.length > currentQuestionIndex && (
          <Button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            className="w-full gap-2"
          >
            Next Question
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
