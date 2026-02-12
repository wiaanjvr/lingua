"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { INTEREST_TOPICS, ProficiencyLevel } from "@/types";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<ProficiencyLevel | null>(
    null,
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const levels: {
    level: ProficiencyLevel;
    label: string;
    description: string;
  }[] = [
    {
      level: "A1",
      label: "Complete Beginner",
      description: "I know little to no words in this language",
    },
    {
      level: "A2",
      label: "Elementary",
      description: "I know basic phrases and can introduce myself",
    },
    {
      level: "B1",
      label: "Intermediate",
      description: "I can handle simple conversations",
    },
    {
      level: "B2",
      label: "Upper Intermediate",
      description: "I can discuss complex topics with effort",
    },
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleComplete = () => {
    // TODO: Save user preferences to database
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to Lingua</h1>
          <p className="text-muted-foreground">
            Let's personalize your learning through struggle
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 w-24 rounded-full transition-colors",
                s === step
                  ? "bg-primary"
                  : s < step
                    ? "bg-primary/50"
                    : "bg-muted",
              )}
            />
          ))}
        </div>

        {/* Step 1: Proficiency Level */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>What's your current level?</CardTitle>
              <CardDescription>
                Be honest—we'll adapt the content to challenge you appropriately
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {levels.map(({ level, label, description }) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition-all",
                    "hover:border-primary/50",
                    selectedLevel === level
                      ? "border-primary bg-primary/5"
                      : "border-muted",
                  )}
                >
                  <div className="font-semibold">{label}</div>
                  <div className="text-sm text-muted-foreground">
                    {description}
                  </div>
                </button>
              ))}
              <Button
                className="w-full mt-6"
                onClick={() => setStep(2)}
                disabled={!selectedLevel}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>What are you interested in?</CardTitle>
              <CardDescription>
                Select 3-5 topics. You'll struggle through content you actually
                care about.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {INTEREST_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleInterest(topic)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all capitalize",
                      "hover:border-primary/50",
                      selectedInterests.includes(topic)
                        ? "border-primary bg-primary/5"
                        : "border-muted",
                    )}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={selectedInterests.length < 3}
                  className="w-full"
                >
                  Complete Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
