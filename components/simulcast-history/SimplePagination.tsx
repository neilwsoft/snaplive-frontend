"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: SimplePaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= Math.min(4, totalPages); i++) {
          pages.push(i);
        }
        if (totalPages > 4) {
          pages.push("...");
        }
      } else if (currentPage >= totalPages - 2) {
        pages.push("...");
        for (let i = Math.max(totalPages - 3, 1); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {/* Previous Button */}
      <button
        onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-md border border-[#94a3b8] transition-colors",
          canGoPrevious
            ? "hover:bg-gray-100 text-[#27272a] cursor-pointer"
            : "text-gray-300 cursor-not-allowed"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) =>
        page === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="flex items-center justify-center w-8 h-8 text-sm text-gray-400"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors",
              currentPage === page
                ? "bg-[#27272a] text-white"
                : "border border-[#94a3b8] text-[#27272a] hover:bg-gray-100"
            )}
          >
            {page}
          </button>
        )
      )}

      {/* Next Button */}
      <button
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-md border border-[#94a3b8] transition-colors",
          canGoNext
            ? "hover:bg-gray-100 text-[#27272a] cursor-pointer"
            : "text-gray-300 cursor-not-allowed"
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
