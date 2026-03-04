"use client";

import { Upload } from "lucide-react";
import Image from "next/image";
import { useLocale } from "@/lib/locale-context";

interface LogoUpload {
  type: "landscape" | "boxed";
  label: string;
  helperText: string;
  imageUrl?: string;
}

interface BrandSetupPanelProps {
  landscapeLogo?: string;
  boxedLogo?: string;
  onUploadLandscape?: (file: File) => void;
  onUploadBoxed?: (file: File) => void;
}

export function BrandSetupPanel({
  landscapeLogo,
  boxedLogo,
  onUploadLandscape,
  onUploadBoxed,
}: BrandSetupPanelProps) {
  const { t } = useLocale();

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "landscape" | "boxed"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "landscape") {
        onUploadLandscape?.(file);
      } else {
        onUploadBoxed?.(file);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg border border-[#e2e8f0]">
      <h3 className="text-sm xl:text-base font-semibold text-[#27272a]">{t("livestream.branding.title")}</h3>

      {/* Logo Uploads - Side by side on larger screens */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Upload Landscape Logo */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs xl:text-sm font-medium text-[#27272a]">
            {t("livestream.branding.uploadLandscape")}
          </label>
          <div className="relative w-full h-[80px] xl:h-[90px] bg-white border-2 border-dashed border-[#cad5e2] rounded-lg flex flex-col items-center justify-center overflow-hidden">
            {landscapeLogo ? (
              <div className="relative w-full h-full">
                <Image
                  src={landscapeLogo}
                  alt={t("livestream.branding.landscapeLogo")}
                  fill
                  className="object-contain p-2"
                  sizes="280px"
                />
                <label
                  htmlFor="landscape-upload"
                  className="absolute inset-0 bg-black/0 hover:bg-black/10 cursor-pointer flex items-center justify-center transition-colors"
                >
                  <div className="opacity-0 hover:opacity-100 transition-opacity">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                </label>
              </div>
            ) : (
              <label
                htmlFor="landscape-upload"
                className="flex flex-col items-center gap-1 cursor-pointer"
              >
                <Upload className="w-5 h-5 text-[#cad5e2]" />
                <span className="text-xs text-[#27272a]">{t("livestream.branding.upload")}</span>
              </label>
            )}
            <input
              id="landscape-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, "landscape")}
            />
          </div>
          <p className="text-[10px] xl:text-xs text-muted-foreground">
            {t("livestream.branding.landscapeSize")}
          </p>
        </div>

        {/* Upload Boxed Logo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs xl:text-sm font-medium text-[#27272a]">
            {t("livestream.branding.uploadBoxed")}
          </label>
          <div className="relative w-[80px] xl:w-[90px] h-[80px] xl:h-[90px] bg-white border-2 border-dashed border-[#cad5e2] rounded-md flex flex-col items-center justify-center overflow-hidden">
            {boxedLogo ? (
              <div className="relative w-full h-full">
                <Image
                  src={boxedLogo}
                  alt={t("livestream.branding.boxedLogo")}
                  fill
                  className="object-contain p-2"
                  sizes="90px"
                />
                <label
                  htmlFor="boxed-upload"
                  className="absolute inset-0 bg-black/0 hover:bg-black/10 cursor-pointer flex items-center justify-center transition-colors"
                >
                  <div className="opacity-0 hover:opacity-100 transition-opacity">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                </label>
              </div>
            ) : (
              <label
                htmlFor="boxed-upload"
                className="flex flex-col items-center gap-1 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#cad5e2]" />
                <span className="text-[10px] text-[#27272a]">{t("livestream.branding.upload")}</span>
              </label>
            )}
            <input
              id="boxed-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, "boxed")}
            />
          </div>
          <p className="text-[10px] xl:text-xs text-muted-foreground">
            {t("livestream.branding.boxedSize")}
          </p>
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-[10px] xl:text-xs text-muted-foreground leading-relaxed hidden xl:block">
        {t("livestream.branding.brandLogoHelper")}
      </p>
    </div>
  );
}
