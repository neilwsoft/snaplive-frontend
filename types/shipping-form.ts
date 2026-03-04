// types/shipping-form.ts

export interface ShipperInfo {
  id?: string
  label?: string
  name: string
  contactNumber: string
  email?: string
  dispatchAddress: string
}

export interface RecipientInfo {
  id?: string
  label?: string
  name: string
  contactNumber: string
  email?: string
  dispatchAddress: string
}

export interface WaybillInfo {
  logisticsProvider: string // 'sf-express', 'ems', etc.
  trackingNumber?: string
  trackingStatus?: string
  trackingTimestamp?: Date
  liveHubOrderId: string
  marketplaceOrderId: string
  marketplace: string
  shippingServiceType: string // 'standard', 'express', 'economy'
}

export interface LogisticsNotes {
  paymentMethod: 'seller-pays' | 'buyer-pays' | 'cod'
  deliveryInstructions: string
  remarksInsurance: string
}

export interface ShippingFormData {
  orderId: string
  grossWeight: number // in kg
  numberOfPackages: number
  shipper: ShipperInfo
  recipient: RecipientInfo
  waybill: WaybillInfo
  notes: LogisticsNotes
}

export interface GoodsDetails {
  products: Array<{
    name: string
    description: string
  }>
  totalQuantity: number
  totalDeclaredValue: number
  currency: string
  grossWeight: number
  numberOfPackages: number
}
