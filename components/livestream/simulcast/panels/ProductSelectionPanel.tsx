'use client';

import { useMemo, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductPreviewCard } from '../ProductPreviewCard';
import { ResizableHandle } from '../ResizableHandle';
import { useLivestreamStore } from '@/lib/stores/livestreamStore';
import type { ProductState } from '@/lib/types/simulcast';

interface ProductSelectionPanelProps {
  width: number;
  onResize: (deltaX: number) => void;
  productStates: Record<string, ProductState>;
  onProductClick: (productId: string) => void;
  className?: string;
}

/**
 * Left panel - Product selection grid with states
 */
export function ProductSelectionPanel({
  width,
  onResize,
  productStates,
  onProductClick,
  className,
}: ProductSelectionPanelProps) {
  const { featuredProducts, aiDetectedProductId } = useLivestreamStore();
  const productGridRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to AI-detected product
  useEffect(() => {
    if (!aiDetectedProductId || !productGridRef.current) return;

    const card = productGridRef.current.querySelector(
      `[data-product-id="${aiDetectedProductId}"]`
    );
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [aiDetectedProductId]);

  // Count active and done products
  const { activeCount, totalCount } = useMemo(() => {
    const done = Object.values(productStates).filter((s) => s === 'done').length;
    return {
      activeCount: done,
      totalCount: featuredProducts.length,
    };
  }, [productStates, featuredProducts.length]);

  return (
    <div
      className="bg-slate-100 flex gap-4 h-full items-start overflow-hidden pl-6 pr-0 py-10 shrink-0"
      style={{ width }}
    >
      <div className="flex flex-col gap-6 h-full flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <p className="text-base font-medium text-zinc-800">
            Product Selection
          </p>
          <div className="flex items-center gap-1 px-2 py-1 border border-slate-300 rounded">
            <span className="text-sm font-medium text-zinc-800">
              {activeCount}/{totalCount}
            </span>
            <svg
              className="w-3 h-3 text-zinc-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
        </div>

        {/* Product grid */}
        <ScrollArea className="flex-1 w-full">
          <div ref={productGridRef} className="flex flex-wrap gap-2 p-0.5">
            {featuredProducts.map((product) => (
              <ProductPreviewCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                currency="CN¥"
                imageUrl={product.image}
                state={productStates[product.id] || 'waiting'}
                isAiDetected={aiDetectedProductId === product.id}
                onClick={() => onProductClick(product.id)}
              />
            ))}
            {featuredProducts.length === 0 && (
              <div className="flex items-center justify-center w-full h-40 text-slate-400">
                No products added
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Resize handle */}
      <ResizableHandle onResize={onResize} direction="right" />
    </div>
  );
}
