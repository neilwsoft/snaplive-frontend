"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { PreLiveWizard } from "@/components/livestream/PreLiveWizard";
import { LivestreamList } from "@/components/livestream/LivestreamList";
import { useLocale } from "@/lib/locale-context";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Users, Play } from "lucide-react";
import { toast } from "sonner";

function LivePageContent() {
  const { t, locale } = useLocale();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("browse");

  // Translations
  const translations = {
    pageTitle: locale === "ko" ? "라이브 스트리밍" : "Live Streaming",
    browseTab: locale === "ko" ? "방송 보기" : "Browse Streams",
    goLiveTab: locale === "ko" ? "라이브 시작" : "Go Live",
    noStreams: locale === "ko" ? "현재 진행 중인 라이브 방송이 없습니다" : "No active livestreams",
    startStreaming: locale === "ko" ? "라이브 방송을 시작하세요" : "Start your livestream",
    startStreamingDesc: locale === "ko"
      ? "제품을 보여주고 실시간으로 고객과 소통하세요. AI 어시스턴트가 제품 설명과 시청자 참여를 도와줍니다."
      : "Showcase your products and engage with customers in real-time. AI assistant helps with product descriptions and viewer engagement.",
    watchStreams: locale === "ko" ? "라이브 방송 시청" : "Watch Livestreams",
    watchStreamsDesc: locale === "ko"
      ? "판매자들의 실시간 제품 소개를 시청하고 채팅으로 소통하세요."
      : "Watch sellers showcase products in real-time and chat with them.",
  };

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: translations.pageTitle }
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              {translations.browseTab}
            </TabsTrigger>
            <TabsTrigger value="go-live" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              {translations.goLiveTab}
            </TabsTrigger>
          </TabsList>

          {/* Browse Active Streams Tab */}
          <TabsContent value="browse" className="mt-6">
            <LivestreamList
              userId={user?.id || "guest"}
              userName={user?.full_name || "Guest"}
              refreshInterval={5000}
            />
          </TabsContent>

          {/* Go Live Tab */}
          <TabsContent value="go-live" className="mt-6">
            <PreLiveWizard
              sellerId={user?.id || "demo-seller"}
              sellerName={user?.full_name || "Demo Seller"}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

export default function LivePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <LivePageContent />
    </Suspense>
  );
}
