import { Subscription } from "./types";

function monthlyEquivalent(amount: number, billingCycle: "monthly" | "yearly"): number {
  return billingCycle === "yearly" ? Math.round(amount / 12) : amount;
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
