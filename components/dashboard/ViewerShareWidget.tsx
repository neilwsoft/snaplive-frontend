"use client";

import React from "react";
import { PieChart } from "@/components/charts/PieChart";

// Dummy data
const PLATFORMS = ["Douyin (抖音)", "Taobao Live (淘宝直播)", "Xiaohongshu (小红书)"];
const SHARES = [48.33, 8.53, 33.33]; // Percentages

const COLORS = [
  "rgba(239, 68, 68, 0.8)", // Red for Douyin
  "rgba(255, 165, 0, 0.8)", // Orange for Taobao
  "rgba(245, 158, 11, 0.8)", // Yellow for Xiaohongshu
];

export function ViewerShareWidget() {
  return (
    <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[18px] font-semibold leading-7 text-black">
          Marketplace Viewer Share
        </h3>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-center justify-center min-h-[250px]">
        <PieChart
          labels={PLATFORMS}
          data={SHARES}
          backgroundColor={COLORS}
          height={300}
          showPercentage={true}
        />
      </div>
    </div>
  );
}
