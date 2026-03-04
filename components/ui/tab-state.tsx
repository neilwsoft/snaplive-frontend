"use client";

import { cn } from "@/lib/utils";

interface TabStateProps {
  className?: string;
  tabLabel: string;
  selected?: boolean;
  count?: number;
  onClick?: () => void;
}

export function TabState({
  className,
  tabLabel,
  selected = false,
  count,
  onClick,
}: TabStateProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
        selected
          ? "bg-[#ffdf20] text-[#27272a]"
          : "bg-white text-[#64748b] hover:bg-gray-100 border border-[#e2e8f0]",
        className
      )}
    >
      <span>{tabLabel}</span>
      {count !== undefined && (
        <span
          className={cn(
            "text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
            selected
              ? "bg-[#27272a]/20 text-[#27272a]"
              : "bg-[#f1f5f9] text-[#64748b]"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
