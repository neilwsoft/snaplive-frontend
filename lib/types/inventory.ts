export type ProductStatus = 'NEW' | 'BEST_SELLER';

export interface Product {
  id: string;
  image: string;
  name: string;
  productId: string;
  sku: string;
  brandMfr: string;
  category: string;
  stocks: number;
  stockUnit?: string;
  liveSalePrice: number;
  unitCost: number;
  profitMargin: number;
  sales: number;
  status?: ProductStatus[];
  productLink?: string;
}

export interface InventoryFilters {
  search: string;
  category?: string;
  brand?: string;
  priceRange?: [number, number];
  stockRange?: [number, number];
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

export type SortField = 'name' | 'productId' | 'sku' | 'brandMfr' | 'category' | 'stocks' | 'liveSalePrice' | 'unitCost' | 'profitMargin' | 'sales';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField | null;
  direction: SortDirection;
}
