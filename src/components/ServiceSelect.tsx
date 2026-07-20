"use client";

import { useEffect, useRef, useState } from "react";
import {
  CATEGORY_COLORS,
  CATEGORY_OPTIONS,
  FALLBACK_CATEGORY_COLOR,
  SERVICE_PRESETS,
} from "@/lib/constants";
import ServiceIcon from "./ServiceIcon";

interface Props {
  value: string;
  onChange: (name: string) => void;
}

// 네이티브 <select>/<optgroup>은 그룹 헤딩에 색상을 줄 수 없어(모바일 네이티브 피커는 CSS를
// 전혀 반영하지 않음), 카테고리별 색상 구분이 필요한 이 드롭다운은 커스텀으로 구현했다.
export default function ServiceSelect({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const groups = CATEGORY_OPTIONS.map((category) => ({
    category,
    services: SERVICE_PRESETS.filter((s) => s.category === category),
  })).filter((group) => group.services.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-border-strong px-3 py-2 text-left text-sm focus:border-primary-500 focus:outline-none"
      >
        <ServiceIcon serviceName={value} size="sm" />
        <span className="min-w-0 flex-1 truncate">{value}</span>
        <span className="shrink-0 text-slate-400">▾</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg">
          {groups.map((group) => {
            const color = CATEGORY_COLORS[group.category] ?? FALLBACK_CATEGORY_COLOR;
            return (
              <div key={group.category}>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold"
                  style={{ color }}
                >
                  <span className="h-3 w-1 rounded-full" style={{ backgroundColor: color }} />
                  {group.category}
                </div>
                {group.services.map((service) => (
                  <button
                    key={service.name}
                    type="button"
                    onClick={() => {
                      onChange(service.name);
                      setIsOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                      value === service.name ? "bg-primary-50 text-primary-700" : "text-slate-700"
                    }`}
                  >
                    <ServiceIcon serviceName={service.name} size="sm" />
                    <span className="truncate">{service.name}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
