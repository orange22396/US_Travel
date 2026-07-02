"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, BedDouble, Receipt, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "總覽" },
  { href: "/itinerary", icon: CalendarDays, label: "行程" },
  { href: "/accommodation", icon: BedDouble, label: "住宿" },
  { href: "/expenses", icon: Receipt, label: "分帳" },
  { href: "/settlement", icon: ArrowLeftRight, label: "結算" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-stone-100">
      <div className="mx-auto max-w-md flex items-center justify-around h-16 px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors",
                active ? "text-stone-900" : "text-stone-400"
              )}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                className={cn(active && "text-stone-900")}
              />
              <span className={cn("text-[10px] font-medium", active ? "text-stone-900" : "text-stone-400")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
