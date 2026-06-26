import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  CalendarDays,
  Users,
  Landmark,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import trip from "@/data/trip.json";
import itinerary from "@/data/itinerary.json";
import expenses from "@/data/expenses.json";

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
const totalAttractions = itinerary.reduce((acc, day) => acc + day.items.length, 0);
const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

const memberColors = [
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
];

export default function DashboardPage() {
  return (
    <div className="px-4 pt-10 pb-4 space-y-6">
      {/* Hero */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-stone-400 text-sm">
          <MapPin size={14} />
          <span>United States</span>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
          {trip.coverEmoji} {trip.name}
        </h1>
        <div className="flex items-center gap-2 text-stone-500 text-sm">
          <CalendarDays size={14} />
          <span>
            {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
          </span>
          <Badge variant="secondary" className="ml-1">
            {totalDays} 天
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Users size={18} className="text-violet-500" />}
          label="旅伴"
          value={`${trip.members.length} 人`}
          bg="bg-violet-50"
        />
        <StatCard
          icon={<Landmark size={18} className="text-emerald-500" />}
          label="景點活動"
          value={`${totalAttractions} 項`}
          bg="bg-emerald-50"
          href="/itinerary"
        />
        <StatCard
          icon={<DollarSign size={18} className="text-amber-500" />}
          label="總支出"
          value={`$${totalExpenses.toLocaleString()}`}
          bg="bg-amber-50"
          href="/expenses"
        />
      </div>

      {/* Members */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-stone-500" />
              <span className="font-semibold text-stone-900">旅伴名單</span>
            </div>
            <span className="text-sm text-stone-400">{trip.members.length} 人</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trip.members.map((member, i) => (
              <span
                key={member}
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${memberColors[i % memberColors.length]}`}
              >
                {member}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest px-1">
          快速導覽
        </p>
        <div className="space-y-2">
          {[
            { href: "/itinerary", label: "查看完整行程", sub: `共 ${itinerary.length} 天`, icon: CalendarDays },
            { href: "/expenses", label: "所有支出", sub: `${expenses.length} 筆記錄`, icon: DollarSign },
            { href: "/settlement", label: "結算誰欠誰", sub: "一鍵看清楚", icon: Users },
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
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  href?: string;
}) {
  const content = (
    <Card className="h-full">
      <CardContent className="pt-5">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
          {icon}
        </div>
        <p className="text-2xl font-bold text-stone-900">{value}</p>
        <p className="text-xs text-stone-400 mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : <div>{content}</div>;
}
