"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ReportFilters, ReportTopic } from "@/lib/types/statistics";
import { RotateCcw } from "lucide-react";

interface GenerateReportSidebarProps {
  onGenerate: (filters: ReportFilters) => void;
  onReset: () => void;
}

const topicOptions: { value: ReportTopic; label: string }[] = [
  { value: "connectivity_reliability", label: "Connectivity-Reliability Rate" },
  { value: "avg_latency", label: "Average Latency" },
  { value: "stream_quality", label: "Stream Quality" },
  { value: "viewer_engagement", label: "Viewer Engagement" },
  { value: "revenue_analytics", label: "Revenue Analytics" },
  { value: "technical_errors", label: "Technical Errors" },
];

export function GenerateReportSidebar({
  onGenerate,
  onReset,
}: GenerateReportSidebarProps) {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const [platforms, setPlatforms] = useState({
    douyin: true,
    xiaohongshu: true,
    taobao: true,
  });

  const [selectedTopics, setSelectedTopics] = useState<ReportTopic[]>([
    "connectivity_reliability",
    "avg_latency",
  ]);

  const handlePlatformToggle = (platform: keyof typeof platforms) => {
    setPlatforms((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const handleTopicToggle = (topic: ReportTopic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleReset = () => {
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setPlatforms({
      douyin: true,
      xiaohongshu: true,
      taobao: true,
    });
    setSelectedTopics(["connectivity_reliability", "avg_latency"]);
    onReset();
  };

  const handleGenerate = () => {
    const filters: ReportFilters = {
      dateTimeRange: {
        startDate,
        startTime,
        endDate,
        endTime,
      },
      platforms,
      topics: selectedTopics,
    };
    onGenerate(filters);
  };

  return (
    <div className="w-80 bg-white border-r border-[#e2e8f0] h-full overflow-y-auto">
      <div className="p-6 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold text-[#27272a] mb-1">
            Generate Report
          </h2>
          <p className="text-sm text-[#64748b]">生成报告</p>
        </div>

        {/* Date & Time Range */}
        <div className="flex flex-col gap-4">
          <div>
            <Label
              htmlFor="start-date"
              className="text-sm font-medium text-[#27272a] mb-2 block"
            >
              Date & Time Range
            </Label>
            <p className="text-xs text-[#64748b] mb-3">日期和时间范围</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="start-date" className="text-xs text-[#64748b]">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-sm mt-1"
                />
              </div>
              <div className="w-24">
                <Label htmlFor="start-time" className="text-xs text-[#64748b]">
                  Time
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-9 text-sm mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="end-date" className="text-xs text-[#64748b]">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-sm mt-1"
                />
              </div>
              <div className="w-24">
                <Label htmlFor="end-time" className="text-xs text-[#64748b]">
                  Time
                </Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-9 text-sm mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Marketplace Platforms */}
        <div className="flex flex-col gap-3">
          <div>
            <Label className="text-sm font-medium text-[#27272a]">
              Marketplace Platforms
            </Label>
            <p className="text-xs text-[#64748b] mt-1">市场平台</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="platform-douyin"
                checked={platforms.douyin}
                onCheckedChange={() => handlePlatformToggle("douyin")}
              />
              <Label
                htmlFor="platform-douyin"
                className="text-sm text-[#27272a] cursor-pointer"
              >
                Douyin 抖音
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="platform-xiaohongshu"
                checked={platforms.xiaohongshu}
                onCheckedChange={() => handlePlatformToggle("xiaohongshu")}
              />
              <Label
                htmlFor="platform-xiaohongshu"
                className="text-sm text-[#27272a] cursor-pointer"
              >
                Xiaohongshu 小红书
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="platform-taobao"
                checked={platforms.taobao}
                onCheckedChange={() => handlePlatformToggle("taobao")}
              />
              <Label
                htmlFor="platform-taobao"
                className="text-sm text-[#27272a] cursor-pointer"
              >
                Taobao Live 淘宝直播
              </Label>
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className="flex flex-col gap-3">
          <div>
            <Label className="text-sm font-medium text-[#27272a]">Topics</Label>
            <p className="text-xs text-[#64748b] mt-1">主题</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {topicOptions.map((topic) => (
              <div key={topic.value} className="flex items-center gap-2">
                <Checkbox
                  id={`topic-${topic.value}`}
                  checked={selectedTopics.includes(topic.value)}
                  onCheckedChange={() => handleTopicToggle(topic.value)}
                />
                <Label
                  htmlFor={`topic-${topic.value}`}
                  className="text-sm text-[#27272a] cursor-pointer"
                >
                  {topic.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[#e2e8f0]">
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full h-10 gap-2 bg-white border-[#cbd5e1] text-[#27272a] hover:bg-[#f8fafc]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={handleGenerate}
            className="w-full h-10 bg-gradient-to-b from-[#1999ee] via-[#115bca] to-[#0b3aa8] border border-[#5081ff] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] text-white hover:opacity-90"
          >
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
}
