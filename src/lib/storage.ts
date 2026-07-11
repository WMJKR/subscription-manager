import { DEFAULT_CATEGORY } from "./constants";
import { Subscription, UserProfile } from "./types";

// 프로토타입 단계: 브라우저 localStorage로 데이터를 관리한다.
// TODO: 추후 Supabase 등 실제 백엔드로 교체 예정.

const SUBSCRIPTIONS_KEY = "sm_subscriptions";
const USER_KEY = "sm_user";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// 카테고리 필드 도입 이전에 저장된 데이터에는 category가 없을 수 있어 기본값으로 보정한다.
function normalizeSubscription(sub: Subscription): Subscription {
  return { ...sub, category: sub.category || DEFAULT_CATEGORY };
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
