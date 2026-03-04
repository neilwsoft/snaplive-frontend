import { Switch } from "@/components/ui/switch";

interface MarketplaceConnectionProps {
  name: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  connected?: boolean;
  signalStrength?: number; // 0-5
  className?: string;
}

// Platform-specific colors
const platformColors: Record<string, string> = {
  "Douyin": "#000000",
  "Xiaohongshu/RED": "#FF2442",
  "Taobao Live": "#FF5000",
};

export function MarketplaceConnection({
  name,
  enabled,
  onToggle,
  connected = false,
  signalStrength = 0,
  className = "",
}: MarketplaceConnectionProps) {
  const bars = [6, 10, 14, 18, 22]; // heights in px
  const platformColor = platformColors[name] || "#6b7280";

  return (
    <div className={`flex items-center justify-between h-8 ${className}`}>
      {/* Toggle + Label with platform indicator */}
      <div className="flex items-center gap-3">
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-[#1c398e]"
        />
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: platformColor }}
        />
        <span className="text-sm font-medium leading-6 text-[#27272a]">
          {name}
        </span>
      </div>

      {/* Signal strength bars */}
      <div className="flex items-end justify-center gap-px w-6 h-6">
        {bars.map((height, index) => (
          <div
            key={index}
            className={`w-1 rounded-[1px] ${
              index < signalStrength ? "bg-[#94a3b8]" : "bg-[#e2e8f0]"
            }`}
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
    </div>
  );
}
