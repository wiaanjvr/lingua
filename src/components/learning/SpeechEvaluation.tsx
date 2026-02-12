"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Volume2,
  Gauge,
  Clock,
  MessageSquare,
  ThumbsUp,
  TrendingUp,
  Award,
  PartyPopper,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeechFeedback {
  pronunciation: number; // 0-100
  fluency: number; // 0-100
  duration: number; // seconds
  wordCount: number;
  overallScore: number; // 0-100
  strengths: string[];
  improvements: string[];
}

interface SpeechEvaluationProps {
  feedback: SpeechFeedback;
  showDetailed?: boolean;
}

export function SpeechEvaluation({
  feedback,
  showDetailed = true,
}: SpeechEvaluationProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Keep Practicing";
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Speech Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div
            className={cn(
              "text-5xl font-bold mb-2",
              getScoreColor(feedback.overallScore),
            )}
          >
            {Math.round(feedback.overallScore)}%
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            {getScoreLabel(feedback.overallScore)}
          </p>
        </div>

        {/* Detailed Metrics */}
        {showDetailed && (
          <div className="space-y-4">
            {/* Pronunciation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Pronunciation</span>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    getScoreColor(feedback.pronunciation),
                  )}
                >
                  {Math.round(feedback.pronunciation)}%
                </span>
              </div>
              <Progress value={feedback.pronunciation} className="h-2" />
            </div>

            {/* Fluency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Fluency</span>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    getScoreColor(feedback.fluency),
                  )}
                >
                  {Math.round(feedback.fluency)}%
                </span>
              </div>
              <Progress value={feedback.fluency} className="h-2" />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">Duration</span>
                </div>
                <p className="text-lg font-semibold">{feedback.duration}s</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MessageSquare className="h-3 w-3" />
                  <span className="text-xs">Words</span>
                </div>
                <p className="text-lg font-semibold">{feedback.wordCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Strengths */}
        {feedback.strengths.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <ThumbsUp className="h-4 w-4" />
              <span>Strengths</span>
            </div>
            <ul className="space-y-1">
              {feedback.strengths.map((strength, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground pl-6 relative"
                >
                  <span className="absolute left-2">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {feedback.improvements.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
              <span>Keep Working On</span>
            </div>
            <ul className="space-y-1">
              {feedback.improvements.map((improvement, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground pl-6 relative"
                >
                  <span className="absolute left-2">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Encouragement */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
            {feedback.overallScore >= 80 ? (
              <>
                <PartyPopper className="h-4 w-4 text-primary" />
                <span>
                  Outstanding! Your French is coming along beautifully!
                </span>
              </>
            ) : feedback.overallScore >= 60 ? (
              <>
                <ThumbsUp className="h-4 w-4 text-primary" />
                <span>
                  Great progress! Keep practicing and you'll master it!
                </span>
              </>
            ) : (
              <>
                <Flame className="h-4 w-4 text-primary" />
                <span>Every attempt makes you better. Don't stop now!</span>
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Mock evaluation function (in production, this would call an API)
export function evaluateSpeech(
  audioBlob: Blob,
  expectedDuration: number = 30,
): SpeechFeedback {
  // Simulate analysis - in production, this would use speech recognition API
  const duration = Math.floor(Math.random() * 20) + 10; // 10-30 seconds
  const wordCount = Math.floor(duration * 2.5); // ~2.5 words per second

  const pronunciation = Math.floor(Math.random() * 30) + 60; // 60-90
  const fluency = Math.floor(Math.random() * 25) + 65; // 65-90
  const overallScore = Math.round((pronunciation + fluency) / 2);

  const strengths = [];
  const improvements = [];

  if (pronunciation >= 75) {
    strengths.push("Clear pronunciation of French sounds");
  } else {
    improvements.push("Focus on French vowel sounds (é, è, ê, etc.)");
  }

  if (fluency >= 75) {
    strengths.push("Good speaking pace and rhythm");
  } else {
    improvements.push("Try to reduce pauses between words");
  }

  if (wordCount >= 40) {
    strengths.push("Rich vocabulary usage");
  } else {
    improvements.push("Try to expand your responses with more details");
  }

  if (duration >= expectedDuration * 0.8) {
    strengths.push("Appropriate response length");
  } else {
    improvements.push(
      "Try to speak for a bit longer to fully express your thoughts",
    );
  }

  return {
    pronunciation,
    fluency,
    duration,
    wordCount,
    overallScore,
    strengths,
    improvements,
  };
}
