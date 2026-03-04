/**
 * Streaming API Client
 */

import { api } from '../api';

export interface ConnectivityStats {
    platform: string;
    rate: number;
    successfulTime: number;
    scheduledTime: number;
}

export interface LatencyDataPoint {
    timestamp: string;
    latency: number;
}

export interface LatencyStats {
    platform: string;
    averageLatency: number;
    dataPoints: LatencyDataPoint[];
}

export interface StreamingReportsResponse {
    connectivity: ConnectivityStats[];
    latency: LatencyStats[];
}

/**
 * Get streaming reports (connectivity, latency, etc.)
 */
export const getStreamingReports = async (): Promise<StreamingReportsResponse> => {
    const response = await api.get('/streaming/reports');
    return response.data;
};


// --- Egress types & functions ---

export interface StartEgressRequest {
    room_name: string;
    destination_ids: string[];
}

export interface EgressResult {
    destination_id: string;
    success: boolean;
    egress_id?: string;
    error?: string;
    platform?: string;
}

export interface EgressBatchResponse {
    results: EgressResult[];
}

export interface EgressStatusInfo {
    egress_id: string;
    status: string;
    destination_id?: string;
    platform?: string;
    started_at?: number;
    ended_at?: number;
    error?: string;
}

export interface EgressStatusResponse {
    egresses: EgressStatusInfo[];
}

export type StreamPlatform = 'taobao' | 'douyin' | 'xiaohongshu' | 'custom';
export type StreamQuality = 'low' | 'medium' | 'high' | 'ultra';
export type StreamStatus = 'active' | 'inactive' | 'streaming' | 'error' | 'disabled';

export interface StreamDestination {
    _id: string;
    id?: string;
    seller_id: string;
    store_id?: string;
    platform: StreamPlatform;
    destination_name: string;
    rtmp_url: string;
    stream_key: string;
    quality: StreamQuality;
    status: StreamStatus;
    is_enabled: boolean;
    egress_id?: string;
    current_stream_id?: string;
    has_backup?: boolean;
    is_streaming?: boolean;
    bitrate_kbps?: number;
    fps?: number;
    resolution_width?: number;
    resolution_height?: number;
    total_streams?: number;
    successful_streams?: number;
    failed_streams?: number;
    connection_error?: string;
    created_at?: string;
    updated_at?: string;
    last_used_at?: string;
}

export interface StreamDestinationListResponse {
    destinations: StreamDestination[];
    total: number;
}

export interface CreateDestinationData {
    platform: StreamPlatform;
    destination_name: string;
    rtmp_url: string;
    stream_key: string;
    store_id?: string;
    quality?: StreamQuality;
    bitrate_kbps?: number;
    fps?: number;
    resolution_width?: number;
    resolution_height?: number;
}

export interface UpdateDestinationData {
    destination_name?: string;
    rtmp_url?: string;
    stream_key?: string;
    quality?: StreamQuality;
    bitrate_kbps?: number;
    fps?: number;
    is_enabled?: boolean;
}

/**
 * Start RTMP egress for multiple destinations
 */
export async function startEgress(req: StartEgressRequest): Promise<EgressBatchResponse> {
    const response = await api.post('/streaming/egress/start', req);
    return response.data;
}

/**
 * Stop all egresses for a room
 */
export async function stopEgress(roomName: string): Promise<EgressBatchResponse> {
    const response = await api.post(`/streaming/egress/stop/${roomName}`);
    return response.data;
}

/**
 * Get egress status for a room
 */
export async function getEgressStatus(roomName: string): Promise<EgressStatusResponse> {
    const response = await api.get(`/streaming/egress/${roomName}/status`);
    return response.data;
}

// Normalize destination IDs — backend may return `id` instead of `_id`
function normalizeDestinations(data: StreamDestinationListResponse): StreamDestinationListResponse {
    return {
        ...data,
        destinations: data.destinations.map((d) => ({
            ...d,
            _id: d._id || d.id || '',
        })),
    };
}

/**
 * List streaming destinations for a seller (only enabled)
 */
export async function listDestinations(sellerId: string): Promise<StreamDestinationListResponse> {
    const response = await api.get('/streaming/destinations', {
        params: { seller_id: sellerId, is_enabled: true },
    });
    return normalizeDestinations(response.data);
}

/**
 * List ALL streaming destinations for a seller (including disabled)
 */
export async function listAllDestinations(sellerId: string): Promise<StreamDestinationListResponse> {
    const response = await api.get('/streaming/destinations', {
        params: { seller_id: sellerId },
    });
    return normalizeDestinations(response.data);
}

/**
 * Create a new streaming destination
 */
export async function createDestination(
    sellerId: string,
    data: CreateDestinationData
): Promise<{ success: boolean; destination_id: string; message: string }> {
    const response = await api.post('/streaming/destinations', data, {
        params: { seller_id: sellerId },
    });
    return response.data;
}

/**
 * Update a streaming destination
 */
export async function updateDestination(
    destinationId: string,
    data: UpdateDestinationData
): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/streaming/destinations/${destinationId}`, data);
    return response.data;
}

/**
 * Delete a streaming destination
 */
export async function deleteDestination(
    destinationId: string
): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/streaming/destinations/${destinationId}`);
    return response.data;
}
