import { Video } from "@/lib/types";

interface VideoMetaProps {
  video: Video;
}

export default function VideoMeta({ video }: VideoMetaProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-white leading-snug">
        {video.title}
      </h1>
      {video.description && (
        <p className="text-sm text-slate-400 leading-relaxed">
          {video.description}
        </p>
      )}
      {video.duration_seconds != null && (
        <p className="text-xs text-slate-500">
          Duration: {formatDuration(video.duration_seconds)}
        </p>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}
