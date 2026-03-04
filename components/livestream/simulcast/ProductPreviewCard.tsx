'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ShoppingCart, Package, Sparkles } from 'lucide-react';
import type { ProductState } from '@/lib/types/simulcast';

interface ProductPreviewCardProps {
  id: string;
  name: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  state: ProductState;
  isAiDetected?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Product card with waiting/active/done states for simulcast interface
 */
export function ProductPreviewCard({
  id,
  name,
  price,
  currency = 'CN¥',
  imageUrl,
  state,
  isAiDetected = false,
  onClick,
  className,
}: ProductPreviewCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = imageUrl && !imageError && !imageUrl.includes('placeholder');
  return (
    <div
      className={cn(
        'flex flex-col gap-2 items-center p-1 rounded-[14px] w-[226px] cursor-pointer transition-all',
        isAiDetected && 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-100 scale-[1.03] shadow-lg shadow-emerald-400/20',
        className
      )}
      onClick={onClick}
      data-product-id={id}
    >
      {/* Image container with state overlay */}
      <div
        className={cn(
          'relative h-[218px] w-full rounded-[10px] overflow-hidden shrink-0',
          state === 'waiting' && !isAiDetected && 'border border-slate-300',
          state === 'active' && 'border-2 border-zinc-800',
          state === 'done' && 'border border-slate-300',
          isAiDetected && 'border-2 border-emerald-400 animate-pulse'
        )}
      >
        {/* Product image or placeholder */}
        {hasValidImage ? (
          <img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-2">
            <Package className="w-12 h-12 text-slate-400" />
            <span className="text-xs text-slate-500 text-center px-2 line-clamp-2">
              {name}
            </span>
          </div>
        )}

        {/* Overlay for waiting and done states */}
        {(state === 'waiting' || state === 'done') && (
          <div className="absolute inset-0 bg-white/50" />
        )}

        {/* Cart icon for done state */}
        {state === 'done' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* AI detected badge */}
        {isAiDetected && (
          <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
              <Sparkles className="w-3 h-3" />
              AI
            </div>
          </div>
        )}
      </div>

      {/* Product name */}
      <p
        className={cn(
          'text-sm font-medium text-zinc-800 text-center w-full line-clamp-2 leading-5',
          (state === 'waiting' || state === 'done') && 'text-zinc-500'
        )}
      >
        {name}
      </p>

      {/* Price */}
      <div className="flex items-center justify-center gap-2 text-sm text-zinc-800 w-full">
        <span className="font-normal text-right">{currency}</span>
        <span className="font-normal overflow-hidden text-ellipsis">
          {price.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
