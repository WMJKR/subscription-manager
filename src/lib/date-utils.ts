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

/**
 * 특정 연/월(month는 0부터 시작)에 결제가 발생하는 날짜별 구독 목록.
 * 매월 구독은 등록된 날짜(day-of-month)에 매달 반복되고(등록 월 이전은 제외),
 * 매년 구독은 등록된 월에만 매년 반복된다. 그 달에 존재하지 않는 날짜(예: 31일)는 건너뛴다.
 */
export function getBillingDaysInMonth(
  subscriptions: Subscription[],
  year: number,
  month: number
): Map<number, Subscription[]> {
  const map = new Map<number, Subscription[]>();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const viewedYM = year * 12 + month;

  for (const sub of subscriptions.filter((s) => s.status === "active")) {
    const anchor = new Date(sub.nextBillingDate);
    const anchorYM = anchor.getFullYear() * 12 + anchor.getMonth();
    const day = anchor.getDate();

    const matches =
      sub.billingCycle === "monthly"
        ? viewedYM >= anchorYM && day <= daysInMonth
        : anchor.getMonth() === month && year >= anchor.getFullYear();

    if (!matches) continue;
    map.set(day, [...(map.get(day) ?? []), sub]);
  }

  return map;
}
