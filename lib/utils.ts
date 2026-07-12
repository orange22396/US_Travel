import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 將 "YYYY-MM-DD" 解析為本地時間的 Date，避免時區偏移導致日期跑掉
 * 直接 new Date("2026-08-21") 會被當成 UTC 午夜，美國時區會變成前一天
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 取得裝置本地時間的今日日期字串 "YYYY-MM-DD"
 * 避免 toISOString() 用 UTC 時間，在美國晚間會跑成明天
 */
export function localDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
