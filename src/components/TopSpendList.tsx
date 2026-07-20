import { TopSubscriptionItem } from "@/lib/spending-metrics";
import ServiceIcon from "./ServiceIcon";

interface Props {
  items: TopSubscriptionItem[];
}

export default function TopSpendList({ items }: Props) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => {
        const isShared = (item.sharedCount ?? 1) > 1;
        return (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
          >
            <span className="w-5 shrink-0 text-center text-sm font-bold text-slate-400 dark:text-slate-500">
              {index + 1}
            </span>
            <ServiceIcon serviceName={item.serviceName} size="md" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">
              {item.serviceName}
            </span>
            <span className="shrink-0 text-right text-sm">
              <span className="block font-semibold text-text">
                {item.actualAmount.toLocaleString()}원
              </span>
              <span className="block text-xs text-text-muted">전체의 {item.percent}%</span>
              {isShared && (
                <span className="block text-[11px] text-slate-400 dark:text-slate-500">
                  {item.amount.toLocaleString()}원 · {item.sharedCount}명 분담
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
