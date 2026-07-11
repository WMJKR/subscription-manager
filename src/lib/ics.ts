import { Subscription } from "./types";

// RFC 5545(iCalendar) 표준 .ics 생성. 외부 라이브러리 없이 직접 문자열을 조립한다.
// 결제일은 특정 시각이 없는 "날짜"이므로 전일(all-day, VALUE=DATE) 이벤트로 만들어
// 타임존 변환 자체가 필요 없게 한다.

function toICSDate(dateStr: string): string {
  return dateStr.replaceAll("-", "");
}

function toICSDateTimeUTC(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(
    date.getUTCHours()
  )}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function escapeICSText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export function buildICS(subscriptions: Subscription[]): string {
  const now = toICSDateTimeUTC(new Date());
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Subscription Manager//KO", "CALSCALE:GREGORIAN"];

  for (const sub of subscriptions.filter((s) => s.status === "active")) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${sub.id}@subscription-manager`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${toICSDate(sub.nextBillingDate)}`,
      `SUMMARY:${escapeICSText(`${sub.serviceName} 결제일 (${sub.amount.toLocaleString()}원)`)}`,
      `RRULE:FREQ=${sub.billingCycle === "monthly" ? "MONTHLY" : "YEARLY"}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICS(subscriptions: Subscription[]): void {
  const blob = new Blob([buildICS(subscriptions)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "subscriptions.ics";
  link.click();
  URL.revokeObjectURL(url);
}
