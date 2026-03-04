"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoodsDetails } from "@/types/shipping-form"

interface GoodsDetailsPanelProps {
  goods: GoodsDetails
  onGrossWeightChange: (weight: number) => void
  onPackagesChange: (packages: number) => void
}

export function GoodsDetailsPanel({
  goods,
  onGrossWeightChange,
  onPackagesChange,
}: GoodsDetailsPanelProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-[#27272a]">
          Goods Details 货物明细
        </h2>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Product Names & Descriptions */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-[#64748b] uppercase">
            Product Names
          </Label>
          <div className="space-y-2">
            {goods.products.map((product, index) => (
              <div key={index} className="text-sm text-[#27272a]">
                <div className="font-medium">{product.name}</div>
                {product.description && (
                  <div className="text-[#64748b] text-xs mt-0.5">
                    {product.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total Quantity */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#64748b] uppercase">
            Total Quantity
          </Label>
          <div className="px-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-md text-sm text-[#27272a]">
            {goods.totalQuantity} pcs
          </div>
        </div>

        {/* Total Declared Value */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#64748b] uppercase">
            Total Declared Value
          </Label>
          <div className="px-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-md text-sm text-[#27272a]">
            {goods.currency} {goods.totalDeclaredValue.toFixed(2)}
          </div>
        </div>

        {/* Gross Weight */}
        <div className="space-y-2">
          <Label
            htmlFor="gross-weight"
            className="text-xs font-medium text-[#64748b] uppercase"
          >
            Gross Weight (kg)
          </Label>
          <Input
            id="gross-weight"
            type="number"
            step="0.1"
            min="0"
            value={goods.grossWeight || ""}
            onChange={(e) => onGrossWeightChange(parseFloat(e.target.value) || 0)}
            placeholder="0.0"
            className="h-9 text-slate-900"
          />
        </div>

        {/* Number of Packages */}
        <div className="space-y-2">
          <Label
            htmlFor="num-packages"
            className="text-xs font-medium text-[#64748b] uppercase"
          >
            Number of Packages
          </Label>
          <Input
            id="num-packages"
            type="number"
            min="1"
            value={goods.numberOfPackages || ""}
            onChange={(e) => onPackagesChange(parseInt(e.target.value) || 1)}
            placeholder="1"
            className="h-9 text-slate-900"
          />
        </div>
      </div>
    </div>
  )
}
