import { OrderDetail } from "@/types/order-detail"
import { OrderStatusBadge } from "./order-status-badge"
import { format } from "date-fns"

interface TransactionHistoryPanelProps {
  order: OrderDetail
}

export function TransactionHistoryPanel({ order }: TransactionHistoryPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-[#27272a]">Transaction History</h2>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Total Amount to Pay */}
        <div>
          <label className="text-xs font-medium text-[#64748b] uppercase mb-2 block">
            Total Amount to Pay
          </label>
          <div className="text-base font-semibold text-[#27272a]">
            {order.currency} {order.totalAmount.toFixed(2)}
          </div>
        </div>

        {/* Paid Amount */}
        <div>
          <label className="text-xs font-medium text-[#64748b] uppercase mb-2 block">
            Paid Amount
          </label>
          <div className="text-base font-semibold text-[#27272a]">
            {order.currency} {order.paidAmount.toFixed(2)}
          </div>
        </div>

        {/* Time Since Ordered */}
        <div>
          <label className="text-xs font-medium text-[#64748b] uppercase mb-2 block">
            Time Since Ordered
          </label>
          <div className="text-sm text-[#27272a]">
            {format(order.timeOrdered, "yyyy年MM月dd日 HH:mm")}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-medium text-[#64748b] uppercase mb-2 block">
            Status
          </label>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Last Updated */}
        <div>
          <label className="text-xs font-medium text-[#64748b] uppercase mb-2 block">
            Last Updated
          </label>
          <div className="text-sm text-[#27272a]">
            {format(order.updatedAt, "yyyy年MM月dd日 HH:mm")}
          </div>
        </div>
      </div>
    </div>
  )
}
