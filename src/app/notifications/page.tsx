"use client";

import { useEffect, useState } from "react";
import { NOTIFICATION_THRESHOLD_OPTIONS, NOTIFICATION_THRESHOLD_STORAGE_KEY } from "@/lib/constants";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { getDDay } from "@/lib/date-utils";
import { updateSubscription } from "@/lib/storage";
import SubscriptionCard from "@/components/SubscriptionCard";
import { Subscription } from "@/lib/types";

export default function NotificationsPage() {
  const { subscriptions, isLoaded, refresh } = useSubscriptions();
  const [threshold, setThreshold] = useState(3);
  const [selected, setSelected] = useState<Subscription | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(NOTIFICATION_THRESHOLD_STORAGE_KEY);
    if (saved) setThreshold(Number(saved));
  }, []);

  function handleThresholdChange(value: number) {
    setThreshold(value);
    window.localStorage.setItem(NOTIFICATION_THRESHOLD_STORAGE_KEY, String(value));
  }

  const upcoming = subscriptions
    .filter((sub) => sub.status === "active")
    .filter((sub) => {
      const dDay = getDDay(sub.nextBillingDate);
      return dDay >= 0 && dDay <= threshold;
    })
    .sort((a, b) => getDDay(a.nextBillingDate) - getDDay(b.nextBillingDate));

  function handleKeep() {
    setSelected(null);
  }

  function handleCancel() {
    if (!selected) return;
    updateSubscription(selected.id, { status: "cancelled" });
    refresh();
    setSelected(null);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-gray-900">알림</h1>
        <p className="mt-1 text-sm text-gray-500">결제 예정인 구독을 확인하고 관리하세요.</p>
      </header>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">알림 시점</label>
        <select
          value={threshold}
          onChange={(e) => handleThresholdChange(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          {NOTIFICATION_THRESHOLD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <section className="space-y-3">
        {isLoaded && upcoming.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-sm text-gray-500">선택한 기간 내 결제 예정인 구독이 없어요.</p>
          </div>
        )}
        {upcoming.map((sub) => (
          <SubscriptionCard key={sub.id} subscription={sub} onClick={() => setSelected(sub)} />
        ))}
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={handleKeep}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-gray-500">{selected.serviceName}</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">
              {selected.amount.toLocaleString()}원 결제가 곧 진행돼요
            </h2>
            <p className="mt-1 text-sm text-gray-500">이 구독을 계속 유지할까요?</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-red-200 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                해지
              </button>
              <button
                type="button"
                onClick={handleKeep}
                className="rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                구독 유지
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
