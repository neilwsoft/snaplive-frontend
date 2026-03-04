"use client";

import React from "react";

interface PlatformStatus {
  name: string;
  connected: boolean;
  signal: number; // 1-5
}

interface PlatformStatusBarProps {
  platforms: PlatformStatus[];
}

const SignalBars = ({ strength }: { strength: number }) => {
  const bars = [6, 10, 14, 18, 22]; // heights in px

  return (
    <div className="flex items-end justify-center gap-[1px] h-6 w-6">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`w-1 rounded-[1px] ${
            index < strength ? "bg-[#94a3b8]" : "bg-gray-300"
          }`}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
};

const ConnectionIndicator = ({ connected }: { connected: boolean }) => {
  return (
    <div className="flex items-center justify-center p-[2px] w-6 h-6">
      <div
        className={`w-4 h-4 rounded-full ${
          connected ? "bg-[#27c840]" : "bg-gray-400"
        }`}
      />
    </div>
  );
};

export function PlatformStatusBar({ platforms }: PlatformStatusBarProps) {
  return (
    <div className="flex items-center gap-6 border border-[#94a3b8] rounded-[6px] px-2 py-0 h-8">
      {platforms.map((platform, index) => (
        <React.Fragment key={platform.name}>
          <div className="flex items-center gap-4 h-7">
            <div className="flex items-center gap-2">
              <ConnectionIndicator connected={platform.connected} />
              <p className="text-[14px] font-medium leading-6 text-[#27272a]">
                {platform.name}
              </p>
            </div>
            <SignalBars strength={platform.signal} />
          </div>
          {index < platforms.length - 1 && (
            <div className="w-0 h-5 flex items-center justify-center">
              <div className="w-5 h-0 border-t border-gray-300 rotate-90" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
