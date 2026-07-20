import { getAnnualSavingsForSub } from "./spending-metrics";
import { Subscription } from "./types";

export interface SubscriptionHistoryItem {
  serviceName: string;
  records: Subscription[]; // createdAt 오름차순(가장 오래된 등록이 먼저)
  cancelCount: number;
  isActive: boolean; // 현재 같은 이름으로 재구독 중인 active 레코드가 있는지
  totalApproxAnnualSpend: number; // 레코드별 연간 환산 지출(getAnnualSavingsForSub 방식)의 합계, 대략적인 값
}

/**
 * serviceName 기준으로 구독 레코드를 그룹핑해, 해지(cancelled) 이력이 최소 1건 이상 있는
 * 서비스만 재구독 이력으로 반환한다. 해지 시점(cancelledAt)이 데이터 모델에 없어 정확한
 * 구독 기간을 계산할 수 없으므로, 지출 합계는 각 레코드의 연간 환산액을 더한 "대략적인" 값이다.
 *
 * 알려진 한계: serviceName은 정확히 일치하는 문자열로만 그룹핑한다. "직접 입력"으로 등록한
 * 커스텀 서비스명은 오타나 표기 차이(예: "넷플릭스" vs "Netflix")가 있으면 같은 서비스로
 * 인식되지 않는다 — 이번 스코프에서는 처리하지 않는다.
 */
export function getSubscriptionHistory(subscriptions: Subscription[]): SubscriptionHistoryItem[] {
  const byServiceName = new Map<string, Subscription[]>();
  for (const sub of subscriptions) {
    const records = byServiceName.get(sub.serviceName) ?? [];
    records.push(sub);
    byServiceName.set(sub.serviceName, records);
  }

  return Array.from(byServiceName.entries())
    .filter(([, records]) => records.some((r) => r.status === "cancelled"))
    .map(([serviceName, records]) => {
      const sorted = [...records].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return {
        serviceName,
        records: sorted,
        cancelCount: sorted.filter((r) => r.status === "cancelled").length,
        isActive: sorted.some((r) => r.status === "active"),
        totalApproxAnnualSpend: sorted.reduce((sum, r) => sum + getAnnualSavingsForSub(r), 0),
      };
    })
    .sort((a, b) => b.cancelCount - a.cancelCount);
}
