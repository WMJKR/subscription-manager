"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_OPTIONS, DEFAULT_CATEGORY, SERVICE_PRESETS } from "@/lib/constants";
import { addSubscription, getUserProfile, saveUserProfile } from "@/lib/storage";
import { BillingCycle } from "@/lib/types";

const CUSTOM_OPTION = "직접 입력";

function todayIsoDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const existingUser = getUserProfile();

  const [name, setName] = useState(existingUser?.name ?? "");
  const [email, setEmail] = useState(existingUser?.email ?? "");
  const [selectedService, setSelectedService] = useState(SERVICE_PRESETS[0].name);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState(DEFAULT_CATEGORY);
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [nextBillingDate, setNextBillingDate] = useState(todayIsoDate());
  const [isShared, setIsShared] = useState(false);
  const [sharedCountInput, setSharedCountInput] = useState("2");
  const [error, setError] = useState("");

  const isCustom = selectedService === CUSTOM_OPTION;
  const preset = SERVICE_PRESETS.find((s) => s.name === selectedService);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const serviceName = isCustom ? customName.trim() : selectedService;
    const parsedAmount = Number(amount);
    const parsedSharedCount = isShared ? Number(sharedCountInput) : 1;

    if (!name.trim() || !email.trim()) {
      setError("이름과 이메일을 입력해주세요.");
      return;
    }
    if (!serviceName) {
      setError("서비스명을 입력해주세요.");
      return;
    }
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("결제금액을 올바르게 입력해주세요.");
      return;
    }
    if (!nextBillingDate) {
      setError("다음 결제일을 선택해주세요.");
      return;
    }
    if (isShared && (!sharedCountInput || Number.isNaN(parsedSharedCount) || parsedSharedCount < 1)) {
      setError("나눠 쓰는 인원 수를 올바르게 입력해주세요.");
      return;
    }

    saveUserProfile({ name: name.trim(), email: email.trim() });
    addSubscription({
      serviceName,
      category: isCustom ? customCategory : preset?.category ?? DEFAULT_CATEGORY,
      amount: parsedAmount,
      initialAmount: parsedAmount,
      sharedCount: Math.round(parsedSharedCount),
      billingCycle,
      nextBillingDate,
    });

    router.push("/");
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-gray-900">구독 등록</h1>
        <p className="mt-1 text-sm text-gray-500">
          새로운 구독 서비스를 등록하고 결제일을 관리하세요.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">구독 서비스</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            {SERVICE_PRESETS.map((s) => (
              <option key={s.name} value={s.name}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>

        {isCustom && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">서비스명 직접 입력</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="예: 회사 헬스장"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">카테고리</label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">결제금액 (원)</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="17000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">결제주기</span>
          <div className="grid grid-cols-2 gap-3">
            {(["monthly", "yearly"] as BillingCycle[]).map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  billingCycle === cycle
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-gray-300 text-gray-600"
                }`}
              >
                {cycle === "monthly" ? "매월" : "매년"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">다음 결제일</label>
          <input
            type="date"
            value={nextBillingDate}
            onChange={(e) => setNextBillingDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-gray-700">
              이 구독을 다른 사람과 나눠 쓰나요?
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isShared}
              onClick={() => setIsShared((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                isShared ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  isShared ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          {isShared && (
            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                나눠 쓰는 인원 수 (본인 포함)
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={sharedCountInput}
                onChange={(e) => setSharedCountInput(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          구독 등록하기
        </button>
      </form>
    </div>
  );
}
