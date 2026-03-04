"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, RefreshCw, Store, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listStores, type StoreConnection } from "@/lib/api/platforms";

export default function StoresPage() {
  const [stores, setStores] = useState<StoreConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);

      // Always show dummy data for demo purposes
      setStores([
        {
          id: "1",
          seller_id: "demo",
          platform: "taobao",
          store_id: "TB123456",
          store_name: "My Taobao Live Store",
          store_url: "https://shop123456.taobao.com",
          connection_status: "connected",
          last_sync_status: "success",
          last_sync_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
          total_syncs: 156,
          successful_syncs: 152,
          failed_syncs: 4,
          config: {
            auto_sync_inventory: true,
            auto_sync_orders: true,
            auto_sync_products: true,
            rtmp_enabled: true,
          },
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          updated_at: new Date().toISOString(),
          connected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          seller_id: "demo",
          platform: "douyin",
          store_id: "DY789012",
          store_name: "抖音官方小店",
          store_url: "https://haohuo.jinritemai.com/views/shop/index?id=789012",
          connection_status: "connected",
          last_sync_status: "success",
          last_sync_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
          total_syncs: 89,
          successful_syncs: 87,
          failed_syncs: 2,
          config: {
            auto_sync_inventory: true,
            auto_sync_orders: true,
            auto_sync_products: false,
            rtmp_enabled: true,
          },
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          updated_at: new Date().toISOString(),
          connected_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          seller_id: "demo",
          platform: "xiaohongshu",
          store_id: "XHS345678",
          store_name: "小红书精选店铺",
          store_url: "https://www.xiaohongshu.com/store/345678",
          connection_status: "connected",
          last_sync_status: "success",
          last_sync_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 mins ago
          total_syncs: 45,
          successful_syncs: 44,
          failed_syncs: 1,
          config: {
            auto_sync_inventory: true,
            auto_sync_orders: true,
            auto_sync_products: true,
            rtmp_enabled: false,
          },
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          updated_at: new Date().toISOString(),
          connected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          seller_id: "demo",
          platform: "taobao",
          store_id: "TB999888",
          store_name: "淘宝直播旗舰店",
          store_url: "https://shop999888.taobao.com",
          connection_status: "error",
          last_sync_status: "failed",
          last_sync_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
          connection_error: "API rate limit exceeded",
          total_syncs: 234,
          successful_syncs: 220,
          failed_syncs: 14,
          config: {
            auto_sync_inventory: true,
            auto_sync_orders: true,
            auto_sync_products: true,
            rtmp_enabled: true,
          },
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
          updated_at: new Date().toISOString(),
          connected_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);

      // Optionally try to load real data too
      // try {
      //   const data = await listStores({ seller_id: "demo-seller" });
      //   if (data.stores.length > 0) {
      //     setStores(data.stores);
      //   }
      // } catch (err) {
      //   console.log("Could not load real stores, using dummy data");
      // }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      connected: "default",
      error: "destructive",
      pending: "secondary",
      disconnected: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getPlatformName = (platform: string) => {
    const names: Record<string, string> = {
      taobao: "Taobao Live",
      douyin: "Douyin (抖音)",
      xiaohongshu: "Xiaohongshu (小红书)",
    };
    return names[platform] || platform;
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      taobao: "bg-orange-500",
      douyin: "bg-black",
      xiaohongshu: "bg-red-500",
    };
    return colors[platform] || "bg-gray-500";
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace Stores</h1>
          <p className="text-muted-foreground">
            Manage your connections to Taobao, Douyin, and Xiaohongshu
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadStores} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/dashboard/stores/connect">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Connect Store
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && stores.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!loading && stores.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No stores connected</h3>
            <p className="text-muted-foreground text-center mb-4">
              Connect your first marketplace store to start syncing orders, inventory, and products.
            </p>
            <Link href="/dashboard/stores/connect">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Connect Your First Store
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Store Cards Grid */}
      {stores.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Link key={store.id} href={`/dashboard/stores/${store.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${getPlatformColor(store.platform)} h-10 w-10 rounded-lg flex items-center justify-center`}>
                        <Store className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{store.store_name}</CardTitle>
                        <CardDescription>{getPlatformName(store.platform)}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(store.connection_status)}
                        {getStatusBadge(store.connection_status)}
                      </div>
                    </div>

                    {/* Last Sync */}
                    {store.last_sync_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Sync</span>
                        <span className="text-sm font-medium">
                          {new Date(store.last_sync_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Sync Stats */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Sync Success Rate</span>
                      <span className="text-sm font-medium">
                        {store.total_syncs > 0
                          ? Math.round((store.successful_syncs / store.total_syncs) * 100)
                          : 0}
                        %
                      </span>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 pt-2">
                      {store.config.auto_sync_inventory && (
                        <Badge variant="outline" className="text-xs">
                          Auto Inventory
                        </Badge>
                      )}
                      {store.config.auto_sync_orders && (
                        <Badge variant="outline" className="text-xs">
                          Auto Orders
                        </Badge>
                      )}
                      {store.config.rtmp_enabled && (
                        <Badge variant="outline" className="text-xs">
                          RTMP Streaming
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
