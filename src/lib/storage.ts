import { DEFAULT_CATEGORY } from "./constants";
import { getDDay } from "./date-utils";
import { NotificationThreshold, SavingsGoal, Subscription, Theme, UserProfile } from "./types";

// 프로토타입 단계: 브라우저 localStorage로 데이터를 관리한다.
// TODO: 추후 Supabase 등 실제 백엔드로 교체 예정.

const SUBSCRIPTIONS_KEY = "sm_subscriptions";
const USER_KEY = "sm_user";
const GOAL_KEY = "sm_goal";
const NOTIFICATION_THRESHOLD_KEY = "sm_notification_threshold";
const DEFAULT_NOTIFICATION_THRESHOLD: NotificationThreshold = 3;
const THEME_KEY = "sm_theme";
const DEFAULT_THEME: Theme = "light";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// 카테고리/분담/최초금액/카드라벨/무료체험 필드 도입 이전에 저장된 데이터에는 해당 값이 없을 수 있어 기본값으로 보정한다.
function normalizeSubscription(sub: Subscription): Subscription {
  // bankName/cardLast4는 항상 짝으로만 유효하다. 하나만 있는 손상된 데이터는 "카드 미지정"으로 취급한다.
  const hasValidCard = Boolean(sub.bankName && sub.cardLast4 && sub.cardLast4.length === 4);

  // 무료체험 종료일이 지났으면 사용자 조작 없이도 일반 구독으로 자동 전환한다.
  const trialExpired = Boolean(sub.isTrial && sub.trialEndDate && getDDay(sub.trialEndDate) < 0);

  return {
    ...sub,
    category: sub.category || DEFAULT_CATEGORY,
    sharedCount: sub.sharedCount && sub.sharedCount > 0 ? sub.sharedCount : 1,
    initialAmount: typeof sub.initialAmount === "number" ? sub.initialAmount : sub.amount,
    bankName: hasValidCard ? sub.bankName : undefined,
    cardLast4: hasValidCard ? sub.cardLast4 : undefined,
    isTrial: trialExpired ? false : sub.isTrial,
  };
}

export function getSubscriptions(): Subscription[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(SUBSCRIPTIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Subscription[]).map(normalizeSubscription) : [];
  } catch {
    return [];
  }
}

function saveSubscriptions(subscriptions: Subscription[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
  window.dispatchEvent(new Event("sm_subscriptions_updated"));
}

export function addSubscription(
  input: Omit<Subscription, "id" | "createdAt" | "status">
): Subscription {
  const subscription: Subscription = {
    ...input,
    id: crypto.randomUUID(),
    status: "active",
    createdAt: new Date().toISOString(),
  };
  const subscriptions = [...getSubscriptions(), subscription];
  saveSubscriptions(subscriptions);
  return subscription;
}

export function updateSubscription(
  id: string,
  updates: Partial<Omit<Subscription, "id" | "createdAt">>
): void {
  const subscriptions = getSubscriptions().map((sub) =>
    sub.id === id ? { ...sub, ...updates } : sub
  );
  saveSubscriptions(subscriptions);
}

export function deleteSubscription(id: string): void {
  const subscriptions = getSubscriptions().filter((sub) => sub.id !== id);
  saveSubscriptions(subscriptions);
}

export function getUserProfile(): UserProfile | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(profile));
}

export function getGoal(): SavingsGoal | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(GOAL_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavingsGoal;
  } catch {
    return null;
  }
}

export function saveGoal(goal: SavingsGoal): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
}

/** 해지로 절약한 금액을 목표 누적액에 더한다. 목표가 이미 있으면 이름은 그대로 유지한다. */
export function addToGoalSavings(goalName: string, amount: number): SavingsGoal {
  const current = getGoal();
  const goal: SavingsGoal = {
    goalName: current?.goalName || goalName,
    goalSavedAmount: Math.round((current?.goalSavedAmount ?? 0) + amount),
  };
  saveGoal(goal);
  return goal;
}

/** 손상되거나(문자열 아님, 범위 밖) 저장된 적 없는 값은 기본값(D-3)으로 보정한다. */
export function getNotificationThreshold(): NotificationThreshold {
  if (!isBrowser()) return DEFAULT_NOTIFICATION_THRESHOLD;
  const raw = window.localStorage.getItem(NOTIFICATION_THRESHOLD_KEY);
  if (raw === null) return DEFAULT_NOTIFICATION_THRESHOLD;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 7
    ? (parsed as NotificationThreshold)
    : DEFAULT_NOTIFICATION_THRESHOLD;
}

export function saveNotificationThreshold(value: NotificationThreshold): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(NOTIFICATION_THRESHOLD_KEY, String(value));
}

/** 손상되거나 저장된 적 없는 값은 기본값(light)으로 보정한다. */
export function getTheme(): Theme {
  if (!isBrowser()) return DEFAULT_THEME;
  const raw = window.localStorage.getItem(THEME_KEY);
  return raw === "dark" ? "dark" : DEFAULT_THEME;
}

export function saveTheme(theme: Theme): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(THEME_KEY, theme);
}
