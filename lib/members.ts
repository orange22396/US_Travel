// 成員顯示順序（依照大合照由左至右）
export const MEMBER_ORDER = ["阿君", "茜茜", "豪豪", "許娘", "阿丁", "委員", "心寧", "米雪兒"];

// 成員色彩設定
export const memberColors: Record<string, { bg: string; text: string; ring: string }> = {
  阿君:   { bg: "bg-violet-100", text: "text-violet-700", ring: "ring-violet-300" },
  茜茜:   { bg: "bg-pink-100",   text: "text-pink-700",   ring: "ring-pink-300" },
  豪豪:   { bg: "bg-amber-100",  text: "text-amber-700",  ring: "ring-amber-300" },
  許娘:   { bg: "bg-emerald-100",text: "text-emerald-700",ring: "ring-emerald-300" },
  阿丁:   { bg: "bg-rose-100",   text: "text-rose-700",   ring: "ring-rose-300" },
  委員:   { bg: "bg-sky-100",    text: "text-sky-700",    ring: "ring-sky-300" },
  心寧:   { bg: "bg-teal-100",   text: "text-teal-700",   ring: "ring-teal-300" },
  米雪兒: { bg: "bg-orange-100", text: "text-orange-700", ring: "ring-orange-300" },
};

// 取得顯示名（縮短）
export function shortName(name: string): string {
  const map: Record<string, string> = { 米雪兒: "雪兒", 阿丁: "丁丁" };
  return map[name] ?? name;
}

// 頭像圖片路徑（檔名用顯示名）
export function avatarPath(name: string): string {
  return `/avatars/${shortName(name)}.jpg`;
}

// 個人小語
export const memberNotes: Record<string, string> = {
  阿君:   "請寶們幫我付餐費mua😚",
  茜茜:   "今天冠豪幾顆星🌟",
  豪豪:   "我叫賴魁星 滿分七顆星",
  許娘:   "人妻爽口不黏牙\n賭城我pay爽了嗎",
  阿丁:   "女人，\n只有我能讓你哭泣",
  委員:   "2027 五子登科",
  心寧:   "🇺🇸",
  米雪兒: "🇺🇸",
};
