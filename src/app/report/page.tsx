"use client";

import { useState } from "react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { updateSubscription } from "@/lib/storage";
import { getActualAmount, getCostPerUse, getWeekKey } from "@/lib/date-utils";
import { getServiceIcon } from "@/lib/constants";
import { Subscription, UsageFrequency } from "@/lib/types";

const FREQUENCY_OPTIONS: { value: UsageFrequency; label: string }[] = [
  { value: "none", label: "안 씀" },
  { value: "few", label: "1~2번" },
  { value: "many", label: "3번 이상" },
];

export default function ReportPage() {
  const { subscriptions, isLoaded, refresh } = useSubscriptions();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const active = subscriptions.filter((sub) => sub.status === "active");
  const currentWeek = getWeekKey();

  function handleCheckIn(sub: Subscription, frequency: UsageFrequency) {
    updateSubscription(sub.id, { usageCheckIn: { weekKey: currentWeek, frequency } });
    refresh();
  }

  function startEdit(sub: Subscription) {
    setEditingId(sub.id);
    setEditValue(String(sub.amount));
  }

  function saveEdit(sub: Subscription) {
    const parsed = Number(editValue);
    if (!Number.isNaN(parsed) && parsed > 0) {
      updateSubscription(sub.id, { amount: Math.round(parsed) });
      refresh();
    }
    setEditingId(null);
  }

  const priceIncreases = active
    .filter((sub) => sub.amount > sub.initialAmount)
    .map((sub) => {
      const diff = sub.amount - sub.initialAmount;
      const percent = Math.round((diff / sub.initialAmount) * 100);
      return { sub, diff, percent };
    })
    .sort((a, b) => b.percent - a.percent);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-bold text-gray-900">리포트</h1>
        <p className="mt-1 text-sm text-gray-500">사용량과 가격 변동을 확인하세요.</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">이번 주 사용량 체크인</h2>

        {isLoaded && active.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            등록된 구독이 없어요.
          </div>
        )}

        <ul className="space-y-3">
          {active.map((sub) => {
            const checkedInThisWeek = sub.usageCheckIn?.weekKey === currentWeek;
            const costPerUse = getCostPerUse(sub);
            const isEditing = editingId === sub.id;

            return (
              <li key={sub.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">{getServiceIcon(sub.serviceName)}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">
                    {sub.serviceName}
                  </span>
                  {isEditing ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(sub)}
                        className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white"
                      >
                        저장
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(sub)}
                      className="shrink-0 text-xs font-medium text-indigo-600"
                    >
                      금액 수정
                    </button>
                  )}
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  현재 {getActualAmount(sub).toLocaleString()}원
                  {(sub.sharedCount ?? 1) > 1 ? " (내 부담)" : ""}
                </p>

                <p className="mt-3 text-xs font-medium text-gray-600">이번 주 몇 번 쓰셨나요?</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {FREQUENCY_OPTIONS.map((opt) => {
                    const selected = checkedInThisWeek && sub.usageCheckIn?.frequency === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleCheckIn(sub, opt.value)}
                        className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                          selected
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-gray-300 text-gray-600"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 min-h-[1rem]">
                  {!checkedInThisWeek && (
                    <p className="text-xs text-gray-400">체크인이 필요해요.</p>
                  )}
                  {checkedInThisWeek && sub.usageCheckIn?.frequency === "none" && (
                    <p className="text-xs font-medium text-amber-600">
                      이번 주 안 쓴 구독이에요.
                    </p>
                  )}
                  {checkedInThisWeek && costPerUse !== null && (
                    <p className="text-xs font-medium text-gray-700">
                      회당 비용 약{" "}
                      <span className="font-bold text-gray-900">
                        {costPerUse.toLocaleString()}원
                      </span>
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">가격 인상 감지</h2>
        {priceIncreases.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            아직 가격이 오른 구독이 없어요.
          </div>
        ) : (
          <ul className="space-y-2">
            {priceIncreases.map(({ sub, diff, percent }) => (
              <li
                key={sub.id}
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <span className="font-semibold">{sub.serviceName}</span> 가격이 등록 시점 대비{" "}
                <span className="font-bold">
                  {diff.toLocaleString()}원({percent}%)
                </span>{" "}
                올랐어요.
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
