"use client";

import { useLocale } from "@/lib/locale-context";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SimulcasterRow } from "./SimulcasterRow";
import type { TopSimulcaster } from "@/lib/api/simulcasters";
import { Skeleton } from "@/components/ui/skeleton";

interface SimulcastersTableProps {
  simulcasters: TopSimulcaster[];
  isLoading?: boolean;
  onRowClick?: (sellerId: string) => void;
  highlightTopRanks?: number;
}

export function SimulcastersTable({
  simulcasters,
  isLoading = false,
  onRowClick,
  highlightTopRanks = 0,
}: SimulcastersTableProps) {
  const { t } = useLocale();

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white/80 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">{t("topSimulcasters.table.rank")}</TableHead>
              <TableHead className="min-w-[200px]">{t("topSimulcasters.table.simulcaster")}</TableHead>
              <TableHead className="w-[120px]">{t("topSimulcasters.table.marketplaces")}</TableHead>
              <TableHead className="w-[100px]">{t("topSimulcasters.table.views")}</TableHead>
              <TableHead className="w-[100px]">{t("topSimulcasters.table.likes")}</TableHead>
              <TableHead className="w-[100px]">{t("topSimulcasters.table.comments")}</TableHead>
              <TableHead className="min-w-[200px]">{t("topSimulcasters.table.categories")}</TableHead>
              <TableHead className="w-[60px]">{t("topSimulcasters.table.action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <td className="p-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                </td>
                <td className="p-2">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-2">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-2">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-2">
                  <div className="flex gap-1.5">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </td>
                <td className="p-2">
                  <Skeleton className="h-5 w-5" />
                </td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (simulcasters.length === 0) {
    return (
      <div className="rounded-lg border bg-white/80 backdrop-blur-sm p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-slate-100 p-6 mb-4">
            <svg
              className="h-12 w-12 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#27272a] mb-2">
            {t("topSimulcasters.empty.title")}
          </h3>
          <p className="text-sm text-slate-500 max-w-md">
            {t("topSimulcasters.empty.description")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white/80 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">{t("topSimulcasters.table.rank")}</TableHead>
            <TableHead className="min-w-[200px]">{t("topSimulcasters.table.simulcaster")}</TableHead>
            <TableHead className="w-[120px]">{t("topSimulcasters.table.marketplaces")}</TableHead>
            <TableHead className="w-[100px]">{t("topSimulcasters.table.views")}</TableHead>
            <TableHead className="w-[100px]">{t("topSimulcasters.table.likes")}</TableHead>
            <TableHead className="w-[100px]">{t("topSimulcasters.table.comments")}</TableHead>
            <TableHead className="min-w-[200px]">{t("topSimulcasters.table.categories")}</TableHead>
            <TableHead className="w-[60px]">{t("topSimulcasters.table.action")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {simulcasters.map((simulcaster) => (
            <SimulcasterRow
              key={simulcaster.seller_id}
              simulcaster={simulcaster}
              onClick={() => onRowClick?.(simulcaster.seller_id)}
              highlighted={highlightTopRanks > 0 && simulcaster.rank <= highlightTopRanks}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
