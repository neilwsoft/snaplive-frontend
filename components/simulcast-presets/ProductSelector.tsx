"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, GripVertical, X } from "lucide-react";
import { toast } from "sonner";

export interface SelectedProduct {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
}

interface ProductSelectorProps {
  onProductsChange?: (products: SelectedProduct[]) => void;
}

// Mock selected products
const mockProducts: SelectedProduct[] = [
  {
    id: "1",
    name: "Velvet Matte Lipstick (Nude 02)",
    price: "128.00",
    imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=218&h=218&fit=crop",
  },
  {
    id: "2",
    name: "Premium Mixed Nuts (1kg Family Pack)",
    price: "89.00",
    imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=218&h=218&fit=crop",
  },
];

export function ProductSelector({ onProductsChange }: ProductSelectorProps) {
  const [products, setProducts] = useState<SelectedProduct[]>(mockProducts);
  const [uploadedImage, setUploadedImage] = useState<string>();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      toast.success("Product image uploaded");
    }
  };

  const handleRemoveProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    onProductsChange?.(updated);
    toast.success("Product removed");
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-lg border border-[#e2e8f0]">
      {/* Header */}
      <h3 className="text-base font-semibold text-[#27272a]">
        Product Selection
      </h3>

      {/* Image Upload Section */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#27272a]">
          Upload Product Image
        </label>

        {/* Landscape Upload */}
        <div className="relative w-full h-[112px] bg-white border-2 border-dashed border-[#cad5e2] rounded-xl flex flex-col items-center justify-center overflow-hidden">
          {uploadedImage ? (
            <div className="relative w-full h-full">
              <Image
                src={uploadedImage}
                alt="Product"
                fill
                className="object-contain p-4"
                sizes="100%"
              />
              <label
                htmlFor="product-upload"
                className="absolute inset-0 bg-black/0 hover:bg-black/10 cursor-pointer flex items-center justify-center transition-colors"
              >
                <div className="opacity-0 hover:opacity-100 transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </label>
            </div>
          ) : (
            <label
              htmlFor="product-upload"
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <Upload className="w-6 h-6 text-[#cad5e2]" />
              <span className="text-sm text-[#27272a]">Upload Image</span>
            </label>
          )}
          <input
            id="product-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        <p className="text-sm text-[#27272a]">
          Max of 2mb, min of 340px by 112px.
        </p>
      </div>

      {/* Selected Products Grid */}
      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium text-[#27272a]">
          Selected Products ({products.length})
        </label>

        <div className="flex flex-wrap gap-4">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col gap-2 w-[218px]">
              {/* Product Preview */}
              <div className="relative w-[218px] h-[218px] bg-white border border-[#b3bad1] rounded-[10px] overflow-hidden group">
                {/* Product Image */}
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="218px"
                />

                {/* Drag Handle - Top Left */}
                <div className="absolute top-2 left-2 w-6 h-6 bg-white/90 rounded flex items-center justify-center cursor-move">
                  <GripVertical className="w-4 h-4 text-[#27272a]" />
                </div>

                {/* Remove Button - Top Right */}
                <button
                  onClick={() => handleRemoveProduct(product.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded flex items-center justify-center hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4 text-[#27272a]" />
                </button>
              </div>

              {/* Product Info */}
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-medium text-[#27272a] text-center line-clamp-2">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 text-sm text-[#27272a]">
                  <span>CN¥</span>
                  <span>{product.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-sm text-[#27272a] leading-relaxed">
        Upload product images and manage your product selection. Products can be reordered by dragging.
      </p>
    </div>
  );
}
