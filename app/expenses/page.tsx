"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, ChevronDown, ChevronUp, Trash2, RefreshCw } from "lucide-react";
import initialExpenses from "@/data/expenses.json";
import trip from "@/data/trip.json";
import { shortName } from "@/lib/members";

type Expense = {
  id: number;
  name: string;
  amount: number;
  currency: string;
  paidBy: string;
  participants: string[];
  category: string;
  date: string;
  note: string;
  rate: number;   // 當日 USD→TWD 匯率（儲存於記錄中）
};

const categoryConfig: Record<string, { label: string; emoji: string }> = {
  transport:     { label: "交通", emoji: "🚗" },
  food:          { label: "餐飲", emoji: "🍔" },
  accommodation: { label: "住宿", emoji: "🏨" },
  attraction:    { label: "景點/活動", emoji: "🎡" },
  shopping:      { label: "購物", emoji: "🛍️" },
  other:         { label: "其他", emoji: "📦" },
};

const STORAGE_KEY = "travel-expenses";
const DEFAULT_RATE = 32.2;

// 補齊舊資料沒有 rate 的情況
function normalizeExpense(e: Partial<Expense>): Expense {
  return { ...e, rate: e.rate ?? DEFAULT_RATE } as Expense;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 表單狀態
  const [form, setForm] = useState({
    name: "",
    amount: "",
    paidBy: trip.members[0],
    participants: [...trip.members],
    category: "food",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });

  // 匯率狀態
  const [rate, setRate] = useState<number>(DEFAULT_RATE);
  const [rateStatus, setRateStatus] = useState<"idle" | "loading" | "ok" | "fallback">("idle");

  // 從 localStorage 載入
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setExpenses((JSON.parse(saved) as Partial<Expense>[]).map(normalizeExpense));
    } else {
      setExpenses((initialExpenses as Partial<Expense>[]).map(normalizeExpense));
    }
  }, []);

  // 抓匯率
  const fetchRate = useCallback(async (date: string) => {
    setRateStatus("loading");
    try {
      const res = await fetch(`/api/exchange-rate?date=${date}`);
      const data = await res.json();
      setRate(data.rate);
      setRateStatus(data.source === "fallback" ? "fallback" : "ok");
    } catch {
      setRate(DEFAULT_RATE);
      setRateStatus("fallback");
    }
  }, []);

  // 開啟表單時抓今天匯率
  useEffect(() => {
    if (showForm) fetchRate(form.date);
  }, [showForm, fetchRate, form.date]);

  // 日期變更時重抓
  function handleDateChange(date: string) {
    setForm((f) => ({ ...f, date }));
    fetchRate(date);
  }

  // 儲存
  function save(updated: Expense[]) {
    setExpenses(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function addExpense() {
    if (!form.name || !form.amount || form.participants.length === 0) return;
    const newExpense: Expense = {
      id: Date.now(),
      name: form.name,
      amount: parseFloat(form.amount),
      currency: "USD",
      paidBy: form.paidBy,
      participants: form.participants,
      category: form.category,
      date: form.date,
      note: form.note,
      rate,   // 儲存當下抓到的匯率
    };
    save([newExpense, ...expenses]);
    setShowForm(false);
    setForm({
      name: "",
      amount: "",
      paidBy: trip.members[0],
      participants: [...trip.members],
      category: "food",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    });
  }

  function deleteExpense(id: number) {
    save(expenses.filter((e) => e.id !== id));
  }

  function toggleParticipant(member: string) {
    setForm((f) => ({
      ...f,
      participants: f.participants.includes(member)
        ? f.participants.filter((m) => m !== member)
        : [...f.participants, member],
    }));
  }

  const totalUSD = expenses.reduce((a, e) => a + e.amount, 0);
  const totalTWD = expenses.reduce((a, e) => a + Math.round(e.amount * e.rate), 0);
  const perPerson = trip.members.length > 0 ? totalUSD / trip.members.length : 0;

  const categoryTotals = Object.entries(
    expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  const amtInput = parseFloat(form.amount || "0");

  return (
    <div className="px-4 pt-10 pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">分帳</h1>
          <p className="text-sm text-stone-400 mt-1">{expenses.length} 筆記錄</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm active:scale-95 transition-transform"
        >
          <Plus size={15} />
          新增支出
        </button>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-5">
          <div className="text-center mb-4">
            <p className="text-xs text-stone-400 font-medium mb-1">總支出</p>
            <p className="text-4xl font-bold text-stone-900">${totalUSD.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
            <p className="text-sm text-stone-400 mt-0.5">≈ NT${totalTWD.toLocaleString()}</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-3 text-center">
            <p className="text-xs text-stone-400">每人平均（{trip.members.length} 人）</p>
            <p className="font-bold text-stone-900 text-lg">${perPerson.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      {categoryTotals.length > 0 && (
        <Card>
          <CardContent className="pt-5 space-y-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">分類概覽</p>
            {categoryTotals.map(([cat, total]) => {
              const cfg = categoryConfig[cat] ?? { label: cat, emoji: "•" };
              const pct = (total / totalUSD) * 100;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span>{cfg.emoji}</span>
                      <span className="text-sm font-medium text-stone-700">{cfg.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-stone-900">${total.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-stone-900 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Expense list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest px-1">所有支出</p>
        {expenses.length === 0 && (
          <div className="text-center py-12 text-stone-300">
            <p className="text-4xl mb-2">🧾</p>
            <p className="text-sm">還沒有支出記錄</p>
            <p className="text-xs">點右上角「新增支出」開始記帳</p>
          </div>
        )}
        {expenses.map((expense) => {
          const cfg = categoryConfig[expense.category] ?? { label: expense.category, emoji: "•" };
          const isExpanded = expandedId === expense.id;
          const twd = Math.round(expense.amount * expense.rate);
          return (
            <div key={expense.id} className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
              <button className="w-full text-left p-4" onClick={() => setExpandedId(isExpanded ? null : expense.id)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{cfg.emoji}</span>
                      <span className="font-medium text-stone-900 text-sm leading-snug truncate">{expense.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                      <span>💳 {shortName(expense.paidBy)}</span>
                      <span>·</span>
                      <span>{expense.participants.length} 人分攤</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex items-start gap-2">
                    <div>
                      <p className="font-bold text-stone-900 text-base">${expense.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">≈ NT${twd.toLocaleString()}</p>
                      <p className="text-[10px] text-stone-300">{expense.date.slice(5).replace("-", "/")} · {expense.rate}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={14} className="text-stone-300 mt-1" /> : <ChevronDown size={14} className="text-stone-300 mt-1" />}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-stone-50 pt-3">
                  <div className="flex flex-wrap gap-1">
                    {expense.participants.map((p) => (
                      <span key={p} className="text-[10px] bg-stone-50 border border-stone-100 rounded-full px-2 py-0.5 text-stone-500">{shortName(p)}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400">每人 ${(expense.amount / expense.participants.length).toFixed(2)} ≈ NT${Math.round(twd / expense.participants.length).toLocaleString()}</span>
                    <button onClick={() => deleteExpense(expense.id)} className="flex items-center gap-1 text-xs text-rose-400 bg-rose-50 px-2 py-1 rounded-lg">
                      <Trash2 size={11} />
                      刪除
                    </button>
                  </div>
                  {expense.note && <p className="text-xs text-stone-400">{expense.note}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 新增支出 Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl p-6 pb-28 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">新增支出</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100">
                <X size={16} className="text-stone-500" />
              </button>
            </div>

            {/* 名稱 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500">支出名稱 *</label>
              <input
                type="text"
                placeholder="例：晚餐、計程車..."
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            {/* 金額 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500">金額（USD）*</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl pl-7 pr-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
              {/* 即時台幣換算 */}
              {amtInput > 0 && (
                <div className="flex items-center gap-1.5 px-1">
                  {rateStatus === "loading" ? (
                    <RefreshCw size={11} className="text-stone-300 animate-spin" />
                  ) : (
                    <span className="text-[10px] text-stone-300">≈</span>
                  )}
                  <span className="text-sm font-semibold text-emerald-600">
                    NT${Math.round(amtInput * rate).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-stone-300">
                    {rateStatus === "loading"
                      ? "抓取匯率中..."
                      : rateStatus === "fallback"
                      ? `匯率 ${rate}（預設值）`
                      : `匯率 ${rate}（Frankfurter）`}
                  </span>
                </div>
              )}
            </div>

            {/* 日期 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500">日期</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            {/* 類別 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500">類別</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoryConfig).map(([key, { label, emoji }]) => (
                  <button
                    key={key}
                    onClick={() => setForm((f) => ({ ...f, category: key }))}
                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      form.category === key ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200"
                    }`}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 付款人 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500">付款人</label>
              <div className="flex flex-wrap gap-2">
                {trip.members.map((m) => (
                  <button
                    key={m}
                    onClick={() => setForm((f) => ({ ...f, paidBy: m }))}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      form.paidBy === m ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* 參與人 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-500">參與人（{form.participants.length} 人）</label>
                <div className="flex gap-2">
                  <button onClick={() => setForm((f) => ({ ...f, participants: [...trip.members] }))} className="text-[10px] text-stone-400 underline">全選</button>
                  <button onClick={() => setForm((f) => ({ ...f, participants: [] }))} className="text-[10px] text-stone-400 underline">清除</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {trip.members.map((m) => (
                  <button
                    key={m}
                    onClick={() => toggleParticipant(m)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      form.participants.includes(m) ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {form.participants.length > 0 && amtInput > 0 && (
                <p className="text-xs text-stone-400">
                  每人 ${(amtInput / form.participants.length).toFixed(2)} ≈ NT${Math.round((amtInput * rate) / form.participants.length).toLocaleString()}
                </p>
              )}
            </div>

            {/* 備註 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500">備註（選填）</label>
              <input
                type="text"
                placeholder="補充說明..."
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <button
              onClick={addExpense}
              disabled={!form.name || !form.amount || form.participants.length === 0}
              className="w-full bg-stone-900 text-white font-semibold py-3 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
            >
              新增支出
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
