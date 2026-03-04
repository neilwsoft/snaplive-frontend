import { Order } from "@/types/order"

export const mockOrders: Order[] = [
  {
    id: "1",
    orderId: "B10394720196948853",
    liveSimulcastId: "LIVE-78B0-A2C4-F063",
    marketplaceSource: "douyin",
    buyer: {
      id: "buyer-1",
      name: "Annie 安安",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    timeOrdered: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    products: [
      { id: "p1", name: "Item Name", quantity: 1 },
      { id: "p2", name: "Item Name", quantity: 1 },
      { id: "p3", name: "New", quantity: 1 },
    ],
    status: "returning",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "2",
    orderId: "B10394720196948854",
    liveSimulcastId: "LIVE-78B0-A2C4-F063",
    marketplaceSource: "xiaohongshu",
    buyer: {
      id: "buyer-2",
      name: "The Product Curator 品管官",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    timeOrdered: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    products: [
      { id: "p4", name: "Item Name", quantity: 1 },
      { id: "p5", name: "Item Name", quantity: 1 },
      { id: "p6", name: "New", quantity: 1 },
    ],
    status: "returning",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "3",
    orderId: "B10394720196948855",
    liveSimulcastId: "LIVE-78B0-A2C4-F063",
    marketplaceSource: "taobao",
    buyer: {
      id: "buyer-3",
      name: "Easy Pesl 易凯",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    timeOrdered: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    products: [
      { id: "p7", name: "Item Name", quantity: 1 },
      { id: "p8", name: "Item Name", quantity: 1 },
      { id: "p9", name: "Pending", quantity: 1 },
    ],
    status: "returning",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "4",
    orderId: "B10394720196948856",
    liveSimulcastId: "LIVE-78B0-A2C4-F063",
    marketplaceSource: "douyin",
    buyer: {
      id: "buyer-4",
      name: "Annie 安安",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    timeOrdered: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    products: [
      { id: "p10", name: "Item Name", quantity: 1 },
      { id: "p11", name: "Item Name", quantity: 1 },
      { id: "p12", name: "Pending", quantity: 1 },
    ],
    status: "returning",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "5",
    orderId: "B10394720196948857",
    liveSimulcastId: "LIVE-78B0-A2C4-F063",
    marketplaceSource: "douyin",
    buyer: {
      id: "buyer-5",
      name: "Sincere Sarah 心心",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    timeOrdered: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    products: [
      { id: "p13", name: "Item Name", quantity: 1 },
      { id: "p14", name: "Item Name", quantity: 1 },
    ],
    status: "returning",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "6",
    orderId: "B10394720196948858",
    liveSimulcastId: "LIVE-78B0-A2C4-F063",
    marketplaceSource: "snaplive",
    buyer: {
      id: "buyer-6",
      name: "Honest Hank 老实",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    },
    timeOrdered: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
    products: [
      { id: "p15", name: "Item Name", quantity: 1 },
      { id: "p16", name: "Item Name", quantity: 1 },
      { id: "p17", name: "Ready", quantity: 1 },
    ],
    status: "ready",
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "7",
    orderId: "B10394720196948859",
    liveSimulcastId: "LIVE-78B0-A2C4-F063",
    marketplaceSource: "xiaohongshu",
    buyer: {
      id: "buyer-7",
      name: "Unnamed",
      avatarUrl: undefined,
    },
    timeOrdered: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    products: [
      { id: "p18", name: "Item Name", quantity: 1 },
      { id: "p19", name: "Item Name", quantity: 1 },
      { id: "p20", name: "Cancelled", quantity: 1 },
    ],
    status: "cancelled",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "8",
    orderId: "B10394720196948860",
    liveSimulcastId: "LIVE-78B0-A2C4-F063",
    marketplaceSource: "xiaohongshu",
    buyer: {
      id: "buyer-8",
      name: "Dot Com 嚣嚣",
      avatarUrl: undefined,
    },
    timeOrdered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    products: [
      { id: "p21", name: "Item Name", quantity: 1 },
      { id: "p22", name: "Item Name", quantity: 1 },
      { id: "p23", name: "Shopping", quantity: 1 },
    ],
    status: "shopping",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "9",
    orderId: "B10394720196948861",
    liveSimulcastId: "LIVE-78B0-A2C4-F063",
    marketplaceSource: "snaplive",
    buyer: {
      id: "buyer-9",
      name: "Best Price Ben 好价",
      avatarUrl: undefined,
    },
    timeOrdered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    products: [
      { id: "p24", name: "Item Name", quantity: 1 },
      { id: "p25", name: "Item Name", quantity: 1 },
      { id: "p26", name: "Shopping", quantity: 1 },
    ],
    status: "shopping",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "10",
    orderId: "B10394720196948862",
    liveSimulcastId: "LIVE-78B0-A2C4-F063",
    marketplaceSource: "snaplive",
    buyer: {
      id: "buyer-10",
      name: "Treasure Ted 寻宝",
      avatarUrl: undefined,
    },
    timeOrdered: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    products: [
      { id: "p27", name: "Item Name", quantity: 1 },
      { id: "p28", name: "Item Name", quantity: 1 },
      { id: "p29", name: "Delivered", quantity: 1 },
    ],
    status: "delivered",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "11",
    orderId: "B10394720196948863",
    liveSimulcastId: "LIVE-78B0-A2C4-F063",
    marketplaceSource: "taobao",
    buyer: {
      id: "buyer-11",
      name: "Rapid Rob 罗罗",
      avatarUrl: undefined,
    },
    timeOrdered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    products: [
      { id: "p30", name: "Item Name", quantity: 1 },
      { id: "p31", name: "Item Name", quantity: 1 },
      { id: "p32", name: "Delivered", quantity: 1 },
    ],
    status: "delivered",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "12",
    orderId: "B10394720196948864",
    liveSimulcastId: "LIVE-78B0-A2C4-F063",
    marketplaceSource: "taobao",
    buyer: {
      id: "buyer-12",
      name: "Annie 安安",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    timeOrdered: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    products: [
      { id: "p33", name: "Item Name", quantity: 1 },
      { id: "p34", name: "Item Name", quantity: 1 },
      { id: "p35", name: "Return", quantity: 1 },
    ],
    status: "return",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
]
