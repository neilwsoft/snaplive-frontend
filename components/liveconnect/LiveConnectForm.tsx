"use client";

import { useState } from "react";
import { MarketplacePlatformTab, MarketplacePlatform } from "./MarketplacePlatformTab";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/lib/locale-context";

export interface LiveConnectFormData {
  platform: MarketplacePlatform;
  storeId: string;
  storeName: string;
  storeUrl: string;
  appKey: string;
  appSecret: string;
  sessionKey: string;
  rtmpUrl: string;
  streamKey: string;
  password: string;
}

interface LiveConnectFormProps {
  initialPlatform?: MarketplacePlatform;
  initialData?: Partial<LiveConnectFormData>;
  onSubmit?: (data: LiveConnectFormData) => void | Promise<void>;
  onReset?: () => void;
}

const getDefaultRtmpUrl = (platform: MarketplacePlatform): string => {
  const rtmpUrls = {
    douyin: "rtmp://push.live.douyin.com/live",
    xiaohongshu: "rtmp://push.live.xiaohongshu.com/live",
    taobao: "rtmp://live.push.taobao.com/app/",
  };
  return rtmpUrls[platform];
};

const getDefaultStreamKey = (platform: MarketplacePlatform): string => {
  const streamKeys = {
    douyin: "a9bB2c4D-E6f7g-H8i9jK-L3m5nO-pQ1rSTu",
    xiaohongshu: "a9bB2c4D-E6f7g-H8i9jK-L3m5nO-pQ1rSTu",
    taobao: "c4m-pr0d-9b-12345678-0000-A_2025115.J08c20-a94f",
  };
  return streamKeys[platform];
};

export function LiveConnectForm({
  initialPlatform = "douyin",
  initialData = {},
  onSubmit,
  onReset,
}: LiveConnectFormProps) {
  const { t } = useLocale();
  const [platform, setPlatform] = useState<MarketplacePlatform>(initialPlatform);
  const [formData, setFormData] = useState<LiveConnectFormData>({
    platform: initialPlatform,
    storeId: initialData.storeId || "",
    storeName: initialData.storeName || "",
    storeUrl: initialData.storeUrl || "",
    appKey: initialData.appKey || "",
    appSecret: initialData.appSecret || "",
    sessionKey: initialData.sessionKey || "",
    rtmpUrl: initialData.rtmpUrl || getDefaultRtmpUrl(initialPlatform),
    streamKey: initialData.streamKey || getDefaultStreamKey(initialPlatform),
    password: initialData.password || "",
  });

  const handleInputChange = (field: keyof LiveConnectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlatformChange = (newPlatform: MarketplacePlatform) => {
    setPlatform(newPlatform);
    setFormData((prev) => ({ ...prev, platform: newPlatform }));
  };

  const handleReset = () => {
    setFormData({
      platform,
      storeId: "",
      storeName: "",
      storeUrl: "",
      appKey: "",
      appSecret: "",
      sessionKey: "",
      rtmpUrl: getDefaultRtmpUrl(platform),
      streamKey: getDefaultStreamKey(platform),
      password: "",
    });
    onReset?.();
    toast.success("Form reset successfully");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.storeId || !formData.storeName || !formData.appKey || !formData.appSecret || !formData.sessionKey) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.rtmpUrl || !formData.streamKey) {
      toast.error("RTMP URL and Stream Key are required for streaming");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.storeId &&
    formData.storeName &&
    formData.appKey &&
    formData.appSecret &&
    formData.sessionKey &&
    formData.rtmpUrl &&
    formData.streamKey;

  return (
    <div className="bg-[#f1f5f9] rounded-[14px] px-4 py-6 flex flex-col gap-10 w-full">
      {/* Platform Tab */}
      <MarketplacePlatformTab
        platform={platform}
        active={true}
      />

      {/* Store Credentials Section */}
      <div className="flex flex-col gap-0 w-full">
        <div className="flex flex-wrap gap-x-10 gap-y-4 w-full">
          {/* Store ID */}
          <div className="flex flex-col gap-1.5 w-[450px] min-w-[144px] max-w-[450px]">
            <label className="text-[14px] font-medium text-[#27272a] leading-[20px]">
              {t("liveConnect.form.storeId")} *
            </label>
            <Input
              type="text"
              placeholder={t("liveConnect.form.storeIdPlaceholder")}
              value={formData.storeId}
              onChange={(e) => handleInputChange("storeId", e.target.value)}
              className="w-full border-[#cbd5e1] text-[14px]"
            />
          </div>

          {/* Store Name */}
          <div className="flex flex-col gap-1.5 w-[450px] min-w-[144px] max-w-[450px]">
            <label className="text-[14px] font-medium text-[#27272a] leading-[20px]">
              {t("liveConnect.form.storeName")} *
            </label>
            <Input
              type="text"
              placeholder={t("liveConnect.form.storeNamePlaceholder")}
              value={formData.storeName}
              onChange={(e) => handleInputChange("storeName", e.target.value)}
              className="w-full border-[#cbd5e1] text-[14px]"
            />
          </div>

          {/* Store URL */}
          <div className="flex flex-col gap-1.5 w-[450px] min-w-[144px] max-w-[450px]">
            <label className="text-[14px] font-medium text-[#27272a] leading-[20px]">
              {t("liveConnect.form.storeUrl")} ({t("common.optional")})
            </label>
            <Input
              type="text"
              placeholder="https://"
              value={formData.storeUrl}
              onChange={(e) => handleInputChange("storeUrl", e.target.value)}
              className="w-full border-[#cbd5e1] text-[14px]"
            />
          </div>

          {/* App Key */}
          <div className="flex flex-col gap-1.5 w-[450px] min-w-[144px] max-w-[450px]">
            <label className="text-[14px] font-medium text-[#27272a] leading-[20px]">
              {t("liveConnect.form.appKey")} *
            </label>
            <Input
              type="text"
              placeholder={t("liveConnect.form.appKeyPlaceholder")}
              value={formData.appKey}
              onChange={(e) => handleInputChange("appKey", e.target.value)}
              className="w-full border-[#cbd5e1] text-[14px]"
            />
          </div>

          {/* App Secret */}
          <div className="flex flex-col gap-1.5 w-[450px] min-w-[144px] max-w-[450px]">
            <label className="text-[14px] font-medium text-[#27272a] leading-[20px]">
              {t("liveConnect.form.appSecret")} *
            </label>
            <Input
              type="text"
              placeholder={t("liveConnect.form.appSecretPlaceholder")}
              value={formData.appSecret}
              onChange={(e) => handleInputChange("appSecret", e.target.value)}
              className="w-full border-[#cbd5e1] text-[14px]"
            />
          </div>

          {/* Session Key */}
          <div className="flex flex-col gap-1.5 w-[450px] min-w-[144px] max-w-[450px]">
            <label className="text-[14px] font-medium text-[#27272a] leading-[20px]">
              {t("liveConnect.form.sessionKey")} *
            </label>
            <Input
              type="text"
              placeholder={t("liveConnect.form.sessionKeyPlaceholder")}
              value={formData.sessionKey}
              onChange={(e) => handleInputChange("sessionKey", e.target.value)}
              className="w-full border-[#cbd5e1] text-[14px]"
            />
          </div>
        </div>
      </div>

      {/* RTMP Streaming Section */}
      <div className="flex flex-col gap-6 w-full">
        {/* Section Header */}
        <div className="flex flex-col gap-0 w-full">
          <div className="flex flex-col h-8 justify-center text-[14px] text-[#27272a]">
            <p className="text-[14px] font-medium leading-[20px]">
              {t("liveConnect.form.rtmpStreaming")} *
            </p>
          </div>
          <p className="text-[14px] font-normal text-[#27272a] leading-[20px]">
            {t("liveConnect.form.rtmpStreamingDesc")}
          </p>
        </div>

        {/* RTMP Fields */}
        <div className="flex flex-wrap gap-10 w-full">
          {/* RTMP URL */}
          <div className="flex flex-col gap-1.5 w-[450px] min-w-[144px] max-w-[450px]">
            <label className="text-[14px] font-medium text-[#27272a] leading-[20px]">
              {t("liveConnect.form.rtmpUrl")}
            </label>
            <Input
              type="text"
              value={formData.rtmpUrl}
              onChange={(e) => handleInputChange("rtmpUrl", e.target.value)}
              className="w-full border-[#cbd5e1] text-[14px]"
            />
            <p className="text-[14px] font-normal text-[#27272a] leading-[24px]">
              {t("liveConnect.form.rtmpUrlHint")}
            </p>
          </div>

          {/* Stream Key */}
          <div className="flex flex-col gap-1.5 w-[450px] min-w-[144px] max-w-[450px]">
            <label className="text-[14px] font-medium text-[#27272a] leading-[20px]">
              {t("liveConnect.form.streamKey")}
            </label>
            <Input
              type="text"
              value={formData.streamKey}
              onChange={(e) => handleInputChange("streamKey", e.target.value)}
              className="w-full border-[#cbd5e1] text-[14px]"
            />
            <p className="text-[14px] font-normal text-[#27272a] leading-[20px]">
              {t("liveConnect.form.streamKeyHint")}
            </p>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 w-[450px] min-w-[144px] max-w-[450px]">
            <label className="text-[14px] font-medium text-[#27272a] leading-[20px]">
              {t("liveConnect.form.password")}
            </label>
            <Input
              type="password"
              placeholder={t("liveConnect.form.passwordPlaceholder")}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full border-[#cbd5e1] text-[14px]"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end items-center w-full">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="h-8 px-4 py-1 text-[14px] font-medium flex items-center gap-2.5 rounded-[6px]"
          >
            <RotateCcw className="w-4 h-4" />
            {t("common.reset")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className={`h-8 px-4 py-1 text-[14px] font-medium flex items-center gap-2.5 rounded-[6px] ${
              isFormValid && !isSubmitting
                ? "bg-[#1c398e] hover:bg-[#1c398e]/90"
                : "bg-[#1c398e] opacity-50 cursor-not-allowed"
            } text-white`}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isSubmitting ? "Connecting..." : t("liveConnect.form.connectStore")}
          </Button>
        </div>
      </div>
    </div>
  );
}
