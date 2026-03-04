"use client";

interface MarketplaceConnectionStatusProps {
  name: string;
  connected: boolean;
  signalStrength?: number; // 0-5
  className?: string;
}

export function MarketplaceConnectionStatus({
  name,
  connected,
  signalStrength = 0,
  className = "",
}: MarketplaceConnectionStatusProps) {
  return (
    <div className={`flex items-center gap-4 h-7 ${className}`}>
      {/* Label with connection indicator */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center p-0.5 w-6 h-6">
          <div
            className={`w-4 h-4 rounded-full ${
              connected ? "bg-[#27c840]" : "bg-[#94a3b8]"
            }`}
          />
        </div>
        <p className="text-[14px] font-medium text-[#27272a] leading-[24px]">
          {name}
        </p>
      </div>

      {/* Signal strength bars */}
      <div className="flex items-end justify-center gap-[1px] w-6 h-6">
        <div
          className={`w-1 h-1.5 rounded-[1px] ${
            signalStrength >= 1 ? "bg-[#27c840]" : "bg-[#94a3b8]"
          }`}
        />
        <div
          className={`w-1 h-2.5 rounded-[1px] ${
            signalStrength >= 2 ? "bg-[#27c840]" : "bg-[#94a3b8]"
          }`}
        />
        <div
          className={`w-1 h-3.5 rounded-[1px] ${
            signalStrength >= 3 ? "bg-[#27c840]" : "bg-[#94a3b8]"
          }`}
        />
        <div
          className={`w-1 h-[18px] rounded-[1px] ${
            signalStrength >= 4 ? "bg-[#27c840]" : "bg-[#94a3b8]"
          }`}
        />
        <div
          className={`w-1 h-[22px] rounded-[1px] ${
            signalStrength >= 5 ? "bg-[#27c840]" : "bg-[#94a3b8]"
          }`}
        />
      </div>
    </div>
  );
}
