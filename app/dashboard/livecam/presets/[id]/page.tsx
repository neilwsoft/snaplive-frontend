"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { UserInvitePanel } from "@/components/live-simulcast/UserInvitePanel";
import {
  BroadcastSetupModal,
  BroadcastConfig,
  Platform,
} from "@/components/live-simulcast/BroadcastSetupModal";
import { ProductSelectionCard, Product } from "@/components/live-simulcast/ProductSelectionCard";
import { BrandSetupPanel } from "@/components/live-simulcast/BrandSetupPanel";
import { MultiCamSelector, Camera } from "@/components/live-simulcast/MultiCamSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  usePreset,
  useProducts,
  useRegisteredUsers,
  useCreateSimulcast,
  useUpdatePreset,
  useDeletePreset,
  type SimulcastProduct,
  type InvitedUser,
} from "@/lib/hooks/useSimulcast";
import { type UpdatePresetData } from "@/lib/api/simulcast-presets";

// Camera mock data (would come from WebRTC devices in real implementation)
const mockCameras: Camera[] = [
  {
    id: "1",
    name: "Camera 1",
    previewUrl: "https://images.unsplash.com/photo-1556911261-6bd341186b2f?w=400&h=300&fit=crop",
    selected: true,
  },
  {
    id: "2",
    name: "Camera 2",
    previewUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    selected: true,
  },
  {
    id: "3",
    name: "Camera 3",
    previewUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    selected: true,
  },
];

export default function PresetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: presetId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  // Fetch the preset
  const { data: preset, isLoading: isLoadingPreset, error: presetError } = usePreset(presetId);

  // Fetch products from inventory API
  const { data: inventoryProducts, isLoading: isLoadingProducts } = useProducts();

  // Fetch registered users for invites
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const { data: registeredUsers } = useRegisteredUsers(userSearchQuery);

  // Mutations
  const createSimulcast = useCreateSimulcast();
  const updatePreset = useUpdatePreset();
  const deletePreset = useDeletePreset();

  // Local state for selections
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [cameras, setCameras] = useState<Camera[]>(mockCameras);
  const [landscapeLogo, setLandscapeLogo] = useState<string>("");
  const [boxedLogo, setBoxedLogo] = useState<string>("");
  const [broadcastConfig, setBroadcastConfig] = useState<BroadcastConfig | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form with preset data
  useEffect(() => {
    if (preset && !isInitialized) {
      // Pre-fill broadcast config with platforms
      const platformsWithState: Platform[] = [
        {
          name: "Douyin",
          enabled: preset.platforms?.some((p) => p.name === "Douyin") || false,
          connected: false,
          signalStrength: 0,
        },
        {
          name: "Xiaohongshu/RED",
          enabled: preset.platforms?.some((p) =>
            p.name === "Xiaohongshu/RED" || p.name === "Xiaohongshu (RED)"
          ) || false,
          connected: false,
          signalStrength: 0,
        },
        {
          name: "Taobao Live",
          enabled: preset.platforms?.some((p) => p.name === "Taobao Live") || false,
          connected: false,
          signalStrength: 0,
        },
      ];

      setBroadcastConfig({
        title: preset.title,
        resolution: preset.resolution,
        category: preset.category || "",
        platforms: platformsWithState,
      });

      // Pre-fill products
      const productIds = preset.products?.map((p) => p.product_id) || [];
      setSelectedProductIds(new Set(productIds));

      // Pre-fill invited users
      if (preset.invited_user_ids && preset.invited_user_ids.length > 0) {
        const users: InvitedUser[] = preset.invited_user_ids.map((id: string) => ({
          id,
          username: id,
          platform: "SnapLive",
        }));
        setInvitedUsers(users);
      }

      // Pre-fill cameras
      if (preset.cameras && preset.cameras.length > 0) {
        const transformedCameras: Camera[] = preset.cameras.map((c) => ({
          id: c.camera_id,
          name: c.name,
          previewUrl: c.preview_url || "https://images.unsplash.com/photo-1556911261-6bd341186b2f?w=400&h=300&fit=crop",
          selected: c.selected,
        }));
        setCameras(transformedCameras);
      }

      // Pre-fill branding
      if (preset.branding?.landscape_logo_url) {
        setLandscapeLogo(preset.branding.landscape_logo_url);
      }
      if (preset.branding?.boxed_logo_url) {
        setBoxedLogo(preset.branding.boxed_logo_url);
      }

      setIsInitialized(true);
    }
  }, [preset, isInitialized]);

  // Transform inventory products with selection state
  const products: Product[] = (inventoryProducts || []).map((p: SimulcastProduct) => ({
    id: p.id,
    name: p.name,
    imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop",
    selected: selectedProductIds.has(p.id),
  }));

  const handleInviteUser = (username: string) => {
    const usernames = username
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u);

    const newUsers: InvitedUser[] = usernames.map((name) => {
      const existingUser = registeredUsers?.find(
        (u) => u.username.toLowerCase() === name.toLowerCase()
      );

      return existingUser || {
        id: `user-${Date.now()}-${Math.random()}`,
        username: name,
        platform: "SnapLive",
      };
    });

    setInvitedUsers([...invitedUsers, ...newUsers]);
    toast.success(`Invited ${newUsers.length} user${newUsers.length > 1 ? "s" : ""}`);
  };

  const handleRemoveUser = (userId: string) => {
    setInvitedUsers(invitedUsers.filter((u) => u.id !== userId));
    toast.success("User removed");
  };

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleToggleCamera = (cameraId: string) => {
    setCameras(
      cameras.map((c) =>
        c.id === cameraId ? { ...c, selected: !c.selected } : c
      )
    );
  };

  const handleUploadLandscapeLogo = (file: File) => {
    const url = URL.createObjectURL(file);
    setLandscapeLogo(url);
    toast.success("Landscape logo uploaded!");
  };

  const handleUploadBoxedLogo = (file: File) => {
    const url = URL.createObjectURL(file);
    setBoxedLogo(url);
    toast.success("Boxed logo uploaded!");
  };

  // Validate preset data
  const validatePresetData = (config: BroadcastConfig) => {
    const errors: string[] = [];

    if (!config.title?.trim()) {
      errors.push("Preset title is required");
    }

    if (!config.resolution) {
      errors.push("Resolution is required");
    }

    const enabledPlatforms = config.platforms?.filter((p) => p.enabled) || [];
    if (enabledPlatforms.length === 0) {
      errors.push("At least one platform must be enabled");
    }

    if (selectedProductIds.size === 0) {
      errors.push("At least one product must be selected");
    }

    const selectedCameras = cameras.filter((c) => c.selected);
    if (selectedCameras.length === 0) {
      errors.push("At least one camera must be selected");
    }

    return errors;
  };

  // Start simulcast from this preset
  const handleStartSimulcast = async (config: BroadcastConfig) => {
    if (!user) {
      toast.error("Please log in to start a broadcast");
      return;
    }

    const enabledPlatforms = config.platforms
      .filter((p) => p.enabled)
      .map((p) => p.name);

    if (enabledPlatforms.length === 0) {
      toast.error("Please enable at least one platform");
      return;
    }

    const invitedUserIds = invitedUsers.map((u) => u.id);

    createSimulcast.mutate({
      config: {
        title: config.title,
        resolution: config.resolution,
        category: config.category,
        platforms: enabledPlatforms,
        selectedProductIds: Array.from(selectedProductIds),
        invitedUserIds,
      },
      sellerId: user.id,
      sellerName: user.full_name,
      products: inventoryProducts || [],
    });
  };

  // Update preset
  const handleUpdatePreset = async (config: BroadcastConfig) => {
    if (!user) {
      toast.error("Please log in to update a preset");
      return;
    }

    const errors = validatePresetData(config);
    if (errors.length > 0) {
      toast.error(
        <div>
          <p className="font-semibold">Cannot update preset:</p>
          <ul className="list-disc pl-4 mt-2">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>,
        { duration: 5000 }
      );
      return;
    }

    const enabledPlatforms = config.platforms
      .filter((p) => p.enabled)
      .map((p) => ({
        name: p.name,
        connected: p.connected,
        signal_strength: p.signalStrength,
      }));

    const invitedUserIds = invitedUsers.map((u) => u.id);
    const selectedProducts = inventoryProducts?.filter((p) =>
      selectedProductIds.has(p.id)
    );

    const presetProducts = (selectedProducts || []).map((p) => ({
      product_id: p.id,
      name: p.name,
      image_url: p.imageUrl,
      sku: p.sku,
      quantity: p.quantity,
      unit_cost: p.unitCost,
      category: p.category,
    }));

    const presetCameras = cameras
      .filter((c) => c.selected)
      .map((c) => ({
        camera_id: c.id,
        name: c.name,
        selected: c.selected,
        preview_url: c.previewUrl,
      }));

    const updateData: UpdatePresetData = {
      title: config.title,
      resolution: config.resolution,
      category: config.category,
      platforms: enabledPlatforms,
      products: presetProducts,
      invited_user_ids: invitedUserIds,
      cameras: presetCameras,
      branding: {
        landscape_logo_url: landscapeLogo,
        boxed_logo_url: boxedLogo,
      },
    };

    try {
      await updatePreset.mutateAsync({
        presetId,
        data: updateData,
      });
      toast.success("Preset updated successfully!");
    } catch (error) {
      console.error("Failed to update preset:", error);
      toast.error("Failed to update preset");
    }
  };

  // Delete preset
  const handleDeletePreset = async () => {
    if (!window.confirm(`Delete preset "${preset?.title}"?`)) return;

    try {
      await deletePreset.mutateAsync(presetId);
      toast.success("Preset deleted");
      router.push("/dashboard/livecam/presets");
    } catch (error) {
      console.error("Failed to delete preset:", error);
      toast.error("Failed to delete preset");
    }
  };

  const selectedProductsCount = selectedProductIds.size;
  const isLoading = createSimulcast.isPending || updatePreset.isPending || deletePreset.isPending;

  // Loading state
  if (isLoadingPreset) {
    return (
      <div className="flex h-full items-center justify-center bg-[rgba(248,250,252,0.72)] backdrop-blur-md">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#94a3b8]" />
          <p className="text-sm text-muted-foreground">Loading preset...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (presetError || !preset) {
    return (
      <div className="flex h-full items-center justify-center bg-[rgba(248,250,252,0.72)] backdrop-blur-md">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-4 text-center p-6">
            <p className="text-red-600 mb-2">Failed to load preset</p>
            <p className="text-sm text-muted-foreground mb-4">
              The preset may have been deleted or you don&apos;t have access to it.
            </p>
            <Button onClick={() => router.push("/dashboard/livecam/presets")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Presets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/livecam/presets")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-[#27272a]">{preset.title}</h1>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(preset.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeletePreset}
              disabled={isLoading}
            >
              {deletePreset.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - User Invites */}
        <UserInvitePanel
          invitedUsers={invitedUsers}
          onInvite={handleInviteUser}
          onRemoveUser={handleRemoveUser}
          onSearchChange={setUserSearchQuery}
          searchSuggestions={registeredUsers}
        />

        {/* Center Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Section - Broadcast Preview Area */}
          <div className="flex-1 bg-[#18181b] relative min-h-[200px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-white text-lg mb-2 font-medium">Camera Preview</p>
                <p className="text-slate-400 text-sm">
                  Configure your broadcast settings to begin
                </p>
              </div>
            </div>

            {/* Broadcast Setup Modal Overlay */}
            <BroadcastSetupModal
              onPreviewBroadcast={handleStartSimulcast}
              onSavePreset={handleUpdatePreset}
              isLoading={isLoading}
              initialConfig={broadcastConfig}
              saveButtonText="Update Preset"
            />
          </div>

          {/* Bottom Section - Product Selection + Brand Setup */}
          <div className="flex border-t border-slate-200 shrink-0">
            {/* Product Selection */}
            <div className="flex-1 bg-white p-4 lg:p-6 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm lg:text-base font-semibold text-foreground">
                    Product Selection
                  </h3>
                  <span className="text-xs lg:text-sm text-foreground font-medium bg-slate-100 px-2 py-0.5 rounded">
                    {selectedProductsCount}/{products.length}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs lg:text-sm flex items-center gap-1 lg:gap-2 border-slate-200 hover:bg-slate-50 h-7 lg:h-8 px-2 lg:px-3"
                >
                  <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Add Product</span>
                </Button>
              </div>

              {/* Product Grid */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center w-full py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    <span className="ml-2 text-sm text-slate-500">Loading products...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex items-center justify-center w-full py-8">
                    <p className="text-sm text-slate-500">No products available.</p>
                  </div>
                ) : (
                  products.map((product) => (
                    <ProductSelectionCard
                      key={product.id}
                      product={product}
                      onToggle={handleToggleProduct}
                    />
                  ))
                )}
              </div>

              <p className="text-xs lg:text-sm text-muted-foreground mt-3 leading-5 hidden lg:block">
                Products are retrieved from your inventory.
                Select the products that you want to include in your simulcast.
              </p>
            </div>

            {/* Brand Setup */}
            <div className="hidden lg:block shrink-0 w-[280px] xl:w-[320px] bg-slate-50 p-4 border-l border-slate-200">
              <BrandSetupPanel
                landscapeLogo={landscapeLogo}
                boxedLogo={boxedLogo}
                onUploadLandscape={handleUploadLandscapeLogo}
                onUploadBoxed={handleUploadBoxedLogo}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - MultiCam */}
        <div className="hidden lg:flex shrink-0 w-[200px] xl:w-[240px] bg-slate-100 p-3 xl:p-4 flex-col border-l border-slate-200 overflow-y-auto">
          <MultiCamSelector
            cameras={cameras}
            onToggle={handleToggleCamera}
          />
        </div>
      </div>
    </div>
  );
}
