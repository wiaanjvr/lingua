"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Lesson,
  ComprehensionEvaluation,
  ConversationTurn,
  VocabularyHint,
} from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Mic,
  Square,
  ArrowRight,
  Lightbulb,
  Volume2,
  User,
  Bot,
  HelpCircle,
  CheckCircle2,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationFeedbackPhaseProps {
  lesson: Lesson;
  initialEvaluation?: ComprehensionEvaluation;
  onPhaseComplete: () => void;
}

// Conversation prompts based on evaluation
const CONVERSATION_PROMPTS = {
  initial: [
    "Can you tell me more about what you understood?",
    "What was the main topic or situation in the audio?",
    "Did you recognize any specific words or phrases?",
  ],
  followUp: [
    "That's great! What else did you notice?",
    "Can you describe any details you remember?",
    "Were there any parts that were confusing?",
  ],
  vocabulary: [
    "Let me help you with a key word from the audio:",
    "Here's an important phrase you'll want to remember:",
  ],
  encouragement: [
    "Excellent! You're understanding more than you might think.",
    "Great job working through this!",
    "Your listening skills are improving!",
  ],
};

export function ConversationFeedbackPhase({
  lesson,
  initialEvaluation,
  onPhaseComplete,
}: ConversationFeedbackPhaseProps) {
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentHint, setCurrentHint] = useState<VocabularyHint | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [canProceed, setCanProceed] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const MIN_TURNS = 3; // Minimum conversation turns before proceeding

  // Initialize conversation with first question
  useEffect(() => {
    const firstQuestion =
      initialEvaluation?.followUpQuestions?.[0] ||
      CONVERSATION_PROMPTS.initial[0];

    const initialTurn: ConversationTurn = {
      id: `turn-${Date.now()}`,
      role: "assistant",
      text: firstQuestion,
      timestamp: new Date().toISOString(),
      questionType: "comprehension",
    };

    setTurns([initialTurn]);
  }, [initialEvaluation]);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  // Check if can proceed
  useEffect(() => {
    const userTurns = turns.filter((t) => t.role === "user").length;
    setCanProceed(userTurns >= MIN_TURNS);
  }, [turns]);

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
        stream.getTracks().forEach((track) => track.stop());
        await handleUserResponse(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUserResponse = async (audioBlob: Blob) => {
    // Transcribe the audio first
    let transcribedText = "[Unable to transcribe]";

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("language", lesson.language || "fr");

      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (transcribeResponse.ok) {
        const transcribeData = await transcribeResponse.json();
        transcribedText = transcribeData.text || transcribedText;
      }
    } catch (error) {
      console.error("Transcription error:", error);
    }

    // Add user turn with transcribed text
    const userTurn: ConversationTurn = {
      id: `turn-${Date.now()}`,
      role: "user",
      text: transcribedText,
      audioUrl: URL.createObjectURL(audioBlob),
      timestamp: new Date().toISOString(),
    };

    setTurns((prev) => [...prev, userTurn]);
    setTurnCount((prev) => prev + 1);

    // Generate assistant response using OpenAI
    await generateAssistantResponse(transcribedText, [...turns, userTurn]);
  };

  const generateAssistantResponse = async (
    userResponse: string,
    currentTurns: ConversationTurn[],
  ) => {
    try {
      const response = await fetch("/api/lesson/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetText: lesson.targetText,
          translation: lesson.translation,
          userResponse,
          conversationHistory: currentTurns.map((t) => ({
            role: t.role,
            text: t.text,
          })),
          level: lesson.level,
        }),
      });

      let feedback;
      if (response.ok) {
        feedback = await response.json();
      } else {
        throw new Error("Failed to generate feedback");
      }

      // Handle vocabulary hint if provided
      if (feedback.vocabularyHint) {
        setCurrentHint({
          word: feedback.vocabularyHint.word,
          translation: feedback.vocabularyHint.translation,
          context: feedback.vocabularyHint.context || "",
          hint: "",
        });
      }

      const userTurnCount = currentTurns.filter(
        (t) => t.role === "user",
      ).length;
      let responseText = feedback.response;

      // Add wrap-up prompt if enough turns
      if (userTurnCount >= MIN_TURNS && !responseText.includes("Ready to")) {
        responseText += " You've done great work! Ready to see the text?";
      }

      const assistantTurn: ConversationTurn = {
        id: `turn-${Date.now()}`,
        role: "assistant",
        text: responseText,
        timestamp: new Date().toISOString(),
        questionType: feedback.questionType || "comprehension",
        vocabularyFocus: feedback.vocabularyHint
          ? [feedback.vocabularyHint.word]
          : undefined,
      };

      setTurns((prev) => [...prev, assistantTurn]);
    } catch (error) {
      console.error("Error generating feedback:", error);
      // Fallback response
      const fallbackTurn: ConversationTurn = {
        id: `turn-${Date.now()}`,
        role: "assistant",
        text: "Thank you for sharing! What else did you notice about the audio?",
        timestamp: new Date().toISOString(),
        questionType: "comprehension",
      };
      setTurns((prev) => [...prev, fallbackTurn]);
    }
  };

  const requestHint = () => {
    const newWords = lesson.words.filter((w) => w.isNew);
    const nextHintIndex = turns.filter(
      (t) => t.questionType === "vocabulary",
    ).length;

    if (nextHintIndex < newWords.length) {
      const word = newWords[nextHintIndex];

      const hintTurn: ConversationTurn = {
        id: `turn-${Date.now()}`,
        role: "assistant",
        text: `Here's a helpful word: "${word.word}" means "${word.translation || "see context"}". This appeared in the audio.`,
        timestamp: new Date().toISOString(),
        questionType: "vocabulary",
        vocabularyFocus: [word.word],
      };

      setTurns((prev) => [...prev, hintTurn]);
      setCurrentHint({
        word: word.word,
        translation: word.translation || "",
        context: "",
        hint: "",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            Phase 3: Guided Conversation
          </span>
        </div>
        <h1 className="text-2xl font-light">Let's Talk About It</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Have a conversation about what you heard. I'll help guide you and
          introduce vocabulary along the way.
        </p>
      </div>

      {/* Chat Area */}
      <Card className="min-h-[300px] sm:min-h-[400px] max-h-[60vh] sm:max-h-[500px] flex flex-col">
        <CardHeader className="pb-2 shrink-0">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Conversation</span>
            <span className="text-sm text-muted-foreground font-normal">
              {turns.filter((t) => t.role === "user").length} / {MIN_TURNS}{" "}
              responses
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4 pb-4">
          {turns.map((turn) => (
            <div
              key={turn.id}
              className={cn(
                "flex gap-3",
                turn.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {turn.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  turn.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                  turn.questionType === "vocabulary" &&
                    turn.role === "assistant" &&
                    "border-2 border-amber-400/50 bg-amber-50 dark:bg-amber-950/30",
                )}
              >
                {turn.questionType === "vocabulary" &&
                  turn.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
                      <Lightbulb className="h-4 w-4" />
                      <span className="text-xs font-medium">
                        Vocabulary Hint
                      </span>
                    </div>
                  )}
                <p className="text-sm">{turn.text}</p>

                {turn.audioUrl && (
                  <audio src={turn.audioUrl} controls className="w-full mt-2" />
                )}
              </div>

              {turn.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {/* Record Button */}
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "h-14 w-14 rounded-full shrink-0",
                isRecording && "animate-pulse",
              )}
            >
              {isRecording ? (
                <Square className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            <div className="flex-1">
              {isRecording ? (
                <p className="text-sm font-medium">Recording... Tap to stop</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tap to respond. Speak naturally in any language.
                </p>
              )}
            </div>

            {/* Hint Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={requestHint}
              className="h-10 w-10"
              title="Get a vocabulary hint"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Vocabulary Hint */}
      {currentHint && (
        <Card className="border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  {currentHint.word}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {currentHint.translation}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <Button
        size="lg"
        className="w-full h-14"
        onClick={onPhaseComplete}
        disabled={!canProceed}
      >
        {canProceed ? (
          <>
            Continue to Text Reveal
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        ) : (
          <>
            Complete {MIN_TURNS - turns.filter((t) => t.role === "user").length}{" "}
            more responses
          </>
        )}
      </Button>
    </div>
  );
}
