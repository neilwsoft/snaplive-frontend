import { Eye, ThumbsUp, MessageCircle } from "lucide-react";

interface SocialStatsProps {
  views?: string;
  likes?: string;
  comments?: string;
  className?: string;
}

export function SocialStats({
  views = "0",
  likes = "0",
  comments = "0",
  className = "",
}: SocialStatsProps) {
  return (
    <div className={`flex items-center w-full ${className}`}>
      {/* Views */}
      <div className="flex-1 flex flex-col gap-2 items-center justify-center p-1 border border-[#b3bad1] rounded-tl-md rounded-bl-md min-h-[60px]">
        <div className="flex items-center gap-2">
          <Eye className="w-3 h-3 text-[#27272a]" strokeWidth={1.5} />
          <span className="text-sm font-medium text-[#27272a]">Views</span>
        </div>
        <span className="text-base font-medium text-[#27272a] text-right">
          {views}
        </span>
      </div>

      {/* Likes */}
      <div className="flex-1 flex flex-col gap-2 items-center justify-center p-1 border-t border-b border-[#b3bad1] min-h-[60px]">
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-3 h-3 text-[#27272a]" strokeWidth={1.5} />
          <span className="text-sm font-medium text-[#27272a]">Likes</span>
        </div>
        <span className="text-base font-medium text-[#27272a] text-right">
          {likes}
        </span>
      </div>

      {/* Comments */}
      <div className="flex-1 flex flex-col gap-2 items-center justify-center p-1 border border-[#b3bad1] rounded-tr-md rounded-br-md min-h-[60px]">
        <div className="flex items-center gap-2">
          <MessageCircle
            className="w-3 h-3 text-[#27272a]"
            strokeWidth={1.5}
          />
          <span className="text-sm font-medium text-[#27272a]">Comments</span>
        </div>
        <span className="text-base font-medium text-[#27272a] text-right">
          {comments}
        </span>
      </div>
    </div>
  );
}
