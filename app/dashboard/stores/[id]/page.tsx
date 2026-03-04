"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, TrendingUp, Package, ShoppingCart, Video, Copy, Eye, EyeOff, Pencil, Save, X, Loader2, Clock, CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getStore, getStoreDashboard, updateStore, type StoreConnection, type StoreDashboardMetrics } from "@/lib/api/platforms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSyncHistory, type SyncLog } from "@/lib/api/sync";

export default function StoreDashboardPage() {
  const params = useParams();
  const storeId = params.id as string;

  const [store, setStore] = useState<StoreConnection | null>(null);
  const [metrics, setMetrics] = useState<StoreDashboardMetrics | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // RTMP Configuration State
  const [rtmpConfig, setRtmpConfig] = useState({
    rtmp_url: "",
    rtmp_stream_key: "",
    rtmp_password: "",
  });
  const [rtmpEditing, setRtmpEditing] = useState(false);
  const [rtmpSaving, setRtmpSaving] = useState(false);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use dummy data for demo stores (IDs 1-4)
      if (["1", "2", "3", "4"].includes(storeId)) {
        const dummyStores = {
          "1": {
            id: "1",
            seller_id: "demo",
            platform: "taobao",
            store_id: "TB123456",
            store_name: "My Taobao Live Store",
            store_url: "https://shop123456.taobao.com",
            connection_status: "connected" as const,
            last_sync_status: "success" as const,
            last_sync_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            total_syncs: 156,
            successful_syncs: 152,
            failed_syncs: 4,
            config: {
              auto_sync_inventory: true,
              auto_sync_orders: true,
              auto_sync_products: true,
              rtmp_enabled: true,
              rtmp_url: "rtmp://live.taobao.com/stream",
              rtmp_stream_key: "tb_live_123456_abcdef",
              rtmp_password: "secretpass123",
            },
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            connected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          "2": {
            id: "2",
            seller_id: "demo",
            platform: "douyin",
            store_id: "DY789012",
            store_name: "抖音官方小店",
            store_url: "https://haohuo.jinritemai.com/views/shop/index?id=789012",
            connection_status: "connected" as const,
            last_sync_status: "success" as const,
            last_sync_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            total_syncs: 89,
            successful_syncs: 87,
            failed_syncs: 2,
            config: {
              auto_sync_inventory: true,
              auto_sync_orders: true,
              auto_sync_products: false,
              rtmp_enabled: true,
              rtmp_url: "rtmp://push.douyin.com/live",
              rtmp_stream_key: "dy_stream_789012_xyz",
              rtmp_password: "douyinpass456",
            },
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            connected_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          },
          "3": {
            id: "3",
            seller_id: "demo",
            platform: "xiaohongshu",
            store_id: "XHS345678",
            store_name: "小红书精选店铺",
            store_url: "https://www.xiaohongshu.com/store/345678",
            connection_status: "connected" as const,
            last_sync_status: "success" as const,
            last_sync_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            total_syncs: 45,
            successful_syncs: 44,
            failed_syncs: 1,
            config: {
              auto_sync_inventory: true,
              auto_sync_orders: true,
              auto_sync_products: true,
              rtmp_enabled: false,
            },
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            connected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          "4": {
            id: "4",
            seller_id: "demo",
            platform: "taobao",
            store_id: "TB999888",
            store_name: "淘宝直播旗舰店",
            store_url: "https://shop999888.taobao.com",
            connection_status: "error" as const,
            last_sync_status: "failed" as const,
            last_sync_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            connection_error: "API rate limit exceeded",
            total_syncs: 234,
            successful_syncs: 220,
            failed_syncs: 14,
            config: {
              auto_sync_inventory: true,
              auto_sync_orders: true,
              auto_sync_products: true,
              rtmp_enabled: true,
              rtmp_url: "rtmp://live.taobao.com/stream",
              rtmp_stream_key: "tb_flagship_999888_key",
              rtmp_password: "flagshippass789",
            },
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            connected_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          },
        };

        const dummyMetrics = {
          "1": {
            store_id: "1",
            platform: "taobao",
            store_name: "My Taobao Live Store",
            connection_status: "connected",
            last_sync_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            api_calls_remaining: 8432,
            orders_today: 45,
            orders_this_week: 312,
            orders_this_month: 1256,
            revenue_today: 18500.50,
            revenue_this_week: 125890.75,
            revenue_this_month: 485632.90,
            average_order_value: 386.50,
            conversion_rate: 8.5,
            total_products: 458,
            in_stock_products: 432,
            out_of_stock_products: 12,
            low_stock_products: 14,
            sync_conflicts: 2,
            active_streams: 1,
            total_viewers_today: 15420,
            peak_concurrent_viewers: 3280,
            average_watch_time_minutes: 28.5,
            engagement_rate: 42.3,
            products_shown_in_stream: 18,
            sync_success_rate_24h: 97.4,
            pending_sync_items: 5,
          },
          "2": {
            store_id: "2",
            platform: "douyin",
            store_name: "抖音官方小店",
            connection_status: "connected",
            last_sync_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            api_calls_remaining: 4567,
            orders_today: 78,
            orders_this_week: 523,
            orders_this_month: 2134,
            revenue_today: 32100.00,
            revenue_this_week: 218900.50,
            revenue_this_month: 892345.80,
            average_order_value: 418.20,
            conversion_rate: 12.8,
            total_products: 256,
            in_stock_products: 242,
            out_of_stock_products: 8,
            low_stock_products: 6,
            sync_conflicts: 0,
            active_streams: 2,
            total_viewers_today: 28650,
            peak_concurrent_viewers: 8420,
            average_watch_time_minutes: 35.2,
            engagement_rate: 58.7,
            products_shown_in_stream: 24,
            sync_success_rate_24h: 97.8,
            pending_sync_items: 3,
          },
          "3": {
            store_id: "3",
            platform: "xiaohongshu",
            store_name: "小红书精选店铺",
            connection_status: "connected",
            last_sync_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            api_calls_remaining: 2890,
            orders_today: 32,
            orders_this_week: 198,
            orders_this_month: 845,
            revenue_today: 16800.00,
            revenue_this_week: 98450.30,
            revenue_this_month: 412890.60,
            average_order_value: 488.50,
            conversion_rate: 15.2,
            total_products: 189,
            in_stock_products: 178,
            out_of_stock_products: 5,
            low_stock_products: 6,
            sync_conflicts: 1,
            active_streams: 0,
            total_viewers_today: 8920,
            peak_concurrent_viewers: 2150,
            average_watch_time_minutes: 42.8,
            engagement_rate: 68.4,
            products_shown_in_stream: 12,
            sync_success_rate_24h: 97.8,
            pending_sync_items: 2,
          },
          "4": {
            store_id: "4",
            platform: "taobao",
            store_name: "淘宝直播旗舰店",
            connection_status: "error",
            last_sync_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            last_sync_error: "API rate limit exceeded",
            api_calls_remaining: 0,
            orders_today: 12,
            orders_this_week: 156,
            orders_this_month: 892,
            revenue_today: 5600.00,
            revenue_this_week: 72800.00,
            revenue_this_month: 398200.50,
            average_order_value: 446.50,
            conversion_rate: 6.2,
            total_products: 612,
            in_stock_products: 568,
            out_of_stock_products: 28,
            low_stock_products: 16,
            sync_conflicts: 8,
            active_streams: 0,
            total_viewers_today: 4520,
            peak_concurrent_viewers: 980,
            average_watch_time_minutes: 18.3,
            engagement_rate: 28.5,
            products_shown_in_stream: 8,
            sync_success_rate_24h: 94.0,
            pending_sync_items: 15,
          },
        };

        const dummySyncHistory = [
          {
            id: "sync-1",
            store_id: storeId,
            seller_id: "demo",
            platform: dummyStores[storeId as keyof typeof dummyStores].platform,
            sync_type: "inventory" as const,
            sync_direction: "pull" as const,
            status: "success" as const,
            triggered_by: "auto",
            result: {
              total_items: 458,
              processed_items: 458,
              successful_items: 458,
              failed_items: 0,
              updated_count: 23,
            },
            duration_seconds: 8.5,
            api_calls_made: 12,
            started_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            completed_at: new Date(Date.now() - 4.9 * 60 * 1000).toISOString(),
          },
          {
            id: "sync-2",
            store_id: storeId,
            seller_id: "demo",
            platform: dummyStores[storeId as keyof typeof dummyStores].platform,
            sync_type: "orders" as const,
            sync_direction: "pull" as const,
            status: "success" as const,
            triggered_by: "auto",
            result: {
              total_items: 45,
              processed_items: 45,
              successful_items: 45,
              failed_items: 0,
              created_count: 8,
            },
            duration_seconds: 3.2,
            api_calls_made: 5,
            started_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            completed_at: new Date(Date.now() - 14.9 * 60 * 1000).toISOString(),
          },
          {
            id: "sync-3",
            store_id: storeId,
            seller_id: "demo",
            platform: dummyStores[storeId as keyof typeof dummyStores].platform,
            sync_type: "products" as const,
            sync_direction: "pull" as const,
            status: "success" as const,
            triggered_by: "manual",
            result: {
              total_items: 256,
              processed_items: 256,
              successful_items: 254,
              failed_items: 2,
              updated_count: 12,
            },
            duration_seconds: 15.8,
            api_calls_made: 20,
            started_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            completed_at: new Date(Date.now() - 59.8 * 60 * 1000).toISOString(),
          },
        ];

        setStore(dummyStores[storeId as keyof typeof dummyStores]);
        setMetrics(dummyMetrics[storeId as keyof typeof dummyMetrics]);
        setSyncHistory(dummySyncHistory);
      } else {
        // Try to load real data for non-demo stores
        const [storeData, metricsData, historyData] = await Promise.all([
          getStore(storeId),
          getStoreDashboard(storeId),
          getSyncHistory(storeId, { page_size: 10 }),
        ]);

        setStore(storeData);
        setMetrics(metricsData);
        setSyncHistory(historyData.syncs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load store data");
      console.error("Error loading store:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, [storeId]);

  // Initialize RTMP config when store loads
  useEffect(() => {
    if (store?.config) {
      setRtmpConfig({
        rtmp_url: store.config.rtmp_url || "",
        rtmp_stream_key: store.config.rtmp_stream_key || "",
        rtmp_password: store.config.rtmp_password || "",
      });
    }
  }, [store]);

  // Save RTMP configuration
  const handleSaveRtmp = async () => {
    if (!store) return;

    setRtmpSaving(true);
    try {
      await updateStore(store.id, {
        rtmp_url: rtmpConfig.rtmp_url || undefined,
        rtmp_stream_key: rtmpConfig.rtmp_stream_key || undefined,
        rtmp_password: rtmpConfig.rtmp_password || undefined,
      });

      // Update local store state
      setStore({
        ...store,
        config: {
          ...store.config,
          rtmp_url: rtmpConfig.rtmp_url,
          rtmp_stream_key: rtmpConfig.rtmp_stream_key,
          rtmp_password: rtmpConfig.rtmp_password,
        },
      });

      setRtmpEditing(false);
    } catch (err) {
      console.error("Failed to save RTMP config:", err);
    } finally {
      setRtmpSaving(false);
    }
  };

  // Cancel RTMP editing
  const handleCancelRtmp = () => {
    if (store?.config) {
      setRtmpConfig({
        rtmp_url: store.config.rtmp_url || "",
        rtmp_stream_key: store.config.rtmp_stream_key || "",
        rtmp_password: store.config.rtmp_password || "",
      });
    }
    setRtmpEditing(false);
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getPlatformName = (platform: string) => {
    const names: Record<string, string> = {
      taobao: "Taobao Live",
      douyin: "Douyin (抖音)",
      xiaohongshu: "Xiaohongshu (小红书)",
    };
    return names[platform] || platform;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !store || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">{error || "Store not found"}</p>
        <Link href="/dashboard/stores">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stores
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/stores">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{store.store_name}</h1>
            <p className="text-muted-foreground">{getPlatformName(store.platform)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadStoreData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Badge variant={store.connection_status === "connected" ? "default" : "destructive"}>
            {store.connection_status}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.orders_today)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(metrics.orders_this_week)} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.revenue_today)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(metrics.revenue_this_week)} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.total_products)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.out_of_stock_products} out of stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Viewers</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.total_viewers_today)}</div>
            <p className="text-xs text-muted-foreground">
              Peak: {formatNumber(metrics.peak_concurrent_viewers)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="streaming">Streaming</TabsTrigger>
          <TabsTrigger value="sync">Sync History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Connection Health */}
            <Card>
              <CardHeader>
                <CardTitle>Connection Health</CardTitle>
                <CardDescription>API status and sync information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant={metrics.connection_status === "connected" ? "default" : "destructive"}>
                    {metrics.connection_status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Sync</span>
                  <span className="text-sm font-medium">
                    {metrics.last_sync_at ? new Date(metrics.last_sync_at).toLocaleString() : "Never"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sync Success Rate (24h)</span>
                  <span className="text-sm font-medium">{metrics.sync_success_rate_24h.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Calls Remaining</span>
                  <span className="text-sm font-medium">{formatNumber(metrics.api_calls_remaining || 0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Sales Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Revenue and conversion metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">This Month's Revenue</span>
                  <span className="text-sm font-medium">{formatCurrency(metrics.revenue_this_month)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Order Value</span>
                  <span className="text-sm font-medium">{formatCurrency(metrics.average_order_value)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Conversion Rate</span>
                  <span className="text-sm font-medium">{metrics.conversion_rate.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Orders This Month</span>
                  <span className="text-sm font-medium">{formatNumber(metrics.orders_this_month)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Status */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>Stock levels and sync conflicts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Products</span>
                  <span className="text-sm font-medium">{formatNumber(metrics.total_products)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">In Stock</span>
                  <span className="text-sm font-medium text-green-600">{formatNumber(metrics.in_stock_products)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low Stock</span>
                  <span className="text-sm font-medium text-yellow-600">{formatNumber(metrics.low_stock_products)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Out of Stock</span>
                  <span className="text-sm font-medium text-red-600">{formatNumber(metrics.out_of_stock_products)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Streaming Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Live Streaming</CardTitle>
                <CardDescription>Today's streaming performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Streams</span>
                  <span className="text-sm font-medium">{metrics.active_streams}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Viewers Today</span>
                  <span className="text-sm font-medium">{formatNumber(metrics.total_viewers_today)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Watch Time</span>
                  <span className="text-sm font-medium">{metrics.average_watch_time_minutes.toFixed(1)} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Engagement Rate</span>
                  <span className="text-sm font-medium">{metrics.engagement_rate.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sync History Tab */}
        <TabsContent value="sync" className="space-y-4">
          {/* Sync Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{store.total_syncs}</p>
                  <p className="text-xs text-muted-foreground">Total Syncs</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{store.successful_syncs}</p>
                  <p className="text-xs text-muted-foreground">Successful</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{store.failed_syncs}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{metrics.sync_success_rate_24h.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Success Rate (24h)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Sync</CardTitle>
              <CardDescription>Manually trigger synchronization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Package className="mr-2 h-4 w-4" />
                  Sync Inventory
                </Button>
                <Button variant="outline" size="sm">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Sync Orders
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Sync Products
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Full Sync
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sync History List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sync Operations</CardTitle>
              <CardDescription>Last 10 synchronization operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 gap-4 p-4 font-medium text-sm border-b bg-muted/50">
                  <div>Type</div>
                  <div>Direction</div>
                  <div>Items</div>
                  <div>Duration</div>
                  <div>Status</div>
                </div>
                {syncHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No sync history available</p>
                ) : (
                  syncHistory.map((sync) => (
                    <div key={sync.id} className="grid grid-cols-5 gap-4 p-4 text-sm border-b last:border-0 hover:bg-muted/30">
                      <div>
                        <p className="font-medium capitalize">{sync.sync_type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sync.started_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="capitalize">
                          {sync.sync_direction}
                        </Badge>
                      </div>
                      <div>
                        {sync.result && (
                          <div>
                            <p className="font-medium">{sync.result.successful_items}/{sync.result.total_items}</p>
                            <p className="text-xs text-muted-foreground">
                              {sync.result.failed_items > 0 && (
                                <span className="text-red-600">{sync.result.failed_items} failed</span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                      <div>
                        {sync.duration_seconds && (
                          <p>{sync.duration_seconds.toFixed(1)}s</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {sync.api_calls_made} API calls
                        </p>
                      </div>
                      <div>
                        <Badge variant={
                          sync.status === "success" ? "default" :
                          sync.status === "failed" ? "destructive" :
                          "secondary"
                        }>
                          {sync.status === "success" && <CheckCircle className="mr-1 h-3 w-3" />}
                          {sync.status === "failed" && <XCircle className="mr-1 h-3 w-3" />}
                          {sync.status === "in_progress" && <Clock className="mr-1 h-3 w-3" />}
                          {sync.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>View and manage orders from this marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Orders Table */}
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 gap-4 p-4 font-medium text-sm border-b bg-muted/50">
                    <div>Order ID</div>
                    <div>Customer</div>
                    <div>Items</div>
                    <div>Total</div>
                    <div>Status</div>
                    <div>Date</div>
                  </div>
                  {[
                    { id: "ORD-001", customer: "张三", items: 3, total: 1580.00, status: "completed", date: "2024-01-15 14:32" },
                    { id: "ORD-002", customer: "李四", items: 1, total: 299.00, status: "shipped", date: "2024-01-15 13:15" },
                    { id: "ORD-003", customer: "王五", items: 5, total: 2450.00, status: "processing", date: "2024-01-15 12:08" },
                    { id: "ORD-004", customer: "赵六", items: 2, total: 890.00, status: "pending", date: "2024-01-15 11:45" },
                    { id: "ORD-005", customer: "陈七", items: 4, total: 1820.00, status: "completed", date: "2024-01-15 10:22" },
                    { id: "ORD-006", customer: "刘八", items: 1, total: 459.00, status: "cancelled", date: "2024-01-15 09:30" },
                    { id: "ORD-007", customer: "周九", items: 2, total: 1280.00, status: "shipped", date: "2024-01-14 18:45" },
                    { id: "ORD-008", customer: "吴十", items: 3, total: 2100.00, status: "completed", date: "2024-01-14 16:20" },
                  ].map((order) => (
                    <div key={order.id} className="grid grid-cols-6 gap-4 p-4 text-sm border-b last:border-0 hover:bg-muted/30">
                      <div className="font-medium">{order.id}</div>
                      <div>{order.customer}</div>
                      <div>{order.items} items</div>
                      <div>{formatCurrency(order.total)}</div>
                      <div>
                        <Badge variant={
                          order.status === "completed" ? "default" :
                          order.status === "shipped" ? "secondary" :
                          order.status === "processing" ? "outline" :
                          order.status === "cancelled" ? "destructive" :
                          "outline"
                        }>
                          {order.status === "completed" && <CheckCircle className="mr-1 h-3 w-3" />}
                          {order.status === "shipped" && <Package className="mr-1 h-3 w-3" />}
                          {order.status === "processing" && <Clock className="mr-1 h-3 w-3" />}
                          {order.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                          {order.status === "cancelled" && <XCircle className="mr-1 h-3 w-3" />}
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">{order.date}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Button variant="outline" size="sm">
                    View All Orders
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <div className="space-y-4">
            {/* Inventory Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total SKUs</p>
                      <p className="text-2xl font-bold">{formatNumber(metrics.total_products)}</p>
                    </div>
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">In Stock</p>
                      <p className="text-2xl font-bold text-green-600">{formatNumber(metrics.in_stock_products)}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Low Stock</p>
                      <p className="text-2xl font-bold text-yellow-600">{formatNumber(metrics.low_stock_products)}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Out of Stock</p>
                      <p className="text-2xl font-bold text-red-600">{formatNumber(metrics.out_of_stock_products)}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inventory Table */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Levels</CardTitle>
                <CardDescription>Current inventory across warehouses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 gap-4 p-4 font-medium text-sm border-b bg-muted/50">
                    <div>SKU</div>
                    <div>Product Name</div>
                    <div>Warehouse</div>
                    <div className="text-right">Quantity</div>
                    <div>Status</div>
                    <div>Last Updated</div>
                  </div>
                  {[
                    { sku: "SKU-001", name: "Premium Skincare Set", warehouse: "Shanghai WH1", qty: 1250, status: "normal", updated: "2 min ago" },
                    { sku: "SKU-002", name: "Vitamin C Serum 30ml", warehouse: "Shanghai WH1", qty: 8, status: "low", updated: "5 min ago" },
                    { sku: "SKU-003", name: "Hydrating Face Mask (5pc)", warehouse: "Beijing WH2", qty: 0, status: "out", updated: "1 hour ago" },
                    { sku: "SKU-004", name: "Anti-Aging Eye Cream", warehouse: "Shanghai WH1", qty: 456, status: "normal", updated: "10 min ago" },
                    { sku: "SKU-005", name: "Collagen Supplement", warehouse: "Guangzhou WH3", qty: 12, status: "low", updated: "30 min ago" },
                    { sku: "SKU-006", name: "Sunscreen SPF50+", warehouse: "Shanghai WH1", qty: 2340, status: "normal", updated: "15 min ago" },
                    { sku: "SKU-007", name: "Lip Balm Collection", warehouse: "Beijing WH2", qty: 0, status: "out", updated: "2 hours ago" },
                    { sku: "SKU-008", name: "Makeup Remover 200ml", warehouse: "Guangzhou WH3", qty: 567, status: "normal", updated: "20 min ago" },
                  ].map((item) => (
                    <div key={item.sku} className="grid grid-cols-6 gap-4 p-4 text-sm border-b last:border-0 hover:bg-muted/30">
                      <div className="font-mono text-xs">{item.sku}</div>
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-muted-foreground">{item.warehouse}</div>
                      <div className="text-right font-medium">{formatNumber(item.qty)}</div>
                      <div>
                        <Badge variant={
                          item.status === "normal" ? "default" :
                          item.status === "low" ? "secondary" :
                          "destructive"
                        }>
                          {item.status === "normal" && "In Stock"}
                          {item.status === "low" && "Low Stock"}
                          {item.status === "out" && "Out of Stock"}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">{item.updated}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Product Catalog</CardTitle>
                <CardDescription>Browse and manage products synced from this store</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Products
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { id: "P001", name: "Premium Skincare Set", nameZh: "高级护肤套装", price: 599.00, stock: 1250, sales: 3420, image: "🧴" },
                  { id: "P002", name: "Vitamin C Serum 30ml", nameZh: "维生素C精华液 30ml", price: 189.00, stock: 8, sales: 8920, image: "💧" },
                  { id: "P003", name: "Hydrating Face Mask (5pc)", nameZh: "补水面膜（5片装）", price: 129.00, stock: 0, sales: 12350, image: "😷" },
                  { id: "P004", name: "Anti-Aging Eye Cream", nameZh: "抗衰老眼霜", price: 299.00, stock: 456, sales: 2180, image: "👁️" },
                  { id: "P005", name: "Collagen Supplement", nameZh: "胶原蛋白补充剂", price: 459.00, stock: 12, sales: 1560, image: "💊" },
                  { id: "P006", name: "Sunscreen SPF50+", nameZh: "防晒霜 SPF50+", price: 159.00, stock: 2340, sales: 15680, image: "☀️" },
                ].map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center text-6xl">
                      {product.image}
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">{product.nameZh}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
                          <Badge variant={product.stock === 0 ? "destructive" : product.stock < 20 ? "secondary" : "default"}>
                            {product.stock === 0 ? "Out of Stock" : `${formatNumber(product.stock)} in stock`}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                          <span>ID: {product.id}</span>
                          <span>{formatNumber(product.sales)} sold</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-center mt-6">
                <Button variant="outline" size="sm">
                  View All Products
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streaming">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>RTMP Streaming Configuration</CardTitle>
                <CardDescription>Configure live streaming settings for this store</CardDescription>
              </div>
              {!rtmpEditing && (
                <Button variant="outline" size="sm" onClick={() => setRtmpEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {rtmpEditing ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_rtmp_url">RTMP URL</Label>
                    <Input
                      id="edit_rtmp_url"
                      type="url"
                      placeholder="rtmp://live.example.com/stream"
                      value={rtmpConfig.rtmp_url}
                      onChange={(e) => setRtmpConfig({ ...rtmpConfig, rtmp_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_rtmp_stream_key">Stream Key</Label>
                    <Input
                      id="edit_rtmp_stream_key"
                      type="password"
                      placeholder="Your stream key"
                      value={rtmpConfig.rtmp_stream_key}
                      onChange={(e) => setRtmpConfig({ ...rtmpConfig, rtmp_stream_key: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_rtmp_password">Password</Label>
                    <Input
                      id="edit_rtmp_password"
                      type="password"
                      placeholder="Stream password"
                      value={rtmpConfig.rtmp_password}
                      onChange={(e) => setRtmpConfig({ ...rtmpConfig, rtmp_password: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveRtmp} disabled={rtmpSaving}>
                      {rtmpSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleCancelRtmp} disabled={rtmpSaving}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-4">
                  {/* RTMP URL */}
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">RTMP URL</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {store.config.rtmp_url || "Not configured"}
                      </p>
                    </div>
                    {store.config.rtmp_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(store.config.rtmp_url || "")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Stream Key */}
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Stream Key</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {store.config.rtmp_stream_key
                          ? showStreamKey
                            ? store.config.rtmp_stream_key
                            : "••••••••••••••••"
                          : "Not configured"}
                      </p>
                    </div>
                    {store.config.rtmp_stream_key && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowStreamKey(!showStreamKey)}
                        >
                          {showStreamKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(store.config.rtmp_stream_key || "")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {store.config.rtmp_password
                          ? showPassword
                            ? store.config.rtmp_password
                            : "••••••••••••"
                          : "Not configured"}
                      </p>
                    </div>
                    {store.config.rtmp_password && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(store.config.rtmp_password || "")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* RTMP Enabled Status */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm">Streaming Status</span>
                    <Badge variant={store.config.rtmp_enabled ? "default" : "secondary"}>
                      {store.config.rtmp_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
