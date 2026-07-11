import { SERVICE_PRESETS } from "@/lib/constants";
import { formatDate, formatDDay, getDDay } from "@/lib/date-utils";
import { Subscription } from "@/lib/types";

function iconFor(serviceName: string): string {
  return SERVICE_PRESETS.find((s) => s.name === serviceName)?.icon ?? "💳";
}

interface Props {
  subscription: Subscription;
  onClick?: () => void;
}

export default function SubscriptionCard({ subscription, onClick }: Props) {
  const dDay = getDDay(subscription.nextBillingDate);
  const isImminent = dDay <= 1 && dDay >= 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition-colors ${
        isImminent ? "border-2 border-indigo-500" : "border-gray-200"
      } ${onClick ? "cursor-pointer hover:bg-gray-50" : "cursor-default"}`}
    >
      <span className="text-2xl leading-none">{iconFor(subscription.serviceName)}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">
          {subscription.serviceName}
        </p>
        <p className="text-xs text-gray-500">
          {formatDate(subscription.nextBillingDate)} ·{" "}
          {subscription.billingCycle === "monthly" ? "매월" : "매년"}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            isImminent ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {formatDDay(dDay)}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          {subscription.amount.toLocaleString()}원
        </span>
      </div>
    </button>
  );
}
