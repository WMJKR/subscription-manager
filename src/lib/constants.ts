export interface ServicePreset {
  name: string;
  category: string;
  icon: string;
}

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
  { name: "헬스장", category: "피트니스", icon: "💪" },
  { name: "쿠팡 와우", category: "정기배송", icon: "📦" },
  { name: "정기배송", category: "정기배송", icon: "🚚" },
  { name: "클라우드 저장소", category: "생산성", icon: "☁️" },
  { name: "직접 입력", category: "기타", icon: "✏️" },
];

export const NOTIFICATION_THRESHOLD_OPTIONS: { label: string; value: number }[] = [
  { label: "D-3일 전", value: 3 },
  { label: "D-1일 전", value: 1 },
  { label: "당일", value: 0 },
];

export const NOTIFICATION_THRESHOLD_STORAGE_KEY = "sm_notification_threshold";
