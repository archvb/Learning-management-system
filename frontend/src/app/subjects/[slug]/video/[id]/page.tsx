"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGetVideo, apiGetSubjectContent } from "@/lib/api";
import { VideoWithNavigation, SubjectContent, VideoProgress } from "@/lib/types";
import { apiGetProgress } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import VideoPlayer from "@/components/VideoPlayer";
import VideoMeta from "@/components/VideoMeta";
import Spinner from "@/components/Spinner";
import Alert from "@/components/Alert";
import Button from "@/components/Button";

export default function VideoPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params["slug"] as string;
  const videoId = params["id"] as string;

  const [videoData, setVideoData] = useState<VideoWithNavigation | null>(null);
  const [subjectContent, setSubjectContent] = useState<SubjectContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [videoRes, contentRes] = await Promise.all([
          apiGetVideo(videoId),
          apiGetSubjectContent(slug),
        ]);
        setVideoData(videoRes);
        setSubjectContent(contentRes.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load video");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [videoId, slug]);

  const handleVideoComplete = useCallback(async () => {
    // Refresh sidebar data to instantly reflect unlocked state
    try {
      const res = await apiGetSubjectContent(slug);
      setSubjectContent(res.content);
    } catch {}
  }, [slug]);

  return (
    <AuthGuard>
      <div className="flex h-screen flex-col overflow-hidden">
        <Navbar />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="hidden md:flex md:w-72 lg:w-80 flex-col border-r border-white/10 bg-[#0a0a0f] overflow-y-auto shrink-0">
            {subjectContent ? (
              <>
                {/* Subject title */}
                <div className="border-b border-white/10 px-4 py-3">
                  <h2 className="font-semibold text-white text-sm leading-snug">
                    {subjectContent.title}
                  </h2>
                </div>
                <Sidebar
                  slug={slug}
                  sections={subjectContent.sections}
                  currentVideoId={videoId}
                />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                {loading && <Spinner />}
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl px-4 py-6">
              {loading && (
                <div className="flex justify-center py-20">
                  <Spinner size="lg" />
                </div>
              )}

              {error && (
                <Alert
                  type="error"
                  message={error}
                  onClose={() => setError(null)}
                />
              )}

              {!loading && !error && videoData && (
                <div className="space-y-6">
                  {videoData.is_locked ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-white/10 bg-[#12121a]">
                      <svg className="h-12 w-12 text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                      <h2 className="text-xl font-bold text-white mb-2">Video Locked</h2>
                      <p className="text-slate-400 mb-6">Complete the previous video to unlock this content.</p>
                      {videoData.previous && (
                         <Button onClick={() => router.push(`/subjects/${slug}/video/${videoData.previous!.id}`)}>
                            Go to Previous Video
                         </Button>
                      )}
                    </div>
                  ) : (
                    <VideoPlayer
                      video={videoData.video}
                      prevVideo={videoData.previous}
                      nextVideo={videoData.next}
                      slug={slug}
                      onComplete={handleVideoComplete}
                    />
                  )}
                  <VideoMeta video={videoData.video} />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
