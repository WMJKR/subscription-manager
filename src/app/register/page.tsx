"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_CATEGORY, SERVICE_PRESETS } from "@/lib/constants";
import { BANK_OPTIONS } from "@/lib/card";
import { addSubscription, getUserProfile, saveUserProfile } from "@/lib/storage";
import { BillingCycle } from "@/lib/types";
import ServiceSelect from "@/components/ServiceSelect";

const CUSTOM_BANK_OPTION = "직접 입력";

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
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [nextBillingDate, setNextBillingDate] = useState(todayIsoDate());
  const [isShared, setIsShared] = useState(false);
  const [sharedCountInput, setSharedCountInput] = useState("2");
  const [isTrial, setIsTrial] = useState(false);
  const [selectedBank, setSelectedBank] = useState(BANK_OPTIONS[0]);
  const [customBankName, setCustomBankName] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [error, setError] = useState("");

  const preset = SERVICE_PRESETS.find((s) => s.name === selectedService);
  const isCustomBank = selectedBank === CUSTOM_BANK_OPTION;
  const hasCardInfo = cardLast4.length === 4;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const serviceName = selectedService;
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

    const bankName = isCustomBank ? customBankName.trim() : selectedBank;
    if (hasCardInfo && !bankName) {
      setError("카드사명을 입력해주세요.");
      return;
    }

    saveUserProfile({ name: name.trim(), email: email.trim() });
    addSubscription({
      serviceName,
      category: preset?.category ?? DEFAULT_CATEGORY,
      amount: parsedAmount,
      initialAmount: parsedAmount,
      sharedCount: Math.round(parsedSharedCount),
      billingCycle,
      nextBillingDate,
      bankName: hasCardInfo ? bankName : undefined,
      cardLast4: hasCardInfo ? cardLast4 : undefined,
      isTrial,
      trialEndDate: isTrial ? nextBillingDate : undefined,
    });

    router.push("/");
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-text">구독 등록</h1>
        <p className="mt-1 text-sm text-text-muted">
          새로운 구독 서비스를 등록하고 결제일을 관리하세요.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">구독 서비스</label>
          <ServiceSelect value={selectedService} onChange={setSelectedService} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">결제금액 (원)</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="17000"
            className="w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">결제주기</span>
          <div className="grid grid-cols-2 gap-3">
            {(["monthly", "yearly"] as BillingCycle[]).map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  billingCycle === cycle
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-border-strong text-slate-600"
                }`}
              >
                {cycle === "monthly" ? "매월" : "매년"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {isTrial ? "무료체험 종료일 (다음 결제일과 동일하게 처리)" : "다음 결제일"}
          </label>
          <input
            type="date"
            value={nextBillingDate}
            onChange={(e) => setNextBillingDate(e.target.value)}
            className="w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-700">무료체험으로 시작하나요?</span>
            <button
              type="button"
              role="switch"
              aria-checked={isTrial}
              onClick={() => setIsTrial((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                isTrial ? "bg-primary-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  isTrial ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          {isTrial && (
            <p className="mt-2 text-xs text-slate-400">
              무료체험 종료일이 다가오면 일반 구독보다 먼저(D-5부터) 알려드려요.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-700">
              이 구독을 다른 사람과 나눠 쓰나요?
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isShared}
              onClick={() => setIsShared((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                isShared ? "bg-primary-600" : "bg-slate-300"
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
              <label className="mb-1 block text-sm font-medium text-slate-700">
                나눠 쓰는 인원 수 (본인 포함)
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={sharedCountInput}
                onChange={(e) => setSharedCountInput(e.target.value)}
                className="w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border p-3">
          <p className="text-sm font-medium text-slate-700">결제 카드 (선택)</p>
          <p className="mt-1 text-xs text-slate-400">
            결제/인증 정보가 아니라 카드를 구분하기 위한 라벨이에요. 계좌번호 앞 4자리만
            입력받고, 뒷자리는 입력받지 않아요.
          </p>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">카드사</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            >
              {BANK_OPTIONS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>

          {isCustomBank && (
            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                카드사명 직접 입력
              </label>
              <input
                type="text"
                value={customBankName}
                onChange={(e) => setCustomBankName(e.target.value)}
                placeholder="예: OO저축은행"
                className="w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          )}

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              계좌번호 앞 4자리
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={cardLast4}
              onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="1234"
              className="w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-primary-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          구독 등록하기
        </button>
      </form>
    </div>
  );
}
