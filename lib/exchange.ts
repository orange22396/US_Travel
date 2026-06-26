import rates from "@/data/exchange-rates.json";

const rateMap = rates as Record<string, number>;

/** 取得某日的 USD→TWD 匯率，找不到就用最近一筆或預設值 */
export function getRate(date: string): number {
  if (rateMap[date]) return rateMap[date];
  // fallback：取最後一筆
  const keys = Object.keys(rateMap).sort();
  return rateMap[keys[keys.length - 1]] ?? 32.2;
}

/** USD 轉台幣（四捨五入到整數） */
export function toTWD(usd: number, date: string): number {
  return Math.round(usd * getRate(date));
}
