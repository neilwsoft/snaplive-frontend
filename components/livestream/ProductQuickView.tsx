'use client';

import { useState } from 'react';
import { useLivestreamStore, FeaturedProduct } from '@/lib/stores/livestreamStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Plus,
  Minus,
  Package,
  DollarSign,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ProductQuickViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: FeaturedProduct | null;
}

export function ProductQuickView({
  open,
  onOpenChange,
  product,
}: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, updateProductStock } = useLivestreamStore();

  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  const handleAddToCart = async () => {
    setIsAdding(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    addToCart(product.id, quantity);

    // Update local stock (in real app, this would come from backend)
    updateProductStock(product.id, Math.max(0, product.stock - quantity));

    setIsAdding(false);

    // Show success message
    const toast = document.createElement('div');
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
          <svg class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span>${quantity} × ${product.name} added to cart!</span>
      </div>
    `;
    toast.className =
      'fixed top-4 right-4 bg-background border border-green-500 text-foreground px-4 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-out', 'slide-out-to-top');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2500);

    // Reset and close
    setQuantity(1);
    onOpenChange(false);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const totalPrice = product.price * quantity;
  const isOutOfStock = product.stock === 0;
  const isQuantityMaxed = quantity >= product.stock;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            View details and add this product to your cart
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}

            {product.isHighlighted && (
              <Badge className="absolute top-4 left-4 bg-primary">
                Featured Now
              </Badge>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 text-destructive" />
                  <p className="font-semibold text-lg">Out of Stock</p>
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>

            {product.description && (
              <p className="text-muted-foreground mb-4">
                {product.description}
              </p>
            )}

            <Separator className="my-4" />

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-muted-foreground">per item</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-5 w-5 text-muted-foreground" />
              {isOutOfStock ? (
                <span className="text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Out of stock
                </span>
              ) : product.stock <= 10 ? (
                <span className="text-orange-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Only {product.stock} left!
                </span>
              ) : (
                <span className="text-green-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  {product.stock} in stock
                </span>
              )}
            </div>

            <Separator className="my-4" />

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="h-10 w-10"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={isQuantityMaxed}
                      className="h-10 w-10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {isQuantityMaxed && (
                    <span className="text-sm text-muted-foreground">
                      Maximum quantity reached
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Total Price */}
            {!isOutOfStock && (
              <div className="bg-muted rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Price
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
              >
                {isAdding ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
