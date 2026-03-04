"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: TablePaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, 3);
        if (totalPages > 3) pages.push("...");
      } else if (currentPage >= totalPages - 1) {
        pages.push("...");
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        if (currentPage < totalPages - 2) pages.push("...");
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center gap-3 border border-[#cad5e2] rounded-[16px] px-2 py-1">
      {/* Previous Button */}
      <button
        onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className={`w-6 h-6 flex items-center justify-center ${
          canGoPrevious
            ? "text-[#27272a] cursor-pointer"
            : "text-[#cad5e2] cursor-not-allowed"
        }`}
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-3">
        {getVisiblePages().map((page, index) =>
          page === "..." ? (
            <div
              key={`ellipsis-${index}`}
              className="w-6 h-6 flex items-center justify-center text-[14px] font-normal text-[#27272a] px-1"
            >
              ...
            </div>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className="relative w-6 h-6 flex flex-col items-center justify-center px-1"
            >
              <span
                className={`text-[14px] leading-6 ${
                  currentPage === page
                    ? "font-normal text-[#27272a]"
                    : "font-normal text-[#cad5e2]"
                }`}
              >
                {page}
              </span>
              {currentPage === page && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#27272a]" />
              )}
            </button>
          )
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className={`w-6 h-6 flex items-center justify-center ${
          canGoNext
            ? "text-[#27272a] cursor-pointer"
            : "text-[#cad5e2] cursor-not-allowed"
        }`}
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}
