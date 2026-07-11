import type { KeyboardEvent, MouseEvent } from "react";
import { getServiceIcon } from "@/lib/constants";
import { getServiceDeepLink } from "@/lib/deeplinks";
import { formatDate, formatDDay, getActualAmount, getDDay } from "@/lib/date-utils";
import { Subscription } from "@/lib/types";

interface Props {
  subscription: Subscription;
  onClick?: () => void;
  onDelete?: () => void;
}

export default function SubscriptionCard({ subscription, onClick, onDelete }: Props) {
  const dDay = getDDay(subscription.nextBillingDate);
  const isImminent = dDay <= 1 && dDay >= 0;
  const isShared = (subscription.sharedCount ?? 1) > 1;
  const actualAmount = getActualAmount(subscription);

  function handleIconClick(e: MouseEvent) {
    e.stopPropagation();
    window.open(getServiceDeepLink(subscription.serviceName), "_blank", "noopener,noreferrer");
  }

  function handleDeleteClick(e: MouseEvent) {
    e.stopPropagation();
    onDelete?.();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative flex w-full items-center gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition-colors ${
        isImminent ? "border-2 border-indigo-500" : "border-gray-200"
      } ${onClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
    >
      {onDelete && (
        <button
          type="button"
          onClick={handleDeleteClick}
          aria-label={`${subscription.serviceName} 삭제`}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500"
        >
          ×
        </button>
      )}
      <button
        type="button"
        onClick={handleIconClick}
        className="text-2xl leading-none"
        aria-label={`${subscription.serviceName} 결제 관리로 이동`}
      >
        {getServiceIcon(subscription.serviceName)}
      </button>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-gray-900">
          <span className="truncate">{subscription.serviceName}</span>
          {subscription.isTrial && (
            <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
              체험중
            </span>
          )}
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
        {isShared && (
          <span className="text-right text-[11px] text-gray-500">
            {subscription.sharedCount}명 분담 · 내 부담 {actualAmount.toLocaleString()}원
          </span>
        )}
      </div>
    </div>
  );
}
