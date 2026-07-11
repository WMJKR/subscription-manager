export type BillingCycle = "monthly" | "yearly";

export type SubscriptionStatus = "active" | "cancelled";

export type UsageFrequency = "none" | "few" | "many"; // 안 씀 / 1~2번 / 3번 이상

export interface WeeklyUsageCheckIn {
  weekKey: string; // ISO week, 예: "2026-W29" — 주가 바뀌면 자동으로 재체크인 대상이 된다.
  frequency: UsageFrequency;
}

export interface Subscription {
  id: string;
  serviceName: string;
  category: string;
  amount: number;
  initialAmount: number; // 최초 등록 금액. 가격 인상 감지의 기준값.
  sharedCount: number; // 나눠 쓰는 인원 수(본인 포함). 기본 1 = 혼자 부담.
  billingCycle: BillingCycle;
  nextBillingDate: string; // ISO date string (YYYY-MM-DD)
  status: SubscriptionStatus;
  createdAt: string; // ISO datetime string
  usageCheckIn?: WeeklyUsageCheckIn;
}

export interface UserProfile {
  name: string;
  email: string;
}

export type NotificationThreshold = 0 | 1 | 3;
