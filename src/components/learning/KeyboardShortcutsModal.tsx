"use client";

import React from "react";
import { X, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "Space", description: "Play/Pause audio" },
    { key: "R", description: "Restart audio from beginning" },
    { key: "→", description: "Skip forward 5 seconds" },
    { key: "←", description: "Skip backward 5 seconds" },
    { key: "T", description: "Toggle transcript visibility" },
    { key: "1-4", description: "Change playback speed" },
    { key: "?", description: "Show/hide this help menu" },
    { key: "Esc", description: "Close dialogs" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <Card className="max-w-md w-full mx-4 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              <CardTitle>Keyboard Shortcuts</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Speed up your learning with these shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <span className="text-sm text-muted-foreground">
                  {shortcut.description}
                </span>
                <kbd className="px-2.5 py-1.5 text-xs font-semibold bg-muted rounded border border-border">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
