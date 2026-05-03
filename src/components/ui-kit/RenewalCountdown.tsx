import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function diffParts(target: Date) {
  const now = Date.now();
  let ms = target.getTime() - now;
  const overdue = ms < 0;
  ms = Math.abs(ms);
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return { overdue, days, hours, minutes, seconds };
}

export function RenewalCountdown({
  endsAt,
  compact = false,
  className = "",
}: {
  endsAt: string | null | undefined;
  compact?: boolean;
  className?: string;
}) {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!endsAt) {
    return <span className={`text-xs text-muted-foreground ${className}`}>—</span>;
  }
  const target = new Date(endsAt);
  if (isNaN(target.getTime())) {
    return <span className={`text-xs text-muted-foreground ${className}`}>—</span>;
  }
  const { overdue, days, hours, minutes, seconds } = diffParts(target);

  const tone = overdue
    ? "text-destructive"
    : days <= 3
      ? "text-destructive"
      : days <= 7
        ? "text-amber-500"
        : "text-emerald-500";

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 font-mono text-xs ${tone} ${className}`}>
        <Clock className="h-3 w-3" />
        {overdue ? "Vencida há " : ""}
        {days}d {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Clock className={`h-4 w-4 ${tone}`} />
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-semibold tabular-nums ${tone}`}>{days}</span>
        <span className="text-xs text-muted-foreground">dias</span>
        <span className={`font-mono text-sm tabular-nums ${tone}`}>
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </span>
        {overdue && <span className="text-xs text-destructive">(vencida)</span>}
      </div>
    </div>
  );
}
