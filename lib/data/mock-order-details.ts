import { OrderDetail, Customer } from "@/types/order-detail"

// Mock customers
const mockCustomers: Record<string, Customer> = {
  "buyer-1": {
    id: "buyer-1",
    name: "Annie 安安",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    contactNumber: "+86 138 1234 5678",
    email: "jwang@redballvegcorp.cn",
    address: "Placeholder",
  },
  "buyer-2": {
    id: "buyer-2",
    name: "The Product Curator 品管官",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    contactNumber: "+86 139 8765 4321",
    email: "curator@example.cn",
    address: "123 Main Street, Beijing",
  },
  "buyer-3": {
    id: "buyer-3",
    name: "Easy Pesl 易凯",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    contactNumber: "+86 135 5555 6666",
    email: "easypesl@example.cn",
    address: "456 Commerce Road, Shanghai",
  },
}

// Function to get order detail by ID
export function getOrderDetailById(_orderId: string): OrderDetail | null {
  // Mock order detail based on order ID
  const baseDate = new Date(Date.now() - 2 * 60 * 60 * 1000)

  // Return a detailed order
  // In a real implementation, this would fetch the order by ID
  return {
    id: "1",
    orderId: "B10394720196948853",
    liveSimulcastId: "LIVE-78B0-A2C4-F063",
    marketplaceSource: "douyin",
    buyer: {
      id: "buyer-1",
      name: "Annie 安安",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    timeOrdered: baseDate,
    products: [
      {
        id: "prod-1",
        sku: "90071-M-NU002",
        name: "Velvet Matte Lipstick",
        imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&h=200&fit=crop",
        quantity: 2,
        unit: "pcs",
        badges: [{ type: "new", label: "NEW" }],
        fulfillmentStatus: null,
      },
      {
        id: "prod-2",
        sku: "104850-L-BL",
        name: "Bright Yellow Knitted Long Sleeve Dress",
        imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&h=200&fit=crop",
        quantity: 1,
        unit: "pc",
        badges: [
          { type: "new", label: "NEW" },
          { type: "bestseller", label: "BESTSELLER" },
        ],
        fulfillmentStatus: null,
      },
      {
        id: "prod-3",
        sku: "77800-PRO-BK",
        name: "PRO-Vlog Wireless Mic System",
        imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&h=200&fit=crop",
        quantity: 1,
        unit: "unit",
        badges: [{ type: "new", label: "NEW" }],
        fulfillmentStatus: null,
      },
    ],
    status: "returning",
    createdAt: baseDate,
    updatedAt: new Date(),
    customer: mockCustomers["buyer-1"],
    transactions: [
      {
        id: "txn-1",
        timestamp: baseDate,
        amount: 788.88,
        currency: "CNY",
        status: "pending",
      },
    ],
    totalAmount: 788.88,
    paidAmount: 0.0,
    currency: "CNY",
    processingStep: 1,
  }
}

// Get all order IDs that have details
export const orderIdsWithDetails = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
]
