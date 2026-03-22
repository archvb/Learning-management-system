type AlertType = "error" | "success" | "info" | "warning";

interface AlertProps {
  type?: AlertType;
  message: string;
  onClose?: () => void;
}

const styles: Record<AlertType, string> = {
  error: "bg-red-500/10 border-red-500/30 text-red-400",
  success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  info: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
  warning: "bg-amber-500/10 border-amber-500/30 text-amber-400",
};

const icons: Record<AlertType, string> = {
  error: "✕",
  success: "✓",
  info: "ℹ",
  warning: "⚠",
};

export default function Alert({ type = "error", message, onClose }: AlertProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styles[type]}`}
      role="alert"
    >
      <span className="mt-0.5 shrink-0 font-bold">{icons[type]}</span>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
