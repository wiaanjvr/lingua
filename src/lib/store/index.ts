import { create } from "zustand";
import { User, LearningSession } from "@/types";

interface AppState {
  user: User | null;
  currentSession: LearningSession | null;
  isSessionActive: boolean;

  setUser: (user: User | null) => void;
  setCurrentSession: (session: LearningSession | null) => void;
  startSession: () => void;
  endSession: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  currentSession: null,
  isSessionActive: false,

  setUser: (user) => set({ user }),
  setCurrentSession: (session) => set({ currentSession: session }),
  startSession: () => set({ isSessionActive: true }),
  endSession: () => set({ isSessionActive: false, currentSession: null }),
}));
