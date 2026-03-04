'use client';

/**
 * PreLiveWizard Component
 * Multi-step wizard for product selection and stream configuration before going live
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronLeft, ChevronRight, Video, Package, Settings } from 'lucide-react';
import { ProductSelectionStep } from './ProductSelectionStep';
import { StreamConfigStep } from './StreamConfigStep';
import { ReviewStep } from './ReviewStep';
import { InventoryItem } from '@/lib/api/inventory';
import { createSession, startSession, SessionProduct } from '@/lib/api/livestream-sessions';
import { createRoom } from '@/lib/api/livekit';
import { useLivestreamStore } from '@/lib/stores/livestreamStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PreLiveWizardProps {
  sellerId: string;
  sellerName: string;
}

export interface StreamConfig {
  title: string;
  maxParticipants: number;
  enableAgent: boolean;
  autoDetection: boolean;
}

const STEPS = [
  { id: 1, name: 'Select Products', icon: Package },
  { id: 2, name: 'Configure Stream', icon: Settings },
  { id: 3, name: 'Review & Go Live', icon: Video },
];

export function PreLiveWizard({ sellerId, sellerName }: PreLiveWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<InventoryItem[]>([]);
  const [streamConfig, setStreamConfig] = useState<StreamConfig>({
    title: '',
    maxParticipants: 100,
    enableAgent: true,
    autoDetection: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const {
    addFeaturedProduct,
    updateDetectionSettings,
    setRoomName,
    setIsHost,
  } = useLivestreamStore();

  const handleProductSelect = useCallback((product: InventoryItem) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p._id === product._id);
      if (isSelected) {
        return prev.filter((p) => p._id !== product._id);
      }
      return [...prev, product];
    });
  }, []);

  const handleSelectAll = useCallback((products: InventoryItem[]) => {
    setSelectedProducts(products);
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  const handleConfigChange = useCallback((config: Partial<StreamConfig>) => {
    setStreamConfig((prev) => ({ ...prev, ...config }));
  }, []);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoLive = async () => {
    try {
      setIsLoading(true);

      // Generate unique room name
      const timestamp = Date.now();
      const roomName = `${sellerId}-${timestamp}`;

      // Convert selected products to session products
      const sessionProducts: SessionProduct[] = selectedProducts.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        sku: item.sku,
        unit_cost: item.unit_cost,
        available_at_start: item.available,
        category: item.category,
      }));

      // Create livestream session in database
      const session = await createSession({
        seller_id: sellerId,
        room_name: roomName,
        title: streamConfig.title || undefined,
        products: sessionProducts,
        max_participants: streamConfig.maxParticipants,
        enable_agent: streamConfig.enableAgent,
      });

      toast.success('Session created! Preparing stream...');

      // Pre-populate livestream store with selected products
      selectedProducts.forEach((product) => {
        addFeaturedProduct({
          id: product.product_id,
          name: product.product_name.en,
          price: product.unit_cost,
          image: '',
          stock: product.available,
          description: `SKU: ${product.sku}`,
          isHighlighted: false,
        });
      });

      // Set detection prompts if auto-detection is enabled
      if (streamConfig.autoDetection && selectedProducts.length > 0) {
        const prompts = selectedProducts.map((p) => p.product_name.en.toLowerCase());
        updateDetectionSettings({
          enabled: true,
          textPrompts: prompts,
        });
      }

      // Create LiveKit room
      await createRoom({
        room_name: roomName,
        seller_id: sellerId,
        max_participants: streamConfig.maxParticipants,
        enable_agent: streamConfig.enableAgent,
      });

      // Start the session (transition to live)
      await startSession(session._id);

      // Set room state
      setRoomName(roomName);
      setIsHost(true);

      // Wait a bit to ensure everything is initialized
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Going live!');

      // Redirect to live room
      router.push(
        `/live/${roomName}?type=host&name=${encodeURIComponent(sellerName)}&userId=${sellerId}&sessionId=${session._id}`
      );
    } catch (error: any) {
      console.error('Failed to go live:', error);
      toast.error(error.response?.data?.detail || 'Failed to start livestream');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedProducts.length > 0;
      case 2:
        return true; // Config is optional
      case 3:
        return selectedProducts.length > 0;
      default:
        return false;
    }
  };

  const progress = (currentStep / 3) * 100;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Start Livestream
        </CardTitle>
        <CardDescription>
          Select products and configure your stream before going live
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />

          <div className="flex justify-between">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex flex-col items-center gap-2',
                    isCurrent && 'text-primary',
                    isCompleted && 'text-green-600',
                    !isCurrent && !isCompleted && 'text-muted-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2',
                      isCurrent && 'border-primary bg-primary/10',
                      isCompleted && 'border-green-600 bg-green-600 text-white',
                      !isCurrent && !isCompleted && 'border-muted-foreground/30'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <ProductSelectionStep
              selectedProducts={selectedProducts}
              onProductSelect={handleProductSelect}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
            />
          )}

          {currentStep === 2 && (
            <StreamConfigStep
              config={streamConfig}
              onConfigChange={handleConfigChange}
              selectedProductCount={selectedProducts.length}
            />
          )}

          {currentStep === 3 && (
            <ReviewStep
              selectedProducts={selectedProducts}
              config={streamConfig}
              sellerName={sellerName}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep < 3 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleGoLive}
              disabled={!canProceed() || isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <span className="animate-pulse mr-2">●</span>
                  Starting...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Go Live
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
