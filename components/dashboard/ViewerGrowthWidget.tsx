"use client";

import React from "react";
import { BarChart } from "@/components/charts/BarChart";

// Dummy data
const MONTHS = ["Mar", "Apr", "May", "Jun", "Jul"];
const DOUYIN_DATA = [50000, 65000, 80000, 95000, 122000];
const TAOBAO_DATA = [15000, 18000, 22000, 28000, 35000];
const XIAOHONGSHU_DATA = [35000, 42000, 55000, 70000, 88000];

const COLORS = {
  douyin: {
    bg: "rgba(239, 68, 68, 0.7)",
    border: "rgb(239, 68, 68)",
  },
  taobao: {
    bg: "rgba(255, 165, 0, 0.7)",
    border: "rgb(255, 165, 0)",
  },
  xiaohongshu: {
    bg: "rgba(245, 158, 11, 0.7)",
    border: "rgb(245, 158, 11)",
  },
};

export function ViewerGrowthWidget() {
  return (
    <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[18px] font-semibold leading-7 text-black">
          Marketplace Viewer Growth Over the Past Months
        </h3>
        <p className="text-[14px] font-normal leading-6 text-black">
          Douyin topped and increased by 122.3% from last month 2025
        </p>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[200px]">
        <BarChart
          labels={MONTHS}
          datasets={[
            {
              label: "Douyin (抖音)",
              data: DOUYIN_DATA,
              backgroundColor: COLORS.douyin.bg,
              borderColor: COLORS.douyin.border,
              borderWidth: 1,
            },
            {
              label: "Taobao Live (淘宝直播)",
              data: TAOBAO_DATA,
              backgroundColor: COLORS.taobao.bg,
              borderColor: COLORS.taobao.border,
              borderWidth: 1,
            },
            {
              label: "Xiaohongshu (小红书)",
              data: XIAOHONGSHU_DATA,
              backgroundColor: COLORS.xiaohongshu.bg,
              borderColor: COLORS.xiaohongshu.border,
              borderWidth: 1,
            },
          ]}
          height={250}
        />
      </div>
    </div>
  );
}
