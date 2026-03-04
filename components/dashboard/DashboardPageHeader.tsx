"use client";

import React from "react";
import { PlatformStatusBar } from "./PlatformStatusBar";
import { LanguageSwitcher } from "@/components/language-switcher";

interface DashboardPageHeaderProps {
  title: string;
  subtitle?: string;
}

// Dummy platform data
const DUMMY_PLATFORMS = [
  { name: "Douyin", connected: true, signal: 5 },
  { name: "Xiaohongshu/RED", connected: true, signal: 4 },
  { name: "Taobao Live", connected: true, signal: 5 },
];

export function DashboardPageHeader({
  title,
  subtitle,
}: DashboardPageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 px-6 py-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] font-semibold leading-8 tracking-tight text-[#27272a]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[14px] font-normal leading-6 text-[#b3bad1]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
