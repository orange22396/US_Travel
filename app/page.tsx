"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronRight, Receipt, ArrowLeftRight, BedDouble } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import trip from "@/data/trip.json";
import { MEMBER_ORDER, memberColors, shortName, avatarPath } from "@/lib/members";

const DEPARTURE = new Date("2026-08-21T00:00:00");
const END_DATE  = new Date("2026-08-28T23:59:59");

function useCountdown() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function CountdownCard() {
  const now = useCountdown();
  if (!now) return null;

  const diffMs = DEPARTURE.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const tripDay = Math.floor((now.getTime() - DEPARTURE.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const isOnTrip = now >= DEPARTURE && now <= END_DATE;
  const isAfter  = now > END_DATE;

  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        {isOnTrip ? (
          <div className="text-center space-y-1">
            <p className="text-xs text-stone-400 font-medium tracking-wider uppercase">旅行中 🌴</p>
            <div className="flex items-end justify-center gap-1">
              <span className="text-6xl font-bold text-stone-900 leading-none">{tripDay}</span>
              <span className="text-xl text-stone-400 mb-1">天</span>
            </div>
            <p className="text-sm text-stone-500">旅行第 {tripDay} 天，繼續享受！</p>
          </div>
        ) : isAfter ? (
          <div className="text-center space-y-1">
            <p className="text-xs text-stone-400 font-medium tracking-wider uppercase">旅行結束 ✈️</p>
            <p className="text-2xl font-bold text-stone-900">回到台灣了！</p>
            <p className="text-sm text-stone-400">美西旅遊，完美收尾 🎉</p>
          </div>
        ) : (
          <div className="text-center space-y-1">
            <p className="text-xs text-stone-400 font-medium tracking-wider uppercase">距離出發還有</p>
            <div className="flex items-end justify-center gap-1">
              <span className="text-6xl font-bold text-stone-900 leading-none">{diffDays}</span>
              <span className="text-xl text-stone-400 mb-1">天</span>
            </div>
            <p className="text-sm text-stone-500">2026 / 08 / 21 · Los Angeles ✈️</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MembersCard() {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">
          旅伴 · {trip.members.length} 人
        </p>
        <div className="grid grid-cols-4 gap-3">
          {MEMBER_ORDER.map((name) => {
            const c = memberColors[name] ?? { bg: "bg-stone-100", text: "text-stone-700", ring: "ring-stone-300" };
            return (
              <div key={name} className="flex flex-col items-center gap-1.5">
                <div className={`relative w-14 h-14 rounded-full ring-2 ${c.ring} overflow-hidden flex-shrink-0`}>
                  <Image
                    src={avatarPath(name)}
                    alt={shortName(name)}
                    fill
                    className="object-cover object-center scale-[1.35]"
                  />
                </div>
                <span className="text-[11px] text-stone-600 font-medium">{shortName(name)}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function getDays(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

const totalDays = getDays(trip.startDate, trip.endDate);

export default function DashboardPage() {
  return (
    <div className="pb-4">
      {/* ── Cover Image ── */}
      <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
        <Image
          src="/cover.jpg"
          alt="2026 Our 30s U.S. Trip"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-stone-50 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <p className="text-xs text-stone-500 font-medium">
            {formatDate(trip.startDate)} – {formatDate(trip.endDate)} · {totalDays} 天
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-2">
        {/* 倒數計時 */}
        <CountdownCard />

        {/* 成員 */}
        <MembersCard />

        {/* 快速導覽 */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest px-1">快速導覽</p>
          <div className="space-y-2">
            {[
              { href: "/itinerary",     label: "行程",  sub: `共 ${totalDays} 天`,   icon: CalendarDays },
              { href: "/accommodation", label: "住宿",  sub: "飯店 & Airbnb",        icon: BedDouble },
              { href: "/expenses",      label: "分帳",  sub: "記帳與支出明細",        icon: Receipt },
              { href: "/settlement",    label: "結算",  sub: "誰欠誰一鍵看清楚",     icon: ArrowLeftRight },
            ].map(({ href, label, sub, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-100 shadow-sm active:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center">
                    <Icon size={16} className="text-stone-600" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-900 text-sm">{label}</p>
                    <p className="text-xs text-stone-400">{sub}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-stone-300" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
