/**
 * Platform and Store Connection API Client
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Platform {
  platform: string;
  display_name: string;
  description: string;
  logo_url?: string;
  is_available: boolean;
  requires_oauth: boolean;
  supports_rtmp: boolean;
  supports_inventory_sync: boolean;
  supports_order_sync: boolean;
  supports_product_sync: boolean;
  supports_stream_data: boolean;
  required_fields: string[];
  optional_fields: string[];
  rate_limit_per_minute: number;
  documentation_url?: string;
  setup_guide_url?: string;
}

export interface StoreConnection {
  id: string;
  seller_id: string;
  platform: string;
  store_id: string;
  store_name: string;
  store_url?: string;
  connection_status: "connected" | "disconnected" | "error" | "pending";
  connection_error?: string;
  last_sync_at?: string;
  last_sync_status: "idle" | "syncing" | "success" | "failed";
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  config: {
    auto_sync_inventory: boolean;
    auto_sync_orders: boolean;
    auto_sync_products: boolean;
    rtmp_enabled: boolean;
    rtmp_url?: string;
    rtmp_stream_key?: string;
    rtmp_password?: string;
  };
  created_at: string;
  updated_at: string;
  connected_at?: string;
}

export interface StoreDashboardMetrics {
  store_id: string;
  platform: string;
  store_name: string;
  // Connection health
  connection_status: string;
  last_sync_at?: string;
  last_sync_error?: string;
  api_calls_remaining?: number;
  rate_limit_reset_at?: string;
  // Sales metrics
  orders_today: number;
  orders_this_week: number;
  orders_this_month: number;
  revenue_today: number;
  revenue_this_week: number;
  revenue_this_month: number;
  average_order_value: number;
  conversion_rate: number;
  // Inventory status
  total_products: number;
  in_stock_products: number;
  out_of_stock_products: number;
  low_stock_products: number;
  sync_conflicts: number;
  // Live streaming metrics
  active_streams: number;
  total_viewers_today: number;
  peak_concurrent_viewers: number;
  average_watch_time_minutes: number;
  engagement_rate: number;
  products_shown_in_stream: number;
  // Sync health
  sync_success_rate_24h: number;
  pending_sync_items: number;
}

export interface CreateStoreData {
  platform: string;
  store_id: string;
  store_name: string;
  store_url?: string;
  // Generic credentials
  api_key?: string;
  api_secret?: string;
  // Taobao specific
  app_key?: string;
  session_key?: string;
  // Douyin specific
  client_key?: string;
  client_secret?: string;
  // Xiaohongshu specific
  app_id?: string;
  app_secret?: string;
  // OAuth tokens
  access_token?: string;
  refresh_token?: string;
  // RTMP Configuration
  rtmp_url?: string;
  rtmp_stream_key?: string;
  rtmp_password?: string;
}

// List available platforms
export async function listPlatforms(): Promise<Platform[]> {
  const response = await fetch(`${API_URL}/api/v1/platforms`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch platforms");
  }

  const data = await response.json();
  return data.platforms;
}

// Get platform details
export async function getPlatform(platform: string): Promise<Platform> {
  const response = await fetch(`${API_URL}/api/v1/platforms/${platform}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch platform");
  }

  return response.json();
}

// List store connections
export async function listStores(params?: {
  seller_id?: string;
  platform?: string;
  page?: number;
  page_size?: number;
}): Promise<{ stores: StoreConnection[]; total: number }> {
  const queryParams = new URLSearchParams();
  if (params?.seller_id) queryParams.append("seller_id", params.seller_id);
  if (params?.platform) queryParams.append("platform", params.platform);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.page_size) queryParams.append("page_size", params.page_size.toString());

  const response = await fetch(`${API_URL}/api/v1/stores?${queryParams}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch stores");
  }

  return response.json();
}

// Get store by ID
export async function getStore(storeId: string): Promise<StoreConnection> {
  const response = await fetch(`${API_URL}/api/v1/stores/${storeId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch store");
  }

  return response.json();
}

// Create store connection
export async function createStore(
  sellerId: string,
  data: CreateStoreData
): Promise<{ success: boolean; store_id: string; message: string }> {
  const response = await fetch(`${API_URL}/api/v1/stores?seller_id=${sellerId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create store connection");
  }

  return response.json();
}

// Update store
export async function updateStore(
  storeId: string,
  updates: Partial<CreateStoreData>
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/api/v1/stores/${storeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update store");
  }

  return response.json();
}

// Delete store
export async function deleteStore(storeId: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/api/v1/stores/${storeId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete store");
  }

  return response.json();
}

// Test store connection
export async function testStoreConnection(storeId: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  const response = await fetch(`${API_URL}/api/v1/stores/${storeId}/test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to test connection");
  }

  return response.json();
}

// Get store dashboard metrics
export async function getStoreDashboard(storeId: string): Promise<StoreDashboardMetrics> {
  const response = await fetch(`${API_URL}/api/v1/stores/${storeId}/dashboard`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard metrics");
  }

  return response.json();
}
