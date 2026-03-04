"use client";

import { cn } from "@/lib/utils";
import { TabState } from "../ui/tab-state";

export const HISTORY_CATEGORIES = [
  "All",
  "Fashion",
  "Beauty",
  "Food",
  "Lifestyle",
  "Tech",
  "Shopping",
  "Music",
] as const;

export type HistoryCategory = (typeof HISTORY_CATEGORIES)[number];

interface HistoryCategoryTabsProps {
  selectedCategory: HistoryCategory;
  onCategoryChange: (category: HistoryCategory) => void;
  categoryCounts: Record<string, number>;
  className?: string;
}

export function HistoryCategoryTabs({
  selectedCategory,
  onCategoryChange,
  categoryCounts,
  className,
}: HistoryCategoryTabsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide",
        className
      )}
    >
      {HISTORY_CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category;
        const count =
          category === "All"
            ? Object.values(categoryCounts).reduce((sum, c) => sum + c, 0)
            : categoryCounts[category] || 0;

        return (
          <TabState
            key={category}
            tabLabel={category}
            selected={isSelected}
            count={count}
            onClick={() => onCategoryChange(category)}
          />
        );
      })}
    </div>
  );
}
