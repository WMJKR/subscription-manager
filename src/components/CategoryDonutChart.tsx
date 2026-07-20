import { CATEGORY_COLORS, FALLBACK_CATEGORY_COLOR } from "@/lib/constants";
import { CategoryBreakdownItem } from "@/lib/spending-metrics";

const RADIUS = 15.915; // circumference = 100, so each 1% of data = 1 unit of stroke-dasharray
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 1.2; // percentage-point gap rendered between segments

interface Props {
  breakdown: CategoryBreakdownItem[];
  totalAmount: number;
}

export default function CategoryDonutChart({ breakdown, totalAmount }: Props) {
  let cumulativePercent = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 42 42" className="h-40 w-40 -rotate-90">
          <circle
            cx={21}
            cy={21}
            r={RADIUS}
            fill="transparent"
            stroke="var(--color-border-strong)"
            strokeWidth={6}
          />
          {breakdown.map((item) => {
            const color = CATEGORY_COLORS[item.category] ?? FALLBACK_CATEGORY_COLOR;
            const filled = Math.max(item.percent - GAP, 0);
            const dashArray = `${(filled / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
            const dashOffset = (-cumulativePercent / 100) * CIRCUMFERENCE;
            cumulativePercent += item.percent;
            return (
              <circle
                key={item.category}
                cx={21}
                cy={21}
                r={RADIUS}
                fill="transparent"
                stroke={color}
                strokeWidth={6}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-text-muted">총 지출</span>
          <span className="text-base font-bold text-text">
            {totalAmount.toLocaleString()}원
          </span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2">
        {breakdown.map((item) => {
          const color = CATEGORY_COLORS[item.category] ?? FALLBACK_CATEGORY_COLOR;
          return (
            <li key={item.category} className="flex items-center gap-2 text-sm">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-300">
                {item.category}
              </span>
              <span className="shrink-0 font-medium text-text">
                {item.percent}% · {item.amount.toLocaleString()}원
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
