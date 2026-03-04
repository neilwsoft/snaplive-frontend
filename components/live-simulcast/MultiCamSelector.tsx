"use client";

import { Check, GripVertical, LayoutGrid } from "lucide-react";
import Image from "next/image";
import { useLocale } from "@/lib/locale-context";

export interface Camera {
  id: string;
  name: string;
  previewUrl: string;
  selected: boolean;
}

interface MultiCamSelectorProps {
  cameras: Camera[];
  onToggle?: (cameraId: string) => void;
  onReorder?: (cameras: Camera[]) => void;
}

export function MultiCamSelector({
  cameras,
  onToggle,
  onReorder,
}: MultiCamSelectorProps) {
  const { t } = useLocale();
  const selectedCount = cameras.filter((c) => c.selected).length;

  return (
    <div className="flex flex-col gap-3 xl:gap-4 p-3 xl:p-4 bg-white rounded-lg border border-[#e2e8f0] w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm xl:text-base font-semibold text-[#27272a]">
          {t("livestream.multiCam.title")}
        </h3>
        <div className="text-xs xl:text-sm font-medium text-[#27272a] bg-slate-100 px-2 py-0.5 rounded">
          {selectedCount}/{cameras.length}
        </div>
      </div>

      {/* Camera Grid */}
      <div className="flex flex-col gap-2 xl:gap-3">
        {cameras.map((camera) => (
          <div
            key={camera.id}
            className="relative w-full h-[80px] xl:h-[100px] bg-black rounded-lg overflow-hidden group"
          >
            {/* Camera Preview */}
            <Image
              src={camera.previewUrl}
              alt={camera.name}
              fill
              className="object-cover"
              sizes="200px"
            />

            {/* Overlay Controls */}
            <div className="absolute inset-0 flex flex-col">
              {/* Top Row - Drag, Grid, Check */}
              <div className="flex items-start justify-between p-1.5">
                <div className="w-5 h-5 bg-white/80 rounded flex items-center justify-center cursor-move">
                  <GripVertical className="w-3 h-3 text-[#27272a]" />
                </div>

                <div className="flex items-center gap-1">
                  <button className="w-5 h-5 bg-white/80 rounded flex items-center justify-center">
                    <LayoutGrid className="w-3 h-3 text-[#27272a]" />
                  </button>
                  <button
                    onClick={() => onToggle?.(camera.id)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      camera.selected
                        ? "bg-[#27c840]"
                        : "bg-white/80 hover:bg-white"
                    }`}
                  >
                    {camera.selected && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Helper Text */}
      <p className="text-[10px] xl:text-xs text-muted-foreground leading-relaxed hidden xl:block">
        {t("livestream.multiCam.helper")}
      </p>
    </div>
  );
}
