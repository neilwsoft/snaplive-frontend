"use client";

import { cn } from "@/lib/utils";

interface ChipSimulcastCategoryProps {
  className?: string;
  simulcastCategory: string;
}

export function ChipSimulcastCategory({
  className,
  simulcastCategory,
}: ChipSimulcastCategoryProps) {
  return (
    <div
      className={cn(
        "inline-flex h-6 items-center justify-center px-1.5 py-0.5",
        "border border-[#27272a] rounded",
        "shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]",
        "text-xs font-medium text-[#27272a] text-center whitespace-nowrap",
        className
      )}
    >
      {simulcastCategory}
    </div>
  );
}
