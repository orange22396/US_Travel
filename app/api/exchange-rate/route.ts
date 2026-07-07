import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "latest";

  // 判斷是否為未來日期
  const today = new Date().toISOString().slice(0, 10);
  const isFuture = date !== "latest" && date > today;

  // 未來日期直接回傳 fallback，不打 API
  if (isFuture) {
    return NextResponse.json({ rate: 32.2, date, source: "fallback" });
  }

  try {
    // 今天或過去日期 → 抓 Frankfurter 真實匯率
    const url =
      date === "latest" || date === today
        ? "https://api.frankfurter.app/latest?from=USD&to=TWD"
        : `https://api.frankfurter.app/${date}?from=USD&to=TWD`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Frankfurter API error");

    const data = await res.json();
    const rate: number = data.rates?.TWD;
    if (!rate) throw new Error("No TWD rate");

    return NextResponse.json({ rate, date: data.date, source: "frankfurter" });
  } catch {
    return NextResponse.json({ rate: 32.2, date, source: "fallback" });
  }
}
