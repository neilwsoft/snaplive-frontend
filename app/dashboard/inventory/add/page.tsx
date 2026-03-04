"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ChevronLeft, RotateCcw, Upload, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useCreateInventory, useWarehouses } from "@/lib/hooks/useInventory";

interface ProductFormData {
  name: string;
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
  availableStocks: string;
  images: File[];
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

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
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
    availableStocks: "0",
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch warehouses and use default one
  const { data: warehouses } = useWarehouses();
  const createInventory = useCreateInventory();

  // Calculate live sale price based on unit cost and profit margin
  const calculateLiveSalePrice = (cost: string, margin: string) => {
    const costNum = parseFloat(cost) || 0;
    const marginNum = parseFloat(margin) || 0;
    const price = costNum * (1 + marginNum / 100);
    return price.toFixed(2);
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };

    // Auto-calculate live sale price when cost or margin changes
    if (field === "unitCost" || field === "profitMargin") {
      newFormData.liveSalePrice = calculateLiveSalePrice(
        field === "unitCost" ? value : formData.unitCost,
        field === "profitMargin" ? value : formData.profitMargin
      );
    }

    setFormData(newFormData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (formData.images.length + files.length > 3) {
      toast.error("Maximum 3 images allowed per product");
      return;
    }

    // Validate file size and dimensions
    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 2MB limit`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          if (img.width < 144 || img.height < 144) {
            toast.error(`${file.name} must be at least 144x144px`);
            return;
          }

          setImagePreviews((prev) => [...prev, event.target?.result as string]);
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, file],
          }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleReset = () => {
    setFormData({
      name: "",
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
      availableStocks: "0",
      images: [],
    });
    setImagePreviews([]);
    toast.success("Form reset");
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name || !formData.productId || !formData.sku) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Get default warehouse or first warehouse
    const defaultWarehouse = warehouses?.find((w) => w.is_default) || warehouses?.[0];
    if (!defaultWarehouse) {
      toast.error("No warehouse available. Please create a warehouse first.");
      return;
    }

    setSaving(true);
    try {
      // Create inventory item via API
      await createInventory.mutateAsync({
        product_id: formData.productId,
        product_name: {
          en: formData.name,
          ko: formData.name, // Using same name for both languages for now
        },
        warehouse_id: defaultWarehouse._id,
        quantity: parseInt(formData.availableStocks) || 0,
        reserved: 0,
        reorder_point: 10, // Default reorder point
        critical_level: 5, // Default critical level
        sku: formData.sku,
        unit_cost: parseFloat(formData.unitCost) || 0,
        product_link: formData.productLink || undefined,
        status: "active",
      });

      toast.success("Product added successfully");
      router.push("/dashboard/inventory");
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error("Failed to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
            <span className="text-[#27272a] font-medium">Product Registry</span>
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
                  Product Name
                </Label>
                <Input
                  placeholder="Enter your product's name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
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
                    <SelectItem value="cosmetics">Cosmetics / Lip Products</SelectItem>
                    <SelectItem value="apparel">Apparel / Women's Tops</SelectItem>
                    <SelectItem value="electronics">Electronics / Audio Equipment</SelectItem>
                    <SelectItem value="food">Food / Snacks</SelectItem>
                    <SelectItem value="home">Home & Living / Aromatherapy</SelectItem>
                    <SelectItem value="baby">Baby & Kids / Apparel</SelectItem>
                    <SelectItem value="sports">Sports & Outdoor Gear</SelectItem>
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
                    onChange={(e) => handleInputChange("productLink", e.target.value)}
                    className="bg-white border-[#cbd5e1] pl-10 pr-3 text-slate-900"
                  />
                </div>
                {(() => {
                  const platform = detectPlatform(formData.productLink);
                  if (!platform) return (
                    <p className="text-xs text-[#64748b]">
                      Paste a product URL from Taobao, Xiaohongshu, Douyin, JD, etc.
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
            </div>
          </div>

          {/* Image Gallery */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] p-6">
            <h3 className="text-base font-semibold text-[#27272a] mb-4">
              Image Gallery
            </h3>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((index) => (
                  <div key={index}>
                    {imagePreviews[index] ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-[#e2e8f0]">
                        <img
                          src={imagePreviews[index]}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-[#cbd5e1] cursor-pointer hover:border-[#94a3b8] transition-colors">
                        <Upload className="w-6 h-6 text-[#94a3b8] mb-2" />
                        <span className="text-xs text-[#64748b]">Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleImageUpload(e)}
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Max of 2mb per image, min of 144px by 144px, up to 3 images only
                per product.
              </p>
            </div>
          </div>

          {/* Specifications & Shipping */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 row-span-2">
            <h3 className="text-base font-semibold text-[#27272a] mb-4">
              Specifications & Shipping
            </h3>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Product ID
                </Label>
                <Input
                  placeholder="Enter your product's SKU"
                  value={formData.productId}
                  onChange={(e) => handleInputChange("productId", e.target.value)}
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Stock Keeping Unit (SKU)
                </Label>
                <Input
                  placeholder="Enter your product's SKU"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
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
                  <span className="text-sm text-[#64748b]">×</span>
                  <Input
                    placeholder="0.00"
                    value={formData.shippingWidth}
                    onChange={(e) =>
                      handleInputChange("shippingWidth", e.target.value)
                    }
                    className="bg-white border-[#cbd5e1] flex-1 text-slate-900"
                  />
                  <span className="text-sm text-[#64748b]">×</span>
                  <Input
                    placeholder="0.00"
                    value={formData.shippingHeight}
                    onChange={(e) =>
                      handleInputChange("shippingHeight", e.target.value)
                    }
                    className="bg-white border-[#cbd5e1] flex-1 text-slate-900"
                  />
                </div>
                <p className="text-xs text-[#64748b]">Length × Width × Height</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Shipping UOM
                </Label>
                <Select
                  value={formData.shippingUom}
                  onValueChange={(value) => handleInputChange("shippingUom", value)}
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
                <Label className="text-sm font-medium text-[#27272a]">Weight</Label>
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
                  onValueChange={(value) => handleInputChange("weightUom", value)}
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
              Pricing & Stocks
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Unit Cost
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748b]">
                    CN¥
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={(e) => handleInputChange("unitCost", e.target.value)}
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
                    CN¥
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

              <div className="space-y-2 col-span-2">
                <Label className="text-sm font-medium text-[#27272a]">
                  Available Stocks
                </Label>
                <Input
                  type="number"
                  value={formData.availableStocks}
                  onChange={(e) =>
                    handleInputChange("availableStocks", e.target.value)
                  }
                  className="bg-white border-[#cbd5e1] text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
            className="h-10 px-4 gap-2 bg-white border-[#cbd5e1] text-[#27272a] hover:bg-[#f8fafc]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
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
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
