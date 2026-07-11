"use client";

import Link from "next/link";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import SubscriptionCard from "@/components/SubscriptionCard";
import { getDDay, getThisMonthTotal } from "@/lib/date-utils";

export default function DashboardPage() {
  const { subscriptions, isLoaded } = useSubscriptions();

  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");
  const sorted = [...activeSubscriptions].sort(
    (a, b) => getDDay(a.nextBillingDate) - getDDay(b.nextBillingDate)
  );
  const monthlyTotal = getThisMonthTotal(subscriptions);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-gray-900">홈</h1>
        <p className="mt-1 text-sm text-gray-500">등록된 구독을 한눈에 확인하세요.</p>
      </header>

      <section className="rounded-2xl bg-indigo-600 p-5 text-white shadow-sm">
        <p className="text-sm text-indigo-100">이번 달 총 구독 지출액</p>
        <p className="mt-1 text-3xl font-bold">{monthlyTotal.toLocaleString()}원</p>
        <p className="mt-2 text-sm text-indigo-100">
          등록된 구독 {activeSubscriptions.length}개
        </p>
      </section>

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
