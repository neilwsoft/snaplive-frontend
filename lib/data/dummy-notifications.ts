/**
 * Dummy Notifications Data
 *
 * Sample notification data for testing and demonstration purposes
 */

export type NotificationType = "order" | "payment" | "shipping" | "system" | "promotion";
export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: {
    en: string;
    ko: string;
    zh: string;
  };
  message: {
    en: string;
    ko: string;
    zh: string;
  };
  icon?: string; // Lucide icon name
  read: boolean;
  actionUrl?: string;
  actionLabel?: {
    en: string;
    ko: string;
    zh: string;
  };
  relatedId?: string; // Order ID, User ID, etc.
  createdAt: string;
  readAt?: string;
}

export const dummyNotifications: Notification[] = [
  {
    id: "notif_001",
    type: "order",
    priority: "high",
    title: {
      en: "New Order Received",
      ko: "새 주문 접수",
      zh: "收到新订单"
    },
    message: {
      en: "Order #SL-2025-005 has been received. Please review and process.",
      ko: "주문 #SL-2025-005가 접수되었습니다. 검토 및 처리해 주세요.",
      zh: "订单 #SL-2025-005 已收到，请审核并处理。"
    },
    icon: "Package",
    read: false,
    actionUrl: "/dashboard/orders/ord_005",
    actionLabel: {
      en: "View Order",
      ko: "주문 보기",
      zh: "查看订单"
    },
    relatedId: "ord_005",
    createdAt: "2025-11-03T09:45:00Z"
  },
  {
    id: "notif_002",
    type: "shipping",
    priority: "medium",
    title: {
      en: "Order Delivered",
      ko: "주문 배송 완료",
      zh: "订单已送达"
    },
    message: {
      en: "Order #SL-2025-003 has been successfully delivered. Customer has received the items.",
      ko: "주문 #SL-2025-003이 성공적으로 배송되었습니다. 고객이 상품을 수령했습니다.",
      zh: "订单 #SL-2025-003 已成功送达，客户已签收。"
    },
    icon: "CheckCircle",
    read: false,
    actionUrl: "/dashboard/orders/ord_003",
    actionLabel: {
      en: "View Order",
      ko: "주문 보기",
      zh: "查看订单"
    },
    relatedId: "ord_003",
    createdAt: "2025-11-01T16:45:00Z"
  },
  {
    id: "notif_003",
    type: "payment",
    priority: "high",
    title: {
      en: "Payment Received",
      ko: "결제 수령",
      zh: "已收到付款"
    },
    message: {
      en: "Payment for order #SL-2025-004 has been completed. Amount: $943.95",
      ko: "주문 #SL-2025-004의 결제가 완료되었습니다. 금액: $943.95",
      zh: "订单 #SL-2025-004 的付款已完成。金额：$943.95"
    },
    icon: "CreditCard",
    read: true,
    actionUrl: "/dashboard/orders/ord_004",
    actionLabel: {
      en: "View Order",
      ko: "주문 보기",
      zh: "查看订单"
    },
    relatedId: "ord_004",
    createdAt: "2025-11-02T16:15:00Z",
    readAt: "2025-11-02T18:00:00Z"
  },
  {
    id: "notif_004",
    type: "shipping",
    priority: "medium",
    title: {
      en: "Order Shipped",
      ko: "주문 배송 시작",
      zh: "订单已发货"
    },
    message: {
      en: "Order #SL-2025-001 has been shipped. Tracking number: SF1234567890",
      ko: "주문 #SL-2025-001이 배송되었습니다. 운송장 번호: SF1234567890",
      zh: "订单 #SL-2025-001 已发货。运单号：SF1234567890"
    },
    icon: "Truck",
    read: true,
    actionUrl: "/dashboard/orders/ord_001",
    actionLabel: {
      en: "Track Shipment",
      ko: "배송 추적",
      zh: "追踪物流"
    },
    relatedId: "ord_001",
    createdAt: "2025-11-02T14:20:00Z",
    readAt: "2025-11-02T15:30:00Z"
  },
  {
    id: "notif_005",
    type: "system",
    priority: "low",
    title: {
      en: "Low Stock Alert",
      ko: "재고 부족 알림",
      zh: "低库存预警"
    },
    message: {
      en: "Premium Korean Kimchi 1kg is running low (less than 10 units). Please restock soon.",
      ko: "프리미엄 한국 김치 1kg의 재고가 부족합니다 (10개 미만). 조속히 재고를 보충해 주세요.",
      zh: "韩国优质泡菜 1kg 库存不足（少于10件），请尽快补货。"
    },
    icon: "AlertTriangle",
    read: true,
    actionUrl: "/dashboard/inventory",
    actionLabel: {
      en: "Manage Inventory",
      ko: "재고 관리",
      zh: "管理库存"
    },
    relatedId: "prod_001",
    createdAt: "2025-11-02T10:00:00Z",
    readAt: "2025-11-02T11:00:00Z"
  },
  {
    id: "notif_006",
    type: "promotion",
    priority: "low",
    title: {
      en: "Promotion Report",
      ko: "프로모션 리포트",
      zh: "促销报告"
    },
    message: {
      en: "November special discount event has reached 50 orders!",
      ko: "11월 특별 할인 이벤트가 50개 주문을 달성했습니다!",
      zh: "11月特别折扣活动已达到50单！"
    },
    icon: "TrendingUp",
    read: true,
    actionUrl: "/dashboard/analytics",
    actionLabel: {
      en: "View Report",
      ko: "리포트 보기",
      zh: "查看报告"
    },
    createdAt: "2025-11-01T09:00:00Z",
    readAt: "2025-11-01T10:15:00Z"
  },
  {
    id: "notif_007",
    type: "order",
    priority: "medium",
    title: {
      en: "Order Confirmed",
      ko: "주문 확인",
      zh: "订单已确认"
    },
    message: {
      en: "Order #SL-2025-002 has been confirmed. Please start preparing the items.",
      ko: "주문 #SL-2025-002가 확인되었습니다. 상품 준비를 시작해 주세요.",
      zh: "订单 #SL-2025-002 已确认，请开始备货。"
    },
    icon: "CheckCircle2",
    read: true,
    actionUrl: "/dashboard/orders/ord_002",
    actionLabel: {
      en: "View Order",
      ko: "주문 보기",
      zh: "查看订单"
    },
    relatedId: "ord_002",
    createdAt: "2025-11-02T10:30:00Z",
    readAt: "2025-11-02T12:00:00Z"
  },
  {
    id: "notif_008",
    type: "system",
    priority: "urgent",
    title: {
      en: "System Maintenance Scheduled",
      ko: "시스템 유지보수 예정",
      zh: "系统维护通知"
    },
    message: {
      en: "Scheduled system maintenance on November 5th from 02:00-04:00 AM.",
      ko: "11월 5일 오전 02:00-04:00에 시스템 유지보수가 예정되어 있습니다.",
      zh: "计划于11月5日凌晨 02:00-04:00 进行系统维护。"
    },
    icon: "Settings",
    read: false,
    actionUrl: "/dashboard/notifications",
    actionLabel: {
      en: "Learn More",
      ko: "자세히 보기",
      zh: "了解更多"
    },
    createdAt: "2025-11-03T08:00:00Z"
  },
  {
    id: "notif_009",
    type: "payment",
    priority: "medium",
    title: {
      en: "Payment Confirmed",
      ko: "결제 확인",
      zh: "付款已确认"
    },
    message: {
      en: "Payment for order #SL-2025-001 has been verified and confirmed.",
      ko: "주문 #SL-2025-001의 결제가 확인되었습니다.",
      zh: "订单 #SL-2025-001 的付款已核实确认。"
    },
    icon: "DollarSign",
    read: true,
    actionUrl: "/dashboard/orders/ord_001",
    relatedId: "ord_001",
    createdAt: "2025-11-01T09:00:00Z",
    readAt: "2025-11-01T09:15:00Z"
  },
  {
    id: "notif_010",
    type: "shipping",
    priority: "high",
    title: {
      en: "Delivery Delayed",
      ko: "배송 지연",
      zh: "配送延迟"
    },
    message: {
      en: "Order #SL-2025-001 delivery will be delayed by 1 day due to weather conditions.",
      ko: "기상 조건으로 인해 주문 #SL-2025-001의 배송이 1일 지연됩니다.",
      zh: "由于天气原因，订单 #SL-2025-001 的配送将延迟1天。"
    },
    icon: "Clock",
    read: false,
    actionUrl: "/dashboard/orders/ord_001",
    actionLabel: {
      en: "View Order",
      ko: "주문 보기",
      zh: "查看订单"
    },
    relatedId: "ord_001",
    createdAt: "2025-11-03T06:30:00Z"
  }
];

export const getUnreadNotifications = (): Notification[] => {
  return dummyNotifications.filter(notif => !notif.read);
};

export const getUnreadCount = (): number => {
  return getUnreadNotifications().length;
};

export const getNotificationsByType = (type: NotificationType): Notification[] => {
  return dummyNotifications.filter(notif => notif.type === type);
};

export const getNotificationById = (id: string): Notification | undefined => {
  return dummyNotifications.find(notif => notif.id === id);
};

export const getRecentNotifications = (limit: number = 5): Notification[] => {
  return [...dummyNotifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const getNotificationsByPriority = (priority: NotificationPriority): Notification[] => {
  return dummyNotifications.filter(notif => notif.priority === priority);
};
