import { MapPin, ExternalLink, BedDouble, Bath, UtensilsCrossed } from "lucide-react";
import accommodations from "@/data/accommodation.json";

const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()} (${weekdays[d.getDay()]})`;
}

const typeStyle: Record<string, { bg: string; text: string; dot: string }> = {
  飯店:   { bg: "bg-sky-50",     text: "text-sky-600",     dot: "bg-sky-400" },
  Airbnb: { bg: "bg-rose-50",    text: "text-rose-500",    dot: "bg-rose-400" },
};

const amenityEmoji: Record<string, string> = {
  廚房: "🍳", 洗衣機: "🫧", 撞球: "🎱", 桌上足球: "⚽️",
  桌遊: "🎲", 戶外烤肉架: "🔥", "停車場（費用另計）": "🚗",
};

export default function AccommodationPage() {
  const total = accommodations.reduce((a, c) => a + c.nights, 0);

  return (
    <div className="px-4 pt-10 pb-4 space-y-2">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">住宿</h1>
        <p className="text-sm text-stone-400 mt-1">{accommodations.length} 處 · 共 {total} 晚</p>
      </div>

      {/* Timeline */}
      <div className="ml-2 space-y-0">
        {accommodations.map((acc, idx) => {
          const style = typeStyle[acc.type] ?? typeStyle["飯店"];
          const isLast = idx === accommodations.length - 1;

          return (
            <div key={acc.id} className="flex gap-4">
              {/* Line */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${style.dot}`} />
                {!isLast && <div className="w-px flex-1 bg-stone-100 mt-1" />}
              </div>

              {/* Card */}
              <div className="pb-6 flex-1">
                {/* Date */}
                <p className="text-xs text-stone-400 font-medium mb-2">
                  {formatDate(acc.checkIn)}
                  {acc.nights > 1 && ` — ${formatDate(acc.checkOut)}`}
                  <span className="ml-1.5 text-stone-300">· {acc.nights} 晚</span>
                </p>

                <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
                  {/* Card Header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                            {acc.type}
                          </span>
                          <span className="text-xs text-stone-400">{acc.location}</span>
                        </div>
                        <h2 className="font-semibold text-stone-900 text-base leading-snug">
                          {acc.websiteUrl ? (
                            <a
                              href={acc.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline underline-offset-2 decoration-stone-300"
                            >
                              {acc.name}
                              <ExternalLink size={11} className="inline ml-1 text-stone-300" />
                            </a>
                          ) : acc.airbnbUrl ? (
                            <a
                              href={acc.airbnbUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline underline-offset-2 decoration-stone-300"
                            >
                              {acc.name}
                              <ExternalLink size={11} className="inline ml-1 text-stone-300" />
                            </a>
                          ) : (
                            acc.name
                          )}
                        </h2>
                      </div>
                      {/* Map button */}
                      {acc.mapUrl && (
                        <a
                          href={acc.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 w-8 h-8 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors"
                        >
                          <MapPin size={14} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-stone-50 mx-4" />

                  {/* Room info */}
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <BedDouble size={14} className="text-stone-400 flex-shrink-0" />
                      <span>{acc.roomInfo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <Bath size={14} className="text-stone-400 flex-shrink-0" />
                      <span>{acc.bathroom}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  {acc.amenities.length > 0 && (
                    <div className="px-4 pb-3">
                      <div className="flex flex-wrap gap-1.5">
                        {acc.amenities.map((a) => (
                          <span
                            key={a}
                            className="text-xs bg-stone-50 border border-stone-100 rounded-lg px-2 py-1 text-stone-500"
                          >
                            {amenityEmoji[a] ?? "•"} {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Note */}
                  {acc.note && (
                    <div className="px-4 pb-3">
                      <p className="text-xs text-stone-400 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                        💡 {acc.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
