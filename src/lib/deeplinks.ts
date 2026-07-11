// 자주 쓰는 서비스는 공식 도메인으로 바로 연결한다. 계정별 해지 절차가 있는 서비스는
// 정확한 하위 경로 대신 신뢰할 수 있는 최상위 도메인으로 연결해 잘못된 링크를 피한다.
const SERVICE_DEEPLINKS: Record<string, string> = {
  넷플릭스: "https://www.netflix.com/YourAccount",
  "유튜브 프리미엄": "https://www.youtube.com/paid_memberships",
  디즈니플러스: "https://www.disneyplus.com/account",
  왓챠: "https://watcha.com/",
  웨이브: "https://www.wavve.com/",
  티빙: "https://www.tving.com/",
  스포티파이: "https://www.spotify.com/account/subscription/",
  멜론: "https://www.melon.com/",
  애플뮤직: "https://music.apple.com/",
  "쿠팡 와우": "https://www.coupang.com/",
};

export function getServiceDeepLink(serviceName: string): string {
  const mapped = SERVICE_DEEPLINKS[serviceName];
  if (mapped) return mapped;
  return `https://www.google.com/search?q=${encodeURIComponent(`${serviceName} 해지방법`)}`;
}
