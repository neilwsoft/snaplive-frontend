/**
 * Dummy Orders Data
 *
 * Sample order data for testing and demonstration purposes
 */

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type Platform = "taobao" | "douyin" | "xiaohongshu" | "direct";

export interface OrderItem {
  product_id: string;
  product_name: {
    en: string;
    ko: string;
  };
  quantity: number;
  unit_price: number;
  subtotal: number;
  sku: string;
  image_url?: string;
}

export interface ShippingAddress {
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_email: string;
  buyer_name: string;
  buyer_language: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  platform: Platform;
  platform_order_id?: string;
  shipping_address: ShippingAddress;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  buyer_notes?: string;
  seller_notes?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
}

export const dummyOrders: Order[] = [
  {
    id: "ord_001",
    order_number: "SL-2025-001",
    buyer_email: "wang.li@example.com",
    buyer_name: "Wang Li",
    buyer_language: "en",
    items: [
      {
        product_id: "prod_001",
        product_name: {
          en: "Premium Korean Kimchi 1kg",
          ko: "프리미엄 한국 김치 1kg"
        },
        quantity: 2,
        unit_price: 45.00,
        subtotal: 90.00,
        sku: "KIMCHI-1KG-001"
      },
      {
        product_id: "prod_002",
        product_name: {
          en: "Premium Korean Gochujang 500g",
          ko: "고급 한국 고추장 500g"
        },
        quantity: 1,
        unit_price: 28.50,
        subtotal: 28.50,
        sku: "GOCHUJANG-500G-001"
      }
    ],
    subtotal: 118.50,
    shipping_fee: 15.00,
    tax: 6.68,
    total: 140.18,
    currency: "USD",
    status: "shipped",
    payment_status: "completed",
    platform: "taobao",
    platform_order_id: "TB2025001234567",
    shipping_address: {
      recipient_name: "Wang Li",
      phone: "+86-138-0000-1111",
      address_line1: "88 Jianguo Road, Chaoyang District",
      address_line2: "SOHO Modern City, Building 5, Unit 2, Room 1503",
      city: "Beijing",
      province: "Beijing",
      postal_code: "100025",
      country: "China"
    },
    tracking_number: "SF1234567890",
    carrier: "SF Express",
    estimated_delivery_date: "2025-11-05T00:00:00Z",
    created_at: "2025-11-01T08:30:00Z",
    updated_at: "2025-11-02T14:20:00Z",
    confirmed_at: "2025-11-01T09:00:00Z",
    shipped_at: "2025-11-02T14:20:00Z"
  },
  {
    id: "ord_002",
    order_number: "SL-2025-002",
    buyer_email: "zhang.wei@example.com",
    buyer_name: "Zhang Wei",
    buyer_language: "en",
    items: [
      {
        product_id: "prod_003",
        product_name: {
          en: "Korean Skincare Set (Toner + Lotion)",
          ko: "한국 화장품 세트 (토너 + 로션)"
        },
        quantity: 1,
        unit_price: 89.90,
        subtotal: 89.90,
        sku: "COSMETIC-SET-001"
      }
    ],
    subtotal: 89.90,
    shipping_fee: 10.00,
    tax: 4.99,
    total: 104.89,
    currency: "USD",
    status: "confirmed",
    payment_status: "completed",
    platform: "douyin",
    platform_order_id: "DY2025002345678",
    shipping_address: {
      recipient_name: "Zhang Wei",
      phone: "+86-139-0000-2222",
      address_line1: "1000 Lujiazui Ring Road, Pudong New Area",
      city: "Shanghai",
      province: "Shanghai",
      postal_code: "200120",
      country: "China"
    },
    buyer_notes: "Please deliver directly, do not leave at parcel locker",
    created_at: "2025-11-02T10:15:00Z",
    updated_at: "2025-11-02T10:30:00Z",
    confirmed_at: "2025-11-02T10:30:00Z"
  },
  {
    id: "ord_003",
    order_number: "SL-2025-003",
    buyer_email: "li.na@example.com",
    buyer_name: "Li Na",
    buyer_language: "en",
    items: [
      {
        product_id: "prod_004",
        product_name: {
          en: "Korean Instant Ramen 20-Pack",
          ko: "한국 즉석 라면 20개입"
        },
        quantity: 1,
        unit_price: 35.00,
        subtotal: 35.00,
        sku: "RAMEN-20PK-001"
      },
      {
        product_id: "prod_005",
        product_name: {
          en: "Korean Seaweed Gift Set",
          ko: "한국 김 선물세트"
        },
        quantity: 3,
        unit_price: 18.00,
        subtotal: 54.00,
        sku: "SEAWEED-GIFT-001"
      }
    ],
    subtotal: 89.00,
    shipping_fee: 12.00,
    tax: 5.05,
    total: 106.05,
    currency: "USD",
    status: "delivered",
    payment_status: "completed",
    platform: "xiaohongshu",
    platform_order_id: "XHS2025003456789",
    shipping_address: {
      recipient_name: "Li Na",
      phone: "+86-137-0000-3333",
      address_line1: "85 Huacheng Avenue, Zhujiang New Town, Tianhe District",
      address_line2: "Taikoo Hui Mall, 3rd Floor",
      city: "Guangzhou",
      province: "Guangdong",
      postal_code: "510623",
      country: "China"
    },
    tracking_number: "YTO9876543210",
    carrier: "YTO Express",
    estimated_delivery_date: "2025-11-01T00:00:00Z",
    actual_delivery_date: "2025-11-01T16:45:00Z",
    created_at: "2025-10-28T14:20:00Z",
    updated_at: "2025-11-01T16:45:00Z",
    confirmed_at: "2025-10-28T15:00:00Z",
    shipped_at: "2025-10-29T09:30:00Z",
    delivered_at: "2025-11-01T16:45:00Z"
  },
  {
    id: "ord_004",
    order_number: "SL-2025-004",
    buyer_email: "chen.ming@example.com",
    buyer_name: "Chen Ming",
    buyer_language: "en",
    items: [
      {
        product_id: "prod_006",
        product_name: {
          en: "Samsung Galaxy Buds Pro",
          ko: "삼성 갤럭시 버즈 프로"
        },
        quantity: 1,
        unit_price: 899.00,
        subtotal: 899.00,
        sku: "SAMSUNG-BUDS-PRO-001"
      }
    ],
    subtotal: 899.00,
    shipping_fee: 0.00,
    tax: 44.95,
    total: 943.95,
    currency: "USD",
    status: "processing",
    payment_status: "completed",
    platform: "taobao",
    platform_order_id: "TB2025004567890",
    shipping_address: {
      recipient_name: "Chen Ming",
      phone: "+86-136-0000-4444",
      address_line1: "15 Keyuan Road, Nanshan Science Park South Area",
      city: "Shenzhen",
      province: "Guangdong",
      postal_code: "518057",
      country: "China"
    },
    seller_notes: "High-value item, please use insured shipping",
    created_at: "2025-11-02T16:00:00Z",
    updated_at: "2025-11-02T18:30:00Z",
    confirmed_at: "2025-11-02T16:15:00Z"
  },
  {
    id: "ord_005",
    order_number: "SL-2025-005",
    buyer_email: "zhao.qiang@example.com",
    buyer_name: "Zhao Qiang",
    buyer_language: "en",
    items: [
      {
        product_id: "prod_007",
        product_name: {
          en: "Traditional Korean Ginseng Tea 50-Pack",
          ko: "한국 전통 인삼차 50포"
        },
        quantity: 2,
        unit_price: 65.00,
        subtotal: 130.00,
        sku: "GINSENG-TEA-50-001"
      }
    ],
    subtotal: 130.00,
    shipping_fee: 15.00,
    tax: 7.25,
    total: 152.25,
    currency: "USD",
    status: "pending",
    payment_status: "pending",
    platform: "direct",
    shipping_address: {
      recipient_name: "Zhao Qiang",
      phone: "+86-135-0000-5555",
      address_line1: "9 Renmin South Road Section 4, Wuhou District",
      city: "Chengdu",
      province: "Sichuan",
      postal_code: "610041",
      country: "China"
    },
    buyer_notes: "Invoice required",
    created_at: "2025-11-03T09:45:00Z",
    updated_at: "2025-11-03T09:45:00Z"
  }
];

export const getOrdersByStatus = (status: OrderStatus): Order[] => {
  return dummyOrders.filter(order => order.status === status);
};

export const getOrderById = (id: string): Order | undefined => {
  return dummyOrders.find(order => order.id === id);
};

export const getRecentOrders = (limit: number = 5): Order[] => {
  return [...dummyOrders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
};
