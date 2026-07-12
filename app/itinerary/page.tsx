"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, ExternalLink, NotebookPen, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { parseLocalDate } from "@/lib/utils";
import itinerary from "@/data/itinerary.json";

const typeConfig: Record<string, {
  label: string;
  variant: "default" | "secondary" | "outline" | "success" | "warning" | "info";
  dot: string;
}> = {
  transport:     { label: "交通", variant: "secondary", dot: "bg-stone-400" },
  food:          { label: "餐飲", variant: "warning",   dot: "bg-amber-400" },
  attraction:    { label: "景點", variant: "info",      dot: "bg-sky-400" },
  shopping:      { label: "購物", variant: "secondary", dot: "bg-pink-400" },
  accommodation: { label: "住宿", variant: "success",   dot: "bg-emerald-400" },
};

const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

function formatDayHeader(dateStr: string) {
  const d = parseLocalDate(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()} (${weekdays[d.getDay()]})`;
}

type DayData = typeof itinerary[number] & {
  dayNote?: string;
  dayNoteUrl?: string;
};

/** 根據今天日期找對應 Day，找不到就回 0（Day 1） */
function getDefaultDayIndex(): number {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const idx = itinerary.findIndex((d) => d.date === todayStr);
  return idx >= 0 ? idx : 0;
}

export default function ItineraryPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 啟動時自動跳到當日
  useEffect(() => {
    const idx = getDefaultDayIndex();
    setActiveIdx(idx);
  }, []);

  // 切換 day 時把對應 tab 滾入可視範圍
  useEffect(() => {
    tabRefs.current[activeIdx]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIdx]);

  const day = itinerary[activeIdx] as DayData;
  const isFirst = activeIdx === 0;
  const isLast = activeIdx === itinerary.length - 1;

  return (
    <div className="flex flex-col h-screen pt-10 pb-20">
      {/* ── 頂部標題 ── */}
      <div className="px-4 mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">行程</h1>
        <p className="text-sm text-stone-400 mt-1">共 {itinerary.length} 天</p>
      </div>

      {/* ── Day Tab 列 ── */}
      <div
        ref={tabsRef}
        className="flex gap-2 px-4 overflow-x-auto scrollbar-none flex-shrink-0 pb-1"
      >
        {itinerary.map((d, idx) => {
          const date = parseLocalDate(d.date);
          const isActive = idx === activeIdx;
          const isToday = d.date === new Date().toISOString().slice(0, 10);
          return (
            <button
              key={d.day}
              ref={(el) => { tabRefs.current[idx] = el; }}
              onClick={() => setActiveIdx(idx)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-2xl transition-colors ${
                isActive
                  ? "bg-stone-900 text-white"
                  : "bg-white border border-stone-100 text-stone-500"
              }`}
            >
              <span className={`text-[10px] font-medium ${isActive ? "text-stone-300" : "text-stone-400"}`}>
                Day {d.day}
              </span>
              <span className={`text-sm font-bold leading-tight ${isActive ? "text-white" : "text-stone-700"}`}>
                {date.getMonth() + 1}/{date.getDate()}
              </span>
              <span className={`text-[10px] ${isActive ? "text-stone-300" : "text-stone-400"}`}>
                {weekdays[date.getDay()]}
              </span>
              {isToday && (
                <div className={`w-1 h-1 rounded-full mt-0.5 ${isActive ? "bg-amber-300" : "bg-amber-400"}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── 當日標題列 + 前後切換 ── */}
      <div className="px-4 mt-4 mb-3 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
          disabled={isFirst}
          className="w-8 h-8 rounded-xl border border-stone-200 flex items-center justify-center text-stone-400 disabled:opacity-20 transition-opacity"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="text-center">
          <p className="font-bold text-stone-900">Day {day.day} · {formatDayHeader(day.date)}</p>
          <p className="text-xs text-stone-400">{day.items.length} 個項目</p>
        </div>

        <button
          onClick={() => setActiveIdx((i) => Math.min(itinerary.length - 1, i + 1))}
          disabled={isLast}
          className="w-8 h-8 rounded-xl border border-stone-200 flex items-center justify-center text-stone-400 disabled:opacity-20 transition-opacity"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── 內容區（可滾動） ── */}
      <div className="flex-1 overflow-y-auto px-4 space-y-0">
        {/* 當日備註 */}
        {day.dayNote && (
          <div className="mb-4">
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <NotebookPen size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-700 mb-0.5">當日備註</p>
                <p className="text-xs text-amber-700 leading-relaxed whitespace-pre-line">{day.dayNote}</p>
              </div>
              {day.dayNoteUrl && (
                <a
                  href={day.dayNoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-500 hover:bg-amber-200 transition-colors"
                >
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="ml-2 space-y-0">
          {day.items.map((item, idx) => {
            const cfg = typeConfig[item.type] ?? typeConfig.attraction;
            const isLast = idx === day.items.length - 1;
            return (
              <div key={idx} className="flex gap-3">
                {/* Line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                  {!isLast && <div className="w-px flex-1 bg-stone-100 mt-1" />}
                </div>

                {/* Content */}
                <div className="pb-5 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs text-stone-400 font-medium font-mono">{item.time}</span>
                        <Badge variant={cfg.variant} className="text-[10px] py-0 px-2">{cfg.label}</Badge>
                      </div>
                      <p className="font-medium text-stone-900 text-sm leading-snug">{item.name}</p>
                      {item.note && (
                        <p className="text-xs text-stone-400 mt-0.5 leading-relaxed whitespace-pre-line">{item.note}</p>
                      )}
                    </div>
                    {item.mapUrl && (
                      <a
                        href={item.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 mt-1 w-7 h-7 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors"
                      >
                        <MapPin size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 前後切換（底部） */}
        <div className="flex gap-3 pt-2 pb-2">
          <button
            onClick={() => { setActiveIdx((i) => Math.max(0, i - 1)); window.scrollTo(0,0); }}
            disabled={isFirst}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-stone-200 text-sm text-stone-500 disabled:opacity-20 transition-opacity"
          >
            <ChevronLeft size={15} />
            Day {day.day - 1}
          </button>
          <button
            onClick={() => { setActiveIdx((i) => Math.min(itinerary.length - 1, i + 1)); window.scrollTo(0,0); }}
            disabled={isLast}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-stone-200 text-sm text-stone-500 disabled:opacity-20 transition-opacity"
          >
            Day {day.day + 1}
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
