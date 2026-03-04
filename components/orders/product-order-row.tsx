import { OrderProductDetail, FulfillmentStatus } from "@/types/order-detail"
import { ProductBadge } from "./product-badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Image from "next/image"

interface ProductOrderRowProps {
  product: OrderProductDetail
  index: number
  onStatusChange: (productId: string, status: FulfillmentStatus) => void
}

export function ProductOrderRow({ product, index, onStatusChange }: ProductOrderRowProps) {
  return (
    <tr className="border-b border-slate-200 hover:bg-[#f8fafc]">
      {/* Index */}
      <td className="px-4 py-3 text-sm text-[#27272a]">{index}</td>

      {/* SKU */}
      <td className="px-4 py-3 text-sm text-[#27272a] font-mono">{product.sku}</td>

      {/* Image */}
      <td className="px-4 py-3">
        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-slate-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
      </td>

      {/* Product Name with Badges */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-[#27272a]">{product.name}</span>
          {product.badges && product.badges.length > 0 && (
            <div className="flex gap-1">
              {product.badges.map((badge, idx) => (
                <ProductBadge key={idx} type={badge.type} />
              ))}
            </div>
          )}
        </div>
      </td>

      {/* Quantity Bought */}
      <td className="px-4 py-3 text-sm text-[#27272a]">
        {product.quantity} {product.unit}
      </td>

      {/* Status Radio Buttons: Pick, Pack, Ship */}
      <td className="px-4 py-3">
        <RadioGroup
          value={product.fulfillmentStatus || ""}
          onValueChange={(value) => onStatusChange(product.id, value as FulfillmentStatus)}
          className="flex items-center gap-4"
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="pick" id={`${product.id}-pick`} />
            <Label htmlFor={`${product.id}-pick`} className="text-xs text-[#64748b] cursor-pointer">
              Pick
            </Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="pack" id={`${product.id}-pack`} />
            <Label htmlFor={`${product.id}-pack`} className="text-xs text-[#64748b] cursor-pointer">
              Pack
            </Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="ship" id={`${product.id}-ship`} />
            <Label htmlFor={`${product.id}-ship`} className="text-xs text-[#64748b] cursor-pointer">
              Ship
            </Label>
          </div>
        </RadioGroup>
      </td>
    </tr>
  )
}
