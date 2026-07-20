"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { markAppHydrated } from "@/hooks/useSubscriptions";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/register", label: "구독등록", icon: "➕" },
  { href: "/notifications", label: "알림", icon: "🔔" },
  { href: "/report", label: "리포트", icon: "📊" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // 모든 페이지에 항상 마운트되는 공통 레이아웃이라, 하이드레이션이 끝난 직후
  // (앱에서 처음 방문한 페이지가 무엇이든) 이 시점에 플래그를 세워둘 수 있다.
  useEffect(() => {
    markAppHydrated();
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-surface">
      <div className="mx-auto flex max-w-md">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? "text-primary-600" : "text-slate-400 dark:text-slate-500"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
