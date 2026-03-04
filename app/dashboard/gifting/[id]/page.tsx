"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGift, useUpdateGift } from "@/lib/hooks/useGifts";
import Image from "next/image";

interface GiftFormData {
  raw_gift_name: string;
  image_url: string;
  quantity: string;
  marketplace_source: string;
  live_simulcast_id: string;
  viewer_username: string;
  viewer_avatar_url: string;
  gifting_timestamp: string;
  virtual_currency_value: string;
  currency_label: string;
  tier_level: string;
  seller_id: string;
}

const platformConfig: Record<string, { label: string; icon: string }> = {
  douyin: { label: "Douyin (抖音)", icon: "/images/platforms/douyin.svg" },
  taobao: { label: "Taobao Live (淘宝直播)", icon: "/images/platforms/taobao.svg" },
  xiaohongshu: { label: "Xiaohongshu (小红书)", icon: "/images/platforms/xiaohongshu.svg" },
  snaplive: { label: "SnapLive 2.0 (速播 2.0)", icon: "/images/platforms/snaplive.svg" },
};

const tierColors: Record<string, string> = {
  small: "bg-gray-100 text-gray-700 border-gray-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  large: "bg-purple-100 text-purple-700 border-purple-200",
  premium: "bg-amber-100 text-amber-700 border-amber-200",
};

function formatDateTimeLocal(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EditGiftPage() {
  const router = useRouter();
  const params = useParams();
  const giftId = params.id as string;

  const { data: gift, isLoading, error } = useGift(giftId);
  const updateGift = useUpdateGift();

  const [formData, setFormData] = useState<GiftFormData>({
    raw_gift_name: "",
    image_url: "",
    quantity: "1",
    marketplace_source: "douyin",
    live_simulcast_id: "",
    viewer_username: "",
    viewer_avatar_url: "",
    gifting_timestamp: "",
    virtual_currency_value: "0",
    currency_label: "",
    tier_level: "large",
    seller_id: "",
  });

  const [saving, setSaving] = useState(false);
  const [formLoaded, setFormLoaded] = useState(false);

  // Populate form when gift data loads
  useEffect(() => {
    if (gift && !formLoaded) {
      setFormData({
        raw_gift_name: gift.raw_gift_name || "",
        image_url: gift.image_url || "",
        quantity: String(gift.quantity ?? 1),
        marketplace_source: gift.marketplace_source || "douyin",
        live_simulcast_id: gift.live_simulcast_id || "",
        viewer_username: gift.viewer_username || "",
        viewer_avatar_url: gift.viewer_avatar_url || "",
        gifting_timestamp: formatDateTimeLocal(gift.gifting_timestamp),
        virtual_currency_value: String(gift.virtual_currency_value ?? 0),
        currency_label: gift.currency_label || "",
        tier_level: gift.tier_level || "large",
        seller_id: gift.seller_id || "",
      });
      setFormLoaded(true);
    }
  }, [gift, formLoaded]);

  const handleInputChange = (field: keyof GiftFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.raw_gift_name) {
      toast.error("Gift name is required");
      return;
    }
    if (!formData.viewer_username) {
      toast.error("Viewer username is required");
      return;
    }

    setSaving(true);
    try {
      await updateGift.mutateAsync({
        giftId,
        data: {
          raw_gift_name: formData.raw_gift_name,
          image_url: formData.image_url || undefined,
          quantity: parseInt(formData.quantity) || 1,
          marketplace_source: formData.marketplace_source,
          live_simulcast_id: formData.live_simulcast_id,
          viewer_username: formData.viewer_username,
          viewer_avatar_url: formData.viewer_avatar_url || undefined,
          gifting_timestamp: formData.gifting_timestamp
            ? new Date(formData.gifting_timestamp).toISOString()
            : undefined,
          virtual_currency_value: parseFloat(formData.virtual_currency_value) || 0,
          currency_label: formData.currency_label || undefined,
          tier_level: formData.tier_level,
          seller_id: formData.seller_id || undefined,
        },
      });

      router.push("/dashboard/gifting");
    } catch (error) {
      console.error("Failed to update gift:", error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading gift...</p>
        </div>
      </div>
    );
  }

  if (error || !gift) {
    return (
      <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-sm text-red-600">
            {error ? "Failed to load gift" : "Gift not found"}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/gifting")}
          >
            Back to Gifting
          </Button>
        </div>
      </div>
    );
  }

  const currentPlatform = platformConfig[formData.marketplace_source];

  return (
    <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
      <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <span
              className="text-[#64748b] hover:text-[#27272a] cursor-pointer"
              onClick={() => router.push("/dashboard/gifting")}
            >
              Gifting
            </span>
            <span className="text-[#64748b]">/</span>
            <span className="text-[#27272a] font-medium">Edit Gift</span>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Gift Details */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] p-6">
            <h3 className="text-base font-semibold text-[#27272a] mb-4">
              Gift Details
            </h3>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Gift Name
                </Label>
                <Input
                  placeholder="Enter gift name"
                  value={formData.raw_gift_name}
                  onChange={(e) =>
                    handleInputChange("raw_gift_name", e.target.value)
                  }
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Image URL
                </Label>
                <Input
                  type="url"
                  placeholder="https://example.com/gift.png"
                  value={formData.image_url}
                  onChange={(e) =>
                    handleInputChange("image_url", e.target.value)
                  }
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
                {formData.image_url && (
                  <div className="mt-2 w-16 h-16 rounded-lg border border-[#e2e8f0] overflow-hidden bg-[#f8fafc] flex items-center justify-center">
                    <Image
                      src={formData.image_url}
                      alt="Gift preview"
                      width={64}
                      height={64}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Quantity
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleInputChange("quantity", e.target.value)
                  }
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Tier Level
                </Label>
                <Select
                  value={formData.tier_level}
                  onValueChange={(value) =>
                    handleInputChange("tier_level", value)
                  }
                >
                  <SelectTrigger className="bg-white border-[#cbd5e1] text-slate-900">
                    <SelectValue placeholder="Select tier level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${
                      tierColors[formData.tier_level] || tierColors.large
                    }`}
                  >
                    {formData.tier_level.charAt(0).toUpperCase() +
                      formData.tier_level.slice(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Gifting Timestamp
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.gifting_timestamp}
                  onChange={(e) =>
                    handleInputChange("gifting_timestamp", e.target.value)
                  }
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Source & Viewer */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] p-6">
            <h3 className="text-base font-semibold text-[#27272a] mb-4">
              Source & Viewer
            </h3>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Marketplace Source
                </Label>
                <Select
                  value={formData.marketplace_source}
                  onValueChange={(value) =>
                    handleInputChange("marketplace_source", value)
                  }
                >
                  <SelectTrigger className="bg-white border-[#cbd5e1] text-slate-900">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(platformConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <Image
                            src={config.icon}
                            alt={config.label}
                            width={16}
                            height={16}
                            className="shrink-0"
                          />
                          {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentPlatform && (
                  <div className="flex items-center gap-2 mt-1">
                    <Image
                      src={currentPlatform.icon}
                      alt={currentPlatform.label}
                      width={20}
                      height={20}
                    />
                    <span className="text-xs text-[#64748b]">
                      {currentPlatform.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Live Simulcast ID
                </Label>
                <Input
                  placeholder="Enter simulcast ID"
                  value={formData.live_simulcast_id}
                  onChange={(e) =>
                    handleInputChange("live_simulcast_id", e.target.value)
                  }
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Viewer Username
                </Label>
                <Input
                  placeholder="Enter viewer username"
                  value={formData.viewer_username}
                  onChange={(e) =>
                    handleInputChange("viewer_username", e.target.value)
                  }
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Viewer Avatar URL
                </Label>
                <Input
                  type="url"
                  placeholder="https://example.com/avatar.png"
                  value={formData.viewer_avatar_url}
                  onChange={(e) =>
                    handleInputChange("viewer_avatar_url", e.target.value)
                  }
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Seller ID
                </Label>
                <Input
                  placeholder="Enter seller ID (optional)"
                  value={formData.seller_id}
                  onChange={(e) =>
                    handleInputChange("seller_id", e.target.value)
                  }
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Currency & Value */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] p-6">
            <h3 className="text-base font-semibold text-[#27272a] mb-4">
              Currency & Value
            </h3>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Virtual Currency Value
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.virtual_currency_value}
                  onChange={(e) =>
                    handleInputChange("virtual_currency_value", e.target.value)
                  }
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Currency Label
                </Label>
                <Input
                  placeholder="e.g., Douyin Coins, Red Beans"
                  value={formData.currency_label}
                  onChange={(e) =>
                    handleInputChange("currency_label", e.target.value)
                  }
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
                <p className="text-xs text-[#64748b]">
                  The name of the virtual currency on the platform
                </p>
              </div>

              {/* Summary Card */}
              <div className="mt-4 p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <h4 className="text-sm font-medium text-[#27272a] mb-3">
                  Gift Summary
                </h4>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Gift</span>
                    <span className="text-[#27272a] font-medium">
                      {formData.raw_gift_name || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Quantity</span>
                    <span className="text-[#27272a] font-medium">
                      x{formData.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Value</span>
                    <span className="text-[#27272a] font-medium">
                      {parseFloat(formData.virtual_currency_value).toLocaleString()}{" "}
                      {formData.currency_label || "coins"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Total Value</span>
                    <span className="text-[#27272a] font-semibold">
                      {(
                        (parseFloat(formData.virtual_currency_value) || 0) *
                        (parseInt(formData.quantity) || 1)
                      ).toLocaleString()}{" "}
                      {formData.currency_label || "coins"}
                    </span>
                  </div>
                  <div className="border-t border-[#e2e8f0] my-1" />
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Viewer</span>
                    <span className="text-[#27272a] font-medium">
                      {formData.viewer_username || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Tier</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${
                        tierColors[formData.tier_level] || tierColors.large
                      }`}
                    >
                      {formData.tier_level.charAt(0).toUpperCase() +
                        formData.tier_level.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/gifting")}
            disabled={saving}
            className="h-10 px-4 gap-2 bg-white border-[#cbd5e1] text-[#27272a] hover:bg-[#f8fafc]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-4 gap-2 bg-gradient-to-b from-[#1999ee] via-[#115bca] to-[#0b3aa8] border border-[#5081ff] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
