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
  // 결제 카드 구분용 라벨. 결제/인증에는 쓰이지 않으며, 계좌번호 앞 4자리 외에는
  // 어떤 값도 입력받거나 저장하지 않는다(뒷자리 입력 필드 자체가 존재하지 않음).
  bankName?: string;
  cardLast4?: string; // 숫자 4자리 문자열. 반드시 bankName과 함께 설정된다.
  // 무료체험 여부. 종료일이 지나면 storage.ts의 정규화 로직이 자동으로 false로 되돌린다.
  isTrial?: boolean;
  trialEndDate?: string; // ISO date string. 등록 시점의 다음 결제일과 동일하게 설정된다.
}

export interface UserProfile {
  name: string;
  email: string;
}

// 앱 전역에 하나만 존재하는 해지 절약 목표. 구독별로 별도 목표를 두지 않는다.
export interface SavingsGoal {
  goalName: string;
  goalSavedAmount: number;
}

export type NotificationThreshold = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Theme = "light" | "dark";
