"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import initialExpenses from "@/data/expenses.json";
import trip from "@/data/trip.json";
import Image from "next/image";
import { memberColors, shortName, avatarPath } from "@/lib/members";

type Expense = {
  id: number;
  name: string;
  amount: number;
  paidBy: string;
  participants: string[];
  category: string;
  date: string;
  note: string;
  rate: number;
};

type Transfer = {
  from: string;
  to: string;
  amountUSD: number;
  amountTWD: number;
};

// ── 類別設定 ──────────────────────────────────────────
const categoryConfig: Record<string, { label: string; emoji: string; bar: string }> = {
  transport:     { label: "交通",    emoji: "🚗", bar: "bg-sky-400" },
  food:          { label: "餐飲",    emoji: "🍔", bar: "bg-amber-400" },
  accommodation: { label: "住宿",    emoji: "🏨", bar: "bg-violet-400" },
  attraction:    { label: "景點/活動", emoji: "🎡", bar: "bg-emerald-400" },
  shopping:      { label: "購物",    emoji: "🛍️", bar: "bg-pink-400" },
  other:         { label: "其他",    emoji: "📦", bar: "bg-stone-400" },
};

const CATEGORIES = Object.keys(categoryConfig);

// ── 成員色彩 ──────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const c = memberColors[name] ?? { bg: "bg-stone-100", text: "text-stone-700", ring: "ring-stone-200" };
  return (
    <div className={`relative w-9 h-9 rounded-full ring-2 ${c.ring} overflow-hidden flex-shrink-0`}>
      <Image
        src={avatarPath(name)}
        alt={shortName(name)}
        fill
        className="object-cover object-center scale-[1.35]"
      />
    </div>
  );
}

// ── 最少轉帳結算 ──────────────────────────────────────
function calcSettlement(expenses: Expense[], members: string[]): Transfer[] {
  const balance: Record<string, number> = {};
  members.forEach((m) => (balance[m] = 0));
  expenses.forEach((e) => {
    const share = e.amount / e.participants.length;
    balance[e.paidBy] = (balance[e.paidBy] ?? 0) + e.amount;
    e.participants.forEach((p) => { balance[p] = (balance[p] ?? 0) - share; });
  });

  const totalUSD = expenses.reduce((a, e) => a + e.amount, 0);
  const weightedRate = totalUSD > 0
    ? expenses.reduce((a, e) => a + e.amount * (e.rate ?? 32.2), 0) / totalUSD
    : 32.2;

  const creditors: { name: string; amount: number }[] = [];
  const debtors:   { name: string; amount: number }[] = [];
  Object.entries(balance).forEach(([name, amt]) => {
    const r = Math.round(amt * 100) / 100;
    if (r >  0.005) creditors.push({ name, amount: r });
    if (r < -0.005) debtors.push({ name, amount: -r });
  });

  const transfers: Transfer[] = [];
  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci], d = debtors[di];
    const usd = Math.round(Math.min(c.amount, d.amount) * 100) / 100;
    transfers.push({ from: d.name, to: c.name, amountUSD: usd, amountTWD: Math.round(usd * weightedRate) });
    c.amount -= usd; d.amount -= usd;
    if (c.amount < 0.005) ci++;
    if (d.amount < 0.005) di++;
  }
  return transfers;
}

// ── 個人花費計算 ──────────────────────────────────────
function calcPersonal(expenses: Expense[], member: string) {
  const relevant = expenses.filter((e) => e.participants.includes(member));
  const totalUSD = relevant.reduce((a, e) => a + e.amount / e.participants.length, 0);
  const totalTWD = relevant.reduce((a, e) => a + Math.round(e.amount * e.rate) / e.participants.length, 0);

  const byCategory: Record<string, { usd: number; twd: number }> = {};
  relevant.forEach((e) => {
    if (!byCategory[e.category]) byCategory[e.category] = { usd: 0, twd: 0 };
    byCategory[e.category].usd += e.amount / e.participants.length;
    byCategory[e.category].twd += Math.round(e.amount * e.rate) / e.participants.length;
  });

  return { totalUSD, totalTWD: Math.round(totalTWD), byCategory };
}

const STORAGE_KEY = "travel-expenses";

export default function SettlementPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isTWD, setIsTWD] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const raw = saved ? JSON.parse(saved) : initialExpenses;
    setExpenses((raw as Partial<Expense>[]).map((e) => ({ ...e, rate: e.rate ?? 32.2 } as Expense)));
  }, []);

  const totalUSD = expenses.reduce((a, e) => a + e.amount, 0);
  const totalTWD = expenses.reduce((a, e) => a + Math.round(e.amount * e.rate), 0);
  const perPersonUSD = trip.members.length > 0 ? totalUSD / trip.members.length : 0;
  const perPersonTWD = trip.members.length > 0 ? Math.round(totalTWD / trip.members.length) : 0;

  const transfers = calcSettlement(expenses, trip.members);

  // 個人花費分析資料
  const personalData = trip.members.map((member) => ({
    member,
    ...calcPersonal(expenses, member),
  })).sort((a, b) => b.totalUSD - a.totalUSD); // 由高到低排序

  const maxPersonUSD = Math.max(...personalData.map((p) => p.totalUSD), 1);

  return (
    <div className="px-4 pt-10 pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">結算</h1>
          <p className="text-sm text-stone-400 mt-1">依分帳頁記錄即時計算</p>
        </div>
        <button
          onClick={() => setIsTWD((v) => !v)}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border transition-colors ${
            isTWD ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-stone-600 border-stone-200"
          }`}
        >
          <RefreshCw size={13} />
          {isTWD ? "台幣 NT$" : "美金 USD"}
        </button>
      </div>

      {/* 總覽 */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-stone-400 font-medium mb-1">總支出</p>
              <p className="font-bold text-stone-900 text-lg">
                {isTWD ? `NT$${totalTWD.toLocaleString()}` : `$${totalUSD.toLocaleString()}`}
              </p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-stone-400 font-medium mb-1">每人均攤</p>
              <p className="font-bold text-stone-900 text-lg">
                {isTWD ? `NT$${perPersonTWD.toLocaleString()}` : `$${perPersonUSD.toFixed(2)}`}
              </p>
            </div>
          </div>
          {isTWD && <p className="text-[10px] text-stone-400 text-center">依各筆支出當日匯率換算加總</p>}
        </CardContent>
      </Card>

      {/* 轉帳清單 */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest px-1">轉帳清單</p>
        {transfers.length === 0 ? (
          <div className="text-center py-8 text-stone-300">
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-sm text-stone-400">大家都平帳了！</p>
          </div>
        ) : (
          transfers.map((s, i) => (
            <div key={i} className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar name={s.from} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 text-sm">{shortName(s.from)}</span>
                    <ArrowRight size={14} className="text-stone-300 flex-shrink-0" />
                    <span className="font-semibold text-stone-900 text-sm">{shortName(s.to)}</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">{shortName(s.from)} 轉帳給 {shortName(s.to)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-stone-900 text-base">
                    {isTWD ? `NT$${s.amountTWD.toLocaleString()}` : `$${s.amountUSD.toFixed(2)}`}
                  </p>
                  <p className="text-[10px] text-stone-300">
                    {isTWD ? `$${s.amountUSD.toFixed(2)} USD` : `≈ NT$${s.amountTWD.toLocaleString()}`}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 個人花費分析 */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest px-1">個人花費分析</p>

        {/* 類別圖例 */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-1">
          {CATEGORIES.filter((cat) =>
            expenses.some((e) => e.category === cat)
          ).map((cat) => {
            const cfg = categoryConfig[cat];
            return (
              <div key={cat} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${cfg.bar}`} />
                <span className="text-[10px] text-stone-400">{cfg.emoji} {cfg.label}</span>
              </div>
            );
          })}
        </div>

        {/* 每人水平堆疊長條 */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            {personalData.map(({ member, totalUSD: pUSD, totalTWD: pTWD, byCategory }) => {
              const displayAmt = isTWD ? `NT$${pTWD.toLocaleString()}` : `$${pUSD.toFixed(0)}`;
              const barPct = maxPersonUSD > 0 ? (pUSD / maxPersonUSD) * 100 : 0;

              return (
                <div key={member} className="space-y-1.5">
                  {/* 名稱 + 金額 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={member} />
                      <span className="text-sm font-medium text-stone-900">{shortName(member)}</span>
                    </div>
                    <span className="text-sm font-bold text-stone-900">{displayAmt}</span>
                  </div>

                  {/* 堆疊長條圖 */}
                  <div className="h-3 bg-stone-100 rounded-full overflow-hidden flex" style={{ width: "100%" }}>
                    <div className="flex h-full rounded-full overflow-hidden" style={{ width: `${barPct}%` }}>
                      {CATEGORIES.map((cat) => {
                        const catUSD = byCategory[cat]?.usd ?? 0;
                        const catPct = pUSD > 0 ? (catUSD / pUSD) * 100 : 0;
                        if (catPct < 0.5) return null;
                        return (
                          <div
                            key={cat}
                            className={`h-full ${categoryConfig[cat].bar}`}
                            style={{ width: `${catPct}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* 類別細項 */}
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 pl-11">
                    {CATEGORIES.filter((cat) => (byCategory[cat]?.usd ?? 0) > 0).map((cat) => {
                      const cfg = categoryConfig[cat];
                      const usd = byCategory[cat].usd;
                      const twd = Math.round(byCategory[cat].twd);
                      return (
                        <span key={cat} className="text-[10px] text-stone-400">
                          {cfg.emoji} {isTWD ? `NT$${twd.toLocaleString()}` : `$${usd.toFixed(0)}`}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 text-xs text-stone-400 px-1">
        <CheckCircle2 size={12} />
        <span>依分帳頁的支出記錄即時計算，共 {expenses.length} 筆</span>
      </div>
    </div>
  );
}
