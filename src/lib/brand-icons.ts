import { siApplemusic, siNetflix, siSpotify, siYoutube } from "simple-icons";

export interface BrandIcon {
  path: string;
  hex: string;
  title: string;
}

// simple-icons(CC0)에 실제로 등록된 브랜드만 매핑한다. 왓챠/웨이브/티빙/멜론/쿠팡 와우 같은
// 한국 로컬 서비스와 헬스장/정기배송/클라우드 저장소/직접 입력처럼 특정 브랜드가 아닌
// 카테고리형 프리셋은 simple-icons에 없어 getServiceIcon()의 이모지로 폴백된다.
const SERVICE_BRAND_ICONS: Record<string, BrandIcon> = {
  넷플릭스: siNetflix,
  "유튜브 프리미엄": siYoutube,
  스포티파이: siSpotify,
  애플뮤직: siApplemusic,
};

export function getBrandIcon(serviceName: string): BrandIcon | null {
  return SERVICE_BRAND_ICONS[serviceName] ?? null;
}
