"use client";

import { useCallback, useEffect, useState } from "react";
import { getSubscriptions } from "@/lib/storage";
import { Subscription } from "@/lib/types";

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
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
