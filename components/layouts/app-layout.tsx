"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget"

/**
 * AppLayout - Global layout component for dashboard pages
 *
 * This component provides a consistent layout with:
 * - AppSidebar with navigation (SNAP LIVE 2.0 branding)
 * - SidebarProvider for sidebar state management
 * - SidebarInset for main content area
 *
 * Usage:
 * ```tsx
 * // In your page or layout file
 * import { AppLayout } from "@/components/layouts/app-layout"
 *
 * export default function MyPage() {
 *   return (
 *     <AppLayout>
 *       <YourPageContent />
 *     </AppLayout>
 *   )
 * }
 * ```
 *
 * The sidebar includes:
 * - Explore menu
 * - Dashboard menu
 * - Platforms section (LiveCam, LiveConnect, LiveHub)
 * - Log-out button
 * - User profile at footer
 *
 * @param children - The page content to render inside the layout
 * @param defaultOpen - Whether the sidebar should be open by default (default: true)
 */

interface AppLayoutProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function AppLayout({ children, defaultOpen = true }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex h-screen w-full bg-[#f1f5f9] overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
          {children}
        </SidebarInset>
        <ChatbotWidget />
      </div>
    </SidebarProvider>
  )
}
