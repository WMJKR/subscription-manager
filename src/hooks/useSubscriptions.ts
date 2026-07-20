"use client";

import { useCallback, useEffect, useState } from "react";
import { getSubscriptions } from "@/lib/storage";
import { Subscription } from "@/lib/types";

// 앱 최초 진입 시 서버가 정적으로 렌더링한 빈 배열과 하이드레이션 시점의 클라이언트 첫 렌더가
// 반드시 일치해야 하므로(불일치 시 하이드레이션 에러), 최초 하이드레이션 전에는 절대 localStorage를
// 동기적으로 읽으면 안 된다. BottomNav(모든 페이지에 항상 마운트되는 공통 레이아웃)의 마운트
// 이펙트가 하이드레이션 완료 직후 이 플래그를 true로 바꿔주면, 이후의 모든 클라이언트 사이드
// 라우트 전환(예: /register 등록 후 "/"로 이동)에서는 이 훅이 새로 마운트될 때 하이드레이션을
// 거치지 않으므로 곧바로 최신 값을 동기적으로 읽어와도 안전하다.
let hasHydratedOnce = false;

export function markAppHydrated(): void {
  hasHydratedOnce = true;
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    hasHydratedOnce ? getSubscriptions() : []
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setSubscriptions(getSubscriptions());
  }, []);

  useEffect(() => {
    refresh();
    setIsLoaded(true);

    window.addEventListener("sm_subscriptions_updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("sm_subscriptions_updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return { subscriptions, isLoaded, refresh };
}
