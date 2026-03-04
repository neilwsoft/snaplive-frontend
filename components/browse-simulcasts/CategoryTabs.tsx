"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Category mapping: key -> English name (for backend filtering)
const categories = [
  { key: "all", value: "All" },
  { key: "fashionApparel", value: "Fashion & Apparel" },
  { key: "beautyPersonalCare", value: "Beauty & Personal Care" },
  { key: "foodBeverage", value: "Food & Beverage" },
  { key: "consumerElectronics", value: "Consumer Electronics & Digital Products" },
  { key: "jewelryLuxury", value: "Jewelry, Luxury & Accessories" },
];

interface CategoryTabsProps {
  onCategoryChange?: (category: string) => void;
}

export function CategoryTabs({ onCategoryChange }: CategoryTabsProps) {
  const { t } = useLocale();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleCategoryChange = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    const category = categories.find((c) => c.key === categoryKey);
    onCategoryChange?.(category?.value || "All");
  };

  return (
    <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
      <TabsList className="h-9 bg-[#f1f5f9] rounded-full px-1 py-0.5 gap-0">
        {categories.map(({ key }) => (
          <TabsTrigger
            key={key}
            value={key}
            className="rounded-full px-3 py-1 text-sm font-medium border-0 text-[#64748b] data-[state=active]:bg-white data-[state=active]:text-[#27272a] data-[state=active]:shadow-sm"
          >
            {t(`explore.categories.${key}`)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
