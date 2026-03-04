/**
 * Object Detection API client
 */

import { api } from '../api';

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  box: BoundingBox;
  matched_product_id?: string;
  matched_product_name?: string;
  matched_product_price?: number;
  matched_product_image?: string;
}

export interface DetectFrameRequest {
  image_data: string; // Base64 encoded image
  room_name: string;
  confidence_threshold?: number;
  text_threshold?: number;
  text_prompts?: string[];
  image_size?: number;
}

export interface DetectFrameResponse {
  detections: Detection[];
  inference_time_ms: number;
  frame_width: number;
  frame_height: number;
  timestamp: string;
}

export interface ToggleDetectionRequest {
  room_name: string;
  enabled: boolean;
  visible_to_viewers?: boolean;
}

export interface ToggleDetectionResponse {
  room_name: string;
  enabled: boolean;
  visible_to_viewers: boolean;
  message: string;
}

export interface DetectionState {
  room_name: string;
  enabled: boolean;
  visible_to_viewers: boolean;
  updated_at?: string;
}

export interface ModelInfo {
  loaded: boolean;
  device: string | null;
  model_type?: string;
  model_id?: string;
  detection_type?: string;
  default_prompts?: string[];
}

/**
 * Detect objects in a video frame
 */
export async function detectFrame(request: DetectFrameRequest): Promise<DetectFrameResponse> {
  const response = await api.post('/detection/detect-frame', request);
  return response.data;
}

/**
 * Toggle object detection for a room
 */
export async function toggleDetection(request: ToggleDetectionRequest): Promise<ToggleDetectionResponse> {
  const response = await api.post('/detection/toggle', request);
  return response.data;
}

/**
 * Get detection state for a room
 */
export async function getDetectionState(roomName: string): Promise<DetectionState> {
  const response = await api.get(`/detection/state/${roomName}`);
  return response.data;
}

/**
 * Get Grounding DINO model information
 */
export async function getModelInfo(): Promise<ModelInfo> {
  const response = await api.get('/detection/model-info');
  return response.data;
}
