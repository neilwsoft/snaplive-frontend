"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GiftingFilters } from "@/components/gifting/GiftingFilters";
import { GiftingTable } from "@/components/gifting/GiftingTable";
import { Trash2, ChevronLeft, ChevronRight, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { useGiftList, useDeleteGift, useSeedGifts } from "@/lib/hooks/useGifts";

const ITEMS_PER_PAGE = 12;

export default function GiftingPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Reset page when platform filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPlatform]);

  // Fetch gifts from API
  const { data, isLoading, error, refetch } = useGiftList({
    search: debouncedSearch || undefined,
    marketplace_source: selectedPlatform || undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  });

  // Mutations
  const deleteGift = useDeleteGift();
  const seedGifts = useSeedGifts();

  const gifts = data?.items || [];
  const totalPages = data?.total_pages || 1;
  const totalItems = data?.total || 0;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(gifts.map((g) => g._id));
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
    router.push(`/dashboard/gifting/${id}`);
  };

  const handleRemoveSelected = async () => {
    if (selectedIds.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} gift(s)?`)) {
      return;
    }

    for (const id of selectedIds) {
      try {
        await deleteGift.mutateAsync(id);
      } catch {
        // Error handled by mutation
      }
    }
    setSelectedIds([]);
  };

  const handleExportData = () => {
    toast.info("Export functionality coming soon");
  };

  const handleSeedGifts = () => {
    seedGifts.mutate(24);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
        <div className="flex flex-col gap-6 w-full h-full">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-semibold text-[#27272a] leading-8 tracking-[-0.6px]">
              Gifting
            </h1>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading gifts...</p>
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
              Gifting
            </h1>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-red-600">Failed to load gifts</p>
              <Button onClick={() => refetch()} variant="outline">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (gifts.length === 0 && !debouncedSearch && !selectedPlatform) {
    return (
      <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
        <div className="flex flex-col gap-6 w-full h-full">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-semibold text-[#27272a] leading-8 tracking-[-0.6px]">
              Gifting
            </h1>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold">No gifts yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Gifts sent by viewers during livestreams will appear here. Seed sample data to explore the interface.
              </p>
              <Button
                onClick={handleSeedGifts}
                disabled={seedGifts.isPending}
              >
                {seedGifts.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  "Seed Gift Data"
                )}
              </Button>
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
            Gifting
          </h1>
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <Button
                variant="outline"
                onClick={handleRemoveSelected}
                disabled={deleteGift.isPending}
                className="h-10 px-4 gap-2 bg-white border-[#cbd5e1] text-[#27272a] hover:bg-[#f8fafc]"
              >
                {deleteGift.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Remove ({selectedIds.length})
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleExportData}
              className="h-10 px-4 gap-2 bg-white border-[#cbd5e1] text-[#27272a] hover:bg-[#f8fafc]"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Filters */}
        <GiftingFilters
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
        />

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <GiftingTable
            gifts={gifts}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onEdit={handleEdit}
            startIndex={(currentPage - 1) * ITEMS_PER_PAGE}
          />
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <span>Show entries</span>
            <span className="px-2 py-1 rounded border border-[#e2e8f0] bg-white text-[#27272a] font-medium">
              {ITEMS_PER_PAGE}
            </span>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
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
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-8 w-8 p-0 ${
                        currentPage === pageNum
                          ? "bg-[#27272a] text-white hover:bg-[#27272a]"
                          : "text-[#64748b]"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <span className="text-sm text-[#64748b] px-1">...</span>
                )}
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
    </div>
  );
}
