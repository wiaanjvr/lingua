"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Lesson,
  ComprehensionEvaluation,
  ConversationTurn,
} from "@/types/lesson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Mic,
  Square,
  ArrowRight,
  Lightbulb,
  User,
  Bot,
  AlertCircle,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptionFeedback {
  isValid: boolean;
  isSilence: boolean;
  isRelevant: boolean;
  englishWords: Array<{ english: string; translation: string }>;
  message?: string;
}

interface EnglishWordCorrection {
  english: string;
  french: string;
  example?: string;
}

interface ConversationFeedbackPhaseProps {
  lesson: Lesson;
  initialEvaluation?: ComprehensionEvaluation;
  onPhaseComplete: () => void;
}

// Teacher's initial prompts based on turn number
const TEACHER_PROMPTS = {
  initial:
    "Let's talk about what you heard! Can you tell me what you understood from the audio? Feel free to speak naturally.",
  turn2Hint: "I'll ask a follow-up question to explore the content more...",
  turn3Hint: "One more response and we'll wrap up this conversation!",
};

const MAX_TURNS = 3;

export function ConversationFeedbackPhase({
  lesson,
  initialEvaluation,
  onPhaseComplete,
}: ConversationFeedbackPhaseProps) {
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastFeedback, setLastFeedback] =
    useState<TranscriptionFeedback | null>(null);
  const [showFeedbackWarning, setShowFeedbackWarning] = useState(false);
  const [englishCorrections, setEnglishCorrections] = useState<
    EnglishWordCorrection[]
  >([]);
  const [conversationComplete, setConversationComplete] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Count user turns
  const userTurnCount = turns.filter((t) => t.role === "user").length;
  const currentTurnNumber = userTurnCount + 1;

  // Initialize conversation with teacher's first question
  useEffect(() => {
    const firstQuestion =
      initialEvaluation?.followUpQuestions?.[0] || TEACHER_PROMPTS.initial;

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

  // Check if conversation is complete
  useEffect(() => {
    if (userTurnCount >= MAX_TURNS) {
      setConversationComplete(true);
    }
  }, [userTurnCount]);

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
    setIsProcessing(true);
    setLastFeedback(null);
    setShowFeedbackWarning(false);

    // Transcribe the audio
    let transcribedText = "[Unable to transcribe]";
    let feedback: TranscriptionFeedback | null = null;

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("language", lesson.language || "fr");
      const lastAssistantTurn = [...turns]
        .reverse()
        .find((t) => t.role === "assistant");
      if (lastAssistantTurn) {
        formData.append("questionContext", lastAssistantTurn.text);
      }

      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (transcribeResponse.ok) {
        const transcribeData = await transcribeResponse.json();
        transcribedText = transcribeData.text || transcribedText;
        feedback = transcribeData.feedback || null;
      }
    } catch (error) {
      console.error("Transcription error:", error);
    }

    // Check if response is invalid (silence or non-sensical)
    if (feedback && !feedback.isValid) {
      setLastFeedback(feedback);
      setShowFeedbackWarning(true);
      setIsProcessing(false);
      return;
    }

    // Add user turn
    const userTurn: ConversationTurn = {
      id: `turn-${Date.now()}`,
      role: "user",
      text: transcribedText,
      audioUrl: URL.createObjectURL(audioBlob),
      timestamp: new Date().toISOString(),
    };

    const updatedTurns = [...turns, userTurn];
    setTurns(updatedTurns);
    setLastFeedback(feedback);

    // Generate teacher response
    await generateTeacherResponse(transcribedText, updatedTurns);
    setIsProcessing(false);
  };

  const generateTeacherResponse = async (
    userResponse: string,
    currentTurns: ConversationTurn[],
  ) => {
    const currentUserTurnCount = currentTurns.filter(
      (t) => t.role === "user",
    ).length;

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
          turnNumber: currentUserTurnCount,
        }),
      });

      let feedback;
      if (response.ok) {
        feedback = await response.json();
      } else {
        throw new Error("Failed to generate feedback");
      }

      // Track English words detected
      if (
        feedback.englishWordsDetected &&
        feedback.englishWordsDetected.length > 0
      ) {
        setEnglishCorrections((prev) => {
          const newCorrections = feedback.englishWordsDetected.filter(
            (newWord: EnglishWordCorrection) =>
              !prev.some(
                (existing) =>
                  existing.english.toLowerCase() ===
                  newWord.english.toLowerCase(),
              ),
          );
          return [...prev, ...newCorrections];
        });
      }

      const assistantTurn: ConversationTurn = {
        id: `turn-${Date.now()}`,
        role: "assistant",
        text: feedback.response,
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
      const fallbackResponses = [
        "Thank you for sharing! What else did you notice?",
        "Interesting perspective! Et si on explorait un peu plus...?",
        "Great conversation! Ready to see the full text?",
      ];
      const fallbackTurn: ConversationTurn = {
        id: `turn-${Date.now()}`,
        role: "assistant",
        text: fallbackResponses[Math.min(currentUserTurnCount - 1, 2)],
        timestamp: new Date().toISOString(),
        questionType:
          currentUserTurnCount >= MAX_TURNS ? "wrap-up" : "comprehension",
      };
      setTurns((prev) => [...prev, fallbackTurn]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            Phase 3: Teacher Conversation
          </span>
        </div>
        <h1 className="text-2xl font-light">Let's Discuss What You Heard</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Have a guided conversation with your teacher. Speak naturally — I'll
          help with vocabulary along the way.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((turn) => (
          <div
            key={turn}
            className={cn(
              "flex items-center gap-2",
              turn < MAX_TURNS && "mr-2",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                userTurnCount >= turn
                  ? "bg-violet-500 text-white"
                  : userTurnCount === turn - 1
                    ? "bg-violet-500/20 text-violet-600 ring-2 ring-violet-500 ring-offset-2"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {userTurnCount >= turn ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                turn
              )}
            </div>
            {turn < MAX_TURNS && (
              <div
                className={cn(
                  "w-8 h-0.5",
                  userTurnCount >= turn ? "bg-violet-500" : "bg-muted",
                )}
              />
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {conversationComplete
          ? "Conversation complete!"
          : `Response ${currentTurnNumber} of ${MAX_TURNS}`}
      </p>

      {/* Chat Area */}
      <Card className="min-h-[300px] sm:min-h-[400px] max-h-[55vh] sm:max-h-[450px] flex flex-col">
        <CardHeader className="pb-2 shrink-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-violet-500" />
            <span>Your French Teacher</span>
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
                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-violet-500" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  turn.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                  turn.questionType === "scenario" &&
                    turn.role === "assistant" &&
                    "border-l-4 border-violet-400",
                  turn.questionType === "wrap-up" &&
                    turn.role === "assistant" &&
                    "border-l-4 border-green-400 bg-green-50 dark:bg-green-950/30",
                )}
              >
                <p className="text-sm leading-relaxed">{turn.text}</p>

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

      {/* English Words Learned Panel */}
      {englishCorrections.length > 0 && (
        <Card className="border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-600" />
              <span className="text-amber-800 dark:text-amber-200">
                Vocabulary You Learned
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-2">
              {englishCorrections.map((correction, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-black/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground line-through">
                      {correction.english}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      {correction.french}
                    </span>
                  </div>
                  {correction.example && (
                    <span className="text-xs text-muted-foreground italic hidden sm:block">
                      {correction.example}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Warning */}
      {showFeedbackWarning && lastFeedback && !lastFeedback.isValid && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="font-medium text-orange-700 dark:text-orange-400">
                  {lastFeedback.isSilence
                    ? "No Speech Detected"
                    : "Please Try Again"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lastFeedback.message ||
                    "I couldn't hear that clearly. Please try speaking again."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowFeedbackWarning(false);
                    setLastFeedback(null);
                  }}
                >
                  Try Recording Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Area - Only show if conversation not complete */}
      {!conversationComplete && (
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
                disabled={isProcessing}
              >
                {isRecording ? (
                  <Square className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>

              <div className="flex-1">
                {isProcessing ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Processing your response...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your teacher is listening
                    </p>
                  </div>
                ) : isRecording ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-600">
                      Recording... Tap to stop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Speak naturally in French or English
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Tap to respond</p>
                    <p className="text-xs text-muted-foreground">
                      {currentTurnNumber === 1 &&
                        "Share what you understood from the audio"}
                      {currentTurnNumber === 2 &&
                        "Answer your teacher's follow-up question"}
                      {currentTurnNumber === 3 &&
                        "One final response to wrap up"}
                    </p>
                  </div>
                )}
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
        disabled={!conversationComplete}
      >
        {conversationComplete ? (
          <>
            Continue to Text Reveal
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        ) : (
          <>
            <Lightbulb className="mr-2 h-5 w-5" />
            Complete {MAX_TURNS - userTurnCount} more response
            {MAX_TURNS - userTurnCount !== 1 ? "s" : ""}
          </>
        )}
      </Button>
    </div>
  );
}
