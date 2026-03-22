"use client";

import { create } from "zustand";
import { Video } from "@/lib/types";

interface VideoState {
  currentVideo: Video | null;
  isPlaying: boolean;
  progress: number; // seconds
  isCompleted: boolean;
  nextVideo: Video | null;
  prevVideo: Video | null;
  setCurrentVideo: (video: Video, prev: Video | null, next: Video | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsCompleted: (isCompleted: boolean) => void;
  setProgress: (seconds: number) => void;
  reset: () => void;
}

export const useVideoStore = create<VideoState>()((set) => ({
  currentVideo: null,
  isPlaying: false,
  progress: 0,
  isCompleted: false,
  nextVideo: null,
  prevVideo: null,

  setCurrentVideo: (video, prev, next) =>
    set({ currentVideo: video, prevVideo: prev, nextVideo: next, progress: 0, isCompleted: false }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setIsCompleted: (isCompleted) => set({ isCompleted }),

  setProgress: (seconds) => set({ progress: seconds }),

  reset: () =>
    set({
      currentVideo: null,
      isPlaying: false,
      progress: 0,
      isCompleted: false,
      nextVideo: null,
      prevVideo: null,
    }),
}));
