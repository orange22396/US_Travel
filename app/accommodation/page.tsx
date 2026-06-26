import { MapPin, CalendarDays, Moon, ExternalLink, Wifi, Car, Utensils, Dumbbell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import accommodations from "@/data/accommodation.json";

const typeColors: Record<string, string> = {
  Airbnb: "bg-rose-100 text-rose-600",
  Hotel: "bg-sky-100 text-sky-600",
  Lodge: "bg-emerald-100 text-emerald-600",
};

const amenityIcon: Record<string, string> = {
  WiFi: "📶",
  停車場: "🚗",
  游泳池: "🏊",
  廚房: "🍳",
  洗衣機: "👕",
  賭場: "🎰",
  健身房: "💪",
  Spa: "💆",
  餐廳: "🍽️",
  淋浴間: "🚿",
  自行車租借: "🚲",
  "WiFi（有限）": "📶",
  酒吧: "🍷",
  行李寄存: "🧳",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function AccommodationPage() {
  return (
    <div className="px-4 pt-10 pb-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">住宿</h1>
        <p className="text-sm text-stone-400 mt-1">{accommodations.length} 處住所</p>
      </div>

      <div className="space-y-4">
        {accommodations.map((acc) => (
          <Card key={acc.id}>
            <CardContent className="pt-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${typeColors[acc.type] ?? "bg-stone-100 text-stone-600"}`}>
                      {acc.type}
                    </span>
                  </div>
                  <h2 className="font-semibold text-stone-900 leading-snug">{acc.name}</h2>
                </div>
                <a
                  href={acc.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-8 h-8 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors"
                >
                  <MapPin size={14} />
                </a>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 text-stone-400">
                <MapPin size={13} className="mt-0.5 flex-shrink-0" />
                <p className="text-xs leading-relaxed">{acc.address}</p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50 rounded-xl p-3">
                  <p className="text-[10px] text-stone-400 font-medium mb-1">CHECK-IN</p>
                  <p className="font-semibold text-stone-900">{formatDate(acc.checkIn)}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-3">
                  <p className="text-[10px] text-stone-400 font-medium mb-1">CHECK-OUT</p>
                  <p className="font-semibold text-stone-900">{formatDate(acc.checkOut)}</p>
                </div>
              </div>

              {/* Nights & Price */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-stone-500">
                  <Moon size={13} />
                  <span>{acc.nights} 晚</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-stone-900 text-base">${acc.totalPrice.toLocaleString()}</span>
                  <span className="text-stone-400 text-xs"> USD</span>
                  <p className="text-xs text-stone-400">${acc.pricePerNight}/晚</p>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-1.5">
                {acc.amenities.map((a) => (
                  <span key={a} className="text-xs bg-stone-50 border border-stone-100 rounded-lg px-2 py-1 text-stone-600">
                    {amenityIcon[a] ?? "•"} {a}
                  </span>
                ))}
              </div>

              {/* Note */}
              {acc.note && (
                <p className="text-xs text-stone-400 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  💡 {acc.note}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
