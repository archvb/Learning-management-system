interface ProgressBarProps {
  current: number; // seconds
  duration: number; // seconds
  className?: string;
}

export default function ProgressBar({ current, duration, className = "" }: ProgressBarProps) {
  const pct = duration > 0 ? Math.min((current / duration) * 100, 100) : 0;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-xs tabular-nums text-slate-400">
        {formatTime(current)} / {formatTime(duration)}
      </span>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
