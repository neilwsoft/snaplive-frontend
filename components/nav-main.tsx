"use client"

import { ChevronRight, type LucideIcon, Target, History, List, TrendingUp, Layers, Gift } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

const iconMap: Record<string, LucideIcon | null> = {
  target: Target,
  history: History,
  list: List,
  chart: TrendingUp,
  preset: Layers,
  gift: Gift,
  douyin: null,
  xiaohongshu: null,
  taobao: null,
}

// Platform icons use images from /public/images/platforms/
const platformIconMap: Record<string, string> = {
  douyin: "/images/platforms/douyin.svg",
  xiaohongshu: "/images/platforms/xiaohongshu.svg",
  taobao: "/images/platforms/taobao.svg",
}

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
    icon?: string
  }[]
}

function NavMainItem({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isChildActive = item.items?.some((sub) => pathname === sub.url) || false
  const [isOpen, setIsOpen] = useState(item.isActive || isChildActive)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuItem>
        <div className="flex items-center w-full">
          <SidebarMenuButton
            onClick={() => setIsOpen(!isOpen)}
            tooltip={item.title}
            className="h-8 rounded-[6px] px-3 gap-3 text-[#27272a] font-normal text-sm leading-5 hover:bg-[#f8fafc] hover:text-[#27272a] flex-1"
          >
            <item.icon className="size-5 shrink-0" />
            <span className="flex-1">{item.title}</span>
            {item.items?.length ? (
              <ChevronRight className={`size-4 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            ) : null}
          </SidebarMenuButton>
        </div>
        {item.items?.length ? (
          <CollapsibleContent>
            <SidebarMenuSub className="gap-[8px] ml-6 border-l border-l-[#e2e8f0] pl-2 py-2">
              {item.items?.map((subItem) => {
                const SubIcon = subItem.icon ? iconMap[subItem.icon] : null
                const platformImg = subItem.icon ? platformIconMap[subItem.icon] : null
                const isActive = pathname === subItem.url

                return (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      asChild
                      className={`h-8 rounded-[6px] px-3 gap-3 text-sm font-normal text-[#27272a] hover:text-[#27272a] leading-5 ${
                        isActive
                          ? "bg-[#e4e4e7] hover:bg-[#e4e4e7]"
                          : "hover:bg-[#f8fafc]"
                      }`}
                    >
                      <Link href={subItem.url} className="flex items-center">
                        {platformImg ? (
                          <div className="size-5 shrink-0 relative rounded overflow-hidden">
                            <Image
                              src={platformImg}
                              alt={subItem.title}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : SubIcon ? (
                          <SubIcon className="size-4 shrink-0" />
                        ) : (
                          <div className="size-4 shrink-0" />
                        )}
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        ) : null}
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function NavMain({
  items,
}: {
  items: NavItem[]
}) {
  return (
    <SidebarGroup>
      <SidebarMenu className="gap-[8px]">
        {items.map((item) => (
          <NavMainItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
