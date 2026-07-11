import { Subscription } from "./types";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDDay(nextBillingDate: string): number {
  const today = startOfDay(new Date());
  const target = startOfDay(new Date(nextBillingDate));
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatDDay(dDay: number): string {
  if (dDay === 0) return "D-DAY";
  if (dDay > 0) return `D-${dDay}`;
  return `D+${Math.abs(dDay)}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function isSameMonthAsToday(dateStr: string): boolean {
  const today = new Date();
  const d = new Date(dateStr);
  return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
}

export function monthlyEquivalent(amount: number, billingCycle: "monthly" | "yearly"): number {
  return billingCycle === "yearly" ? Math.round(amount / 12) : amount;
}

/** 이번 달에 실제로 청구되는 금액의 합. 매월 구독은 항상 포함하고, 매년 구독은 결제월이 이번 달인 경우만 포함한다. */
export function getThisMonthTotal(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((total, sub) => {
      if (sub.billingCycle === "monthly") return total + sub.amount;
      return isSameMonthAsToday(sub.nextBillingDate) ? total + sub.amount : total;
    }, 0);
}

/** 연간 환산 총액. 매월 구독은 ×12, 매년 구독은 이미 연 단위이므로 그대로 더한다. */
export function getAnnualTotal(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((total, sub) => {
      return total + (sub.billingCycle === "monthly" ? sub.amount * 12 : sub.amount);
    }, 0);
}

export function getTotalSpend(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((total, sub) => total + sub.amount, 0);
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percent: number;
}

/** 카테고리별 지출 비중. 퍼센트는 반올림하며, 금액 내림차순으로 정렬한다. */
export function getCategoryBreakdown(subscriptions: Subscription[]): CategoryBreakdownItem[] {
  const active = subscriptions.filter((sub) => sub.status === "active");
  const total = getTotalSpend(active);

  const amountByCategory = new Map<string, number>();
  for (const sub of active) {
    amountByCategory.set(sub.category, (amountByCategory.get(sub.category) ?? 0) + sub.amount);
  }

  return Array.from(amountByCategory.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percent: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export interface TopSubscriptionItem extends Subscription {
  percent: number;
}

/** 금액이 가장 큰 구독 상위 n개. 각 항목에 전체 지출 대비 비중(%)을 함께 계산한다. */
export function getTopSubscriptions(subscriptions: Subscription[], n = 3): TopSubscriptionItem[] {
  const active = subscriptions.filter((sub) => sub.status === "active");
  const total = getTotalSpend(active);

  return [...active]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, n)
    .map((sub) => ({
      ...sub,
      percent: total > 0 ? Math.round((sub.amount / total) * 100) : 0,
    }));
}
