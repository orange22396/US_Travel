import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "latest";
  const today = new Date().toISOString().slice(0, 10);
  const isFuture = date !== "latest" && date > today;

  // 未來日期直接回傳預設值
  if (isFuture) {
    return NextResponse.json({ rate: 32.2, date, source: "fallback" });
  }

  try {
    let rate: number | undefined;

    if (date === "latest" || date === today) {
      // 今天 → 抓即時匯率
      const res = await fetch("https://open.er-api.com/v6/latest/USD", {
        next: { revalidate: 3600 },
      });
      if (!res.ok) throw new Error("open.er-api error");
      const data = await res.json();
      rate = data.rates?.TWD;
    } else {
      // 過去日期 → 抓歷史匯率（CDN，免費無需 key）
      const res = await fetch(
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/usd.json`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) throw new Error("history api error");
      const data = await res.json();
      rate = data.usd?.twd;
    }

    if (!rate) throw new Error("No TWD rate");

    // 四捨五入到小數點後兩位
    const rounded = Math.round(rate * 100) / 100;
    return NextResponse.json({ rate: rounded, date, source: "live" });
  } catch {
    return NextResponse.json({ rate: 32.2, date, source: "fallback" });
  }
}
