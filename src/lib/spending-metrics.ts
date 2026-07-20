import { isSameMonthAsToday } from "./date-utils";
import { Subscription } from "./types";

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

/** 이 구독 하나를 해지했을 때 연간 절약되는 금액(내 부담 기준). */
export function getAnnualSavingsForSub(sub: Subscription): number {
  const actual = getActualAmount(sub);
  return sub.billingCycle === "monthly" ? actual * 12 : actual;
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
