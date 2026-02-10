interface MatchScoreCircleProps {
  score: number;
  size?: "sm" | "lg";
}

export function MatchScoreCircle({ score, size = "lg" }: MatchScoreCircleProps) {
  const isLg = size === "lg";
  const dim = isLg ? "h-20 w-20" : "h-12 w-12";
  const textSize = isLg ? "text-xl" : "text-xs";
  const strokeWidth = isLg ? 3 : 2.5;

  const color =
    score >= 70 ? "#16a34a" : score >= 40 ? "#d97706" : "#94a3b8";
  const bg =
    score >= 70 ? "bg-emerald-50" : score >= 40 ? "bg-amber-50" : "bg-muted";
  const text =
    score >= 70
      ? "text-emerald-600"
      : score >= 40
      ? "text-amber-600"
      : "text-muted-foreground";

  return (
    <div className={`relative ${dim} rounded-full flex items-center justify-center ${bg}`}>
      <svg className="absolute inset-0" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 175.9} 175.9`}
          transform="rotate(-90 32 32)"
        />
      </svg>
      <span className={`${textSize} font-bold ${text}`}>{score}%</span>
    </div>
  );
}
