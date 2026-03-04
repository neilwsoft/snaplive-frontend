/**
 * Shipping API Client
 *
 * API functions for shipping address and logistics management.
 */

import { api } from '../api';

// Types

export interface SavedAddress {
  _id: string;
  address_type: 'shipper' | 'recipient';
  label?: string;
  name: string;
  contact_number: string;
  email?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedAddressCreate {
  label?: string;
  name: string;
  contact_number: string;
  email?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
}

export interface SavedAddressUpdate {
  label?: string;
  name?: string;
  contact_number?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
}

export interface SavedAddressListResponse {
  items: SavedAddress[];
  total: number;
}

export interface LogisticsProvider {
  _id: string;
  code: string;
  name: string;
  name_zh: string;
  service_types: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LogisticsProviderListResponse {
  providers: LogisticsProvider[];
}

// Order Processing Types

export interface GoodsDetails {
  products: Array<{ name: string; description: string }>;
  total_quantity: number;
  total_declared_value: number;
  currency: string;
  gross_weight: number;
  number_of_packages: number;
}

export interface ShipperInfo {
  name: string;
  contact_number: string;
  email?: string;
  dispatch_address: string;
}

export interface RecipientInfo {
  name: string;
  contact_number: string;
  email?: string;
  dispatch_address: string;
}

export interface WaybillInfo {
  logistics_provider: string;
  live_hub_order_id?: string;
  marketplace_order_id: string;
  marketplace: string;
  shipping_service_type: string;
}

export interface LogisticsNotes {
  payment_method: string;
  delivery_instructions?: string;
  remarks_insurance?: string;
}

export interface OrderProcessingRequest {
  goods_details: GoodsDetails;
  shipper: ShipperInfo;
  recipient: RecipientInfo;
  waybill: WaybillInfo;
  notes?: LogisticsNotes;
}

export interface OrderProcessingResponse {
  success: boolean;
  order_id: string;
  tracking_number?: string;
  carrier: string;
  status: string;
  message: string;
}

export interface SeedAddressesResponse {
  message: string;
  shippers_created: number;
  recipients_created: number;
}

// Shipper Address API

export const getShippers = async (): Promise<SavedAddressListResponse> => {
  const response = await api.get('/shipping/shippers');
  return response.data;
};

export const createShipper = async (data: SavedAddressCreate): Promise<SavedAddress> => {
  const response = await api.post('/shipping/shippers', data);
  return response.data;
};

export const getShipper = async (addressId: string): Promise<SavedAddress> => {
  const response = await api.get(`/shipping/shippers/${addressId}`);
  return response.data;
};

export const updateShipper = async (addressId: string, data: SavedAddressUpdate): Promise<SavedAddress> => {
  const response = await api.put(`/shipping/shippers/${addressId}`, data);
  return response.data;
};

export const deleteShipper = async (addressId: string): Promise<void> => {
  await api.delete(`/shipping/shippers/${addressId}`);
};

// Recipient Address API

export const getRecipients = async (): Promise<SavedAddressListResponse> => {
  const response = await api.get('/shipping/recipients');
  return response.data;
};

export const createRecipient = async (data: SavedAddressCreate): Promise<SavedAddress> => {
  const response = await api.post('/shipping/recipients', data);
  return response.data;
};

export const getRecipient = async (addressId: string): Promise<SavedAddress> => {
  const response = await api.get(`/shipping/recipients/${addressId}`);
  return response.data;
};

export const updateRecipient = async (addressId: string, data: SavedAddressUpdate): Promise<SavedAddress> => {
  const response = await api.put(`/shipping/recipients/${addressId}`, data);
  return response.data;
};

export const deleteRecipient = async (addressId: string): Promise<void> => {
  await api.delete(`/shipping/recipients/${addressId}`);
};

// Logistics Providers API

export const getLogisticsProviders = async (): Promise<LogisticsProviderListResponse> => {
  const response = await api.get('/shipping/providers');
  return response.data;
};

// Order Processing API

export const processOrder = async (
  orderId: string,
  data: OrderProcessingRequest
): Promise<OrderProcessingResponse> => {
  const response = await api.post(`/orders/${orderId}/process`, data);
  return response.data;
};

// Seed Addresses API (for testing)

export const seedAddresses = async (): Promise<SeedAddressesResponse> => {
  const response = await api.post('/shipping/seed');
  return response.data;
};

// Transform functions for frontend types

export interface FrontendShipperInfo {
  name: string;
  contactNumber: string;
  email?: string;
  dispatchAddress: string;
}

export interface FrontendRecipientInfo {
  name: string;
  contactNumber: string;
  email?: string;
  dispatchAddress: string;
}

export function transformAddressToFrontend(address: SavedAddress): FrontendShipperInfo | FrontendRecipientInfo {
  return {
    name: address.name,
    contactNumber: address.contact_number,
    email: address.email,
    dispatchAddress: `${address.address_line1}${address.address_line2 ? ', ' + address.address_line2 : ''}, ${address.city}, ${address.province} ${address.postal_code}, ${address.country}`,
  };
}

export function transformFrontendToShipper(info: FrontendShipperInfo): ShipperInfo {
  return {
    name: info.name,
    contact_number: info.contactNumber,
    email: info.email,
    dispatch_address: info.dispatchAddress,
  };
}

export function transformFrontendToRecipient(info: FrontendRecipientInfo): RecipientInfo {
  return {
    name: info.name,
    contact_number: info.contactNumber,
    email: info.email,
    dispatch_address: info.dispatchAddress,
  };
}
