"use client";

import { cn } from "@/lib/utils";

interface BadgeCounterProps {
  className?: string;
  count: number | string;
}

export function BadgeCounter({ className, count }: BadgeCounterProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-1.5 py-0.5 rounded-full",
        "text-xs font-medium min-w-[20px] text-center",
        "bg-[#f1f5f9] text-[#64748b]",
        className
      )}
    >
      {count}
    </span>
  );
}
