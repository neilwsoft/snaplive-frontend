"use client"

import * as React from "react"
import {
  Home,
  Video,
  Network,
  Package,
  LayoutGrid,
  Sparkles,
  Trophy,
  Radio,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const { toggleSidebar } = useSidebar()
  const { t } = useLocale()
  const [mounted, setMounted] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const data = {
    user: {
      name: user?.full_name || t("navigation.guestUser"),
      email: user?.email || "",
      subtitle: user?.email || "",
      avatar: "",
      verified: user?.is_active || false,
    },
    explore: {
      title: t("navigation.explore"),
      url: "/dashboard/browse-simulcasts",
      icon: Sparkles,
    },
    dashboard: {
      title: t("navigation.dashboard"),
      url: "/dashboard",
      icon: Home,
    },
    liveSimulcasts: {
      title: t("navigation.liveSimulcasts"),
      url: "/dashboard/live-simulcasts",
      icon: Radio,
    },
    topSimulcasters: {
      title: t("navigation.topSimulcasters"),
      url: "/dashboard/top-simulcasters",
      icon: Trophy,
    },
    navMain: [
      {
        title: t("navigation.liveCam"),
        url: "/dashboard/livecam",
        icon: Video,
        items: [
          { title: t("navigation.startSimulcast"), url: "/dashboard/livecam/simulcast", icon: "target" },
          { title: t("navigation.simulcastPresets"), url: "/dashboard/livecam/presets", icon: "preset" },
          { title: t("navigation.simulcastHistory"), url: "/dashboard/livecam/simulcast-history", icon: "history" },
        ],
      },
      {
        title: t("navigation.liveConnect"),
        url: "/dashboard/liveconnect",
        icon: Network,
        items: [
          { title: t("navigation.douyinLive"), url: "/dashboard/liveconnect/douyin", icon: "douyin" },
          { title: t("navigation.xiaohongshuLive"), url: "/dashboard/liveconnect/xiaohongshu", icon: "xiaohongshu" },
          { title: t("navigation.taobaoLive"), url: "/dashboard/liveconnect/taobao", icon: "taobao" },
        ],
      },
      {
        title: t("navigation.liveHub"),
        url: "/dashboard/livehub",
        icon: Package,
        items: [
          { title: t("navigation.orders"), url: "/dashboard/orders", icon: "list" },
          { title: t("navigation.inventory"), url: "/dashboard/inventory", icon: "list" },
          { title: t("navigation.gifting"), url: "/dashboard/gifting", icon: "gift" },
          { title: t("navigation.statisticsReports"), url: "/dashboard/livehub/reports", icon: "chart" },
        ],
      },
    ],
  }

  return (
    <Sidebar
      variant="sidebar"
      {...props}
      suppressHydrationWarning
      className="bg-white shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] relative z-[3]"
    >
      {/* Floating Collapse/Expand Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-[72px] -right-2 z-50 w-10 h-10 bg-white rounded-[3px] flex items-center justify-center p-0 cursor-pointer"
        aria-label={t("navigation.toggleSidebar")}
      >
        <LayoutGrid className="w-6 h-6 text-[#27272a]" />
      </button>

      <SidebarHeader className="px-4 py-10 bg-white">
        <div className="flex items-center gap-2">
          <div className="text-[32px] font-extrabold leading-none tracking-tight flex items-end gap-2">
            <span className="text-[#27272a]">SNAP</span>
            <span className="text-[#ffdf20]">LIVE</span>
            <span className="text-[#ffdf20] text-[18px] font-extrabold">2.0</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent suppressHydrationWarning className="px-4 py-0 bg-white flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
        {/* Top Menu Items */}
        <SidebarMenu className="gap-[8px]">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={`h-8 rounded-[6px] px-3 gap-3 text-[#27272a] font-normal text-sm leading-5 hover:text-[#27272a] ${
                pathname === data.explore.url
                  ? "bg-[#e4e4e7] hover:bg-[#e4e4e7]"
                  : "hover:bg-[#f8fafc]"
              }`}
            >
              <Link href={data.explore.url} className="flex items-center">
                <data.explore.icon className="size-5 shrink-0" />
                <span className="flex-1">{data.explore.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={`h-8 rounded-[6px] px-3 gap-3 text-[#27272a] font-normal text-sm leading-5 hover:text-[#27272a] ${
                pathname === data.dashboard.url && pathname === "/dashboard"
                  ? "bg-[#e4e4e7] hover:bg-[#e4e4e7]"
                  : "hover:bg-[#f8fafc]"
              }`}
            >
              <Link href={data.dashboard.url} className="flex items-center">
                <data.dashboard.icon className="size-5 shrink-0" />
                <span className="flex-1">{data.dashboard.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Recommended Section Label */}
        <div className="py-2 mt-2">
          <span className="text-[14px] font-medium leading-6 text-[#27272a]">{t("navigation.recommended")}</span>
        </div>

        {/* Recommended Items */}
        <SidebarMenu className="gap-[8px]">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={`h-8 rounded-[6px] px-3 gap-3 text-[#27272a] font-normal text-sm leading-5 hover:text-[#27272a] ${
                pathname === data.liveSimulcasts.url
                  ? "bg-[#e4e4e7] hover:bg-[#e4e4e7]"
                  : "hover:bg-[#f8fafc]"
              }`}
            >
              <Link href={data.liveSimulcasts.url} className="flex items-center">
                <data.liveSimulcasts.icon className="size-5 shrink-0" />
                <span className="flex-1">{data.liveSimulcasts.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={`h-8 rounded-[6px] px-3 gap-3 text-[#27272a] font-normal text-sm leading-5 hover:text-[#27272a] ${
                pathname === data.topSimulcasters.url
                  ? "bg-[#e4e4e7] hover:bg-[#e4e4e7]"
                  : "hover:bg-[#f8fafc]"
              }`}
            >
              <Link href={data.topSimulcasters.url} className="flex items-center">
                <data.topSimulcasters.icon className="size-5 shrink-0" />
                <span className="flex-1">{data.topSimulcasters.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Platform Section Label */}
        <div className="py-2 mt-2">
          <span className="text-[14px] font-medium leading-6 text-[#27272a]">{t("navigation.platforms")}</span>
        </div>

        {/* Platform Section */}
        <NavMain items={data.navMain} />

      </SidebarContent>
      <SidebarFooter className="px-3 py-3 bg-white">
        {mounted && <NavUser user={data.user} />}
      </SidebarFooter>
    </Sidebar>
  )
}
