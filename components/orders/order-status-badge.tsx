import { OrderStatus } from "@/types/order"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    returning: {
      label: "RETURNING",
      className: "bg-[#fef3c7] text-[#92400e] hover:bg-[#fef3c7] border-[#fef3c7]",
    },
    pending: {
      label: "Pending",
      className: "bg-[#fef3c7] text-[#92400e] hover:bg-[#fef3c7] border-[#fef3c7]",
    },
    ready: {
      label: "Ready",
      className: "bg-[#ccfbf1] text-[#134e4a] hover:bg-[#ccfbf1] border-[#ccfbf1]",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-[#f1f5f9] text-[#475569] hover:bg-[#f1f5f9] border-[#f1f5f9]",
    },
    shopping: {
      label: "Shopping",
      className: "bg-[#e9d5ff] text-[#6b21a8] hover:bg-[#e9d5ff] border-[#e9d5ff]",
    },
    shipped: {
      label: "Shipped",
      className: "bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7] border-[#dcfce7]",
    },
    delivered: {
      label: "Delivered",
      className: "bg-[#dbeafe] text-[#1e40af] hover:bg-[#dbeafe] border-[#dbeafe]",
    },
    return: {
      label: "Return",
      className: "bg-[#f1f5f9] text-[#64748b] hover:bg-[#f1f5f9] border-[#f1f5f9]",
    },
  }

  const config = statusConfig[status] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    className: "bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200",
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium text-xs px-2.5 py-0.5 rounded-[4px]",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
