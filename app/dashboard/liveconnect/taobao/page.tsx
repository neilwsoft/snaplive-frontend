"use client";

import { LiveConnectPageLayout } from "@/components/liveconnect/LiveConnectPageLayout";
import type { LiveConnectFormData } from "@/components/liveconnect/LiveConnectForm";
import { createDestination } from "@/lib/api/streaming";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function LiveConnectTaobaoPage() {
  const { user } = useAuth();

  const handleFormSubmit = async (data: LiveConnectFormData) => {
    if (!user?.id) {
      toast.error("Please log in to connect a store");
      return;
    }

    try {
      await createDestination(user.id, {
        platform: "taobao",
        destination_name: data.storeName,
        rtmp_url: data.rtmpUrl,
        stream_key: data.streamKey,
        store_id: data.storeId,
      });
      toast.success("Taobao Live streaming destination created successfully!");
    } catch (error: any) {
      console.error("Failed to create destination:", error);
      toast.error(error.response?.data?.detail || "Failed to create streaming destination");
      throw error;
    }
  };

  const handleFormReset = () => {
    // No-op
  };

  return (
    <LiveConnectPageLayout
      platform="taobao"
      onSubmit={handleFormSubmit}
      onReset={handleFormReset}
    />
  );
}
