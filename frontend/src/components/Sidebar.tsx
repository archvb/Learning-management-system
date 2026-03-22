"use client";

import Link from "next/link";
import { Section, Video } from "@/lib/types";
import { CheckCircle, Lock } from "./Icons";

interface SidebarProps {
  slug: string;
  sections: Section[];
  currentVideoId: string;
}

export default function Sidebar({
  slug,
  sections,
  currentVideoId,
}: SidebarProps) {
  return (
    <nav className="flex flex-col overflow-y-auto">
      {sections.map((section) => (
        <div key={section.id} className="mb-1">
          {/* Section header */}
          <div className="sticky top-0 z-10 bg-[#0a0a0f] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-white/5">
            {section.title}
          </div>

          {/* Videos */}
          <ul className="py-1">
            {section.videos.map((video) => {
              const isActive = video.id === currentVideoId;
              const isDone = !!video.is_completed;
              const isLocked = !!video.is_locked;

              return (
                <li key={video.id}>
                  <Link
                    href={isLocked ? "#" : `/subjects/${slug}/video/${video.id}`}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 text-sm transition-colors group relative
                      ${isLocked ? "pointer-events-none opacity-60" : ""}
                      ${isActive
                        ? "bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-500"
                        : "text-slate-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                      }
                    `}
                    title={isLocked ? "Complete previous video to unlock this" : ""}
                  >
                    {/* Status icon */}
                    <span className="shrink-0">
                      {isLocked ? (
                        <Lock className="h-4 w-4 text-slate-500" />
                      ) : isDone ? (
                         <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : isActive ? (
                        <span className="flex h-4 w-4 items-center justify-center">
                          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                        </span>
                      ) : (
                        <span className="flex h-4 w-4 items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                        </span>
                      )}
                    </span>

                    {/* Title */}
                    <span className="flex-1 line-clamp-2 leading-snug">
                      {video.title}
                    </span>

                    {/* Duration */}
                    {video.duration_seconds != null && (
                      <span className="ml-auto shrink-0 text-xs tabular-nums text-slate-600">
                        {formatDuration(video.duration_seconds)}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
