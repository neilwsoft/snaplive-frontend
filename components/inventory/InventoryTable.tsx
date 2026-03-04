"use client";

import { useState } from "react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types/inventory";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { Pencil, ArrowUpDown } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

interface InventoryTableProps {
  products: Product[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onEdit: (id: string) => void;
}

export function InventoryTable({
  products,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onEdit,
}: InventoryTableProps) {
  const { t } = useLocale();
  const allSelected = products.length > 0 && selectedIds.length === products.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < products.length;

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg border border-[#e2e8f0]">
      <table className="w-full">
        <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
          <tr>
            <th className="w-12 px-4 py-3 text-left">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                aria-label={t("inventory.table.selectAll")}
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("inventory.table.image")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              <div className="flex items-center gap-1">
                {t("inventory.table.productName")}
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              <div className="flex items-center gap-1">
                {t("inventory.table.productId")}
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("inventory.table.sku")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("inventory.table.brandMfr")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("inventory.table.category")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("inventory.table.stocks")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("inventory.table.liveSalePrice")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("inventory.table.unitCost")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("inventory.table.profitMargin")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("inventory.table.sales")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              {t("inventory.table.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr
              key={product.id}
              className={`border-b border-[#e2e8f0] hover:bg-[#f8fafc] ${
                index % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
              }`}
            >
              <td className="px-4 py-3">
                <Checkbox
                  checked={selectedIds.includes(product.id)}
                  onCheckedChange={(checked) =>
                    onSelectOne(product.id, checked as boolean)
                  }
                  aria-label={`Select ${product.name}`}
                />
              </td>
              <td className="px-4 py-3">
                <div className="relative w-12 h-12 rounded overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-[#27272a] font-medium">
                    {product.name}
                  </span>
                  {product.status && product.status.length > 0 && (
                    <div className="flex gap-1">
                      {product.status.map((status) => (
                        <ProductStatusBadge key={status} status={status} />
                      ))}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-[#27272a]">
                {product.productId}
              </td>
              <td className="px-4 py-3 text-sm text-[#27272a]">{product.sku}</td>
              <td className="px-4 py-3 text-sm text-[#27272a]">
                {product.brandMfr}
              </td>
              <td className="px-4 py-3 text-sm text-[#27272a]">
                {product.category}
              </td>
              <td className="px-4 py-3 text-sm text-[#27272a]">
                {product.stocks} {product.stockUnit || "pcs."}
              </td>
              <td className="px-4 py-3 text-sm text-[#27272a]">
                CN¥ {product.liveSalePrice.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-[#27272a]">
                CN¥ {product.unitCost.toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      product.profitMargin >= 60
                        ? "text-green-600"
                        : product.profitMargin >= 40
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {product.profitMargin.toFixed(1)}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-[#27272a]">
                {product.sales}
              </td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(product.id)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4 text-[#64748b]" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && (
        <div className="py-12 text-center text-sm text-[#94a3b8]">
          {t("inventory.noProductsFound")}
        </div>
      )}
    </div>
  );
}
