// Order types and interfaces for the Orders Management system

export type MarketplaceSource = 'douyin' | 'xiaohongshu' | 'taobao' | 'snaplive'

export type OrderStatus =
  | 'returning'
  | 'pending'
  | 'ready'
  | 'cancelled'
  | 'shopping'
  | 'delivered'
  | 'shipped'
  | 'return'

export interface OrderProduct {
  id: string
  name: string
  quantity: number
  imageUrl?: string
}

export interface Order {
  id: string
  orderId: string // Display ID like "B10394720196948853..."
  liveSimulcastId: string // e.g., "LIVE-78B0-A2C4-F063"
  marketplaceSource: MarketplaceSource
  buyer: {
    id: string
    name: string
    avatarUrl?: string
  }
  timeOrdered: Date
  products: OrderProduct[]
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
}

export interface OrderFilters {
  status?: OrderStatus[]
  marketplace?: MarketplaceSource[]
  dateRange?: {
    start: Date
    end: Date
  }
  searchQuery?: string
}

export interface OrdersListResponse {
  orders: Order[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
