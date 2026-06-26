import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "latest";

  try {
    // Frankfurter 免費 API，不需 key，支援歷史日期
    const url =
      date === "latest"
        ? "https://api.frankfurter.app/latest?from=USD&to=TWD"
        : `https://api.frankfurter.app/${date}?from=USD&to=TWD`;

    const res = await fetch(url, { next: { revalidate: 3600 } }); // 快取 1 小時
    if (!res.ok) throw new Error("Frankfurter API error");

    const data = await res.json();
    // data.rates.TWD = 匯率數字
    const rate: number = data.rates?.TWD;
    if (!rate) throw new Error("No TWD rate");

    return NextResponse.json({ rate, date: data.date, source: "frankfurter" });
  } catch {
    // fallback：回傳靜態預設值
    return NextResponse.json({ rate: 32.2, date, source: "fallback" });
  }
}
