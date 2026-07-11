"use client";

import Link from "next/link";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import SubscriptionCard from "@/components/SubscriptionCard";
import CategoryDonutChart from "@/components/CategoryDonutChart";
import TopSpendList from "@/components/TopSpendList";
import {
  getAnnualTotal,
  getCategoryBreakdown,
  getDDay,
  getThisMonthTotal,
  getTopSubscriptions,
  getTotalSpend,
} from "@/lib/date-utils";

export default function DashboardPage() {
  const { subscriptions, isLoaded } = useSubscriptions();

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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-gray-900">홈</h1>
        <p className="mt-1 text-sm text-gray-500">등록된 구독을 한눈에 확인하세요.</p>
      </header>

      <section className="rounded-2xl bg-indigo-600 p-5 text-white shadow-sm">
        <p className="text-sm text-indigo-100">이번 달 총 구독 지출액</p>
        <p className="mt-1 text-3xl font-bold">
          {monthlyTotal.toLocaleString()}원{" "}
          <span className="text-base font-medium text-indigo-100">
            · 연간 약 {annualTotal.toLocaleString()}원
          </span>
        </p>
        <p className="mt-2 text-sm text-indigo-100">
          등록된 구독 {activeSubscriptions.length}개
        </p>
      </section>

      {hasActiveSubscriptions && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">가장 비싸게 나가는 구독 Top 3</h2>
          <TopSpendList items={topSubscriptions} />
        </section>
      )}

      {hasActiveSubscriptions && (
        <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700">카테고리별 지출 비중</h2>
          <CategoryDonutChart breakdown={categoryBreakdown} totalAmount={totalSpend} />
        </section>
      )}

      <section className="space-y-3">
        {isLoaded && sorted.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-sm text-gray-500">아직 등록된 구독이 없어요.</p>
            <Link
              href="/register"
              className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              첫 구독 등록하기
            </Link>
          </div>
        )}
        {sorted.map((sub) => (
          <SubscriptionCard key={sub.id} subscription={sub} />
        ))}
      </section>
    </div>
  );
}
