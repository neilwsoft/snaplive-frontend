"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { OrdersActionBar } from "@/components/orders/orders-action-bar"
import { OrdersTable } from "@/components/orders/orders-table"
import { useOrders, useSeedOrders } from "@/lib/hooks/useOrders"
import { useLocale } from "@/lib/locale-context"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

const ITEMS_PER_PAGE = 12

export default function OrdersPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to first page on search
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch orders from API
  const { data, isLoading, error, refetch } = useOrders({
    search: debouncedSearch || undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  })

  // Seed orders mutation
  const seedOrders = useSeedOrders()

  const orders = data?.orders || []
  const totalPages = data?.totalPages || 1

  // Selection handlers
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map((order) => order.id))
    } else {
      setSelectedOrders([])
    }
  }

  // Action handlers
  const handleEdit = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`)
  }

  const handleBulkPrint = () => {
    toast.success(`Printing ${selectedOrders.length} waybills...`)
    // TODO: Implement bulk print functionality
  }

  const handleBulkUpdateStatus = () => {
    toast.success(`Updating status for ${selectedOrders.length} orders...`)
    // TODO: Implement bulk update functionality
  }

  const handleExport = () => {
    toast.success("Exporting orders data...")
    // TODO: Implement export functionality
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedOrders([]) // Clear selection when changing pages
  }

  const handleSeedOrders = () => {
    seedOrders.mutate({ count: 20, clear_existing: true })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
        <div className="flex flex-col gap-6 w-full h-full">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-semibold text-[#27272a] leading-8 tracking-[-0.6px]">
              {t("orders.title")} <span className="text-[#94a3b8]">{t("orders.subtitle")}</span>
            </h1>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t("orders.loading")}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
        <div className="flex flex-col gap-6 w-full h-full">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-semibold text-[#27272a] leading-8 tracking-[-0.6px]">
              {t("orders.title")} <span className="text-[#94a3b8]">{t("orders.subtitle")}</span>
            </h1>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-red-600">{t("orders.failed")}</p>
              <Button onClick={() => refetch()} variant="outline">
                {t("common.retry")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (orders.length === 0 && !debouncedSearch) {
    return (
      <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
        <div className="flex flex-col gap-6 w-full h-full">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-semibold text-[#27272a] leading-8 tracking-[-0.6px]">
              {t("orders.title")} <span className="text-[#94a3b8]">{t("orders.subtitle")}</span>
            </h1>
            <Button
              onClick={handleSeedOrders}
              className="h-10 px-4 gap-2 bg-gradient-to-b from-[#1999ee] via-[#115bca] to-[#0b3aa8] border border-[#5081ff] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] text-white hover:opacity-90"
              disabled={seedOrders.isPending}
            >
              {seedOrders.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("orders.seeding")}
                </>
              ) : (
                t("orders.seedOrders")
              )}
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold">{t("orders.noOrders")}</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {t("orders.noOrdersDesc")}
              </p>
              <Button
                onClick={handleSeedOrders}
                disabled={seedOrders.isPending}
              >
                {seedOrders.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("orders.seeding")}
                  </>
                ) : (
                  t("orders.seedOrders")
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
      <div className="flex flex-col gap-6 w-full h-full">
        {/* Page Header */}
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-semibold text-[#27272a] leading-8 tracking-[-0.6px]">
            {t("orders.title")} <span className="text-[#94a3b8]">{t("orders.subtitle")}</span>
          </h1>
          <Button
            onClick={handleSeedOrders}
            className="h-10 px-4 gap-2 bg-gradient-to-b from-[#1999ee] via-[#115bca] to-[#0b3aa8] border border-[#5081ff] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] text-white hover:opacity-90"
            disabled={seedOrders.isPending}
          >
            {seedOrders.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {t("orders.seedOrders")}
          </Button>
        </div>

        {/* Action Bar */}
        <OrdersActionBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCount={selectedOrders.length}
          onBulkPrint={handleBulkPrint}
          onBulkUpdateStatus={handleBulkUpdateStatus}
          onExport={handleExport}
        />

        {/* Orders Table */}
        <div className="flex-1 overflow-hidden">
          <OrdersTable
            orders={orders}
            selectedOrders={selectedOrders}
            onSelectOrder={handleSelectOrder}
            onSelectAll={handleSelectAll}
            onEdit={handleEdit}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm text-[#27272a] font-medium px-3 py-1 rounded bg-white border border-[#e2e8f0]">
                {currentPage}
              </span>
              <span className="text-sm text-muted-foreground">{t("common.of")} {totalPages}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
