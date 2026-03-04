"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Play, Save, Eye, AlertTriangle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarketplaceConnection } from "./MarketplaceConnection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/lib/locale-context";

// Category keys for translation lookup
const CATEGORY_KEYS = [
  "fashionApparel",
  "beautySkincare",
  "electronics",
  "homeLiving",
  "foodBeverages",
  "healthWellness",
  "sportsOutdoors",
  "toysGames",
  "other"
] as const;

export interface Platform {
  name: string;
  enabled: boolean;
  connected: boolean;
  signalStrength: number;
}

interface BroadcastSetupModalProps {
  onPreviewBroadcast?: (config: BroadcastConfig) => void;
  onSavePreset?: (config: BroadcastConfig) => void;
  isLoading?: boolean;
  initialConfig?: BroadcastConfig | null;
  saveButtonText?: string;
}

export interface BroadcastConfig {
  title: string;
  resolution: string;
  category: string;
  platforms: Platform[];
}

export function BroadcastSetupModal({
  onPreviewBroadcast,
  onSavePreset,
  isLoading = false,
  initialConfig,
  saveButtonText,
}: BroadcastSetupModalProps) {
  const { t } = useLocale();
  const [title, setTitle] = useState("");
  const [resolution, setResolution] = useState("Auto");
  const [category, setCategory] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([
    { name: "Douyin", enabled: false, connected: false, signalStrength: 0 },
    { name: "Xiaohongshu/RED", enabled: false, connected: false, signalStrength: 0 },
    { name: "Taobao Live", enabled: false, connected: false, signalStrength: 0 },
  ]);

  // Populate form when initialConfig changes (preset loading)
  useEffect(() => {
    if (initialConfig) {
      setTitle(initialConfig.title || "");
      setResolution(initialConfig.resolution || "Auto");
      setCategory(initialConfig.category || "");
      if (initialConfig.platforms && initialConfig.platforms.length > 0) {
        setPlatforms(initialConfig.platforms);
      }
    }
  }, [initialConfig]);

  const handleTogglePlatform = (platformName: string, enabled: boolean) => {
    setPlatforms(prev =>
      prev.map(p =>
        p.name === platformName ? { ...p, enabled } : p
      )
    );
  };

  const handlePreviewBroadcast = () => {
    onPreviewBroadcast?.({
      title,
      resolution,
      category,
      platforms,
    });
  };

  const handleSavePreset = () => {
    onSavePreset?.({
      title,
      resolution,
      category,
      platforms,
    });
  };

  const canStart = title.trim().length > 0 && !isLoading;

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
      <div className="bg-[rgba(248,250,252,0.72)] backdrop-blur-md rounded-[28px] shadow-lg px-6 py-10 flex flex-col gap-10">
        {/* Title/Description Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium leading-5 text-[#27272a]">
            {t("livestream.broadcast.titleDescription")}
          </label>
          <Input
            type="text"
            placeholder={t("livestream.broadcast.titlePlaceholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-[#cbd5e1] text-sm text-[#27272a] placeholder:text-slate-400"
          />
          <p className="text-sm leading-6 text-[#27272a]">{t("livestream.broadcast.required")}</p>
        </div>

        {/* Resolution + Category Row */}
        <div className="flex gap-4">
          {/* Resolution Dropdown */}
          <div className="flex flex-col gap-1.5 w-[144px]">
            <label className="text-sm font-medium leading-5 text-[#27272a]">
              {t("livestream.broadcast.resolution")}
            </label>
            <Select value={resolution} onValueChange={setResolution}>
              <SelectTrigger className="w-full border-[#cbd5e1] h-9 text-[#27272a]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Auto">Auto</SelectItem>
                <SelectItem value="4K">4K (2160p)</SelectItem>
                <SelectItem value="1080p">1080p</SelectItem>
                <SelectItem value="720p">720p</SelectItem>
                <SelectItem value="480p">480p</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium leading-5 text-[#27272a]">
              {t("livestream.broadcast.category")}
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full border-[#cbd5e1] h-9 text-[#27272a]">
                <SelectValue placeholder={t("livestream.broadcast.selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_KEYS.map((key) => (
                  <SelectItem key={key} value={t(`livestream.broadcast.categoryOptions.${key}`)}>
                    {t(`livestream.broadcast.categoryOptions.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Marketplace Connections */}
        <div className="flex flex-col gap-4 w-full">
          <p className="text-sm font-medium leading-5 text-[#27272a]">
            {t("livestream.broadcast.marketplaceConnections")}
          </p>
          <div className="flex flex-col gap-3 w-full">
            {platforms.map((platform) => (
              <MarketplaceConnection
                key={platform.name}
                name={platform.name}
                enabled={platform.enabled}
                onToggle={(enabled) => handleTogglePlatform(platform.name, enabled)}
                connected={platform.connected}
                signalStrength={platform.signalStrength}
              />
            ))}
          </div>
          <div className="flex items-center w-full">
            <p className="flex-1 text-sm leading-5 text-[#27272a]">
              {t("livestream.broadcast.marketplaceHelper")}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 items-center w-full">
          <div className="flex gap-2">
            <Button
              onClick={handlePreviewBroadcast}
              disabled={!canStart}
              className={`${
                canStart
                  ? "bg-[#1c398e] hover:bg-[#1c398e]/90"
                  : "bg-[#1c398e] opacity-20 cursor-not-allowed"
              } text-white px-4 py-1 rounded-md text-sm font-medium capitalize flex items-center gap-2`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {isLoading ? t("livestream.broadcast.starting") : t("livestream.broadcast.previewLive")}
            </Button>
            <Button
              onClick={handleSavePreset}
              disabled={!canStart}
              className={`${
                canStart
                  ? "bg-[#e7000b] hover:bg-[#e7000b]/90"
                  : "bg-[#e7000b] opacity-20 cursor-not-allowed"
              } text-white px-4 py-1 rounded-md text-sm font-medium capitalize flex items-center gap-2`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isLoading ? t("livestream.broadcast.saving") : (saveButtonText || t("livestream.presets.saveAsNew"))}
            </Button>
          </div>
          <div className="flex items-start gap-2 text-xs text-[#27272a] max-w-md">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-5">
              {t("livestream.broadcast.previewWarning")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
