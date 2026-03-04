"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  useInventoryItem,
  useUpdateInventory,
  useWarehouses,
} from "@/lib/hooks/useInventory";

interface ProductFormData {
  name: string;
  nameKo: string;
  description: string;
  brandMfr: string;
  category: string;
  productLink: string;
  productId: string;
  sku: string;
  uom: string;
  shippingLength: string;
  shippingWidth: string;
  shippingHeight: string;
  shippingUom: string;
  weight: string;
  weightUom: string;
  unitCost: string;
  profitMargin: string;
  liveSalePrice: string;
  quantity: string;
  reserved: string;
  reorderPoint: string;
  criticalLevel: string;
  warehouseId: string;
  status: string;
}

type PlatformInfo = { name: string; color: string; label: string } | null;

function detectPlatform(url: string): PlatformInfo {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.includes("taobao.com") || lower.includes("tmall.com"))
    return { name: "taobao", color: "#ff6a00", label: "Taobao" };
  if (lower.includes("xiaohongshu.com") || lower.includes("xhslink.com"))
    return { name: "xiaohongshu", color: "#fe2c55", label: "Xiaohongshu" };
  if (lower.includes("douyin.com"))
    return { name: "douyin", color: "#000000", label: "Douyin" };
  if (lower.includes("jd.com"))
    return { name: "jd", color: "#e1251b", label: "JD.com" };
  if (lower.includes("pinduoduo.com"))
    return { name: "pinduoduo", color: "#f23030", label: "Pinduoduo" };
  return { name: "other", color: "#64748b", label: "External Link" };
}

export default function EditInventoryPage() {
  const router = useRouter();
  const params = useParams();
  const inventoryId = params.id as string;

  const { data: item, isLoading, error } = useInventoryItem(inventoryId);
  const { data: warehouses } = useWarehouses();
  const updateInventory = useUpdateInventory();

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    nameKo: "",
    description: "",
    brandMfr: "",
    category: "",
    productLink: "",
    productId: "",
    sku: "",
    uom: "",
    shippingLength: "",
    shippingWidth: "",
    shippingHeight: "",
    shippingUom: "",
    weight: "",
    weightUom: "",
    unitCost: "0.00",
    profitMargin: "0.0",
    liveSalePrice: "0.00",
    quantity: "0",
    reserved: "0",
    reorderPoint: "10",
    criticalLevel: "5",
    warehouseId: "",
    status: "active",
  });

  const [saving, setSaving] = useState(false);
  const [formLoaded, setFormLoaded] = useState(false);

  // Populate form when item data loads
  useEffect(() => {
    if (item && !formLoaded) {
      const unitCost = item.unit_cost || 0;
      const liveSalePrice = unitCost * 2;
      const profitMargin =
        liveSalePrice > 0
          ? ((liveSalePrice - unitCost) / liveSalePrice) * 100
          : 0;

      setFormData({
        name: item.product_name?.en || "",
        nameKo: item.product_name?.ko || "",
        description: "",
        brandMfr: "",
        category: item.category || "",
        productLink: item.product_link || "",
        productId: item.product_id || "",
        sku: item.sku || "",
        uom: "",
        shippingLength: "",
        shippingWidth: "",
        shippingHeight: "",
        shippingUom: "",
        weight: "",
        weightUom: "",
        unitCost: unitCost.toFixed(2),
        profitMargin: profitMargin.toFixed(1),
        liveSalePrice: liveSalePrice.toFixed(2),
        quantity: String(item.quantity ?? 0),
        reserved: String(item.reserved ?? 0),
        reorderPoint: String(item.reorder_point ?? 10),
        criticalLevel: String(item.critical_level ?? 5),
        warehouseId: item.warehouse_id || "",
        status: item.status || "active",
      });
      setFormLoaded(true);
    }
  }, [item, formLoaded]);

  const calculateLiveSalePrice = (cost: string, margin: string) => {
    const costNum = parseFloat(cost) || 0;
    const marginNum = parseFloat(margin) || 0;
    const price = costNum * (1 + marginNum / 100);
    return price.toFixed(2);
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };

    if (field === "unitCost" || field === "profitMargin") {
      newFormData.liveSalePrice = calculateLiveSalePrice(
        field === "unitCost" ? value : formData.unitCost,
        field === "profitMargin" ? value : formData.profitMargin
      );
    }

    setFormData(newFormData);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Product name is required");
      return;
    }

    setSaving(true);
    try {
      await updateInventory.mutateAsync({
        inventoryId,
        data: {
          product_name: {
            en: formData.name,
            ko: formData.nameKo || formData.name,
          },
          warehouse_id: formData.warehouseId || undefined,
          quantity: parseInt(formData.quantity) || 0,
          reserved: parseInt(formData.reserved) || 0,
          reorder_point: parseInt(formData.reorderPoint) || 10,
          critical_level: parseInt(formData.criticalLevel) || 5,
          unit_cost: parseFloat(formData.unitCost) || 0,
          product_link: formData.productLink || undefined,
          status: formData.status as "active" | "inactive" | "discontinued",
        },
      });

      router.push("/dashboard/inventory");
    } catch (error) {
      console.error("Failed to update product:", error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading inventory item...
          </p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-sm text-red-600">
            {error ? "Failed to load inventory item" : "Item not found"}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/inventory")}
          >
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#f8fafc] px-6 py-10">
      <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <span
              className="text-[#64748b] hover:text-[#27272a] cursor-pointer"
              onClick={() => router.push("/dashboard/inventory")}
            >
              Inventory
            </span>
            <span className="text-[#64748b]">/</span>
            <span className="text-[#27272a] font-medium">Edit Product</span>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Basic Details */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] p-6">
            <h3 className="text-base font-semibold text-[#27272a] mb-4">
              Basic Details
            </h3>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Product Name (EN)
                </Label>
                <Input
                  placeholder="Enter product name in English"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Product Name (KO)
                </Label>
                <Input
                  placeholder="한국어 제품명 입력"
                  value={formData.nameKo}
                  onChange={(e) => handleInputChange("nameKo", e.target.value)}
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Description
                </Label>
                <Textarea
                  placeholder="Enter your product's description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="bg-white border-[#cbd5e1] min-h-[100px] text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Brand/Manufacturer
                </Label>
                <Input
                  placeholder="Enter the brand/mfr of the brand/mfr."
                  value={formData.brandMfr}
                  onChange={(e) => handleInputChange("brandMfr", e.target.value)}
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger className="bg-white border-[#cbd5e1] text-slate-900">
                    <SelectValue placeholder="Select or add a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="beauty">Beauty / Cosmetics</SelectItem>
                    <SelectItem value="food">Food / Snacks</SelectItem>
                    <SelectItem value="home">Home & Living</SelectItem>
                    <SelectItem value="sports">Sports & Outdoor</SelectItem>
                    <SelectItem value="toys">Toys & Games</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Product Link
                </Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <Input
                    type="url"
                    placeholder="https://taobao.com/item/..."
                    value={formData.productLink}
                    onChange={(e) =>
                      handleInputChange("productLink", e.target.value)
                    }
                    className="bg-white border-[#cbd5e1] pl-10 pr-3 text-slate-900"
                  />
                </div>
                {(() => {
                  const platform = detectPlatform(formData.productLink);
                  if (!platform)
                    return (
                      <p className="text-xs text-[#64748b]">
                        Paste a product URL from Taobao, Xiaohongshu, Douyin,
                        JD, etc.
                      </p>
                    );
                  return (
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.label}
                      </span>
                      <a
                        href={formData.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#3b82f6] hover:underline"
                      >
                        Open link
                      </a>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger className="bg-white border-[#cbd5e1] text-slate-900">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Inventory Details */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] p-6">
            <h3 className="text-base font-semibold text-[#27272a] mb-4">
              Inventory Details
            </h3>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Warehouse
                </Label>
                <Select
                  value={formData.warehouseId}
                  onValueChange={(value) =>
                    handleInputChange("warehouseId", value)
                  }
                >
                  <SelectTrigger className="bg-white border-[#cbd5e1] text-slate-900">
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses?.map((w) => (
                      <SelectItem key={w._id} value={w._id}>
                        {w.name.en || w.name.ko}
                        {w.is_default ? " (Default)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Total Quantity
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Reserved
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.reserved}
                  onChange={(e) => handleInputChange("reserved", e.target.value)}
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Available
                </Label>
                <Input
                  type="number"
                  value={Math.max(
                    0,
                    (parseInt(formData.quantity) || 0) -
                      (parseInt(formData.reserved) || 0)
                  )}
                  readOnly
                  className="bg-[#f8fafc] border-[#cbd5e1] cursor-not-allowed text-slate-900"
                />
                <p className="text-xs text-[#64748b]">
                  Automatically calculated: Quantity - Reserved
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Reorder Point
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.reorderPoint}
                  onChange={(e) =>
                    handleInputChange("reorderPoint", e.target.value)
                  }
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
                <p className="text-xs text-[#64748b]">
                  Low stock alert triggers below this level
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Critical Level
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.criticalLevel}
                  onChange={(e) =>
                    handleInputChange("criticalLevel", e.target.value)
                  }
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
                <p className="text-xs text-[#64748b]">
                  Critical stock alert triggers below this level
                </p>
              </div>
            </div>
          </div>

          {/* Specifications & Pricing */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 row-span-2">
            <h3 className="text-base font-semibold text-[#27272a] mb-4">
              Specifications & Pricing
            </h3>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Product ID
                </Label>
                <Input
                  value={formData.productId}
                  readOnly
                  className="bg-[#f8fafc] border-[#cbd5e1] cursor-not-allowed text-slate-500"
                />
                <p className="text-xs text-[#64748b]">
                  Product ID cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Stock Keeping Unit (SKU)
                </Label>
                <Input
                  value={formData.sku}
                  readOnly
                  className="bg-[#f8fafc] border-[#cbd5e1] cursor-not-allowed text-slate-500"
                />
                <p className="text-xs text-[#64748b]">
                  SKU cannot be changed after creation
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Unit of Measurement (UOM)
                </Label>
                <Select
                  value={formData.uom}
                  onValueChange={(value) => handleInputChange("uom", value)}
                >
                  <SelectTrigger className="bg-white border-[#cbd5e1] text-slate-900">
                    <SelectValue placeholder="Select the UOM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">pcs.</SelectItem>
                    <SelectItem value="units">units</SelectItem>
                    <SelectItem value="packs">packs</SelectItem>
                    <SelectItem value="boxes">boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Shipping Dimensions
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="0.00"
                    value={formData.shippingLength}
                    onChange={(e) =>
                      handleInputChange("shippingLength", e.target.value)
                    }
                    className="bg-white border-[#cbd5e1] flex-1 text-slate-900"
                  />
                  <span className="text-sm text-[#64748b]">&times;</span>
                  <Input
                    placeholder="0.00"
                    value={formData.shippingWidth}
                    onChange={(e) =>
                      handleInputChange("shippingWidth", e.target.value)
                    }
                    className="bg-white border-[#cbd5e1] flex-1 text-slate-900"
                  />
                  <span className="text-sm text-[#64748b]">&times;</span>
                  <Input
                    placeholder="0.00"
                    value={formData.shippingHeight}
                    onChange={(e) =>
                      handleInputChange("shippingHeight", e.target.value)
                    }
                    className="bg-white border-[#cbd5e1] flex-1 text-slate-900"
                  />
                </div>
                <p className="text-xs text-[#64748b]">
                  Length &times; Width &times; Height
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Shipping UOM
                </Label>
                <Select
                  value={formData.shippingUom}
                  onValueChange={(value) =>
                    handleInputChange("shippingUom", value)
                  }
                >
                  <SelectTrigger className="bg-white border-[#cbd5e1] text-slate-900">
                    <SelectValue placeholder="Select the UOM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="inch">inch</SelectItem>
                    <SelectItem value="m">m</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Weight
                </Label>
                <Input
                  placeholder="0"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Weight UoM
                </Label>
                <Select
                  value={formData.weightUom}
                  onValueChange={(value) =>
                    handleInputChange("weightUom", value)
                  }
                >
                  <SelectTrigger className="bg-white border-[#cbd5e1] text-slate-900">
                    <SelectValue placeholder="Select the UOM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing & Stocks */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 col-span-2">
            <h3 className="text-base font-semibold text-[#27272a] mb-4">
              Pricing
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Unit Cost
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748b]">
                    CN&yen;
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={(e) =>
                      handleInputChange("unitCost", e.target.value)
                    }
                    className="bg-white border-[#cbd5e1] pl-12 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Profit Margin (%)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.profitMargin}
                    onChange={(e) =>
                      handleInputChange("profitMargin", e.target.value)
                    }
                    className="bg-white border-[#cbd5e1] pr-8 text-slate-900"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#64748b]">
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Live Sale Price
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748b]">
                    CN&yen;
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.liveSalePrice}
                    readOnly
                    className="bg-[#f8fafc] border-[#cbd5e1] pl-12 cursor-not-allowed text-slate-900"
                  />
                </div>
                <p className="text-xs text-[#64748b]">
                  Enter the Unit Cost and desired Profit Margin (%) to see the
                  suggested Live Sale Price
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/inventory")}
            disabled={saving}
            className="h-10 px-4 gap-2 bg-white border-[#cbd5e1] text-[#27272a] hover:bg-[#f8fafc]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-4 gap-2 bg-gradient-to-b from-[#1999ee] via-[#115bca] to-[#0b3aa8] border border-[#5081ff] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
