import { Play, Video } from "lucide-react";
import { SocialStats } from "./SocialStats";
import Image from "next/image";

export interface Simulcast {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  quality: string;
  views: string;
  likes: string;
  comments: string;
  thumbnailUrl: string;
  isLive: boolean;
  category?: string;
  platforms?: string[];
}

interface SimulcastCardProps {
  simulcast: Simulcast;
  onClick?: () => void;
  isGuest?: boolean;
}

// Check if URL is valid (not empty, not placeholder)
function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  if (url.trim() === '') return false;
  if (url === '/placeholder.jpg' || url === '/placeholder.png') return false;
  return true;
}

export function SimulcastCard({ simulcast, onClick, isGuest = false }: SimulcastCardProps) {
  const hasValidThumbnail = isValidImageUrl(simulcast.thumbnailUrl);

  return (
    <div className="flex flex-col gap-4 w-[338px] group cursor-pointer" onClick={onClick}>
      {/* Video Thumbnail */}
      <div className="relative w-full h-[220px] rounded-[11px] overflow-hidden">
        {hasValidThumbnail ? (
          <Image
            src={simulcast.thumbnailUrl}
            alt={simulcast.title}
            fill
            className="object-cover"
            sizes="338px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
            <Video className="w-16 h-16 text-zinc-400" />
          </div>
        )}

        {/* Watch Simulcast Button (Guest mode) or Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isGuest ? (
            <div className="bg-[#e7000b] rounded-2xl px-4 py-2 flex items-center gap-2 shadow-md group-hover:scale-105 transition-transform">
              <Play className="w-4 h-4 text-white fill-white" />
              <span className="text-sm font-medium text-white">Join Live Simulcast</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-[#e7000b] rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Live Badge */}
        {simulcast.isLive && (
          <div className="absolute top-2 right-2 bg-[#e7000b] px-1.5 py-0.5 rounded shadow-md">
            <span className="text-xs font-medium text-white leading-5">
              LIVE
            </span>
          </div>
        )}
      </div>

      {/* Category and Platforms (if provided) */}
      {(simulcast.category || simulcast.platforms) && (
        <div className="flex items-center justify-between gap-2">
          {simulcast.category && (
            <div className="border border-zinc-800 rounded px-1.5 py-0.5">
              <span className="text-xs font-medium text-zinc-800 capitalize">
                {simulcast.category}
              </span>
            </div>
          )}
          {simulcast.platforms && simulcast.platforms.length > 0 && (
            <div className="flex items-center gap-1.5">
              {simulcast.platforms.map((platform) => (
                <div
                  key={platform}
                  className="w-6 h-6 relative rounded shadow-sm overflow-hidden"
                >
                  <Image
                    src={`/images/platforms/${platform}.svg`}
                    alt={platform}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col w-full">
        {/* Date, Time, and Duration */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 text-sm text-[#27272a]">
            <span className="font-normal">{simulcast.date}</span>
            <span className="font-normal">{simulcast.time}</span>
          </div>
          <div className="text-sm text-[#27272a] font-normal">
            {simulcast.duration}
          </div>
        </div>

        {/* Title and Quality */}
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-[#27272a] truncate flex-1">
            {simulcast.title}
          </h3>
          <span className="text-lg font-semibold text-[#27272a] ml-4">
            {simulcast.quality}
          </span>
        </div>
      </div>

      {/* Social Stats */}
      <SocialStats
        views={simulcast.views}
        likes={simulcast.likes}
        comments={simulcast.comments}
      />
    </div>
  );
}
