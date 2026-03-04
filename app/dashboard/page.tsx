"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/locale-context";
import { Loader2 } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { RevenueWidget } from "@/components/dashboard/RevenueWidget";
import { PlatformSalesWidget } from "@/components/dashboard/PlatformSalesWidget";
import { OrderGrowthWidget } from "@/components/dashboard/OrderGrowthWidget";
import { LatestOrdersWidget } from "@/components/dashboard/LatestOrdersWidget";
import { LowStockWidget } from "@/components/dashboard/LowStockWidget";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-full backdrop-blur-md backdrop-filter bg-[rgba(248,250,252,0.72)] overflow-hidden">
      {/* Page Header */}
      <DashboardPageHeader title={t("dashboard.title")} subtitle={t("dashboard.subtitle")} />

      {/* Dashboard Content */}
      <div className="flex-1 px-6 py-10 overflow-y-auto">
        <div className="flex flex-col gap-10">
          {/* Top Row - Analytics Widgets */}
          <div className="grid grid-cols-3 gap-6">
            <RevenueWidget />
            <PlatformSalesWidget />
            <OrderGrowthWidget />
          </div>

          {/* Bottom Row - Data Tables */}
          <div className="grid grid-cols-[1fr_auto] gap-6">
            <LatestOrdersWidget />
            <div className="w-[550px]">
              <LowStockWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
