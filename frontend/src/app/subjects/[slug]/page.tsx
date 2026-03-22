"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGetSubjectContent } from "@/lib/api";
import { SubjectContent } from "@/lib/types";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { ChevronRight } from "@/components/Icons";

export default function SubjectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params["slug"] as string;

  const [content, setContent] = useState<SubjectContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGetSubjectContent(slug);
        setContent(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const allVideos = content?.sections.flatMap(s => s.videos) || [];
  const totalVideos = allVideos.length;
  const completedVideos = allVideos.filter(v => v.is_completed).length;
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  // Find the first uncompleted video (or just the first one if all done)
  const resumeVideo = allVideos.find(v => !v.is_completed) || allVideos[0];

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1 px-4 py-10 max-w-screen-lg mx-auto w-full">
          {/* Back link */}
          <Link
            href="/subjects"
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-6"
          >
            ← All Courses
          </Link>

          {loading && (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <Alert type="error" message={error} />
              <Button variant="secondary" onClick={() => router.push("/subjects")}>
                Back to Courses
              </Button>
            </div>
          )}

          {!loading && !error && content && (
            <div className="space-y-8">
              {/* Hero */}
              <div className="rounded-2xl border border-white/10 bg-[#12121a] overflow-hidden">
                {content.thumbnail_url && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={content.thumbnail_url}
                      alt={content.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] to-transparent" />
                  </div>
                )}
                <div className="p-6 space-y-3">
                  <h1 className="text-2xl font-bold text-white">{content.title}</h1>
                  {content.description && (
                    <p className="text-slate-400 leading-relaxed">{content.description}</p>
                  )}
                  {/* Stats & Progress */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-4">
                      <span>{content.sections.length} section{content.sections.length !== 1 ? "s" : ""}</span>
                      <span>·</span>
                      <span>{totalVideos} video{totalVideos !== 1 ? "s" : ""}</span>
                    </div>

                    {totalVideos > 0 && (
                      <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-1.5 w-full sm:w-auto">
                        <span className="font-medium text-white">{progressPercent}%</span>
                        <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                            style={{ width: `${progressPercent}%` }} 
                          />
                        </div>
                        <span className="text-xs">Completed</span>
                      </div>
                    )}
                  </div>
                  
                  {resumeVideo && (
                    <div className="pt-2">
                      <Button
                        size="lg"
                        onClick={() =>
                          router.push(`/subjects/${slug}/video/${resumeVideo.id}`)
                        }
                      >
                        {progressPercent === 0 ? "Start Learning" : progressPercent === 100 ? "Review Course" : "Resume Learning"}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Curriculum */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Curriculum</h2>
                <div className="space-y-4">
                  {content.sections.map((section) => (
                    <div
                      key={section.id}
                      className="rounded-xl border border-white/10 bg-[#12121a] overflow-hidden"
                    >
                      {/* Section header */}
                      <div className="bg-[#1a1a27] px-4 py-3 border-b border-white/10">
                        <h3 className="font-medium text-white text-sm">
                          {section.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {section.videos.length} video{section.videos.length !== 1 ? "s" : ""}
                        </p>
                      </div>

                      {/* Videos list */}
                      <ul className="divide-y divide-white/5">
                        {section.videos.map((video, idx) => {
                          const isDone = !!video.is_completed;
                          const isLocked = !!video.is_locked;
                          
                          return (
                            <li key={video.id}>
                              <Link
                                href={isLocked ? "#" : `/subjects/${slug}/video/${video.id}`}
                                className={`
                                  flex items-center gap-3 px-4 py-3 text-sm transition-colors group relative
                                  ${isLocked ? "pointer-events-none opacity-50" : "text-slate-400 hover:bg-white/5 hover:text-white"}
                                `}
                                title={isLocked ? "Complete previous video to unlock this" : ""}
                              >
                                {/* Index or Status */}
                                <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-xs tabular-nums text-slate-600 transition-colors">
                                  {isLocked ? (
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                  ) : isDone ? (
                                    <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  ) : (
                                    idx + 1
                                  )}
                                </span>

                                {/* Title */}
                                <span className={`flex-1 line-clamp-1 ${isDone ? "text-slate-300" : ""}`}>{video.title}</span>

                                {/* Duration */}
                                {video.duration_seconds != null && (
                                  <span className="shrink-0 text-xs tabular-nums text-slate-500">
                                    {formatDuration(video.duration_seconds)}
                                  </span>
                                )}

                                {!isLocked && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
