/**
 * Orders API Client
 *
 * TypeScript client for order management operations.
 * Matches frontend order types and backend API.
 */

import { api } from "@/lib/api";
import type { Order as FrontendOrder, OrderStatus as FrontendOrderStatus, MarketplaceSource } from "@/types/order";
import type { OrderDetail, OrderProductDetail, Customer, Transaction } from "@/types/order-detail";

// Backend Status Enum (matches backend)
export enum OrderStatus {
  PENDING = "pending",
  READY = "ready",
  SHOPPING = "shopping",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  RETURNING = "returning",
  RETURN = "return"
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded"
}

export enum Platform {
  TAOBAO = "taobao",
  DOUYIN = "douyin",
  XIAOHONGSHU = "xiaohongshu",
  SNAPLIVE = "snaplive",
  DIRECT = "direct"
}

export interface ProductBadge {
  type: string;
  label: string;
}

export interface OrderItem {
  product_id?: string;
  product_name: {
    ko?: string;
    en?: string;
    zh?: string;
  };
  quantity: number;
  unit_price: number;
  subtotal: number;
  sku?: string;
  image_url?: string;
  unit?: string;
  fulfillment_status?: 'pick' | 'pack' | 'ship' | null;
  badges?: ProductBadge[];
}

export interface ShippingAddress {
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

// Backend Order Response type
export interface BackendOrder {
  id: string;
  order_number: string;
  buyer_email: string;
  buyer_name: string;
  buyer_language: string;
  buyer_avatar_url?: string;
  buyer_phone?: string;
  live_simulcast_id?: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  platform: Platform;
  platform_order_id?: string;
  shipping_address: ShippingAddress;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  buyer_notes?: string;
  seller_notes?: string;
  processing_step: number;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
}

export interface OrderStats {
  total_orders: number;
  status_counts: {
    [key: string]: number;
  };
  payment_status_counts: {
    [key: string]: number;
  };
  platform_counts: {
    [key: string]: number;
  };
  total_revenue: number;
  average_order_value: number;
  orders_last_30_days: number;
  daily_orders: {
    date: string;
    count: number;
  }[];
  daily_orders_by_platform: {
    date: string;
    platform: string;
    count: number;
  }[];
  pending_orders: number;
  confirmed_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
}

// Response types

export interface OrderListResponse {
  orders: BackendOrder[];
  total: number;
  page: number;
  page_size: number;
}

export interface SeedOrdersResponse {
  message: string;
  count: number;
  orders_created: string[];
}

// Transform functions: Backend -> Frontend

export function transformBackendToFrontend(order: BackendOrder): FrontendOrder {
  // Map backend platform to frontend MarketplaceSource
  const platformMap: Record<Platform, MarketplaceSource> = {
    [Platform.DOUYIN]: 'douyin',
    [Platform.XIAOHONGSHU]: 'xiaohongshu',
    [Platform.TAOBAO]: 'taobao',
    [Platform.SNAPLIVE]: 'snaplive',
    [Platform.DIRECT]: 'snaplive',
  };

  return {
    id: order.id,
    orderId: order.order_number,
    liveSimulcastId: order.live_simulcast_id || `LIVE-${order.id.substring(0, 4).toUpperCase()}`,
    marketplaceSource: platformMap[order.platform] || 'snaplive',
    buyer: {
      id: order.id, // Use order ID as buyer ID placeholder
      name: order.buyer_name,
      avatarUrl: order.buyer_avatar_url,
    },
    timeOrdered: new Date(order.created_at),
    products: order.items.map((item, idx) => ({
      id: item.product_id || `prod-${idx}`,
      name: item.product_name.en || item.product_name.ko || item.product_name.zh || 'Product',
      quantity: item.quantity,
      imageUrl: item.image_url,
    })),
    status: order.status as FrontendOrderStatus,
    createdAt: new Date(order.created_at),
    updatedAt: new Date(order.updated_at),
  };
}

export function transformBackendToOrderDetail(order: BackendOrder): OrderDetail {
  const frontendOrder = transformBackendToFrontend(order);

  const products: OrderProductDetail[] = order.items.map((item, idx) => ({
    id: item.product_id || `prod-${idx}`,
    sku: item.sku || '',
    name: item.product_name.en || item.product_name.ko || item.product_name.zh || 'Product',
    imageUrl: item.image_url || '',
    quantity: item.quantity,
    unit: item.unit || 'pcs',
    badges: item.badges?.map(b => ({
      type: b.type as 'new' | 'bestseller' | 'hot-seller',
      label: b.label,
    })),
    fulfillmentStatus: item.fulfillment_status || null,
  }));

  const customer: Customer = {
    id: order.id,
    name: order.buyer_name,
    avatarUrl: order.buyer_avatar_url,
    contactNumber: order.buyer_phone || order.shipping_address.phone,
    email: order.buyer_email,
    address: `${order.shipping_address.address_line1}, ${order.shipping_address.city}, ${order.shipping_address.province}`,
  };

  const transactions: Transaction[] = [{
    id: `txn-${order.id}`,
    timestamp: new Date(order.created_at),
    amount: order.total,
    currency: order.currency,
    status: order.payment_status === PaymentStatus.COMPLETED ? 'completed' :
            order.payment_status === PaymentStatus.FAILED ? 'failed' : 'pending',
  }];

  return {
    ...frontendOrder,
    products,
    customer,
    transactions,
    totalAmount: order.total,
    paidAmount: order.payment_status === PaymentStatus.COMPLETED ? order.total : 0,
    currency: order.currency,
    processingStep: order.processing_step,
  };
}

// API Functions

export interface GetOrdersParams {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  platform?: Platform;
  buyer_email?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export const getOrders = async (params?: GetOrdersParams): Promise<OrderListResponse> => {
  const response = await api.get("/orders", { params });
  return response.data;
};

export const getOrder = async (orderId: string): Promise<BackendOrder> => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const createOrder = async (data: {
  buyer_email: string;
  buyer_name: string;
  buyer_language?: string;
  buyer_avatar_url?: string;
  buyer_phone?: string;
  live_simulcast_id?: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  platform: Platform;
  platform_order_id?: string;
  buyer_notes?: string;
  shipping_fee?: number;
  tax?: number;
  currency?: string;
}): Promise<BackendOrder> => {
  const response = await api.post("/orders", data);
  return response.data;
};

export interface UpdateOrderData {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery_date?: string;
  seller_notes?: string;
  processing_step?: number;
  items?: OrderItem[];
}

export const updateOrder = async (
  orderId: string,
  data: UpdateOrderData
): Promise<BackendOrder> => {
  const response = await api.patch(`/orders/${orderId}`, data);
  return response.data;
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  await api.delete(`/orders/${orderId}`);
};

export const getOrderStats = async (): Promise<OrderStats> => {
  const response = await api.get("/orders/stats");
  return response.data;
};

export const seedOrders = async (params?: {
  count?: number;
  clear_existing?: boolean;
}): Promise<SeedOrdersResponse> => {
  const response = await api.post("/orders/seed", null, { params });
  return response.data;
};

// Helper functions

export const getStatusLabel = (status: OrderStatus, locale: "en" | "ko" = "en"): string => {
  const labels: Record<OrderStatus, { en: string; ko: string }> = {
    [OrderStatus.PENDING]: { en: "Pending", ko: "대기중" },
    [OrderStatus.READY]: { en: "Ready", ko: "준비완료" },
    [OrderStatus.SHOPPING]: { en: "Processing", ko: "처리중" },
    [OrderStatus.SHIPPED]: { en: "Shipped", ko: "배송됨" },
    [OrderStatus.DELIVERED]: { en: "Delivered", ko: "배송완료" },
    [OrderStatus.CANCELLED]: { en: "Cancelled", ko: "취소됨" },
    [OrderStatus.RETURNING]: { en: "Returning", ko: "반품진행중" },
    [OrderStatus.RETURN]: { en: "Returned", ko: "반품완료" }
  };

  return labels[status]?.[locale] || status;
};

export const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "bg-gray-100 text-gray-800",
    [OrderStatus.READY]: "bg-blue-100 text-blue-800",
    [OrderStatus.SHOPPING]: "bg-purple-100 text-purple-800",
    [OrderStatus.SHIPPED]: "bg-yellow-100 text-yellow-800",
    [OrderStatus.DELIVERED]: "bg-green-100 text-green-800",
    [OrderStatus.CANCELLED]: "bg-red-100 text-red-800",
    [OrderStatus.RETURNING]: "bg-orange-100 text-orange-800",
    [OrderStatus.RETURN]: "bg-pink-100 text-pink-800"
  };

  return colors[status] || "bg-gray-100 text-gray-800";
};

export const getPaymentStatusLabel = (status: PaymentStatus, locale: "en" | "ko" = "en"): string => {
  const labels: Record<PaymentStatus, { en: string; ko: string }> = {
    [PaymentStatus.PENDING]: { en: "Pending", ko: "대기중" },
    [PaymentStatus.COMPLETED]: { en: "Completed", ko: "완료됨" },
    [PaymentStatus.FAILED]: { en: "Failed", ko: "실패" },
    [PaymentStatus.REFUNDED]: { en: "Refunded", ko: "환불됨" }
  };

  return labels[status]?.[locale] || status;
};

export const getPlatformLabel = (platform: Platform, locale: "en" | "ko" = "en"): string => {
  const labels: Record<Platform, { en: string; ko: string }> = {
    [Platform.TAOBAO]: { en: "Taobao", ko: "타오바오" },
    [Platform.DOUYIN]: { en: "Douyin", ko: "더우인" },
    [Platform.XIAOHONGSHU]: { en: "Xiaohongshu", ko: "샤오홍슈" },
    [Platform.SNAPLIVE]: { en: "SnapLive", ko: "스냅라이브" },
    [Platform.DIRECT]: { en: "Direct", ko: "직접" }
  };

  return labels[platform]?.[locale] || platform;
};

// Monthly Revenue Stats Types

export interface MonthlyRevenueItem {
  month: string;
  month_label: string;
  revenue: number;
  cost: number;
  order_count: number;
}

export interface MonthlyRevenueStats {
  monthly_data: MonthlyRevenueItem[];
  current_month_revenue: number;
  previous_month_revenue: number;
  percentage_change: number;
  total_revenue: number;
}

// Monthly Revenue Stats API

export const getRevenueStats = async (months: number = 5): Promise<MonthlyRevenueStats> => {
  const response = await api.get("/orders/stats/revenue", { params: { months } });
  return response.data;
};
