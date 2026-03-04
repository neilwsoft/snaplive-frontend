"use client";

import { useLocale } from "@/lib/locale-context";
import { Eye, ThumbsUp, MessageCircle, ChevronRight, Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import type { TopSimulcaster } from "@/lib/api/simulcasters";

interface SimulcasterRowProps {
  simulcaster: TopSimulcaster;
  onClick?: () => void;
  highlighted?: boolean;
}

export function SimulcasterRow({ simulcaster, onClick, highlighted = false }: SimulcasterRowProps) {
  const { t } = useLocale();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TableRow
      className={`cursor-pointer transition-colors ${
        highlighted
          ? "bg-gradient-to-r from-[#fffbeb] to-[#fef3c7] hover:from-[#fef3c7] hover:to-[#fde68a]"
          : "hover:bg-slate-50/80"
      }`}
      onClick={onClick}
    >
      {/* Rank */}
      <TableCell className="font-medium text-[#27272a]">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
          {simulcaster.rank}
        </div>
      </TableCell>

      {/* Simulcaster */}
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={simulcaster.avatar_url} alt={simulcaster.name} />
            <AvatarFallback className="bg-slate-200 text-slate-700">
              {getInitials(simulcaster.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#27272a]">
                {simulcaster.name}
              </span>
              {simulcaster.verified && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            <span className="text-xs text-slate-500">
              {simulcaster.session_count} {t("topSimulcasters.sessions")}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Marketplaces */}
      <TableCell>
        <div className="flex items-center gap-2">
          {simulcaster.platforms.length > 0 ? (
            simulcaster.platforms.slice(0, 3).map((platform, idx) => (
              <div
                key={idx}
                className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600 shadow-sm"
                title={platform}
              >
                {platform.slice(0, 1).toUpperCase()}
              </div>
            ))
          ) : (
            <span className="text-sm text-slate-400">-</span>
          )}
        </div>
      </TableCell>

      {/* Views */}
      <TableCell>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-slate-600" />
          <span className="font-medium text-[#27272a]">
            {formatNumber(simulcaster.total_views)}
          </span>
        </div>
      </TableCell>

      {/* Likes */}
      <TableCell>
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-4 h-4 text-slate-600" />
          <span className="font-medium text-[#27272a]">
            {formatNumber(simulcaster.total_likes)}
          </span>
        </div>
      </TableCell>

      {/* Comments */}
      <TableCell>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-slate-600" />
          <span className="font-medium text-[#27272a]">
            {formatNumber(simulcaster.total_comments)}
          </span>
        </div>
      </TableCell>

      {/* Categories */}
      <TableCell>
        <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
          {simulcaster.categories.slice(0, 3).map((category, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs px-2 py-0.5"
            >
              {category}
            </Badge>
          ))}
          {simulcaster.categories.length > 3 && (
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5"
            >
              +{simulcaster.categories.length - 3}
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Action */}
      <TableCell>
        <div className="flex items-center justify-center">
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </TableCell>
    </TableRow>
  );
}
