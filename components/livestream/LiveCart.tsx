'use client';

import { useState } from 'react';
import { useLivestreamStore } from '@/lib/stores/livestreamStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  DollarSign,
  ArrowRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LiveCartProps {
  className?: string;
}

export function LiveCart({ className }: LiveCartProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const {
    cartItems,
    featuredProducts,
    isCartVisible,
    toggleCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  } = useLivestreamStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  // Get cart items with product details
  const cartWithProducts = cartItems
    .map((item) => {
      const product = featuredProducts.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        ...item,
        product,
      };
    })
    .filter(Boolean) as Array<{
    productId: string;
    quantity: number;
    product: (typeof featuredProducts)[0];
  }>;

  // Calculate totals
  const subtotal = cartWithProducts.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 50000 ? 0 : 3000; // Free shipping over ₩50,000
  const tax = Math.round(subtotal * 0.1); // 10% tax
  const total = subtotal + shipping + tax;

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    const item = cartWithProducts.find((i) => i.productId === productId);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else if (newQuantity <= item.product.stock) {
      updateCartQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);

    // Simulate checkout process
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Show success message
    const toast = document.createElement('div');
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
          <svg class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span>Order placed successfully! Continue watching.</span>
      </div>
    `;
    toast.className =
      'fixed top-4 right-4 bg-background border border-green-500 text-foreground px-4 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-out', 'slide-out-to-top');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);

    clearCart();
    setIsCheckingOut(false);
    toggleCart();
  };

  return (
    <>
      {/* Cart Button (when cart is closed) */}
      {!isCartVisible && (
        <Button
          onClick={toggleCart}
          className={cn(
            'fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg z-40',
            totalItems > 0 && 'animate-pulse',
            className
          )}
          size="icon"
        >
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-destructive">
              {totalItems}
            </Badge>
          )}
        </Button>
      )}

      {/* Cart Sidebar */}
      <Sheet open={isCartVisible} onOpenChange={toggleCart}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart
              {totalItems > 0 && (
                <Badge variant="secondary">{totalItems} items</Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              Continue watching while you shop
            </SheetDescription>
          </SheetHeader>

          {cartWithProducts.length === 0 ? (
            /* Empty Cart */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add products from the stream to get started
                </p>
                <Button variant="outline" onClick={toggleCart}>
                  Continue Watching
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-4 py-4">
                  {cartWithProducts.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-4 p-3 rounded-lg border bg-card"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium line-clamp-2 mb-1">
                          {item.product.name}
                        </h4>
                        <p className="text-sm font-bold text-primary mb-2">
                          {formatPrice(item.product.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border rounded">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        {item.quantity >= item.product.stock && (
                          <p className="text-xs text-orange-600 mt-1">
                            Max quantity reached
                          </p>
                        )}
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Cart Summary */}
              <div className="border-t pt-4 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-between text-base">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg text-primary">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {shipping > 0 && (
                  <p className="text-xs text-center text-muted-foreground">
                    Add ₩{(50000 - subtotal).toLocaleString()} more for free
                    shipping
                  </p>
                )}

                <SheetFooter className="flex-row gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={clearCart}
                    disabled={isCheckingOut}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Checkout
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </SheetFooter>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
