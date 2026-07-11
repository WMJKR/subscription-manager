import { SERVICE_PRESETS } from "@/lib/constants";
import { TopSubscriptionItem } from "@/lib/date-utils";

function iconFor(serviceName: string): string {
  return SERVICE_PRESETS.find((s) => s.name === serviceName)?.icon ?? "💳";
}

interface Props {
  items: TopSubscriptionItem[];
}

export default function TopSpendList({ items }: Props) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={item.id}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
        >
          <span className="w-5 shrink-0 text-center text-sm font-bold text-gray-400">
            {index + 1}
          </span>
          <span className="text-xl leading-none">{iconFor(item.serviceName)}</span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">
            {item.serviceName}
          </span>
          <span className="shrink-0 text-right text-sm">
            <span className="block font-semibold text-gray-900">
              {item.amount.toLocaleString()}원
            </span>
            <span className="block text-xs text-gray-500">전체의 {item.percent}%</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
