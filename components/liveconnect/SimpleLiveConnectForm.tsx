"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useLocale } from "@/lib/locale-context";

export type Platform = "douyin" | "xiaohongshu" | "taobao";

export interface SimpleLiveConnectFormData {
  platform: Platform;
  rtmpUrl: string;
  streamKey: string;
}

interface SimpleLiveConnectFormProps {
  initialPlatform?: Platform;
  onSubmit?: (data: SimpleLiveConnectFormData) => void;
  onReset?: () => void;
}

const platformData: Record<Platform, { name: string; imageUrl: string; rtmpUrl: string; streamKey: string }> = {
  douyin: {
    name: "Douyin",
    imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=32&h=32&fit=crop",
    rtmpUrl: "rtmp://push.live.douyin.com/live",
    streamKey: "a9bB2c4D-E6f7g-H8i9jK-L3m5nO-pQ1rSTu",
  },
  xiaohongshu: {
    name: "Xiaohongshu",
    imageUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=32&h=32&fit=crop",
    rtmpUrl: "rtmp://push.live.xiaohongshu.com/live",
    streamKey: "x7hY4k2P-Q9r3s-T5u6vW-X8y9zA-bC0dEFg",
  },
  taobao: {
    name: "Taobao Live",
    imageUrl: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=32&h=32&fit=crop",
    rtmpUrl: "rtmp://live.push.taobao.com/app/",
    streamKey: "c4m-pr0d-9b-12345678-0000-A_2025115.J08c20-a94f",
  },
};

export function SimpleLiveConnectForm({
  initialPlatform = "douyin",
  onSubmit,
  onReset,
}: SimpleLiveConnectFormProps) {
  const { t } = useLocale();
  const [platform, setPlatform] = useState<Platform>(initialPlatform);
  const [rtmpUrl, setRtmpUrl] = useState(platformData[initialPlatform].rtmpUrl);
  const [streamKey, setStreamKey] = useState(platformData[initialPlatform].streamKey);

  const handlePlatformChange = (newPlatform: Platform) => {
    setPlatform(newPlatform);
    setRtmpUrl(platformData[newPlatform].rtmpUrl);
    setStreamKey(platformData[newPlatform].streamKey);
  };

  const handleReset = () => {
    setRtmpUrl(platformData[platform].rtmpUrl);
    setStreamKey(platformData[platform].streamKey);
    onReset?.();
    toast.success("Form reset successfully");
  };

  const handleSubmit = () => {
    if (!rtmpUrl || !streamKey) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSubmit?.({ platform, rtmpUrl, streamKey });
    toast.success(`Connected to ${platformData[platform].name} successfully!`);
  };

  const fullIngestPath = `${rtmpUrl}${rtmpUrl.endsWith('/') ? '' : '/'}${streamKey}`;

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Page Heading */}
      <div className="flex items-center justify-between w-full">
        <h1 className="flex-1 text-2xl font-semibold text-[#27272a] leading-8 tracking-[-0.6px]">
          {t("liveConnect.marketplaceConnection")}
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-0 flex-1 w-full min-h-0">
        {/* Instructions Panel */}
        <div className="border border-[#b3bad1] rounded-[14px] p-6 flex flex-col gap-6 mb-10">
          <h2 className="text-[30px] font-semibold text-[#27272a] leading-9 tracking-[-0.75px]">
            {t("liveConnect.rtmpInstructions.title")}
          </h2>
          <div className="text-sm font-normal text-[#27272a] leading-6">
            <p className="mb-0">
              {t("liveConnect.rtmpInstructions.intro")}
            </p>
            <p className="mb-0">&nbsp;</p>
            <ol className="list-decimal ms-5 space-y-2">
              <li>{t("liveConnect.rtmpInstructions.step1")}</li>
              <li>{t("liveConnect.rtmpInstructions.step2")}</li>
              <li>{t("liveConnect.rtmpInstructions.step3")}</li>
              <li>{t("liveConnect.rtmpInstructions.step4")}</li>
            </ol>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex flex-col gap-0 w-full">
          {/* Tabs Section */}
          <div className="bg-[#e2e8f0] flex flex-col gap-4 p-4 rounded-t-[14px]">
            <p className="text-sm text-[#27272a] font-normal leading-6">
              {t("liveConnect.selectPlatforms")}
            </p>

            {/* Platform Tabs */}
            <div className="bg-[#f1f5f9] flex gap-2 p-2 rounded-md">
              {(Object.keys(platformData) as Platform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePlatformChange(p)}
                  className={`flex items-center gap-2.5 h-8 px-0 pr-3 py-0 rounded-[7px] transition-opacity ${
                    platform === p
                      ? "bg-white shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
                      : "opacity-50 hover:opacity-75"
                  }`}
                >
                  <div className="relative w-[31px] h-[31px] rounded-[5px] overflow-hidden flex-shrink-0">
                    <Image
                      src={platformData[p].imageUrl}
                      alt={platformData[p].name}
                      fill
                      className="object-cover"
                      sizes="31px"
                    />
                  </div>
                  <span className="text-sm font-medium text-[#27272a] leading-5">
                    {platformData[p].name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-[#f1f5f9] flex flex-col gap-10 px-4 py-6 rounded-b-[14px]">
            <p className="text-xl font-normal text-[#27272a] leading-7">
              {platformData[platform].name} Marketplace
            </p>

            {/* Input Fields */}
            <div className="flex flex-wrap gap-x-10 gap-y-4 w-full">
              {/* RTMP URL */}
              <div className="flex flex-col gap-1.5 w-[450px] min-w-[144px] max-w-[450px]">
                <label className="text-sm font-medium text-[#27272a] leading-5">
                  {t("liveConnect.form.rtmpUrl")}
                </label>
                <Input
                  type="text"
                  value={rtmpUrl}
                  onChange={(e) => setRtmpUrl(e.target.value)}
                  className="w-full border-[#cbd5e1] text-sm bg-white"
                />
                <p className="text-sm font-normal text-[#27272a] leading-6">
                  {t("liveConnect.form.rtmpUrlHint")}
                </p>
              </div>

              {/* Streaming Key */}
              <div className="flex flex-col gap-1.5 w-[450px] min-w-[144px] max-w-[450px]">
                <label className="text-sm font-medium text-[#27272a] leading-5">
                  {t("liveConnect.form.streamKey")}
                </label>
                <Input
                  type="text"
                  value={streamKey}
                  onChange={(e) => setStreamKey(e.target.value)}
                  className="w-full border-[#cbd5e1] text-sm bg-white"
                />
                <p className="text-sm font-normal text-[#27272a] leading-5">
                  {t("liveConnect.form.streamKeyHint")}
                </p>
              </div>

              {/* Full Ingest Path */}
              <div className="flex flex-col gap-1.5 w-[450px] min-w-[144px] max-w-[450px]">
                <label className="text-sm font-medium text-[#27272a] leading-5">
                  {t("liveConnect.form.fullIngestPath")}
                </label>
                <Input
                  type="text"
                  value={fullIngestPath}
                  readOnly
                  className="w-full border-[#cbd5e1] text-sm bg-white"
                />
                <p className="text-sm font-normal text-[#27272a] leading-5">
                  {t("liveConnect.form.fullIngestPathHint")} {platformData[platform].name}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-start items-center w-full">
              <div className="flex gap-6">
                <Button
                  onClick={handleSubmit}
                  className="h-10 px-4 py-2 text-sm font-medium flex items-center gap-2.5 rounded-md bg-gradient-to-b from-[#1999ee] via-[#115bca] to-[#0b3aa8] border border-[#5081ff] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] text-white hover:opacity-90"
                >
                  <Check className="w-4 h-4" />
                  {t("common.submit")}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="h-10 px-4 py-2 text-sm font-medium flex items-center gap-2.5 rounded-md bg-[rgba(255,255,255,0.33)] border border-[#ffdf20] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] text-[#27272a] hover:bg-[rgba(255,255,255,0.5)]"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t("common.reset")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
