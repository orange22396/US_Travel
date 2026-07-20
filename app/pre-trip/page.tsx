"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2, Check } from "lucide-react";

// ── 預設資料 ──────────────────────────────────────────────

const DEFAULT_CHECKED_LUGGAGE = [
  "泳衣褲（泳帽不用，國外沒人在給你戴）",
  "排汗易乾衣（溯溪、獨木舟可能用到）",
  "手機防水袋（溯溪可用，看你要不要帶手機）",
  "帽子",
  "涼鞋/拖鞋",
  "墨鏡",
  "登山頭燈（如有可攜帶備用）",
  "手機充電線",
  "牙膏/牙刷",
  "化妝用品",
  "個人藥品",
];

const DEFAULT_CARRY_ON = [
  "護照",
  "國際駕照（如有）",
  "台灣駕照（需一起攜帶才有效力）",
  "防曬機能衣（機上可蓋）",
  "手持電風扇（僅能攜帶換電池或USB充電類型）",
  "舒服頸枕（長途飛行有這差很多）",
  "您的美金小姐",
  "您的信用卡",
  "水瓶（在美國很熱請自帶水瓶！）",
  "行動電源（務必隨身）",
];

const DOCUMENTS = [
  { text: "ESTA 申請通過文件（請列印攜帶）", note: "" },
  { text: "機票訂位紀錄（請列印攜帶）", note: "" },
  { text: "行程簡要（Line群請截圖）", note: "" },
  { text: "住宿證明（Line群請下載圖片）", note: "" },
  { text: "投保旅平險", note: "" },
  { text: "購買 eSIM", note: "" },
];

// ── 型別 ─────────────────────────────────────────────────

interface LuggageItem {
  id: string;
  text: string;
  checked: boolean;
  custom?: boolean;
}

// ── Storage helpers ───────────────────────────────────────

function loadLuggage(key: string, defaults: string[]): LuggageItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaults.map((text, i) => ({ id: `${i}`, text, checked: false }));
}

function saveLuggage(key: string, items: LuggageItem[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

function loadDocChecks(): Record<number, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem("pre-trip-docs");
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
}

function saveDocChecks(checks: Record<number, boolean>) {
  localStorage.setItem("pre-trip-docs", JSON.stringify(checks));
}

// ── 子元件：行李清單區塊 ──────────────────────────────────

function LuggageSection({
  title,
  storageKey,
  defaults,
  icon,
}: {
  title: string;
  storageKey: string;
  defaults: string[];
  icon: string;
}) {
  const [items, setItems] = useState<LuggageItem[]>([]);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadLuggage(storageKey, defaults));
    setMounted(true);
  }, [storageKey]);

  function update(next: LuggageItem[]) {
    setItems(next);
    saveLuggage(storageKey, next);
  }

  function toggle(id: string) {
    update(items.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it)));
  }

  function remove(id: string) {
    update(items.filter((it) => it.id !== id));
  }

  function addItem() {
    const text = newText.trim();
    if (!text) return;
    const next: LuggageItem = { id: Date.now().toString(), text, checked: false, custom: true };
    update([...items, next]);
    setNewText("");
    setAdding(false);
  }

  if (!mounted) return null;

  const done = items.filter((it) => it.checked).length;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <h2 className="font-semibold text-stone-800 text-sm">{title}</h2>
        </div>
        <span className="text-xs text-stone-400">{done}/{items.length}</span>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
              item.checked
                ? "bg-emerald-50 border-emerald-100"
                : "bg-white border-stone-100"
            }`}
          >
            <button
              onClick={() => toggle(item.id)}
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                item.checked
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-stone-300"
              }`}
            >
              {item.checked && <Check size={11} className="text-white stroke-[3]" />}
            </button>
            <span
              className={`flex-1 text-sm leading-snug ${
                item.checked ? "line-through text-stone-400" : "text-stone-700"
              }`}
            >
              {item.text}
            </span>
            <button
              onClick={() => remove(item.id)}
              className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-stone-300 hover:text-rose-400 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        {/* 新增列 */}
        {adding ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addItem(); if (e.key === "Escape") setAdding(false); }}
              placeholder="輸入項目名稱..."
              className="flex-1 text-sm px-3 py-2.5 rounded-2xl border border-stone-200 outline-none focus:border-stone-400 bg-white"
            />
            <button
              onClick={addItem}
              className="px-4 py-2 rounded-2xl bg-stone-800 text-white text-sm font-medium"
            >
              新增
            </button>
            <button
              onClick={() => { setAdding(false); setNewText(""); }}
              className="px-3 py-2 rounded-2xl border border-stone-200 text-sm text-stone-500"
            >
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center gap-2 p-3 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-sm hover:border-stone-300 transition-colors"
          >
            <Plus size={14} />
            新增項目
          </button>
        )}
      </div>
    </div>
  );
}

// ── 子元件：文件準備 ──────────────────────────────────────

function DocumentsTab() {
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setChecks(loadDocChecks());
    setMounted(true);
  }, []);

  function toggle(idx: number) {
    const next = { ...checks, [idx]: !checks[idx] };
    setChecks(next);
    saveDocChecks(next);
  }

  if (!mounted) return null;

  const done = DOCUMENTS.filter((_, i) => checks[i]).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-stone-400">{done}/{DOCUMENTS.length} 完成</p>
      </div>
      <div className="space-y-2">
        {DOCUMENTS.map((doc, idx) => (
          <button
            key={idx}
            onClick={() => toggle(idx)}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-colors ${
              checks[idx]
                ? "bg-emerald-50 border-emerald-100"
                : "bg-white border-stone-100"
            }`}
          >
            <div
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                checks[idx]
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-stone-300"
              }`}
            >
              {checks[idx] && <Check size={11} className="text-white stroke-[3]" />}
            </div>
            <span
              className={`text-sm leading-snug ${
                checks[idx] ? "line-through text-stone-400" : "text-stone-700"
              }`}
            >
              {doc.text}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
        <p className="text-xs text-amber-700 leading-relaxed">
          💡 建議出發前一天把所有文件列印 / 截圖完畢，並確認護照有效期限距離回台灣至少 6 個月以上。
        </p>
      </div>
    </div>
  );
}

// ── 主頁面 ───────────────────────────────────────────────

export default function PreTripPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"luggage" | "docs">("luggage");

  return (
    <div className="min-h-screen bg-stone-50 pb-10">
      {/* Header */}
      <div className="px-4 pt-10 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-stone-400 mb-5 hover:text-stone-600 transition-colors"
        >
          <ChevronLeft size={16} />
          返回總覽
        </button>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">行前準備</h1>
        <p className="text-sm text-stone-400 mt-1">打勾狀態存在你自己的手機，互不干擾 😌</p>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-5">
        <div className="flex bg-stone-100 rounded-2xl p-1 gap-1">
          {(["luggage", "docs"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-400"
              }`}
            >
              {t === "luggage" ? "🧳 行李打包" : "📋 文件準備"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {tab === "luggage" ? (
          <>
            <LuggageSection
              title="托運行李"
              storageKey="pre-trip-checked"
              defaults={DEFAULT_CHECKED_LUGGAGE}
              icon="🧳"
            />
            <LuggageSection
              title="隨身行李"
              storageKey="pre-trip-carryon"
              defaults={DEFAULT_CARRY_ON}
              icon="🎒"
            />
          </>
        ) : (
          <DocumentsTab />
        )}
      </div>
    </div>
  );
}
