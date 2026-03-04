"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { MarketplaceConnectionStatus } from "./MarketplaceConnectionStatus";
import { LiveConnectForm, type LiveConnectFormData } from "./LiveConnectForm";
import type { MarketplacePlatform } from "./MarketplacePlatformTab";
import { useLocale } from "@/lib/locale-context";

interface LiveConnectPageLayoutProps {
  platform: MarketplacePlatform;
  onSubmit?: (data: LiveConnectFormData) => void | Promise<void>;
  onReset?: () => void;
}

export function LiveConnectPageLayout({
  platform,
  onSubmit,
  onReset,
}: LiveConnectPageLayoutProps) {
  const { t } = useLocale();

  const handleFormSubmit = async (data: LiveConnectFormData) => {
    await onSubmit?.(data);
  };

  const handleFormReset = () => {
    console.log("Form reset");
    onReset?.();
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full bg-[#f8fafc] px-6 py-10">
      {/* Page Header */}
      <div className="flex items-center justify-between w-full">
        <h1 className="text-[24px] font-semibold text-[#27272a] leading-[32px] tracking-[-0.6px]">
          {t("liveConnect.title")}
        </h1>

        {/* Search + Platform Status */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder={t("explore.searchPlaceholder")}
              className="w-full h-9 pl-9 pr-4 border border-slate-200 rounded-md text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>

          {/* Platform Connection Status */}
          <div className="flex items-center gap-3 h-8 px-3 py-0 border border-[#94a3b8] rounded-[6px]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 relative shrink-0">
                <Image src="/images/platforms/douyin.svg" alt="Douyin" fill className="object-contain" />
              </div>
              <MarketplaceConnectionStatus
                name=""
                connected={false}
                signalStrength={0}
              />
            </div>
            <div className="w-px h-4 bg-[#94a3b8]" />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 relative shrink-0">
                <Image src="/images/platforms/xiaohongshu.svg" alt="Xiaohongshu" fill className="object-contain" />
              </div>
              <MarketplaceConnectionStatus
                name=""
                connected={false}
                signalStrength={0}
              />
            </div>
            <div className="w-px h-4 bg-[#94a3b8]" />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 relative shrink-0">
                <Image src="/images/platforms/taobao.svg" alt="Taobao" fill className="object-contain" />
              </div>
              <MarketplaceConnectionStatus
                name=""
                connected={false}
                signalStrength={0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Instructions + Form */}
      <div className="flex gap-10 flex-1 w-full min-h-0">
        {/* Instructions Panel */}
        <div className="border border-[#b3bad1] rounded-[14px] p-6 flex flex-col gap-6 w-[380px] shrink-0 h-fit">
          <h2 className="text-[18px] font-semibold text-[#27272a] leading-[26px]">
            {t("liveConnect.rtmpInstructions.title")}
          </h2>
          <div className="text-[14px] font-normal text-[#27272a] leading-[24px]">
            <p className="mb-4">
              {t("liveConnect.rtmpInstructions.intro")}
            </p>
            <ol className="list-decimal ms-5 space-y-2">
              <li>{t("liveConnect.rtmpInstructions.step1")}</li>
              <li>{t("liveConnect.rtmpInstructions.step2")}</li>
              <li>{t("liveConnect.rtmpInstructions.step3")}</li>
              <li>{t("liveConnect.rtmpInstructions.step4")}</li>
            </ol>
          </div>
        </div>

        {/* Form Panel */}
        <div className="flex-1 min-w-0">
          <LiveConnectForm
            initialPlatform={platform}
            onSubmit={handleFormSubmit}
            onReset={handleFormReset}
          />
        </div>
      </div>
    </div>
  );
}
