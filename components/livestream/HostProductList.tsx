'use client';

import { useState, useEffect } from 'react';
import { Room } from 'livekit-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Package,
  Search,
  X,
  Plus,
  AlertCircle,
  Loader2,
  Star,
  Eye,
  Scan,
  Check,
} from 'lucide-react';
import { getInventory, InventoryItem } from '@/lib/api/inventory';
import { useLivestreamStore } from '@/lib/stores/livestreamStore';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { toast } from 'sonner';

interface HostProductListProps {
  room: Room;
  className?: string;
}

export function HostProductList({ room, className }: HostProductListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const {
    featuredProducts,
    addFeaturedProduct,
    highlightProduct,
    detectionSettings,
    updateDetectionSettings
  } = useLivestreamStore();

  // Fetch inventory products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getInventory({
          stock_status: 'all',
          page: 1,
          page_size: 50,
        });
        setProducts(response.items);
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.product_name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.product_name.ko.includes(searchQuery) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToFeatured = async (product: InventoryItem) => {
    try {
      const featuredProduct = {
        id: product.product_id,
        name: product.product_name.en,
        price: product.unit_cost,
        image: '', // You can add image URL if available
        stock: product.available,
        description: `SKU: ${product.sku}`,
        isHighlighted: false,
      };

      addFeaturedProduct(featuredProduct);

      // Broadcast to viewers
      await room.localParticipant.sendText(
        JSON.stringify({
          type: 'featured_product_added',
          product: featuredProduct,
          timestamp: Date.now(),
        }),
        { topic: 'products' }
      );

      toast.success(`${product.product_name.en} added to featured products`);
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleHighlight = async (productId: string) => {
    try {
      highlightProduct(productId);

      await room.localParticipant.sendText(
        JSON.stringify({
          type: 'product_highlight',
          productId,
          timestamp: Date.now(),
        }),
        { topic: 'products' }
      );

      toast.success('Product highlighted for viewers');
    } catch (error) {
      console.error('Failed to highlight product:', error);
    }
  };

  const isFeatured = (productId: string) => {
    return featuredProducts.some((p) => p.id === productId);
  };

  /**
   * Check if a product is in detection prompts
   */
  const isInDetection = (productName: string) => {
    const prompt = productName.toLowerCase();
    return detectionSettings.textPrompts.some((p) =>
      p.toLowerCase().includes(prompt) || prompt.includes(p.replace(/^a\s+|^an\s+/, ''))
    );
  };

  /**
   * Add product name to detection prompts
   */
  const handleAddToDetection = (product: InventoryItem) => {
    const productName = product.product_name.en;
    const prompt = productName.toLowerCase();

    // Check if already in prompts
    if (isInDetection(productName)) {
      toast.info(`${productName} is already in detection prompts`);
      return;
    }

    // Add to prompts
    updateDetectionSettings({
      textPrompts: [...detectionSettings.textPrompts, prompt],
    });

    toast.success(`${productName} added to detection`, {
      description: 'Detection will now look for this product in your stream',
      icon: <Scan className="h-4 w-4" />,
    });

    // Also add to featured if not already
    if (!isFeatured(product.product_id)) {
      handleAddToFeatured(product);
    }
  };

  /**
   * Remove product from detection prompts
   */
  const handleRemoveFromDetection = (product: InventoryItem) => {
    const productName = product.product_name.en.toLowerCase();

    // Remove matching prompts
    const updatedPrompts = detectionSettings.textPrompts.filter((p) => {
      const cleanP = p.replace(/^a\s+|^an\s+/, '').toLowerCase();
      return !cleanP.includes(productName) && !productName.includes(cleanP);
    });

    // Ensure at least one prompt remains
    if (updatedPrompts.length === 0) {
      toast.error('Cannot remove last detection prompt');
      return;
    }

    updateDetectionSettings({
      textPrompts: updatedPrompts,
    });

    toast.success(`${product.product_name.en} removed from detection`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  return (
    <>
      {/* Floating toggle button - only show when panel is closed */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed bottom-24 left-6 rounded-full w-14 h-14 shadow-2xl z-50',
            'bg-primary hover:bg-primary/90 transition-all hover:scale-110',
            className
          )}
          size="icon"
          title="Product Inventory"
        >
          <Package className="h-6 w-6" />
          {products.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-blue-500 text-white text-xs">
              {products.length > 99 ? '99+' : products.length}
            </Badge>
          )}
        </Button>
      )}

      {/* Product list overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-24 left-6 z-40 w-[380px] h-[550px]"
          >
            <Card className="bg-background/95 backdrop-blur-md border shadow-2xl h-full flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <h3 className="font-semibold">Product Inventory</h3>
                  <Badge variant="secondary">{products.length}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="p-4 border-b flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Product list */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Package className="h-12 w-12 mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchQuery ? 'No products found' : 'No inventory items'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product._id}
                        className={cn(
                          'p-3 hover:border-primary transition-colors cursor-pointer',
                          isFeatured(product.product_id) && 'border-primary bg-primary/5'
                        )}
                      >
                        <div className="flex gap-3">
                          {/* Product image placeholder */}
                          <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                            <div className="flex items-center justify-center h-full">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          </div>

                          {/* Product info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-medium text-sm line-clamp-2">
                                {product.product_name.en}
                              </h4>
                              <div className="flex items-center gap-1">
                                {isInDetection(product.product_name.en) && (
                                  <Badge
                                    variant="outline"
                                    className="h-5 px-1.5 text-xs bg-green-500/10 border-green-500/30 text-green-600 flex items-center gap-1"
                                  >
                                    <Scan className="h-3 w-3" />
                                    AI
                                  </Badge>
                                )}
                                {isFeatured(product.product_id) && (
                                  <Star className="h-4 w-4 text-primary fill-primary flex-shrink-0" />
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">
                                SKU: {product.sku}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-primary">
                                {formatPrice(product.unit_cost)}
                              </span>

                              <div className="flex items-center gap-1 text-xs">
                                {product.available > 0 ? (
                                  <span
                                    className={cn(
                                      'flex items-center gap-1',
                                      product.is_low_stock && 'text-orange-600',
                                      product.is_critical_stock && 'text-red-600',
                                      !product.is_low_stock &&
                                        !product.is_critical_stock &&
                                        'text-green-600'
                                    )}
                                  >
                                    <Package className="h-3 w-3" />
                                    {product.available}
                                  </span>
                                ) : (
                                  <span className="text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Out of stock
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1.5 mt-2">
                              {!isFeatured(product.product_id) ? (
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-7 text-xs flex-1"
                                  onClick={() => handleAddToFeatured(product)}
                                  disabled={product.available === 0}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs flex-1"
                                  onClick={() => handleHighlight(product.product_id)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Highlight
                                </Button>
                              )}

                              {/* Detection button */}
                              {!isInDetection(product.product_name.en) ? (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 text-xs flex-1"
                                  onClick={() => handleAddToDetection(product)}
                                  disabled={product.available === 0}
                                  title="Add product to AI detection"
                                >
                                  <Scan className="h-3 w-3 mr-1" />
                                  Detect
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs flex-1 border-green-500/50 bg-green-500/10 hover:bg-green-500/20"
                                  onClick={() => handleRemoveFromDetection(product)}
                                  title="Remove from detection"
                                >
                                  <Check className="h-3 w-3 mr-1 text-green-600" />
                                  <span className="text-green-600">Detecting</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                </ScrollArea>
              </div>

              {/* Footer info */}
              <div className="p-3 border-t bg-muted/50 flex-shrink-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>{featuredProducts.length} featured</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Scan className="h-3 w-3" />
                    <span>{detectionSettings.textPrompts.length} in detection</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
