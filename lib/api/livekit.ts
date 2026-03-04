/**
 * LiveKit API client for room and token management
 */

import { api } from '../api';

// Re-export axios for type compatibility
import axios from 'axios';

export interface CreateRoomRequest {
  room_name: string;
  seller_id: string;
  max_participants?: number;
  enable_agent?: boolean;
}

export interface RoomResponse {
  room_name: string;
  seller_id: string;
  max_participants: number;
  enable_agent: boolean;
  created_at?: string;
}

export interface TokenRequest {
  room_name: string;
  participant_name: string;
  participant_id: string;
  participant_type?: 'host' | 'viewer' | 'agent';
  can_publish?: boolean;
  can_subscribe?: boolean;
}

export interface TokenResponse {
  token: string;
  url: string;
  room_name: string;
  participant_name: string;
  participant_type: string;
}

export interface Room {
  sid: string;
  name: string;
  num_participants: number;
  max_participants: number;
  creation_time: number;
  metadata?: string;
}

/**
 * Create a new live streaming room
 */
export async function createRoom(request: CreateRoomRequest): Promise<RoomResponse> {
  const response = await api.post('/livekit/rooms', request);
  return response.data;
}

/**
 * Get all active rooms
 */
export async function listRooms(): Promise<{ rooms: Room[]; total: number }> {
  const response = await api.get('/livekit/rooms');
  return response.data;
}

/**
 * Get information about a specific room
 */
export async function getRoom(roomName: string): Promise<Room> {
  const response = await api.get(`/livekit/rooms/${roomName}`);
  return response.data;
}

/**
 * Delete a room (end the stream)
 */
export async function deleteRoom(roomName: string): Promise<{ message: string }> {
  const response = await api.delete(`/livekit/rooms/${roomName}`);
  return response.data;
}

/**
 * Generate an access token to join a room
 */
export async function createToken(request: TokenRequest): Promise<TokenResponse> {
  const response = await api.post('/livekit/tokens', request);
  return response.data;
}

/**
 * Generate a token for a host to start streaming
 */
export async function createHostToken(
  roomName: string,
  hostName: string,
  hostId: string
): Promise<TokenResponse> {
  return createToken({
    room_name: roomName,
    participant_name: hostName,
    participant_id: hostId,
    participant_type: 'host',
  });
}

/**
 * Generate a token for a viewer to watch the stream
 */
export async function createViewerToken(
  roomName: string,
  viewerName: string,
  viewerId: string
): Promise<TokenResponse> {
  return createToken({
    room_name: roomName,
    participant_name: viewerName,
    participant_id: viewerId,
    participant_type: 'viewer',
  });
}

/**
 * Start the AI agent in a room
 */
export async function startAgent(roomName: string): Promise<any> {
  const response = await api.post(`/livekit/rooms/${roomName}/start-agent`);
  return response.data;
}
