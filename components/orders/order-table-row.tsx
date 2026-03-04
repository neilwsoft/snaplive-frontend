import { Order } from "@/types/order"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Copy, Edit } from "lucide-react"
import { OrderStatusBadge } from "./order-status-badge"
import { MarketplacePlatformBadge } from "@/components/dashboard/MarketplacePlatformBadge"
import { formatDistanceToNow } from "date-fns"

interface OrderTableRowProps {
  order: Order
  selected: boolean
  onSelect: () => void
  onEdit: () => void
}

export function OrderTableRow({
  order,
  selected,
  onSelect,
  onEdit,
}: OrderTableRowProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <tr
      className={`border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors ${selected ? "bg-[#f1f5f9]" : "bg-white"
        }`}
    >
      {/* Checkbox + Order ID */}
      {/* Checkbox */}
      <td className="w-12 px-4 py-3">
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          className="border-slate-300"
        />
      </td>

      {/* Order ID */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#27272a] font-mono">
            {order.orderId.slice(0, 20)}...
          </span>
          <button
            onClick={() => copyToClipboard(order.orderId)}
            className="text-[#94a3b8] hover:text-[#27272a] transition-colors"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
      </td>

      {/* Live Simulcast ID */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#27272a] font-mono">
            {order.liveSimulcastId}
          </span>
          <button
            onClick={() => copyToClipboard(order.liveSimulcastId)}
            className="text-[#94a3b8] hover:text-[#27272a] transition-colors"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
      </td>

      {/* Marketplace Source */}
      <td className="px-4 py-3">
        <MarketplacePlatformBadge platform={order.marketplaceSource} />
      </td>

      {/* Buyer */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={order.buyer.avatarUrl} alt={order.buyer.name} />
            <AvatarFallback className="bg-gradient-to-br from-[#1c398e] to-[#27c840] text-white text-xs">
              {getInitials(order.buyer.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-[#27272a]">{order.buyer.name}</span>
        </div>
      </td>

      {/* Time Since Ordered */}
      <td className="px-4 py-3">
        <span className="text-sm text-[#27272a]">
          {formatDistanceToNow(order.timeOrdered, { addSuffix: false })}
          <br />
          <span className="text-xs text-[#94a3b8]">
            {new Date(order.timeOrdered).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </span>
      </td>

      {/* Products Ordered */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {order.products.slice(0, 3).map((product, index) => (
            <span key={product.id} className="flex items-center text-sm text-[#27272a]">
              <span className="text-slate-400">▼</span>
              <span className="ml-1">{product.name}</span>
              {index < order.products.length - 1 && index < 2 && (
                <span className="mx-1">x{product.quantity}</span>
              )}
              {index < Math.min(order.products.length - 1, 2) && ","}
            </span>
          ))}
          {order.products.length > 3 && (
            <span className="text-sm text-[#94a3b8]">
              +{order.products.length - 3} more
            </span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <OrderStatusBadge status={order.status} />
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8 text-[#94a3b8] hover:text-[#27272a] hover:bg-slate-100"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  )
}
