"use client";

import { useState } from "react";
import { getBillingDaysInMonth } from "@/lib/date-utils";
import { Subscription } from "@/lib/types";
import ServiceIcon from "./ServiceIcon";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

interface Props {
  subscriptions: Subscription[];
}

export default function BillingCalendar({ subscriptions }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const billingMap = getBillingDaysInMonth(subscriptions, viewYear, viewMonth);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const isViewingCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  function goPrevMonth() {
    setSelectedDay(null);
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    setSelectedDay(null);
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const selectedSubs = selectedDay !== null ? billingMap.get(selectedDay) ?? [] : [];

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          aria-label="이전 달"
          className="rounded-lg px-3 py-1 text-text-muted hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ‹
        </button>
        <p className="text-sm font-semibold text-text">
          {viewYear}년 {viewMonth + 1}월
        </p>
        <button
          type="button"
          onClick={goNextMonth}
          aria-label="다음 달"
          className="rounded-lg px-3 py-1 text-text-muted hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400 dark:text-slate-500">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const hasBilling = billingMap.has(day);
          const isToday = isViewingCurrentMonth && day === today.getDate();
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`flex h-9 flex-col items-center justify-center rounded-lg text-xs transition-colors ${
                isSelected
                  ? "bg-primary-600 text-white"
                  : isToday
                    ? "border border-primary-400 text-text"
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span>{day}</span>
              {hasBilling && (
                <span
                  className={`mt-0.5 h-1 w-1 rounded-full ${isSelected ? "bg-white" : "bg-primary-500"}`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        {selectedDay === null ? (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            날짜를 선택하면 결제 예정 구독을 볼 수 있어요.
          </p>
        ) : selectedSubs.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {viewMonth + 1}월 {selectedDay}일에는 결제 예정 구독이 없어요.
          </p>
        ) : (
          <ul className="space-y-2">
            {selectedSubs.map((sub) => (
              <li key={sub.id} className="flex items-center gap-2 text-sm">
                <ServiceIcon serviceName={sub.serviceName} size="sm" />
                <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-300">
                  {sub.serviceName}
                </span>
                <span className="shrink-0 font-semibold text-text">
                  {sub.amount.toLocaleString()}원
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
