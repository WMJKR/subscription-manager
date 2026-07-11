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

/** 결제금액을 나눠 쓰는 인원 수로 나눈, 실제 내 부담액(반올림). 모든 지출 집계의 기준값이다. */
export function getActualAmount(sub: Subscription): number {
  const shared = sub.sharedCount && sub.sharedCount > 0 ? sub.sharedCount : 1;
  return Math.round(sub.amount / shared);
}

/** 이번 달에 실제로 청구되는 금액(내 부담 기준)의 합. 매월 구독은 항상 포함하고, 매년 구독은 결제월이 이번 달인 경우만 포함한다. */
export function getThisMonthTotal(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((total, sub) => {
      if (sub.billingCycle === "monthly") return total + getActualAmount(sub);
      return isSameMonthAsToday(sub.nextBillingDate) ? total + getActualAmount(sub) : total;
    }, 0);
}

/** 연간 환산 총액(내 부담 기준). 매월 구독은 ×12, 매년 구독은 이미 연 단위이므로 그대로 더한다. */
export function getAnnualTotal(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((total, sub) => {
      return total + (sub.billingCycle === "monthly" ? getActualAmount(sub) * 12 : getActualAmount(sub));
    }, 0);
}

export function getTotalSpend(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((total, sub) => total + getActualAmount(sub), 0);
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percent: number;
}

/** 카테고리별 지출 비중(내 부담 기준). 퍼센트는 반올림하며, 금액 내림차순으로 정렬한다. */
export function getCategoryBreakdown(subscriptions: Subscription[]): CategoryBreakdownItem[] {
  const active = subscriptions.filter((sub) => sub.status === "active");
  const total = getTotalSpend(active);

  const amountByCategory = new Map<string, number>();
  for (const sub of active) {
    const actual = getActualAmount(sub);
    amountByCategory.set(sub.category, (amountByCategory.get(sub.category) ?? 0) + actual);
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
  actualAmount: number;
}

/** 내 부담액이 가장 큰 구독 상위 n개. 각 항목에 전체 지출 대비 비중(%)을 함께 계산한다. */
export function getTopSubscriptions(subscriptions: Subscription[], n = 3): TopSubscriptionItem[] {
  const active = subscriptions.filter((sub) => sub.status === "active");
  const total = getTotalSpend(active);

  return active
    .map((sub) => ({ sub, actualAmount: getActualAmount(sub) }))
    .sort((a, b) => b.actualAmount - a.actualAmount)
    .slice(0, n)
    .map(({ sub, actualAmount }) => ({
      ...sub,
      actualAmount,
      percent: total > 0 ? Math.round((actualAmount / total) * 100) : 0,
    }));
}

/** ISO 8601 주차 키(예: "2026-W29"). 주 단위 사용량 체크인의 리셋 기준으로 쓰인다. */
export function getWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // 월요일=0 ... 일요일=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // 그 주의 목요일로 이동
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const weekNum = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/** 월 환산 결제금액을 나눠 쓰는 인원 수로 나눈 값(반올림 없음, 회당 비용 계산용 중간값). */
export function getMonthlyActualAmount(sub: Subscription): number {
  const monthly = monthlyEquivalent(sub.amount, sub.billingCycle);
  const shared = sub.sharedCount && sub.sharedCount > 0 ? sub.sharedCount : 1;
  return monthly / shared;
}

export const USAGE_REPRESENTATIVE_COUNT: Record<"few" | "many", number> = {
  few: 1.5,
  many: 4,
};

/**
 * 이번 주 체크인을 기준으로 회당 비용을 계산한다.
 * 체크인이 없거나(=체크인 필요), 지난주 응답이거나(=주가 바뀌어 리셋됨), "안 씀"이면 null을 반환한다.
 */
export function getCostPerUse(sub: Subscription): number | null {
  const checkIn = sub.usageCheckIn;
  if (!checkIn || checkIn.weekKey !== getWeekKey() || checkIn.frequency === "none") return null;
  const representative = USAGE_REPRESENTATIVE_COUNT[checkIn.frequency];
  return Math.round(getMonthlyActualAmount(sub) / 4 / representative);
}
