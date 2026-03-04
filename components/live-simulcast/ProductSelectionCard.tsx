"use client";

import { useState } from "react";
import { Check, GripVertical, Package, AlertTriangle } from "lucide-react";
import Image from "next/image";

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  selected: boolean;
  sku?: string;
  quantity?: number;
  unitCost?: number;
  category?: string;
  isLowStock?: boolean;
  isCriticalStock?: boolean;
}

interface ProductSelectionCardProps {
  product: Product;
  onToggle?: (productId: string) => void;
  onDragStart?: (productId: string) => void;
}

export function ProductSelectionCard({
  product,
  onToggle,
  onDragStart,
}: ProductSelectionCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = product.imageUrl && product.imageUrl !== '/placeholder-product.png' && !imageError;
  const hasStockWarning = product.isLowStock || product.isCriticalStock;

  return (
    <div
      className={`relative w-[100px] lg:w-[120px] xl:w-[140px] bg-white border rounded-lg overflow-hidden group shrink-0 transition-all ${
        product.selected
          ? "border-[#27c840] ring-1 ring-[#27c840]/30"
          : "border-[#cad5e2] hover:border-slate-400"
      }`}
      draggable
      onDragStart={() => onDragStart?.(product.id)}
    >
      {/* Image Section */}
      <div className="relative w-full h-[80px] lg:h-[90px] xl:h-[100px]">
        {/* Drag Handle */}
        <div className="absolute top-0.5 left-0.5 lg:top-1 lg:left-1 z-10 cursor-move">
          <div className="w-5 h-5 lg:w-6 lg:h-6 bg-white/80 rounded flex items-center justify-center">
            <GripVertical className="w-3 h-3 lg:w-4 lg:h-4 text-[#27272a]" />
          </div>
        </div>

        {/* Selection Indicator */}
        {product.selected && (
          <div className="absolute top-0.5 right-0.5 lg:top-1 lg:right-1 z-10">
            <div className="w-5 h-5 lg:w-6 lg:h-6 bg-[#27c840] rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 lg:w-4 lg:h-4 text-white" strokeWidth={3} />
            </div>
          </div>
        )}

        {/* Stock Warning Badge */}
        {hasStockWarning && (
          <div className="absolute bottom-0.5 left-0.5 lg:bottom-1 lg:left-1 z-10">
            <div className={`px-1 py-0.5 rounded text-[8px] lg:text-[9px] font-medium flex items-center gap-0.5 ${
              product.isCriticalStock
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700"
            }`}>
              <AlertTriangle className="w-2.5 h-2.5" />
              {product.isCriticalStock ? "Critical" : "Low"}
            </div>
          </div>
        )}

        {/* Product Image or Placeholder */}
        <button
          onClick={() => onToggle?.(product.id)}
          className="w-full h-full relative cursor-pointer"
          title={product.name}
        >
          {hasValidImage ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100px, (max-width: 1280px) 120px, 140px"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-1">
              <Package className="w-6 h-6 lg:w-8 lg:h-8 text-slate-400" />
            </div>
          )}
          {!product.selected && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          )}
        </button>
      </div>

      {/* Product Info */}
      <button
        onClick={() => onToggle?.(product.id)}
        className="w-full p-1.5 lg:p-2 text-left cursor-pointer border-t border-slate-100"
      >
        <p className="text-[9px] lg:text-[10px] xl:text-xs font-medium text-slate-800 line-clamp-2 leading-tight">
          {product.name}
        </p>
        <div className="flex items-center justify-between mt-1">
          {product.unitCost !== undefined && (
            <span className="text-[9px] lg:text-[10px] font-semibold text-slate-900">
              ${product.unitCost.toFixed(2)}
            </span>
          )}
          {product.quantity !== undefined && (
            <span className={`text-[8px] lg:text-[9px] ${
              product.isCriticalStock ? "text-red-600" :
              product.isLowStock ? "text-amber-600" :
              "text-slate-500"
            }`}>
              Qty: {product.quantity}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
