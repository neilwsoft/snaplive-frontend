import { ProductBadgeType } from "@/types/order-detail"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProductBadgeProps {
  type: ProductBadgeType
  className?: string
}

export function ProductBadge({ type, className }: ProductBadgeProps) {
  const badgeConfig: Record<ProductBadgeType, { label: string; className: string }> = {
    new: {
      label: "NEW",
      className: "bg-[#dbeafe] text-[#1e40af] hover:bg-[#dbeafe] border-[#dbeafe]",
    },
    bestseller: {
      label: "BESTSELLER",
      className: "bg-[#fee2e2] text-[#991b1b] hover:bg-[#fee2e2] border-[#fee2e2]",
    },
    "hot-seller": {
      label: "HOT SELLER",
      className: "bg-[#fef3c7] text-[#92400e] hover:bg-[#fef3c7] border-[#fef3c7]",
    },
  }

  const config = badgeConfig[type]

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold text-[10px] px-1.5 py-0 h-5 rounded-[3px]",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
