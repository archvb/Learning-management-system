"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { useRouter } from "next/navigation";
import { Video } from "@/lib/types";
import { apiGetProgress, apiSaveProgress } from "@/lib/api";
import { useVideoStore } from "@/store/videoStore";
import ProgressBar from "./ProgressBar";
import Button from "./Button";
import { ChevronLeft, ChevronRight } from "./Icons";

interface VideoPlayerProps {
  video: Video;
  prevVideo: Video | null;
  nextVideo: Video | null;
  slug: string;
  onComplete?: (videoId: string) => void;
}

/**
 * Extracts a YouTube video ID from a URL like:
 * https://www.youtube.com/watch?v=abc123
 * https://youtu.be/abc123
 */
function extractYouTubeId(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
    return parsed.searchParams.get("v") ?? url;
  } catch {
    return url;
  }
}

const PROGRESS_INTERVAL_MS = 5000;

export default function VideoPlayer({
  video,
  prevVideo,
  nextVideo,
  slug,
  onComplete,
}: VideoPlayerProps) {
  const router = useRouter();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const resumeSeekRef = useRef<number>(0);

  const { setProgress, setIsPlaying } = useVideoStore();
  const [currentSecs, setCurrentSecs] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentSecsRef = useRef(0);
  const lastSentSecsRef = useRef(0);

  const videoId = extractYouTubeId(video.video_url);
  const duration = video.duration_seconds ?? 0;

  // Load saved progress on mount
  useEffect(() => {
    completedRef.current = false;
    setIsCompleted(false);

    const loadProgress = async () => {
      try {
        const { progress } = await apiGetProgress(video.id);
        if (progress) {
          resumeSeekRef.current = progress.last_position_seconds;
          setCurrentSecs(progress.last_position_seconds);
          currentSecsRef.current = progress.last_position_seconds;
          lastSentSecsRef.current = progress.last_position_seconds;
          if (progress.is_completed) {
            setIsCompleted(true);
            completedRef.current = true;
          }
        }
      } catch {
        // no progress yet, start from beginning
      }
    };

    loadProgress();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // We aren't able to dynamically query state during generic unmounts reliably in Next FastRefresh
      // However the HandlePause callback catches 99% of hard unloads implicitly.
    };
  }, [video.id]);

  const saveProgress = useCallback(
    async (secs: number, completed: boolean, force = false) => {
      // Debounce: prevent spam tracking if moved less than 3s, unless forced (e.g., completion)
      if (!force && Math.abs(secs - lastSentSecsRef.current) <= 3 && !completed) {
        return;
      }
      try {
        lastSentSecsRef.current = secs;
        await apiSaveProgress(video.id, Math.floor(secs), completed);
      } catch {
        // silently ignore progress save errors
      }
    },
    [video.id]
  );

  const startProgressInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      if (!playerRef.current) return;
      const secs: number = await playerRef.current.getCurrentTime();
      const capped = duration > 0 ? Math.min(secs, duration) : secs;
      setCurrentSecs(capped);
      currentSecsRef.current = capped;
      setProgress(capped);
      await saveProgress(capped, completedRef.current);
    }, PROGRESS_INTERVAL_MS);
  }, [duration, saveProgress, setProgress]);

  const stopProgressInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleReady = useCallback(
    (event: YouTubeEvent) => {
      playerRef.current = event.target;
      // Seek to resume position
      if (resumeSeekRef.current > 0) {
        event.target.seekTo(resumeSeekRef.current, true);
      }
    },
    []
  );

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    startProgressInterval();
  }, [setIsPlaying, startProgressInterval]);

  const handlePause = useCallback(async () => {
    stopProgressInterval();
    setIsPlaying(false);
    if (playerRef.current) {
      const secs: number = await playerRef.current.getCurrentTime();
      setCurrentSecs(secs);
      currentSecsRef.current = secs;
      await saveProgress(secs, completedRef.current, true);
    }
  }, [stopProgressInterval, setIsPlaying, saveProgress]);

  const handleEnd = useCallback(async () => {
    stopProgressInterval();
    setIsPlaying(false);

    if (!completedRef.current) {
      completedRef.current = true;
      setIsCompleted(true);
      await saveProgress(duration || currentSecsRef.current, true, true);
      onComplete?.(video.id);
    }

    // Auto-advance after short delay
    if (nextVideo) {
      setTimeout(() => {
        router.push(`/subjects/${slug}/video/${nextVideo.id}`);
      }, 1500);
    }
  }, [
    stopProgressInterval,
    setIsPlaying,
    saveProgress,
    duration,
    onComplete,
    video.id,
    nextVideo,
    slug,
    router,
  ]);

  const opts = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 1 as const,
      modestbranding: 1 as const,
      rel: 0 as const,
    },
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Video embed */}
      <div className="relative w-full overflow-hidden rounded-xl bg-black" style={{ paddingTop: "56.25%" }}>
        <div className="absolute inset-0">
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={handleReady}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnd={handleEnd}
            className="h-full w-full"
            iframeClassName="h-full w-full"
          />
        </div>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <ProgressBar current={currentSecs} duration={duration} />
      )}

      {/* Completed badge */}
      {isCompleted && (
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <span>✓</span>
          <span>Completed</span>
          {nextVideo && (
            <span className="text-slate-400">— auto-advancing to next video…</span>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="secondary"
          size="sm"
          disabled={!prevVideo}
          onClick={() =>
            prevVideo &&
            router.push(`/subjects/${slug}/video/${prevVideo.id}`)
          }
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button
          variant={nextVideo ? "primary" : "secondary"}
          size="sm"
          disabled={!nextVideo}
          onClick={() =>
            nextVideo && router.push(`/subjects/${slug}/video/${nextVideo.id}`)
          }
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
