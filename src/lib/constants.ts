import { NotificationThreshold } from "./types";

export interface ServicePreset {
  name: string;
  category: string;
  icon: string;
}

// 실제 서비스 사이트로 직접 이동 가능한(deeplinks.ts에 매핑이 있는) 프리셋만 유지한다.
// 카테고리형 항목(헬스장/정기배송/클라우드 저장소)과 "직접 입력"은 이동 가능한 사이트가
// 없어 제외했다 — 커스텀 서비스명 입력 자체도 이제 지원하지 않는다.
export const SERVICE_PRESETS: ServicePreset[] = [
  { name: "넷플릭스", category: "OTT", icon: "🎬" },
  { name: "유튜브 프리미엄", category: "OTT", icon: "▶️" },
  { name: "디즈니플러스", category: "OTT", icon: "🏰" },
  { name: "왓챠", category: "OTT", icon: "🎞️" },
  { name: "웨이브", category: "OTT", icon: "🌊" },
  { name: "티빙", category: "OTT", icon: "📺" },
  { name: "스포티파이", category: "음악", icon: "🎵" },
  { name: "멜론", category: "음악", icon: "🍈" },
  { name: "애플뮤직", category: "음악", icon: "🎧" },
  { name: "쿠팡 와우", category: "정기배송", icon: "📦" },
];

export const NOTIFICATION_THRESHOLD_OPTIONS: { label: string; value: NotificationThreshold }[] = [
  { label: "D-7", value: 7 },
  { label: "D-6", value: 6 },
  { label: "D-5", value: 5 },
  { label: "D-4", value: 4 },
  { label: "D-3", value: 3 },
  { label: "D-2", value: 2 },
  { label: "D-1", value: 1 },
  { label: "당일", value: 0 },
];

export const DEFAULT_CATEGORY = "기타";

// 고정 순서 유지: 카테고리가 늘거나 줄어도 같은 카테고리는 항상 같은 색을 갖도록 한다.
export const CATEGORY_OPTIONS = ["OTT", "음악", "피트니스", "정기배송", "생산성", "기타"];

export const CATEGORY_COLORS: Record<string, string> = {
  OTT: "#2a78d6",
  음악: "#1baf7a",
  피트니스: "#eda100",
  정기배송: "#008300",
  생산성: "#4a3aa7",
  기타: "#e34948",
};

export const FALLBACK_CATEGORY_COLOR = "#898781";

export function getServiceIcon(serviceName: string): string {
  return SERVICE_PRESETS.find((s) => s.name === serviceName)?.icon ?? "💳";
}
