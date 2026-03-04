"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Store, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { listPlatforms, createStore, type Platform } from "@/lib/api/platforms";

export default function ConnectStorePage() {
  const router = useRouter();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    store_id: "",
    store_name: "",
    store_url: "",
    api_key: "",
    api_secret: "",
    app_key: "",
    session_key: "",
    client_key: "",
    client_secret: "",
    app_id: "",
    app_secret: "",
    // RTMP Configuration
    rtmp_url: "",
    rtmp_stream_key: "",
    rtmp_password: "",
  });

  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        const data = await listPlatforms();
        setPlatforms(data);
      } catch (err) {
        console.error("Failed to load platforms:", err);
        // Mock platforms for demo
        setPlatforms([
          {
            platform: "taobao",
            display_name: "Taobao Live",
            description: "China's largest C2C e-commerce platform with live streaming",
            is_available: true,
            requires_oauth: false,
            supports_rtmp: true,
            supports_inventory_sync: true,
            supports_order_sync: true,
            supports_product_sync: true,
            supports_stream_data: true,
            required_fields: ["app_key", "app_secret", "session_key"],
            optional_fields: ["store_url"],
            rate_limit_per_minute: 10000,
          },
          {
            platform: "douyin",
            display_name: "Douyin (抖音)",
            description: "China's leading short video and live streaming platform",
            is_available: true,
            requires_oauth: true,
            supports_rtmp: true,
            supports_inventory_sync: true,
            supports_order_sync: true,
            supports_product_sync: true,
            supports_stream_data: true,
            required_fields: ["client_key", "client_secret"],
            optional_fields: [],
            rate_limit_per_minute: 5000,
          },
          {
            platform: "xiaohongshu",
            display_name: "Xiaohongshu (小红书)",
            description: "China's lifestyle and shopping community platform",
            is_available: true,
            requires_oauth: false,
            supports_rtmp: true,
            supports_inventory_sync: true,
            supports_order_sync: true,
            supports_product_sync: true,
            supports_stream_data: true,
            required_fields: ["app_id", "app_secret"],
            optional_fields: ["store_url"],
            rate_limit_per_minute: 3000,
          },
        ]);
      }
    };

    loadPlatforms();
  }, []);

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      taobao: "bg-orange-500 hover:bg-orange-600",
      douyin: "bg-black hover:bg-gray-800",
      xiaohongshu: "bg-red-500 hover:bg-red-600",
    };
    return colors[platform] || "bg-gray-500 hover:bg-gray-600";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform) return;

    setLoading(true);
    setError(null);

    try {
      // TODO: Get actual seller_id from auth context
      await createStore("demo-seller", {
        platform: selectedPlatform,
        store_id: formData.store_id,
        store_name: formData.store_name,
        store_url: formData.store_url || undefined,
        api_key: formData.api_key || undefined,
        api_secret: formData.api_secret || undefined,
        app_key: formData.app_key || undefined,
        session_key: formData.session_key || undefined,
        client_key: formData.client_key || undefined,
        client_secret: formData.client_secret || undefined,
        app_id: formData.app_id || undefined,
        app_secret: formData.app_secret || undefined,
        // RTMP Configuration
        rtmp_url: formData.rtmp_url || undefined,
        rtmp_stream_key: formData.rtmp_stream_key || undefined,
        rtmp_password: formData.rtmp_password || undefined,
      });

      setSuccess(true);

      // Redirect to stores page after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/stores");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect store");
    } finally {
      setLoading(false);
    }
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      app_key: "App Key",
      app_secret: "App Secret",
      session_key: "Session Key",
      client_key: "Client Key",
      client_secret: "Client Secret",
      app_id: "App ID",
    };
    return labels[field] || field;
  };

  const selectedPlatformData = platforms.find((p) => p.platform === selectedPlatform);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/stores">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stores
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connect Marketplace Store</h1>
        <p className="text-muted-foreground">
          Choose a platform and provide your store credentials to connect
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Store connected successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Platform Selection */}
      {!selectedPlatform && (
        <div className="grid gap-4 md:grid-cols-3">
          {platforms.map((platform) => (
            <Card
              key={platform.platform}
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setSelectedPlatform(platform.platform)}
            >
              <CardHeader>
                <div className={`${getPlatformColor(platform.platform)} h-12 w-12 rounded-lg flex items-center justify-center mb-2`}>
                  <Store className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{platform.display_name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {platform.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Orders & Inventory Sync</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>RTMP Live Streaming</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Product Catalog Sync</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Connection Form */}
      {selectedPlatform && selectedPlatformData && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`${getPlatformColor(selectedPlatform)} h-10 w-10 rounded-lg flex items-center justify-center`}>
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>{selectedPlatformData.display_name}</CardTitle>
                <CardDescription>Enter your store credentials</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Store ID */}
              <div className="space-y-2">
                <Label htmlFor="store_id">
                  Store ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="store_id"
                  required
                  placeholder="Your store ID on the platform"
                  value={formData.store_id}
                  onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                />
              </div>

              {/* Store Name */}
              <div className="space-y-2">
                <Label htmlFor="store_name">
                  Store Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="store_name"
                  required
                  placeholder="Your store name"
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                />
              </div>

              {/* Store URL (optional) */}
              {selectedPlatformData.optional_fields?.includes("store_url") && (
                <div className="space-y-2">
                  <Label htmlFor="store_url">Store URL (Optional)</Label>
                  <Input
                    id="store_url"
                    type="url"
                    placeholder="https://..."
                    value={formData.store_url}
                    onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
                  />
                </div>
              )}

              {/* Required Platform Fields */}
              {selectedPlatformData.required_fields?.map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>
                    {getFieldLabel(field)} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={field}
                    required
                    type={field.includes("secret") ? "password" : "text"}
                    placeholder={`Enter your ${getFieldLabel(field).toLowerCase()}`}
                    value={(formData as any)[field] || ""}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  />
                </div>
              ))}

              {/* RTMP Streaming Configuration (Optional) */}
              {selectedPlatformData.supports_rtmp && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <h3 className="text-sm font-medium">RTMP Streaming (Optional)</h3>
                    <p className="text-xs text-muted-foreground">Configure live streaming settings for this store</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rtmp_url">RTMP URL</Label>
                    <Input
                      id="rtmp_url"
                      type="url"
                      placeholder="rtmp://live.example.com/stream"
                      value={formData.rtmp_url}
                      onChange={(e) => setFormData({ ...formData, rtmp_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rtmp_stream_key">Stream Key</Label>
                    <Input
                      id="rtmp_stream_key"
                      type="password"
                      placeholder="Your stream key"
                      value={formData.rtmp_stream_key}
                      onChange={(e) => setFormData({ ...formData, rtmp_stream_key: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rtmp_password">Password</Label>
                    <Input
                      id="rtmp_password"
                      type="password"
                      placeholder="Stream password (if required)"
                      value={formData.rtmp_password}
                      onChange={(e) => setFormData({ ...formData, rtmp_password: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedPlatform(null);
                    setFormData({
                      store_id: "",
                      store_name: "",
                      store_url: "",
                      api_key: "",
                      api_secret: "",
                      app_key: "",
                      session_key: "",
                      client_key: "",
                      client_secret: "",
                      app_id: "",
                      app_secret: "",
                      rtmp_url: "",
                      rtmp_stream_key: "",
                      rtmp_password: "",
                    });
                  }}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Connect Store
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
