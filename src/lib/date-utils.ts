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
