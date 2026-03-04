/**
 * Sync and Streaming API Client
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface SyncLog {
  id: string;
  store_id: string;
  seller_id: string;
  platform: string;
  sync_type: "inventory" | "orders" | "products" | "stream_data" | "full_sync";
  sync_direction: "pull" | "push" | "bidirectional";
  status: "started" | "in_progress" | "success" | "partial_success" | "failed" | "cancelled";
  triggered_by: string;
  result?: {
    total_items: number;
    processed_items: number;
    successful_items: number;
    failed_items: number;
    created_count?: number;
    updated_count?: number;
    errors?: any[];
  };
  error_message?: string;
  duration_seconds?: number;
  api_calls_made: number;
  started_at: string;
  completed_at?: string;
}

export interface SyncStatus {
  store_id: string;
  platform: string;
  is_syncing: boolean;
  current_sync?: SyncLog;
  last_successful_sync?: SyncLog;
  total_syncs_today: number;
  successful_syncs_today: number;
  failed_syncs_today: number;
  success_rate_today: number;
}

export interface StreamingDestination {
  id: string;
  store_id?: string;
  seller_id: string;
  platform: string;
  destination_name: string;
  rtmp_url: string;
  stream_key: string;
  has_backup: boolean;
  quality: string;
  bitrate_kbps: number;
  fps: number;
  resolution_width: number;
  resolution_height: number;
  status: "active" | "inactive" | "streaming" | "error" | "disabled";
  is_enabled: boolean;
  connection_error?: string;
  total_streams: number;
  successful_streams: number;
  failed_streams: number;
  is_streaming: boolean;
  stream_started_at?: string;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

// Trigger sync
export async function triggerSync(
  storeId: string,
  syncType: "inventory" | "orders" | "products" | "stream_data" | "full_sync",
  direction: "pull" | "push" | "bidirectional" = "pull"
): Promise<{ success: boolean; sync_log_id: string; message: string }> {
  const response = await fetch(`${API_URL}/api/v1/stores/${storeId}/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      store_id: storeId,
      sync_type: syncType,
      sync_direction: direction,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to trigger sync");
  }

  return response.json();
}

// Get sync status
export async function getSyncStatus(storeId: string): Promise<SyncStatus> {
  const response = await fetch(`${API_URL}/api/v1/stores/${storeId}/sync-status`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch sync status");
  }

  return response.json();
}

// Get sync history
export async function getSyncHistory(
  storeId: string,
  params?: {
    sync_type?: string;
    page?: number;
    page_size?: number;
  }
): Promise<{ syncs: SyncLog[]; total: number; page: number; page_size: number }> {
  const queryParams = new URLSearchParams();
  if (params?.sync_type) queryParams.append("sync_type", params.sync_type);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.page_size) queryParams.append("page_size", params.page_size.toString());

  const response = await fetch(
    `${API_URL}/api/v1/stores/${storeId}/sync-history?${queryParams}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch sync history");
  }

  return response.json();
}

// Create streaming destination
export async function createStreamingDestination(
  sellerId: string,
  data: {
    platform: string;
    destination_name: string;
    rtmp_url: string;
    stream_key: string;
    store_id?: string;
    quality?: string;
    bitrate_kbps?: number;
    fps?: number;
  }
): Promise<{ success: boolean; destination_id: string; message: string }> {
  const response = await fetch(
    `${API_URL}/api/v1/streaming/destinations?seller_id=${sellerId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create streaming destination");
  }

  return response.json();
}

// List streaming destinations
export async function listStreamingDestinations(params?: {
  seller_id?: string;
  store_id?: string;
  platform?: string;
  is_enabled?: boolean;
}): Promise<{ destinations: StreamingDestination[]; total: number }> {
  const queryParams = new URLSearchParams();
  if (params?.seller_id) queryParams.append("seller_id", params.seller_id);
  if (params?.store_id) queryParams.append("store_id", params.store_id);
  if (params?.platform) queryParams.append("platform", params.platform);
  if (params?.is_enabled !== undefined)
    queryParams.append("is_enabled", params.is_enabled.toString());

  const response = await fetch(`${API_URL}/api/v1/streaming/destinations?${queryParams}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch streaming destinations");
  }

  return response.json();
}

// Get streaming destination
export async function getStreamingDestination(
  destinationId: string
): Promise<StreamingDestination> {
  const response = await fetch(`${API_URL}/api/v1/streaming/destinations/${destinationId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch streaming destination");
  }

  return response.json();
}

// Start streaming
export async function startStreaming(
  destinationId: string,
  roomName: string
): Promise<{ success: boolean; message: string; rtmp_url: string; stream_key: string }> {
  const response = await fetch(
    `${API_URL}/api/v1/streaming/destinations/${destinationId}/start?room_name=${roomName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to start streaming");
  }

  return response.json();
}

// End streaming
export async function endStreaming(
  destinationId: string
): Promise<{ success: boolean; message: string; final_metrics?: any }> {
  const response = await fetch(
    `${API_URL}/api/v1/streaming/destinations/${destinationId}/end`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to end streaming");
  }

  return response.json();
}

// Get RTMP config for store
export async function getRTMPConfig(storeId: string): Promise<{
  success: boolean;
  platform: string;
  config: {
    rtmp_url: string;
    stream_key: string;
    backup_url?: string;
    max_bitrate_kbps: number;
    recommended_bitrate_kbps: number;
  };
}> {
  const response = await fetch(`${API_URL}/api/v1/streaming/stores/${storeId}/rtmp-config`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch RTMP config");
  }

  return response.json();
}

// Get active streams
export async function getActiveStreams(sellerId?: string): Promise<{
  destinations: StreamingDestination[];
  total: number;
}> {
  const queryParams = new URLSearchParams();
  if (sellerId) queryParams.append("seller_id", sellerId);

  const response = await fetch(`${API_URL}/api/v1/streaming/active?${queryParams}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch active streams");
  }

  return response.json();
}
