"use client"

import { Search, ChevronDown, Printer, RefreshCw, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface OrdersActionBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCount: number
  onBulkPrint?: () => void
  onBulkUpdateStatus?: () => void
  onExport?: () => void
}

export function OrdersActionBar({
  searchQuery,
  onSearchChange,
  selectedCount,
  onBulkPrint,
  onBulkUpdateStatus,
  onExport,
}: OrdersActionBarProps) {
  const { t } = useLocale()

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      {/* Search */}
      <div className="relative flex-1 max-w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
        <Input
          type="search"
          placeholder={t("common.search")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 bg-white border-[#cbd5e1] text-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Filter Orders Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 px-4 gap-2 bg-white border-[#cbd5e1] text-[#27272a] hover:bg-[#f8fafc]"
            >
              {t("orders.filterOrders")}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>{t("orders.allOrders")}</DropdownMenuItem>
            <DropdownMenuItem>{t("orders.status.pending")}</DropdownMenuItem>
            <DropdownMenuItem>{t("orders.status.ready")}</DropdownMenuItem>
            <DropdownMenuItem>{t("orders.status.delivered")}</DropdownMenuItem>
            <DropdownMenuItem>{t("orders.status.cancelled")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Bulk Actions - Show when items are selected */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onBulkPrint}
              className="h-10 px-4 gap-2 bg-white border-[#cbd5e1] text-[#27272a] hover:bg-[#f8fafc]"
            >
              <Printer className="h-4 w-4" />
              {t("orders.printWaybills")}
            </Button>
            <Button
              variant="outline"
              onClick={onBulkUpdateStatus}
              className="h-10 px-4 gap-2 bg-white border-[#cbd5e1] text-[#27272a] hover:bg-[#f8fafc]"
            >
              <RefreshCw className="h-4 w-4" />
              {t("orders.updateStatus")}
            </Button>
          </div>
        )}

        {/* Export Button */}
        <Button
          variant="outline"
          onClick={onExport}
          className="h-10 px-4 gap-2 bg-white border-[#cbd5e1] text-[#27272a] hover:bg-[#f8fafc]"
        >
          <Download className="h-4 w-4" />
          {t("common.export")}
        </Button>
      </div>
    </div>
  )
}
