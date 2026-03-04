"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2, Upload, X, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/locale-context";
import {
  useProducts,
  useRegisteredUsers,
  useCreateSimulcast,
  useSavePreset,
  useSavedPresets,
  useUpdatePreset,
  useDeletePreset,
  type SimulcastProduct,
  type InvitedUser,
} from "@/lib/hooks/useSimulcast";
import { type UpdatePresetData } from "@/lib/api/simulcast-presets";
import { listDestinations, type StreamDestination } from "@/lib/api/streaming";

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

export default function LiveSimulcastPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const sellerId = user?.id;

  // Product search state (debounced)
  const [productSearchInput, setProductSearchInput] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");

  // Debounce product search
  useEffect(() => {
    const timer = setTimeout(() => {
      setProductSearchQuery(productSearchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearchInput]);

  // Fetch products from inventory API with search
  const { data: inventoryProducts, isLoading: isLoadingProducts } = useProducts(productSearchQuery);

  // Fetch registered users for invites
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const { data: registeredUsers } = useRegisteredUsers(userSearchQuery);

  // Fetch saved presets
  const { data: savedPresets = [] } = useSavedPresets(sellerId);

  // Mutations for creating simulcast and managing presets
  const createSimulcast = useCreateSimulcast();
  const savePreset = useSavePreset();
  const updatePreset = useUpdatePreset();
  const deletePreset = useDeletePreset();

  // Local state for selections
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [cameras, setCameras] = useState<Camera[]>(mockCameras);
  const [landscapeLogo, setLandscapeLogo] = useState<string>("");
  const [boxedLogo, setBoxedLogo] = useState<string>("");

  // Preset management state
  const [loadedPreset, setLoadedPreset] = useState<any | null>(null);
  const [broadcastConfig, setBroadcastConfig] = useState<BroadcastConfig | null>(null);

  // Transform inventory products with selection state
  const products: Product[] = (inventoryProducts || []).map((p: SimulcastProduct) => ({
    id: p.id,
    name: p.name,
    imageUrl: p.imageUrl || "/placeholder-product.png",
    selected: selectedProductIds.has(p.id),
    sku: p.sku,
    quantity: p.quantity,
    unitCost: p.unitCost,
    category: p.category,
    isLowStock: p.isLowStock,
    isCriticalStock: p.isCriticalStock,
  }));

  const handleInviteUser = (username: string) => {
    const usernames = username
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u);

    // Check if users exist in registered users
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
    toast.success(t("livestream.invites.invitedUsers").replace("{count}", String(newUsers.length)));
  };

  const handleRemoveUser = (userId: string) => {
    setInvitedUsers(invitedUsers.filter((u) => u.id !== userId));
    toast.success(t("livestream.invites.userRemoved"));
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

  // Load preset and pre-fill all form data
  const handleLoadPreset = (presetId: string) => {
    const preset = savedPresets.find((p) => p._id === presetId);
    if (!preset) return;

    // Pre-fill broadcast config with platforms that have enabled state
    const platformsWithState: Platform[] = [
      {
        name: "Douyin",
        enabled: preset.platforms?.some((p: any) => p.platform === "Douyin") || false,
        connected: false,
        signalStrength: 0
      },
      {
        name: "Xiaohongshu/RED",
        enabled: preset.platforms?.some((p: any) =>
          p.platform === "Xiaohongshu/RED" || p.platform === "Xiaohongshu (RED)"
        ) || false,
        connected: false,
        signalStrength: 0
      },
      {
        name: "Taobao Live",
        enabled: preset.platforms?.some((p: any) => p.platform === "Taobao Live") || false,
        connected: false,
        signalStrength: 0
      },
    ];

    setBroadcastConfig({
      title: preset.title,
      resolution: preset.resolution,
      category: preset.category || "",
      platforms: platformsWithState,
    });

    // Pre-fill products
    const productIds = preset.products?.map((p: any) => p.product_id) || [];
    setSelectedProductIds(new Set(productIds));

    // Pre-fill invited users
    if (preset.invited_user_ids && preset.invited_user_ids.length > 0) {
      const users: InvitedUser[] = preset.invited_user_ids.map((id: string) => ({
        id,
        username: id, // Use ID as username for now
        platform: "SnapLive",
      }));
      setInvitedUsers(users);
    }

    // Pre-fill cameras
    if (preset.cameras && preset.cameras.length > 0) {
      // Transform CameraConfig to Camera format
      const transformedCameras: Camera[] = preset.cameras.map((c: any) => ({
        id: c.camera_id || c.id,
        name: c.name,
        previewUrl: c.preview_url || c.previewUrl,
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

    // Store loaded preset for update/delete operations
    setLoadedPreset(preset);

    toast.success(`${t("livestream.presets.loadedPreset")}: ${preset.title}`);
  };

  // Clear loaded preset and reset form
  const handleClearPreset = () => {
    setLoadedPreset(null);
    setBroadcastConfig(null);
    setSelectedProductIds(new Set());
    setInvitedUsers([]);
    setCameras(mockCameras);
    setLandscapeLogo("");
    setBoxedLogo("");
    toast.info(t("livestream.presets.formCleared"));
  };

  // Validate preset data before saving
  const validatePresetData = (config: BroadcastConfig) => {
    const errors: string[] = [];

    if (!config.title?.trim()) {
      errors.push(t("livestream.errors.presetTitleRequired"));
    }

    if (!config.resolution) {
      errors.push(t("livestream.errors.resolutionRequired"));
    }

    // Check for enabled platforms
    const enabledPlatforms = config.platforms?.filter(p => p.enabled) || [];
    if (enabledPlatforms.length === 0) {
      errors.push(t("livestream.errors.platformRequired"));
    }

    if (selectedProductIds.size === 0) {
      errors.push(t("livestream.errors.productRequired"));
    }

    const selectedCameras = cameras.filter((c) => c.selected);
    if (selectedCameras.length === 0) {
      errors.push(t("livestream.errors.cameraRequired"));
    }

    return errors;
  };

  const handlePreviewBroadcast = async (config: BroadcastConfig) => {
    if (!user) {
      toast.error(t("livestream.errors.loginRequired"));
      return;
    }

    // Extract enabled platforms
    const enabledPlatforms = config.platforms
      .filter(p => p.enabled)
      .map(p => p.name);

    if (enabledPlatforms.length === 0) {
      toast.error(t("livestream.errors.enablePlatform"));
      return;
    }

    const invitedUserIds = invitedUsers.map((u) => u.id);

    // Fetch seller's streaming destinations and filter to enabled platforms
    let destinationIds: string[] = [];
    try {
      const destResponse = await listDestinations(user.id);
      // Map platform display names to platform enum values for matching
      const platformNameMap: Record<string, string> = {
        "Douyin": "douyin",
        "Xiaohongshu/RED": "xiaohongshu",
        "Xiaohongshu (RED)": "xiaohongshu",
        "Taobao Live": "taobao",
      };
      const enabledPlatformValues = enabledPlatforms.map(
        (name) => platformNameMap[name] || name.toLowerCase()
      );
      // Include platform-matched destinations AND all "custom" destinations
      destinationIds = destResponse.destinations
        .filter((d) => enabledPlatformValues.includes(d.platform) || d.platform === "custom")
        .map((d) => d._id || d.id || "")
        .filter(Boolean);
    } catch (error) {
      console.warn("Failed to fetch streaming destinations:", error);
    }

    // Create simulcast and navigate to live room
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
      destinationIds,
    });
  };

  const handleSavePreset = async (config: BroadcastConfig) => {
    if (!user) {
      toast.error(t("livestream.errors.loginRequiredSave"));
      return;
    }

    // Validate before saving
    const errors = validatePresetData(config);
    if (errors.length > 0) {
      toast.error(
        <div>
          <p className="font-semibold">{t("livestream.errors.cannotSavePreset")}</p>
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

    // Extract enabled platforms
    const enabledPlatforms = config.platforms
      .filter(p => p.enabled)
      .map(p => p.name);

    const invitedUserIds = invitedUsers.map((u) => u.id);

    // Save preset with LiveKit room creation
    savePreset.mutate({
      config: {
        title: config.title,
        resolution: config.resolution,
        category: config.category,
        platforms: enabledPlatforms,
        selectedProductIds: Array.from(selectedProductIds),
        invitedUserIds,
      },
      sellerId: user.id,
      products: inventoryProducts || [],
    });
  };

  // Update existing preset
  const handleUpdatePreset = async (config: BroadcastConfig) => {
    if (!loadedPreset) {
      toast.error(t("livestream.errors.noPresetLoaded"));
      return;
    }

    if (!user) {
      toast.error(t("livestream.errors.loginRequiredUpdate"));
      return;
    }

    // Validate before updating
    const errors = validatePresetData(config);
    if (errors.length > 0) {
      toast.error(
        <div>
          <p className="font-semibold">{t("livestream.errors.cannotUpdatePreset")}</p>
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

    // Extract enabled platforms in PlatformConfig format
    const enabledPlatforms = config.platforms
      .filter(p => p.enabled)
      .map(p => ({
        name: p.name,
        connected: p.connected,
        signal_strength: p.signalStrength,
      }));

    const invitedUserIds = invitedUsers.map((u) => u.id);
    const selectedProducts = inventoryProducts?.filter((p) =>
      selectedProductIds.has(p.id)
    );

    // Transform products to PresetProduct format
    const presetProducts = (selectedProducts || []).map((p) => ({
      product_id: p.id,
      name: p.name,
      image_url: p.imageUrl,
      sku: p.sku,
      quantity: p.quantity,
      unit_cost: p.unitCost,
      category: p.category,
    }));

    // Transform cameras to CameraConfig format
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
        presetId: loadedPreset._id,
        data: updateData,
      });
      toast.success(t("livestream.presets.presetUpdated"));
      handleClearPreset();
    } catch (error) {
      console.error("Failed to update preset:", error);
      toast.error(t("livestream.errors.failedToUpdate"));
    }
  };

  // Delete loaded preset
  const handleDeleteLoadedPreset = async () => {
    if (!loadedPreset) return;

    const confirmMessage = t("livestream.confirmations.deletePreset").replace("{title}", loadedPreset.title);
    if (!window.confirm(confirmMessage)) return;

    try {
      await deletePreset.mutateAsync(loadedPreset._id);
      toast.success(t("livestream.presets.presetDeleted"));
      handleClearPreset();
    } catch (error) {
      console.error("Failed to delete preset:", error);
      toast.error(t("livestream.errors.failedToDelete"));
    }
  };

  const handleUploadLandscapeLogo = (file: File) => {
    const url = URL.createObjectURL(file);
    setLandscapeLogo(url);
    toast.success(t("livestream.branding.landscapeUploaded"));
  };

  const handleUploadBoxedLogo = (file: File) => {
    const url = URL.createObjectURL(file);
    setBoxedLogo(url);
    toast.success(t("livestream.branding.boxedUploaded"));
  };

  const selectedProductsCount = selectedProductIds.size;
  const isLoading = createSimulcast.isPending || savePreset.isPending || updatePreset.isPending || deletePreset.isPending;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100">
      {/* Preset Management Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Load Preset */}
          <div className="flex-1 min-w-[300px]">
            <Label className="text-sm font-medium mb-2 block">{t("livestream.presets.loadExisting")}</Label>
            <Select onValueChange={handleLoadPreset} value={loadedPreset?._id || ""}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t("livestream.presets.selectToLoad")} />
              </SelectTrigger>
              <SelectContent>
                {savedPresets.map((preset: any) => (
                  <SelectItem key={preset._id} value={preset._id}>
                    {preset.title} - {new Date(preset.updated_at).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 items-end">
            {loadedPreset && (
              <>
                <Badge variant="secondary" className="flex items-center gap-2 px-3 py-2">
                  <span className="text-sm">{t("livestream.presets.editing")}: {loadedPreset.title}</span>
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-600"
                    onClick={handleClearPreset}
                  />
                </Badge>

                <Button
                  onClick={handleDeleteLoadedPreset}
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                >
                  {deletePreset.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {t("common.delete")}
                </Button>

                <Button onClick={handleClearPreset} variant="outline" size="sm">
                  {t("livestream.presets.clearStartFresh")}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Currently Loaded Indicator */}
        {loadedPreset && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>{t("livestream.presets.currentlyEditing")}:</strong> {loadedPreset.title}
              <span className="text-blue-600 ml-2">
                ({t("livestream.presets.lastUpdated")}: {new Date(loadedPreset.updated_at).toLocaleString()})
              </span>
            </p>
          </div>
        )}
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
                <p className="text-white text-lg mb-2 font-medium">{t("livestream.cameraPreview")}</p>
                <p className="text-slate-400 text-sm">
                  {t("livestream.configureSettings")}
                </p>
              </div>
            </div>

            {/* Broadcast Setup Modal Overlay */}
            <BroadcastSetupModal
              onPreviewBroadcast={handlePreviewBroadcast}
              onSavePreset={loadedPreset ? handleUpdatePreset : handleSavePreset}
              isLoading={isLoading}
              initialConfig={broadcastConfig}
              saveButtonText={loadedPreset ? t("livestream.presets.updatePreset") : t("livestream.presets.saveAsNew")}
            />
          </div>

          {/* Bottom Section - Product Selection + Brand Setup */}
          <div className="flex border-t border-slate-200 shrink-0">
            {/* Product Selection */}
            <div className="flex-1 bg-white p-4 lg:p-6 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm lg:text-base font-semibold text-foreground">
                    {t("livestream.products.title")}
                  </h3>
                  <span className="text-xs lg:text-sm text-foreground font-medium bg-slate-100 px-2 py-0.5 rounded">
                    {selectedProductsCount}/{products.length}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs lg:text-sm flex items-center gap-1 lg:gap-2 border-slate-200 hover:bg-slate-50 h-7 lg:h-8 px-2 lg:px-3"
                    onClick={() => {
                      const allIds = new Set(products.map((p) => p.id));
                      setSelectedProductIds(allIds);
                    }}
                  >
                    <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden sm:inline">{t("livestream.products.addProduct")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs lg:text-sm flex items-center gap-1 lg:gap-2 border-slate-200 hover:bg-slate-50 h-7 lg:h-8 px-2 lg:px-3"
                    onClick={() => setSelectedProductIds(new Set())}
                  >
                    <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden sm:inline">{t("livestream.products.remove")}</span>
                  </Button>
                </div>
              </div>

              {/* Product Search */}
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={productSearchInput}
                  onChange={(e) => setProductSearchInput(e.target.value)}
                  className="pl-8 h-8 text-sm border-slate-200"
                />
                {productSearchInput && (
                  <button
                    onClick={() => setProductSearchInput("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Product Grid */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center w-full py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    <span className="ml-2 text-sm text-slate-500">{t("livestream.loadingProducts")}</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex items-center justify-center w-full py-8">
                    <p className="text-sm text-slate-500">
                      {productSearchQuery
                        ? `No products found for "${productSearchQuery}"`
                        : t("livestream.noProductsAvailable")}
                    </p>
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
                {t("livestream.productsFromInventory")}
              </p>
            </div>

            {/* Brand Setup - Right side of bottom section */}
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

        {/* Right Panel - MultiCam Select Only */}
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
