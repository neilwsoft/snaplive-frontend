"use client";

import {
  Bell,
  Package,
  CheckCircle,
  CreditCard,
  Truck,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Settings,
  DollarSign,
  Clock,
  type LucideIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocale } from "@/lib/locale-context";
import {
  getUnreadCount,
  getRecentNotifications,
} from "@/lib/data/dummy-notifications";

// Map of icon names to Lucide icon components
const iconMap: Record<string, LucideIcon> = {
  Package,
  CheckCircle,
  CreditCard,
  Truck,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Settings,
  DollarSign,
  Clock,
};

export function NotificationBell() {
  const { locale } = useLocale();
  const unreadCount = getUnreadCount();
  const recentNotifications = getRecentNotifications(10);

  const labels = {
    notifications: { en: "Notifications", ko: "알림", zh: "通知" },
    markAllAsRead: { en: "Mark all as read", ko: "모두 읽음으로 표시", zh: "全部标为已读" },
    noNotifications: { en: "No notifications", ko: "알림 없음", zh: "暂无通知" },
    viewAll: { en: "View all notifications", ko: "모든 알림 보기", zh: "查看全部通知" },
    justNow: { en: "Just now", ko: "방금 전", zh: "刚刚" },
    minutesAgo: { en: "m ago", ko: "분 전", zh: "分钟前" },
    hoursAgo: { en: "h ago", ko: "시간 전", zh: "小时前" },
    daysAgo: { en: "d ago", ko: "일 전", zh: "天前" },
    typeLabels: {
      order: { en: "Order", ko: "주문", zh: "订单" },
      payment: { en: "Payment", ko: "결제", zh: "付款" },
      shipping: { en: "Shipping", ko: "배송", zh: "物流" },
      system: { en: "System", ko: "시스템", zh: "系统" },
      promotion: { en: "Promotion", ko: "프로모션", zh: "促销" },
    }
  };

  const markAsRead = (_id: string) => {
    // TODO: Implement mark as read functionality with backend API
    console.log('Mark as read:', _id);
  };

  const markAllAsRead = () => {
    // TODO: Implement mark all as read functionality with backend API
    console.log('Mark all as read');
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - notifDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) {
      return labels.justNow[locale];
    } else if (diffInMinutes < 60) {
      return locale === "ko" ? `${diffInMinutes}${labels.minutesAgo[locale]}` : `${diffInMinutes}${labels.minutesAgo[locale]}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return locale === "ko" ? `${hours}${labels.hoursAgo[locale]}` : `${hours}${labels.hoursAgo[locale]}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return locale === "ko" ? `${days}${labels.daysAgo[locale]}` : `${days}${labels.daysAgo[locale]}`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "high":
        return "bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
      case "medium":
        return "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  const getTypeLabel = (type: string) => {
    return labels.typeLabels[type as keyof typeof labels.typeLabels]?.[locale] || type;
  };

  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = iconMap[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="h-5 w-5 flex-shrink-0" />;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-3">
          <h3 className="font-semibold text-lg">{labels.notifications[locale]}</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={markAllAsRead}
            >
              {labels.markAllAsRead[locale]}
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[400px]">
          {recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p>{labels.noNotifications[locale]}</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    {notification.icon && (
                      <div className="flex-shrink-0 mt-0.5">
                        {renderIcon(notification.icon)}
                      </div>
                    )}
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm leading-tight">
                          {notification.title[locale]}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message[locale]}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(
                            notification.priority
                          )}`}
                        >
                          {getTypeLabel(notification.type)}
                        </Badge>
                      </div>
                      {notification.actionLabel && notification.actionUrl && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          asChild
                        >
                          <a href={notification.actionUrl}>
                            {notification.actionLabel[locale]} →
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button variant="ghost" className="w-full text-sm" asChild>
            <a href="/dashboard/notifications">{labels.viewAll[locale]}</a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
