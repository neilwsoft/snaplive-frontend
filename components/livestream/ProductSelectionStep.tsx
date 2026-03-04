'use client';

/**
 * ProductSelectionStep Component
 * Step 1 of the PreLive wizard - Select products for the livestream
 */

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Package,
  Loader2,
  Check,
  X,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { getInventory, getCategories, InventoryItem, Category } from '@/lib/api/inventory';
import { listStores, StoreConnection } from '@/lib/api/platforms';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductSelectionStepProps {
  selectedProducts: InventoryItem[];
  onProductSelect: (product: InventoryItem) => void;
  onSelectAll: (products: InventoryItem[]) => void;
  onClearAll: () => void;
}

export function ProductSelectionStep({
  selectedProducts,
  onProductSelect,
  onSelectAll,
  onClearAll,
}: ProductSelectionStepProps) {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<StoreConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch in parallel
        const [inventoryResponse, categoriesResponse, storesResponse] = await Promise.all([
          getInventory({ page: 1, page_size: 100 }),
          getCategories(),
          listStores(),
        ]);

        setProducts(inventoryResponse.items);
        setCategories(categoriesResponse.categories);
        setStores(storesResponse.stores);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on search, category, and store
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        product.product_name.en.toLowerCase().includes(searchLower) ||
        product.product_name.ko.includes(searchQuery) ||
        product.sku.toLowerCase().includes(searchLower);

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      // Store filter - for now we show all products regardless of store
      // In a real implementation, products would have a store_id field
      const matchesStore = selectedStore === 'all' || true;

      return matchesSearch && matchesCategory && matchesStore;
    });
  }, [products, searchQuery, selectedCategory, selectedStore]);

  const isSelected = (productId: string) => {
    return selectedProducts.some((p) => p._id === productId);
  };

  const handleSelectAll = () => {
    // Select all currently filtered products
    const availableProducts = filteredProducts.filter((p) => p.available > 0);
    onSelectAll(availableProducts);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Package className="h-3 w-3 mr-1" />
            {selectedProducts.length} selected
          </Badge>
          {selectedProducts.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              <X className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleSelectAll}>
          <Check className="h-3 w-3 mr-1" />
          Select all ({filteredProducts.filter((p) => p.available > 0).length})
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label} ({cat.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Store Filter */}
        {stores.length > 0 && (
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.store_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Product Grid */}
      <ScrollArea className="h-[350px] rounded-md border p-4">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Package className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">
              {searchQuery || selectedCategory !== 'all'
                ? 'No products match your filters'
                : 'No inventory items found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredProducts.map((product) => {
              const selected = isSelected(product._id);
              const outOfStock = product.available === 0;

              return (
                <Card
                  key={product._id}
                  className={cn(
                    'p-3 cursor-pointer transition-all',
                    selected && 'border-primary bg-primary/5',
                    outOfStock && 'opacity-50 cursor-not-allowed',
                    !selected && !outOfStock && 'hover:border-primary/50'
                  )}
                  onClick={() => !outOfStock && onProductSelect(product)}
                >
                  <div className="flex gap-3">
                    {/* Checkbox */}
                    <div className="flex items-start pt-1">
                      <Checkbox
                        checked={selected}
                        disabled={outOfStock}
                        onCheckedChange={() => !outOfStock && onProductSelect(product)}
                      />
                    </div>

                    {/* Product Image Placeholder */}
                    <div className="w-12 h-12 flex-shrink-0 rounded bg-muted flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {product.product_name.en}
                        </h4>
                        {product.category && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {product.category}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku}
                      </p>

                      <div className="flex items-center justify-between mt-1">
                        <span className="font-semibold text-sm text-primary">
                          {formatPrice(product.unit_cost)}
                        </span>

                        <span
                          className={cn(
                            'text-xs flex items-center gap-1',
                            product.is_critical_stock && 'text-red-600',
                            product.is_low_stock && !product.is_critical_stock && 'text-orange-600',
                            !product.is_low_stock && !product.is_critical_stock && 'text-green-600'
                          )}
                        >
                          {outOfStock ? (
                            <>
                              <AlertCircle className="h-3 w-3" />
                              Out of stock
                            </>
                          ) : (
                            <>
                              <Package className="h-3 w-3" />
                              {product.available} in stock
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Selected Products Preview */}
      {selectedProducts.length > 0 && (
        <div className="border rounded-md p-3 bg-muted/50">
          <p className="text-xs text-muted-foreground mb-2">Selected Products:</p>
          <div className="flex flex-wrap gap-1">
            {selectedProducts.slice(0, 8).map((product) => (
              <Badge
                key={product._id}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/10"
                onClick={() => onProductSelect(product)}
              >
                {product.product_name.en}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {selectedProducts.length > 8 && (
              <Badge variant="outline">+{selectedProducts.length - 8} more</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
