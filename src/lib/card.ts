import { getActualAmount } from "./date-utils";
import { Subscription } from "./types";

// 이 파일이 다루는 "카드 라벨"은 결제/인증 수단이 아니라, 사용자가 같은 카드사의
// 여러 카드/계좌를 구분하기 위한 식별용 표시일 뿐이다. 계좌번호 앞 4자리 외에는
// 어떤 값(전체 번호, 뒷자리, 유효기간, CVV 등)도 입력받지 않는다 — 입력 필드 자체가 없다.

export const BANK_OPTIONS = [
  "국민",
  "신한",
  "삼성",
  "현대",
  "우리",
  "농협",
  "카카오뱅크",
  "토스뱅크",
  "직접 입력",
];

export const NO_CARD_LABEL = "카드 미지정";

export function getCardLabel(sub: Pick<Subscription, "bankName" | "cardLast4">): string {
  if (sub.bankName && sub.cardLast4) return `${sub.bankName} ${sub.cardLast4}`;
  return NO_CARD_LABEL;
}

export interface CardBreakdownItem {
  label: string;
  amount: number;
  count: number;
}

/** 카드/계좌 라벨별 지출 합계(내 부담 기준)와 구독 개수. 금액 내림차순으로 정렬한다. */
export function getCardBreakdown(subscriptions: Subscription[]): CardBreakdownItem[] {
  const active = subscriptions.filter((sub) => sub.status === "active");
  const map = new Map<string, { amount: number; count: number }>();

  for (const sub of active) {
    const label = getCardLabel(sub);
    const entry = map.get(label) ?? { amount: 0, count: 0 };
    entry.amount += getActualAmount(sub);
    entry.count += 1;
    map.set(label, entry);
  }

  return Array.from(map.entries())
    .map(([label, v]) => ({ label, ...v }))
    .sort((a, b) => b.amount - a.amount);
}
