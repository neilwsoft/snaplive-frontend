/**
 * Logistics API Client
 *
 * TypeScript client for logistics management operations.
 */

import { api } from "@/lib/api";

// Types

export interface BilingualText {
  en: string;
  ko: string;
}

export interface Address {
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province?: string;
  postal_code: string;
  country: string;
}

export interface PackageDetails {
  weight: number; // kg
  length?: number; // cm
  width?: number; // cm
  height?: number; // cm
  declared_value?: number;
}

export enum ShipmentStatus {
  PENDING = "pending",
  PICKED_UP = "picked_up",
  IN_TRANSIT = "in_transit",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
  FAILED = "failed",
  RETURNED = "returned"
}

export interface Carrier {
  _id: string;
  name: BilingualText;
  code: string;
  country: string;
  api_endpoint?: string;
  supports_tracking: boolean;
  supports_webhooks: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryZone {
  _id: string;
  name: BilingualText;
  carrier_id: string;
  carrier_name?: BilingualText;
  origin_country: string;
  destination_country: string;
  destination_regions: string[];
  base_cost: number;
  per_kg_cost: number;
  weight_min: number;
  weight_max?: number;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  _id: string;
  order_id: string;
  shipment_number: string;
  carrier_id: string;
  carrier_name?: BilingualText;
  tracking_number?: string;
  status: ShipmentStatus;
  origin: Address;
  destination: Address;
  package_details: PackageDetails;
  warehouse_id?: string;
  delivery_zone_id?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  shipping_cost?: number;
  currency: string;
  qr_code_url?: string;
  label_url?: string;
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
  is_delivered: boolean;
  is_in_transit: boolean;
  is_pending: boolean;
}

export interface TrackingEvent {
  _id: string;
  shipment_id: string;
  status: ShipmentStatus;
  location?: string;
  description: BilingualText;
  event_time: string;
  created_at: string;
}

export interface ShippingCostQuote {
  carrier_id: string;
  carrier_name: BilingualText;
  delivery_zone_id: string;
  cost: number;
  currency: string;
  estimated_days_min: number;
  estimated_days_max: number;
}

export interface LogisticsStats {
  total_shipments: number;
  pending_shipments: number;
  in_transit_shipments: number;
  delivered_shipments: number;
  failed_shipments: number;
  total_carriers: number;
  active_carriers: number;
  total_delivery_zones: number;
}

// Response types

export interface ShipmentListResponse {
  items: Shipment[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TrackingEventListResponse {
  items: TrackingEvent[];
  total: number;
}

export interface CalculateShippingCostResponse {
  quotes: ShippingCostQuote[];
}

// API Functions

// Carriers

export const getCarriers = async (params?: {
  is_active?: boolean;
}): Promise<Carrier[]> => {
  const response = await api.get("/logistics/carriers", { params });
  return response.data;
};

export const getCarrier = async (carrierId: string): Promise<Carrier> => {
  const response = await api.get(`/logistics/carriers/${carrierId}`);
  return response.data;
};

export const createCarrier = async (data: {
  name: BilingualText;
  code: string;
  country: string;
  api_endpoint?: string;
  supports_tracking?: boolean;
  supports_webhooks?: boolean;
  is_active?: boolean;
}): Promise<Carrier> => {
  const response = await api.post("/logistics/carriers", data);
  return response.data;
};

export const updateCarrier = async (
  carrierId: string,
  data: Partial<{
    name: BilingualText;
    api_endpoint: string;
    supports_tracking: boolean;
    supports_webhooks: boolean;
    is_active: boolean;
  }>
): Promise<Carrier> => {
  const response = await api.patch(`/logistics/carriers/${carrierId}`, data);
  return response.data;
};

// Delivery Zones

export const getDeliveryZones = async (params?: {
  carrier_id?: string;
  is_active?: boolean;
}): Promise<DeliveryZone[]> => {
  const response = await api.get("/logistics/delivery-zones", { params });
  return response.data;
};

export const getDeliveryZone = async (zoneId: string): Promise<DeliveryZone> => {
  const response = await api.get(`/logistics/delivery-zones/${zoneId}`);
  return response.data;
};

export const createDeliveryZone = async (data: {
  name: BilingualText;
  carrier_id: string;
  origin_country: string;
  destination_country: string;
  destination_regions?: string[];
  base_cost: number;
  per_kg_cost: number;
  weight_min?: number;
  weight_max?: number;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active?: boolean;
}): Promise<DeliveryZone> => {
  const response = await api.post("/logistics/delivery-zones", data);
  return response.data;
};

export const calculateShippingCost = async (data: {
  carrier_id?: string;
  origin_country: string;
  destination_country: string;
  destination_region?: string;
  weight: number;
}): Promise<CalculateShippingCostResponse> => {
  const response = await api.post("/logistics/delivery-zones/calculate-cost", data);
  return response.data;
};

// Shipments

export const getShipments = async (params?: {
  order_id?: string;
  status?: ShipmentStatus;
  carrier_id?: string;
  page?: number;
  page_size?: number;
}): Promise<ShipmentListResponse> => {
  const response = await api.get("/logistics/shipments", { params });
  return response.data;
};

export const getShipment = async (shipmentId: string): Promise<Shipment> => {
  const response = await api.get(`/logistics/shipments/${shipmentId}`);
  return response.data;
};

export const createShipment = async (data: {
  order_id: string;
  carrier_id: string;
  origin: Address;
  destination: Address;
  package_details: PackageDetails;
  warehouse_id?: string;
  delivery_zone_id?: string;
  tracking_number?: string;
}): Promise<Shipment> => {
  const response = await api.post("/logistics/shipments", data);
  return response.data;
};

export const updateShipment = async (
  shipmentId: string,
  data: Partial<{
    carrier_id: string;
    tracking_number: string;
    status: ShipmentStatus;
    estimated_delivery_date: string;
    actual_delivery_date: string;
    shipping_cost: number;
  }>
): Promise<Shipment> => {
  const response = await api.patch(`/logistics/shipments/${shipmentId}`, data);
  return response.data;
};

export const deleteShipment = async (shipmentId: string): Promise<void> => {
  await api.delete(`/logistics/shipments/${shipmentId}`);
};

// Tracking

export const getTrackingEvents = async (shipmentId: string): Promise<TrackingEventListResponse> => {
  const response = await api.get(`/logistics/shipments/${shipmentId}/tracking-events`);
  return response.data;
};

export const addTrackingEvent = async (data: {
  shipment_id: string;
  status: ShipmentStatus;
  location?: string;
  description: BilingualText;
  event_time?: string;
}): Promise<TrackingEvent> => {
  const response = await api.post("/logistics/shipments/track", data);
  return response.data;
};

// QR Code and Labels

export const generateQRCode = async (data: {
  shipment_id: string;
  size?: number;
  format?: "png" | "svg";
}): Promise<{ qr_code_url: string; shipment_id: string }> => {
  const response = await api.post("/logistics/shipments/generate-qr", data);
  return response.data;
};

export const generateLabel = async (data: {
  shipment_id: string;
}): Promise<{ label_url: string; shipment_id: string }> => {
  const response = await api.post("/logistics/shipments/generate-label", data);
  return response.data;
};

// Statistics

export const getLogisticsStats = async (): Promise<LogisticsStats> => {
  const response = await api.get("/logistics/shipments/stats");
  return response.data;
};

// Seeding

export const seedLogisticsDatabase = async (): Promise<{ message: string }> => {
  const response = await api.post("/logistics/seed");
  return response.data;
};

// Helper functions

export const getStatusLabel = (status: ShipmentStatus, locale: "en" | "ko" = "en"): string => {
  const labels: Record<ShipmentStatus, { en: string; ko: string }> = {
    [ShipmentStatus.PENDING]: { en: "Pending", ko: "대기중" },
    [ShipmentStatus.PICKED_UP]: { en: "Picked Up", ko: "픽업완료" },
    [ShipmentStatus.IN_TRANSIT]: { en: "In Transit", ko: "배송중" },
    [ShipmentStatus.OUT_FOR_DELIVERY]: { en: "Out for Delivery", ko: "배달중" },
    [ShipmentStatus.DELIVERED]: { en: "Delivered", ko: "배송완료" },
    [ShipmentStatus.FAILED]: { en: "Failed", ko: "배송실패" },
    [ShipmentStatus.RETURNED]: { en: "Returned", ko: "반송됨" }
  };

  return labels[status][locale];
};

export const getStatusColor = (status: ShipmentStatus): string => {
  const colors: Record<ShipmentStatus, string> = {
    [ShipmentStatus.PENDING]: "bg-gray-100 text-gray-800",
    [ShipmentStatus.PICKED_UP]: "bg-blue-100 text-blue-800",
    [ShipmentStatus.IN_TRANSIT]: "bg-purple-100 text-purple-800",
    [ShipmentStatus.OUT_FOR_DELIVERY]: "bg-yellow-100 text-yellow-800",
    [ShipmentStatus.DELIVERED]: "bg-green-100 text-green-800",
    [ShipmentStatus.FAILED]: "bg-red-100 text-red-800",
    [ShipmentStatus.RETURNED]: "bg-orange-100 text-orange-800"
  };

  return colors[status];
};
