"use client";

import { useEffect, useRef, useState } from "react";
import { NOTIFICATION_THRESHOLD_OPTIONS } from "@/lib/constants";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { formatDDay, getDDay } from "@/lib/date-utils";
import { getAnnualSavingsForSub } from "@/lib/spending-metrics";
import {
  addToGoalSavings,
  getGoal,
  getNotificationThreshold,
  saveNotificationThreshold,
  updateSubscription,
} from "@/lib/storage";
import SubscriptionCard from "@/components/SubscriptionCard";
import BillingCalendar from "@/components/BillingCalendar";
import { NotificationThreshold, Subscription } from "@/lib/types";

const TRIAL_LEAD_DAYS = 5;
const GOAL_PRESETS = ["여행자금", "비상금", "취미"];
const CUSTOM_GOAL_OPTION = "직접 입력";

export default function NotificationsPage() {
  const { subscriptions, isLoaded, refresh } = useSubscriptions();
  const [threshold, setThreshold] = useState<NotificationThreshold>(3);
  const [selected, setSelected] = useState<Subscription | null>(null);
  const [modalStep, setModalStep] = useState<"confirm" | "goal">("confirm");
  const [goalChoice, setGoalChoice] = useState(GOAL_PRESETS[0]);
  const [customGoalName, setCustomGoalName] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setThreshold(getNotificationThreshold());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }
    setNotificationPermission(Notification.permission);
  }, []);

  function handleThresholdChange(value: NotificationThreshold) {
    setThreshold(value);
    saveNotificationThreshold(value);
  }

  function handleRequestNotificationPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    Notification.requestPermission().then((result) => {
      setNotificationPermission(result);
      if (result === "granted") {
        new Notification("알림이 켜졌어요!", {
          body: "결제 예정 구독을 브라우저 알림으로 알려드릴게요.",
        });
      }
    });
  }

  const upcoming = subscriptions
    .filter((sub) => sub.status === "active")
    .filter((sub) => {
      const dDay = getDDay(sub.nextBillingDate);
      if (dDay < 0) return false;
      const effectiveThreshold = sub.isTrial ? Math.max(threshold, TRIAL_LEAD_DAYS) : threshold;
      return dDay <= effectiveThreshold;
    })
    .sort((a, b) => getDDay(a.nextBillingDate) - getDDay(b.nextBillingDate));

  // 허용된 뒤로는 알림 시점 목록에 새로 나타난 구독마다 브라우저 알림을 한 번씩 띄운다.
  // 탭이 열려있는 동안만 동작하며(서비스 워커 없음), 같은 구독을 반복해서 알리지 않도록
  // 세션 동안 알린 id를 기억한다.
  useEffect(() => {
    if (notificationPermission !== "granted") return;
    for (const sub of upcoming) {
      if (notifiedIdsRef.current.has(sub.id)) continue;
      notifiedIdsRef.current.add(sub.id);
      const dDay = getDDay(sub.nextBillingDate);
      new Notification(`${sub.serviceName} 결제 예정`, {
        body: `${formatDDay(dDay)} · ${sub.amount.toLocaleString()}원`,
      });
    }
  }, [notificationPermission, upcoming]);

  function openModal(sub: Subscription) {
    setSelected(sub);
    setModalStep("confirm");
    setGoalChoice(GOAL_PRESETS[0]);
    setCustomGoalName("");
  }

  function handleKeep() {
    setSelected(null);
  }

  function finalizeCancel(sub: Subscription, goalName: string) {
    const annualSavings = getAnnualSavingsForSub(sub);
    updateSubscription(sub.id, { status: "cancelled" });
    addToGoalSavings(goalName, annualSavings);
    refresh();
    setSelected(null);
  }

  function handleCancelClick() {
    if (!selected) return;
    const existingGoal = getGoal();
    if (existingGoal?.goalName) {
      finalizeCancel(selected, existingGoal.goalName);
    } else {
      setModalStep("goal");
    }
  }

  function handleConfirmGoal() {
    if (!selected) return;
    const goalName = goalChoice === CUSTOM_GOAL_OPTION ? customGoalName.trim() : goalChoice;
    if (!goalName) return;
    finalizeCancel(selected, goalName);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-gray-900">알림</h1>
        <p className="mt-1 text-sm text-gray-500">결제 예정인 구독을 확인하고 관리하세요.</p>
      </header>

      {notificationPermission !== "unsupported" && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-700">🔔 브라우저 알림</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {notificationPermission === "granted"
                ? "결제 예정 구독을 브라우저 알림으로 받고 있어요."
                : notificationPermission === "denied"
                  ? "알림이 차단되어 있어요. 브라우저 설정에서 허용해주세요."
                  : "결제 예정 구독을 브라우저 알림으로 받아보세요."}
            </p>
          </div>
          {notificationPermission === "default" && (
            <button
              type="button"
              onClick={handleRequestNotificationPermission}
              className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              알림 허용
            </button>
          )}
        </div>
      )}

      <div>
        <span className="mb-1 block text-sm font-medium text-gray-700">알림 시점</span>
        <div className="grid grid-cols-4 gap-2">
          {NOTIFICATION_THRESHOLD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleThresholdChange(opt.value)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                threshold === opt.value
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-3">
        {isLoaded && upcoming.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-sm text-gray-500">선택한 기간 내 결제 예정인 구독이 없어요.</p>
          </div>
        )}
        {upcoming.map((sub) => (
          <div key={sub.id} className="space-y-1">
            <SubscriptionCard subscription={sub} onClick={() => openModal(sub)} />
            {sub.isTrial && (
              <p className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                무료체험 종료 임박 · 지금 해지하면 0원
              </p>
            )}
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">결제 캘린더</h2>
        <BillingCalendar subscriptions={subscriptions} />
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
            {modalStep === "confirm" && (
              <>
                <p className="text-sm text-gray-500">{selected.serviceName}</p>
                <h2 className="mt-1 text-lg font-bold text-gray-900">
                  {selected.isTrial
                    ? "무료체험이 곧 끝나요"
                    : `${selected.amount.toLocaleString()}원 결제가 곧 진행돼요`}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selected.isTrial
                    ? "지금 해지하면 결제 없이 종료돼요."
                    : "이 구독을 계속 유지할까요?"}
                </p>
                <p className="mt-2 text-sm font-medium text-indigo-600">
                  이 구독 해지하면 연간 약{" "}
                  {getAnnualSavingsForSub(selected).toLocaleString()}원 절약돼요
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCancelClick}
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
              </>
            )}

            {modalStep === "goal" && (
              <>
                <h2 className="text-lg font-bold text-gray-900">이 돈을 어디에 모아볼까요?</h2>
                <p className="mt-1 text-sm text-gray-500">
                  연간 약 {getAnnualSavingsForSub(selected).toLocaleString()}원을 모을 목표를
                  정해주세요.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[...GOAL_PRESETS, CUSTOM_GOAL_OPTION].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setGoalChoice(option)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        goalChoice === option
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-gray-300 text-gray-600"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {goalChoice === CUSTOM_GOAL_OPTION && (
                  <input
                    type="text"
                    value={customGoalName}
                    onChange={(e) => setCustomGoalName(e.target.value)}
                    placeholder="예: 새 노트북"
                    className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                )}

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleKeep}
                    className="rounded-lg border border-gray-300 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmGoal}
                    className="rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    목표 설정하고 해지
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
