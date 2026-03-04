'use client';

import { useState, useEffect, useRef } from 'react';
import { Room } from 'livekit-client';
import { motion, AnimatePresence } from 'framer-motion';
import { useLivestreamStore, FeaturedProduct } from '@/lib/stores/livestreamStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  ShoppingCart,
  X,
  Eye,
  Package,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ProductOverlayProps {
  room: Room;
  isHost?: boolean;
  className?: string;
  onProductClick?: (product: FeaturedProduct) => void;
}

export function ProductOverlay({
  room,
  isHost = false,
  className,
  onProductClick,
}: ProductOverlayProps) {
  const handlerRegistered = useRef(false);

  const {
    featuredProducts,
    highlightedProductId,
    isProductOverlayVisible,
    selectProduct,
    addToCart,
    highlightProduct,
  } = useLivestreamStore();

  const highlightedProduct = featuredProducts.find(
    (p) => p.id === highlightedProductId
  );

  // Register RPC handler for product highlights (viewers)
  useEffect(() => {
    if (!room || isHost || handlerRegistered.current) return;

    const handleTextStream = async (reader: any, participantInfo: { identity: string }) => {
      try {
        const text = await reader.readAll();
        const data = JSON.parse(text);

        if (data.type === 'product_highlight' || data.type === 'ai_product_highlight') {
          highlightProduct(data.productId);
        }
      } catch (error) {
        console.error('Error reading product highlight:', error);
      }
    };

    // Register the handler only once
    try {
      room.registerTextStreamHandler('products', handleTextStream);
      handlerRegistered.current = true;
    } catch (error) {
      console.warn('Product stream handler already registered:', error);
    }

    return () => {
      handlerRegistered.current = false;
    };
  }, [room, isHost, highlightProduct]);

  // Broadcast product highlight (host)
  const broadcastHighlight = async (productId: string | null) => {
    if (!room || !isHost) return;

    try {
      const highlightData = {
        type: 'product_highlight',
        productId,
        timestamp: Date.now(),
      };

      await room.localParticipant.sendText(JSON.stringify(highlightData), {
        topic: 'products',
      });

      highlightProduct(productId);
    } catch (error) {
      console.error('Failed to broadcast product highlight:', error);
    }
  };

  const handleAddToCart = (product: FeaturedProduct) => {
    addToCart(product.id, 1);
    // Show toast notification
    const toast = document.createElement('div');
    toast.textContent = `${product.name} added to cart!`;
    toast.className =
      'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  if (!isProductOverlayVisible || featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className={cn('absolute bottom-20 left-6 max-w-2xl z-10', className)}>
      <AnimatePresence>
        {/* Highlighted Product - Large Display */}
        {highlightedProduct && (
          <motion.div
            key={`highlighted-${highlightedProduct.id}`}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <Card className="bg-background/95 backdrop-blur-sm p-4 mb-4 border-2 border-primary shadow-xl">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  {highlightedProduct.image ? (
                    <Image
                      src={highlightedProduct.image}
                      alt={highlightedProduct.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge className="absolute top-2 left-2 bg-primary">
                    Featured
                  </Badge>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg line-clamp-2 mb-2">
                    {highlightedProduct.name}
                  </h3>

                  {highlightedProduct.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {highlightedProduct.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-bold text-xl text-primary">
                        {formatPrice(highlightedProduct.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {highlightedProduct.stock > 0 ? (
                          <span className="text-green-600">
                            {highlightedProduct.stock} in stock
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Out of stock
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        selectProduct(highlightedProduct);
                        onProductClick?.(highlightedProduct);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    {highlightedProduct.stock > 0 && (
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1"
                        onClick={() => handleAddToCart(highlightedProduct)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    )}

                    {isHost && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => broadcastHighlight(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Other Featured Products - Small Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {featuredProducts
            .filter((p) => p.id !== highlightedProductId)
            .map((product) => (
              <motion.div
                key={product.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0"
              >
                <Card
                  className={cn(
                    'bg-background/90 backdrop-blur-sm p-2 cursor-pointer hover:border-primary transition-colors',
                    'w-24'
                  )}
                  onClick={() => {
                    if (isHost) {
                      broadcastHighlight(product.id);
                    } else {
                      selectProduct(product);
                      onProductClick?.(product);
                    }
                  }}
                >
                  <div className="relative w-20 h-20 rounded overflow-hidden bg-muted mb-2">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium line-clamp-2 mb-1">
                    {product.name}
                  </p>
                  <p className="text-xs font-bold text-primary">
                    {formatPrice(product.price)}
                  </p>
                </Card>
              </motion.div>
            ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
