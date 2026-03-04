import { ProductStatus } from "@/lib/types/inventory";

interface ProductStatusBadgeProps {
  status: ProductStatus;
}

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  const styles = {
    NEW: "bg-[#3b82f6] text-white text-[10px] font-bold px-1.5 py-0.5 rounded",
    BEST_SELLER: "bg-[#ef4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded",
  };

  const labels = {
    NEW: "NEW",
    BEST_SELLER: "BEST SELLER",
  };

  return (
    <span className={styles[status]}>
      {labels[status]}
    </span>
  );
}
