'use client';

/**
 * ReviewStep Component
 * Step 3 of the PreLive wizard - Review and confirm before going live
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Users,
  Bot,
  Scan,
  User,
  DollarSign,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { InventoryItem } from '@/lib/api/inventory';
import { StreamConfig } from './PreLiveWizard';
import { cn } from '@/lib/utils';

interface ReviewStepProps {
  selectedProducts: InventoryItem[];
  config: StreamConfig;
  sellerName: string;
}

export function ReviewStep({ selectedProducts, config, sellerName }: ReviewStepProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  const totalValue = selectedProducts.reduce((sum, p) => sum + p.unit_cost * p.available, 0);

  // Group products by category
  const categoryGroups = selectedProducts.reduce((acc, product) => {
    const category = product.category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  return (
    <div className="space-y-6">
      {/* Ready to Go Live Banner */}
      <Card className="border-green-500/50 bg-green-500/5">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-700">Ready to Go Live!</h3>
              <p className="text-sm text-green-600">
                Review your selection below, then click &quot;Go Live&quot; to start streaming
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Products Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products ({selectedProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[200px]">
              <div className="space-y-4">
                {Object.entries(categoryGroups).map(([category, products]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {category === 'uncategorized' ? 'Other' : category}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {products.length}
                      </Badge>
                    </div>
                    <div className="space-y-2 pl-5">
                      {products.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="truncate flex-1 pr-2">
                            {product.product_name.en}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {formatPrice(product.unit_cost)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-3" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Inventory Value</span>
              <span className="font-semibold">{formatPrice(totalValue)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Stream Configuration Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Stream Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {/* Host Info */}
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{sellerName}</p>
                <p className="text-xs text-muted-foreground">Host</p>
              </div>
            </div>

            {/* Stream Title */}
            {config.title && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Stream Title</p>
                <p className="text-sm font-medium">{config.title}</p>
              </div>
            )}

            {/* Settings List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Max Viewers</span>
                </div>
                <Badge variant="secondary">{config.maxParticipants}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <span>AI Assistant</span>
                </div>
                <Badge
                  variant={config.enableAgent ? 'default' : 'outline'}
                  className={cn(
                    config.enableAgent && 'bg-green-600'
                  )}
                >
                  {config.enableAgent ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Scan className="h-4 w-4 text-muted-foreground" />
                  <span>Auto Detection</span>
                </div>
                <Badge
                  variant={config.autoDetection ? 'default' : 'outline'}
                  className={cn(
                    config.autoDetection && 'bg-green-600'
                  )}
                >
                  {config.autoDetection ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="text-center">
            <Package className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{selectedProducts.length}</p>
            <p className="text-xs text-muted-foreground">Products</p>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <Tag className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{Object.keys(categoryGroups).length}</p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{config.maxParticipants}</p>
            <p className="text-xs text-muted-foreground">Max Viewers</p>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold truncate">{formatPrice(totalValue)}</p>
            <p className="text-xs text-muted-foreground">Total Value</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
