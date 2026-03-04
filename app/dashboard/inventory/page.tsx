"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Product, ProductStatus } from "@/lib/types/inventory";
import { Plus, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useInventoryList, useDeleteInventory, useSeedInventory } from "@/lib/hooks/useInventory";
import { useLocale } from "@/lib/locale-context";
import type { InventoryItem } from "@/lib/api/inventory";

const ITEMS_PER_PAGE = 10;

// Category image mapping for product images
const categoryImages: Record<string, string> = {
  electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop",
  clothing: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&h=100&fit=crop",
  beauty: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=100&h=100&fit=crop",
  food: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop",
  home: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=100&h=100&fit=crop",
  sports: "https://images.unsplash.com/photo-1574271143515-5cddf8da19be?w=100&h=100&fit=crop",
  toys: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100&h=100&fit=crop",
  other: "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=100&h=100&fit=crop",
};

// Transform backend InventoryItem to frontend Product
function transformInventoryToProduct(item: InventoryItem): Product {
  const unitCost = item.unit_cost || 0;
  // Calculate a reasonable sale price (2x markup as default)
  const liveSalePrice = unitCost * 2;
  // Calculate profit margin
  const profitMargin = liveSalePrice > 0 ? ((liveSalePrice - unitCost) / liveSalePrice) * 100 : 0;

  // Determine status based on stock levels
  const status: ProductStatus[] = [];
  if (item.is_critical_stock) {
    // We don't have a "LOW_STOCK" status, but we could show as BEST_SELLER if high demand
  }

  return {
    id: item._id,
    image: categoryImages[item.category || "other"] || categoryImages.other,
    name: item.product_name?.en || item.product_name?.ko || "Unnamed Product",
    productId: item.product_id,
    sku: item.sku,
    brandMfr: "SnapLive Vendor", // Default brand since not in backend
    category: item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : "Other",
    stocks: item.available,
    stockUnit: "pcs.",
    liveSalePrice,
    unitCost,
    profitMargin: Math.round(profitMargin * 100) / 100,
    sales: 0, // Not tracked in backend inventory
    status: status.length > 0 ? status : undefined,
  };
}

export default function InventoryPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Fetch inventory from API
  const { data, isLoading, error, refetch } = useInventoryList({
    search: debouncedSearch || undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  });

  // Mutations
  const deleteInventory = useDeleteInventory();
  const seedInventory = useSeedInventory();

  // Transform API data to frontend format
  const products: Product[] = data?.items?.map(transformInventoryToProduct) || [];
  const totalPages = data?.total_pages || 1;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/inventory/${id}`);
  };

  const handleAddProduct = () => {
    router.push("/dashboard/inventory/add");
  };

  const handleRemoveSelected = async () => {
    if (selectedIds.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} product(s)?`)) {
      return;
    }

    // Delete each selected item
    for (const id of selectedIds) {
      try {
        await deleteInventory.mutateAsync(id);
      } catch {
        // Error handled by mutation
      }
    }
    setSelectedIds([]);
  };

  const handleFilterClick = () => {
    toast.info("Filter functionality coming soon");
  };

  const handleSeedInventory = () => {
    seedInventory.mutate();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]); // Clear selection when changing pages
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
        <div className="flex flex-col gap-6 w-full h-full">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-semibold text-[#27272a] leading-8 tracking-[-0.6px]">
              {t("inventory.title")} <span className="text-[#94a3b8]">{t("inventory.subtitle")}</span>
            </h1>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t("inventory.loading")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
        <div className="flex flex-col gap-6 w-full h-full">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-semibold text-[#27272a] leading-8 tracking-[-0.6px]">
              {t("inventory.title")} <span className="text-[#94a3b8]">{t("inventory.subtitle")}</span>
            </h1>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-red-600">{t("inventory.failed")}</p>
              <Button onClick={() => refetch()} variant="outline">
                {t("common.retry")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0 && !debouncedSearch) {
    return (
      <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
        <div className="flex flex-col gap-6 w-full h-full">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-semibold text-[#27272a] leading-8 tracking-[-0.6px]">
              {t("inventory.title")} <span className="text-[#94a3b8]">{t("inventory.subtitle")}</span>
            </h1>
            <Button
              onClick={handleAddProduct}
              className="h-10 px-4 gap-2 bg-gradient-to-b from-[#1999ee] via-[#115bca] to-[#0b3aa8] border border-[#5081ff] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              {t("inventory.addProduct")}
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold">{t("inventory.noItems")}</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {t("inventory.noItemsDesc")}
              </p>
              <div className="flex gap-3">
                <Button onClick={handleAddProduct} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("inventory.addProduct")}
                </Button>
                <Button
                  onClick={handleSeedInventory}
                  disabled={seedInventory.isPending}
                >
                  {seedInventory.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("inventory.seeding")}
                    </>
                  ) : (
                    t("inventory.seedInventory")
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
      <div className="flex flex-col gap-6 w-full h-full">
        {/* Page Header */}
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-semibold text-[#27272a] leading-8 tracking-[-0.6px]">
            {t("inventory.title")} <span className="text-[#94a3b8]">{t("inventory.subtitle")}</span>
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRemoveSelected}
              disabled={selectedIds.length === 0 || deleteInventory.isPending}
              className="h-10 px-4 gap-2 bg-white border-[#cbd5e1] text-[#27272a] hover:bg-[#f8fafc] disabled:opacity-50"
            >
              {deleteInventory.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {t("inventory.remove")}
            </Button>
            <Button
              onClick={handleAddProduct}
              className="h-10 px-4 gap-2 bg-gradient-to-b from-[#1999ee] via-[#115bca] to-[#0b3aa8] border border-[#5081ff] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              {t("inventory.addProduct")}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <InventoryFilters
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={handleFilterClick}
        />

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <InventoryTable
            products={products}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onEdit={handleEdit}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm text-[#27272a] font-medium px-3 py-1 rounded bg-white border border-[#e2e8f0]">
                {currentPage}
              </span>
              <span className="text-sm text-[#64748b]">{t("common.of")} {totalPages}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 text-slate-900"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
