"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import SubscriptionCard from "@/components/SubscriptionCard";
import CategoryDonutChart from "@/components/CategoryDonutChart";
import TopSpendList from "@/components/TopSpendList";
import { downloadICS } from "@/lib/ics";
import { deleteSubscription, getGoal, getTheme, saveGoal, saveTheme } from "@/lib/storage";
import { SavingsGoal, Subscription, Theme } from "@/lib/types";
import { getDDay } from "@/lib/date-utils";
import {
  getAnnualTotal,
  getCategoryBreakdown,
  getThisMonthTotal,
  getTopSubscriptions,
  getTotalSpend,
} from "@/lib/spending-metrics";

export default function DashboardPage() {
  const { subscriptions, isLoaded, refresh } = useSubscriptions();
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalNameInput, setGoalNameInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setGoal(getGoal());
    setTheme(getTheme());
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    saveTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }

  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");
  const sorted = [...activeSubscriptions].sort(
    (a, b) => getDDay(a.nextBillingDate) - getDDay(b.nextBillingDate)
  );
  const monthlyTotal = getThisMonthTotal(subscriptions);
  const annualTotal = getAnnualTotal(subscriptions);
  const totalSpend = getTotalSpend(subscriptions);
  const topSubscriptions = getTopSubscriptions(subscriptions);
  const categoryBreakdown = getCategoryBreakdown(subscriptions);
  const hasActiveSubscriptions = activeSubscriptions.length > 0;

  function startEditGoal() {
    if (!goal) return;
    setGoalNameInput(goal.goalName);
    setIsEditingGoal(true);
  }

  function saveGoalName() {
    if (!goal) return;
    const name = goalNameInput.trim();
    if (name) {
      const updated = { ...goal, goalName: name };
      saveGoal(updated);
      setGoal(updated);
    }
    setIsEditingGoal(false);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteSubscription(deleteTarget.id);
    refresh();
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text">홈</h1>
          <p className="mt-1 text-sm text-text-muted">등록된 구독을 한눈에 확인하세요.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
            className="rounded-lg border border-border-strong px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            type="button"
            onClick={() => downloadICS(subscriptions)}
            className="rounded-lg border border-border-strong px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            📅 캘린더로 내보내기
          </button>
        </div>
      </header>

      <section className="rounded-2xl bg-primary-600 p-5 text-white shadow-sm">
        <p className="text-sm text-primary-100">이번 달 총 구독 지출액</p>
        <p className="mt-1 text-3xl font-bold">
          {monthlyTotal.toLocaleString()}원{" "}
          <span className="text-base font-medium text-primary-100">
            · 연간 약 {annualTotal.toLocaleString()}원
          </span>
        </p>
        <p className="mt-2 text-sm text-primary-100">
          등록된 구독 {activeSubscriptions.length}개
        </p>
      </section>

      {goal && (
        <section className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          {isEditingGoal ? (
            <div className="flex w-full items-center gap-2">
              <input
                type="text"
                value={goalNameInput}
                onChange={(e) => setGoalNameInput(e.target.value)}
                className="min-w-0 flex-1 rounded-md border border-border-strong px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={saveGoalName}
                className="shrink-0 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white"
              >
                저장
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                🎯 {goal.goalName} · {goal.goalSavedAmount.toLocaleString()}원 모음
              </p>
              <button
                type="button"
                onClick={startEditGoal}
                className="shrink-0 text-xs font-medium text-emerald-700 dark:text-emerald-400"
              >
                수정
              </button>
            </>
          )}
        </section>
      )}

      {hasActiveSubscriptions && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            가장 비싸게 나가는 구독 Top 3
          </h2>
          <TopSpendList items={topSubscriptions} />
        </section>
      )}

      {hasActiveSubscriptions && (
        <section className="space-y-3 rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            카테고리별 지출 비중
          </h2>
          <CategoryDonutChart breakdown={categoryBreakdown} totalAmount={totalSpend} />
        </section>
      )}

      <section className="space-y-3">
        {isLoaded && sorted.length === 0 && (
          <div className="rounded-xl border border-dashed border-border-strong p-8 text-center">
            <p className="text-sm text-text-muted">아직 등록된 구독이 없어요.</p>
            <Link
              href="/register"
              className="mt-3 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
            >
              첫 구독 등록하기
            </Link>
          </div>
        )}
        {sorted.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            subscription={sub}
            onDelete={() => setDeleteTarget(sub)}
          />
        ))}
      </section>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-surface p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-text">
              {deleteTarget.serviceName}을(를) 목록에서 삭제할까요?
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              이 작업은 되돌릴 수 없어요. 해지 절약 목표에는 반영되지 않아요.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-border-strong py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
