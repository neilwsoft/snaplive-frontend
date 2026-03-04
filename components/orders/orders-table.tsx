"use client"

import { Order } from "@/types/order"
import { Checkbox } from "@/components/ui/checkbox"
import { OrderTableRow } from "./order-table-row"
import { Loader2 } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

interface OrdersTableProps {
  orders: Order[]
  selectedOrders: string[]
  onSelectOrder: (orderId: string) => void
  onSelectAll: (checked: boolean) => void
  onEdit: (orderId: string) => void
  loading?: boolean
}

export function OrdersTable({
  orders,
  selectedOrders,
  onSelectOrder,
  onSelectAll,
  onEdit,
  loading = false,
}: OrdersTableProps) {
  const { t } = useLocale()
  const allSelected = orders.length > 0 && selectedOrders.length === orders.length
  const someSelected = selectedOrders.length > 0 && !allSelected

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#94a3b8]" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white text-center">
        <p className="text-[#94a3b8] text-sm">{t("orders.noOrdersFound")}</p>
        <p className="text-[#cbd5e1] text-xs mt-1">
          {t("orders.adjustFilters")}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg border border-[#e2e8f0]">
      <table className="w-full">
        <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
          <tr>
            <th className="w-12 px-4 py-3 text-left">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                className={`border-slate-300 ${someSelected ? "data-[state=checked]:bg-[#94a3b8]" : ""
                  }`}
                aria-label={t("orders.table.selectAll")}
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("orders.table.orderId")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("orders.table.liveSimulcastId")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("orders.table.marketplaceSource")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("orders.table.buyer")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("orders.table.timeSinceOrdered")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("orders.table.productsOrdered")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("orders.table.status")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("orders.table.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderTableRow
              key={order.id}
              order={order}
              selected={selectedOrders.includes(order.id)}
              onSelect={() => onSelectOrder(order.id)}
              onEdit={() => onEdit(order.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
