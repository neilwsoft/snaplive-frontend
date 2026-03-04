"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/locale-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface InventoryFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
}

export function InventoryFilters({
  searchValue,
  onSearchChange,
  onFilterClick,
}: InventoryFiltersProps) {
  const { t } = useLocale();

  return (
    <div className="flex items-center gap-4 w-full">
      {/* Search Input */}
      <div className="relative flex-1 max-w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
        <Input
          type="text"
          placeholder={t("common.search")}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 bg-white border-[#cbd5e1]"
        />
      </div>

      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-10 px-4 gap-2 bg-white border-[#cbd5e1] text-[#27272a] hover:bg-[#f8fafc]"
          >
            {t("inventory.filterProducts")}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onFilterClick}>
            {t("inventory.categories.all")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onFilterClick}>
            {t("inventory.categories.electronics")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onFilterClick}>
            {t("inventory.categories.apparel")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onFilterClick}>
            {t("inventory.categories.foodSnacks")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onFilterClick}>
            {t("inventory.categories.homeLiving")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
