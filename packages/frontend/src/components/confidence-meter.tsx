import { cn } from "../lib/utils";
import { confidenceTone } from "../lib/agro-labels";

interface ConfidenceMeterProps {
  value: number;
  size?: number;
  className?: string;
}

const TONE_COLOR_CLASS: Record<ReturnType<typeof confidenceTone>, string> = {
  good: "text-primaryGreen",
  medium: "text-warning",
  low: "text-destructive",
};

export function ConfidenceMeter({
  value,
  size = 72,
  className,
}: ConfidenceMeterProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const colorClass = TONE_COLOR_CLASS[confidenceTone(value)];

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${pct}% de confiança`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-muted"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-700 ease-out", colorClass)}
          stroke="currentColor"
          fill="none"
        />
      </svg>
      <span className="absolute text-sm font-semibold tabular-nums">{pct}%</span>
    </div>
  );
}
