"use client";

import React, { useState } from "react";
import { ArrowRight, MoreHorizontal, User, Loader2 } from "lucide-react";
import { TablePagination } from "./TablePagination";
import { useOrdersRaw } from "@/lib/hooks/useOrders";
import { OrderStatus as BackendOrderStatus, type BackendOrder } from "@/lib/api/orders";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocale } from "@/lib/locale-context";

type DisplayStatus = "new" | "ready" | "processing" | "returned";

// Map backend status to display status
function mapOrderStatus(backendStatus: BackendOrderStatus): DisplayStatus {
  switch (backendStatus) {
    case BackendOrderStatus.PENDING:
      return "new";
    case BackendOrderStatus.READY:
      return "ready";
    case BackendOrderStatus.SHOPPING:
    case BackendOrderStatus.SHIPPED:
      return "processing";
    case BackendOrderStatus.RETURNING:
    case BackendOrderStatus.RETURN:
      return "returned";
    default:
      return "new";
  }
}

const StatusBadge = ({ status, t }: { status: DisplayStatus; t: (key: string) => string }) => {
  const statusConfig = {
    new: { labelKey: "common.new", dotColor: "bg-[#b3bad1]" },
    ready: { labelKey: "orders.status.ready", dotColor: "bg-[#ff8904]" },
    processing: { labelKey: "orders.status.processing", dotColor: "bg-blue-500" },
    returned: { labelKey: "logistics.status.returned", dotColor: "bg-yellow-500" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${config.dotColor}`} />
      <span className="text-[14px] font-normal leading-6 text-[#27272a]">
        {t(config.labelKey)}
      </span>
    </div>
  );
};

export function LatestOrdersWidget() {
  const { t } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data, isLoading, error } = useOrdersRaw({
    page: currentPage,
    page_size: itemsPerPage,
  });

  if (isLoading) {
    return (
      <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{t("orders.loading")}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 items-center justify-center min-h-[400px]">
        <span className="text-sm text-red-500">{t("orders.failed")}</span>
      </div>
    );
  }

  const orders = data.orders;
  const totalPages = Math.ceil(data.total / data.page_size);

  if (orders.length === 0) {
    return (
      <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 items-center justify-center min-h-[400px]">
        <span className="text-sm text-muted-foreground">{t("orders.noOrders")}</span>
        <span className="text-xs text-muted-foreground">{t("orders.noOrdersDesc")}</span>
      </div>
    );
  }

  // Format order date
  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '年').replace(/\//, '月') + '日';
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${dateStr}\n${timeStr}`;
  };

  return (
    <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="text-[18px] font-semibold leading-7 text-black">
            {t("dashboard.widgets.latestOrders")}
          </h3>
          <p className="text-[14px] font-normal leading-6 text-black">
            {data.total.toLocaleString()} {t("common.total").toLowerCase()} {t("navigation.orders").toLowerCase()}
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
      <div className="flex flex-col gap-4">
        {/* Table Header */}
        <div className="flex items-center justify-between pl-2 pr-0">
          <div className="flex items-center px-2 w-[144px]">
            <span className="text-[12px] font-normal leading-6 text-[#27272a]">
              {t("orders.table.orderId")}
            </span>
          </div>
          <div className="flex items-center px-2 w-[144px]">
            <span className="text-[12px] font-normal leading-6 text-[#27272a]">
              {t("orders.table.buyer")}
            </span>
          </div>
          <div className="flex items-center px-2 w-[160px]">
            <span className="text-[12px] font-normal leading-6 text-[#27272a]">
              {t("orders.detail.totalAmount")}
            </span>
          </div>
          <div className="flex items-center px-2 w-[160px]">
            <span className="text-[12px] font-normal leading-6 text-[#27272a]">
              {t("orders.detail.orderDate")}
            </span>
          </div>
          <div className="flex items-center px-2 w-[120px]">
            <span className="text-[12px] font-normal leading-6 text-[#27272a]">
              {t("orders.table.status")}
            </span>
          </div>
          <div className="w-16" />
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {orders.map((order: BackendOrder, index: number) => (
            <div
              key={order.id}
              className={`flex items-center justify-between h-16 pl-2 pr-0 py-1 rounded-[7px] ${
                index % 2 === 0 ? "bg-[rgba(241,245,249,0.33)]" : ""
              }`}
            >
              <div className="flex items-center px-2 w-[144px]">
                <span className="text-[14px] font-normal leading-6 text-[#27272a] overflow-ellipsis overflow-hidden whitespace-nowrap">
                  {order.order_number}
                </span>
              </div>
              <div className="flex items-center gap-2 px-2 w-[144px]">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={order.buyer_avatar_url || undefined} />
                  <AvatarFallback className="bg-gray-200">
                    <User className="w-4 h-4 text-gray-500" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-[14px] font-normal leading-6 text-[#27272a] overflow-ellipsis overflow-hidden whitespace-nowrap">
                  {order.buyer_name}
                </span>
              </div>
              <div className="flex items-center px-2 w-[160px]">
                <span className="text-[14px] font-normal leading-6 text-[#27272a] overflow-ellipsis overflow-hidden whitespace-nowrap">
                  {order.currency} {order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center px-2 w-[160px]">
                <span className="text-[14px] font-normal leading-6 text-[#27272a] whitespace-pre-line">
                  {formatOrderDate(order.created_at)}
                </span>
              </div>
              <div className="flex items-center px-2 w-[120px]">
                <StatusBadge status={mapOrderStatus(order.status)} t={t} />
              </div>
              <div className="flex items-center justify-center w-16">
                <button className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded">
                  <MoreHorizontal className="w-6 h-6 text-[#27272a]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Pagination */}
        <div className="flex items-center justify-end gap-10">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
