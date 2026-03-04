import { Order } from "./order"

export type ProductBadgeType = 'new' | 'bestseller' | 'hot-seller'

export type FulfillmentStatus = 'pick' | 'pack' | 'ship' | null

export interface ProductBadge {
  type: ProductBadgeType
  label: string
}

export interface OrderProductDetail {
  id: string
  sku: string
  name: string
  imageUrl: string
  quantity: number
  unit: string // 'pcs', 'unit', etc.
  badges?: ProductBadge[]
  fulfillmentStatus: FulfillmentStatus
}

export interface Customer {
  id: string
  name: string
  avatarUrl?: string
  contactNumber: string
  email: string
  address: string
}

export interface Transaction {
  id: string
  timestamp: Date
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  paymentMethod?: string
}

export interface OrderDetail extends Omit<Order, 'products'> {
  products: OrderProductDetail[]
  customer: Customer
  transactions: Transaction[]
  totalAmount: number
  paidAmount: number
  currency: string
  processingStep: number // 1, 2, or 3
}

export type OrderProcessingStep = 'new-pending' | 'shipping-form' | 'ready-to-ship'
