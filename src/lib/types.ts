export type BillingCycle = "monthly" | "yearly";

export type SubscriptionStatus = "active" | "cancelled";

export interface Subscription {
  id: string;
  serviceName: string;
  category: string;
  amount: number;
  billingCycle: BillingCycle;
  nextBillingDate: string; // ISO date string (YYYY-MM-DD)
  status: SubscriptionStatus;
  createdAt: string; // ISO datetime string
}

export interface UserProfile {
  name: string;
  email: string;
}

export type NotificationThreshold = 0 | 1 | 3;
