"use client";

import React, { useState } from "react";
import { ArrowRight, MoreHorizontal, ChevronDown, ChevronUp, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { TablePagination } from "./TablePagination";
import { Badge } from "@/components/ui/badge";
import { useStockAlerts } from "@/lib/hooks/useInventory";
import { useLocale } from "@/lib/locale-context";
import type { StockAlert } from "@/lib/api/inventory";

type AlertType = "low" | "critical";

const ProductTags = ({ alertType }: { alertType: AlertType }) => {
  return (
    <div className="absolute top-2 right-2 flex gap-1">
      {alertType === "critical" && (
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">CRITICAL</Badge>
      )}
      {alertType === "low" && (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-800 border-yellow-300">LOW</Badge>
      )}
    </div>
  );
};

const SortIcon = () => {
  return (
    <div className="flex flex-col w-3 h-3">
      <ChevronUp className="w-3 h-[6px] text-[#27272a]" strokeWidth={2} />
      <ChevronDown className="w-3 h-[6px] text-[#27272a]" strokeWidth={2} />
    </div>
  );
};

export function LowStockWidget() {
  const { t } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch unacknowledged stock alerts
  const { data, isLoading, error } = useStockAlerts({ acknowledged: false });

  if (isLoading) {
    return (
      <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{t("common.loading")}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 items-center justify-center min-h-[400px]">
        <span className="text-sm text-red-500">{t("errors.loadFailed")}</span>
      </div>
    );
  }

  const alerts = data.items || [];

  // Client-side pagination since the alerts API doesn't support pagination
  const totalPages = Math.ceil(alerts.length / itemsPerPage);
  const paginatedAlerts = alerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (alerts.length === 0) {
    return (
      <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <h3 className="text-[18px] font-semibold leading-7 text-black">
              {t("dashboard.widgets.lowStock")}
            </h3>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <CheckCircle className="w-12 h-12 mb-2 text-green-500" />
          <span className="text-sm">{t("inventory.status.inStock")}</span>
        </div>
      </div>
    );
  }

  // Map alert type to display format
  const getAlertType = (alert: StockAlert): AlertType => {
    return alert.alert_type === 'critical_stock' ? 'critical' : 'low';
  };

  return (
    <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="text-[18px] font-semibold leading-7 text-black">
            {t("dashboard.widgets.lowStock")}
          </h3>
          <p className="text-[14px] font-normal leading-6 text-black">
            {alerts.length} {t("common.items")}
          </p>
        </div>
        <button className="flex items-center gap-2 px-2 py-1 rounded-[6px] hover:bg-gray-50">
          <span className="text-[14px] font-medium leading-6 text-[#27272a]">
            {t("common.seeAll")}
          </span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Table */}
      <div className="flex flex-col flex-1 gap-4 min-h-0">
        {/* Table Header */}
        <div className="flex items-center justify-between pl-2 pr-0">
          <div className="flex items-center justify-between px-2 w-[248px]">
            <span className="text-[12px] font-normal leading-6 text-[#27272a]">
              {t("inventory.table.productName")}
            </span>
            <SortIcon />
          </div>
          <div className="flex items-center justify-between px-2 w-[112px]">
            <span className="text-[12px] font-normal leading-6 text-[#27272a]">
              {t("inventory.table.stocks")}
            </span>
            <SortIcon />
          </div>
          <div className="w-16" />
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {paginatedAlerts.map((alert, index) => {
            const alertType = getAlertType(alert);
            const productName = alert.product_name.en || alert.product_name.ko || 'Unknown Product';

            return (
              <div
                key={alert._id}
                className={`relative flex items-center justify-between h-16 pl-2 pr-0 py-1 rounded-[7px] ${
                  index % 2 === 0 ? "bg-[rgba(241,245,249,0.33)]" : ""
                }`}
              >
                <div className="flex items-center gap-2 px-2 w-[248px] relative">
                  <span className="text-[14px] font-normal leading-6 text-[#27272a] overflow-ellipsis overflow-hidden whitespace-nowrap pr-16">
                    {productName}
                  </span>
                  <ProductTags alertType={alertType} />
                </div>
                <div className="flex items-center px-2 w-[112px]">
                  <span className={`text-[14px] font-normal leading-6 overflow-ellipsis overflow-hidden whitespace-nowrap ${
                    alertType === 'critical' ? 'text-red-600 font-medium' : 'text-[#27272a]'
                  }`}>
                    {alert.current_level} pcs
                  </span>
                </div>
                <div className="flex items-center justify-center w-16">
                  <button className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded">
                    <MoreHorizontal className="w-6 h-6 text-[#27272a]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-10">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
