"use client"

import {
  LogOut,
  Settings,
  Languages,
  ChevronsUpDown,
  Check,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    subtitle?: string
    verified?: boolean
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { logout } = useAuth()
  const { t, locale, setLocale } = useLocale()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-2 w-full rounded-md hover:bg-[#f8fafc] transition-colors cursor-pointer outline-none">
              <Avatar className="h-8 w-8 rounded-full shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-full bg-gradient-to-br from-[#1c398e] to-[#27c840] text-white text-xs font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-semibold text-sm text-[#27272a]">{user.name}</span>
                  {user.verified && (
                    <div className="flex-shrink-0 w-4 h-4 bg-[#ffdf20] rounded-full flex items-center justify-center">
                      <Settings className="w-2.5 h-2.5 text-[#27272a]" />
                    </div>
                  )}
                </div>
                <span className="truncate text-xs text-[#94a3b8] block">
                  {user.subtitle || user.email}
                </span>
              </div>
              <ChevronsUpDown className="size-4 shrink-0 text-[#94a3b8]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "top" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                <Languages className="size-4" />
                <span>{t("common.language")}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setLocale("en")} className="gap-2 cursor-pointer">
                  <Check className={`size-4 ${locale === "en" ? "opacity-100" : "opacity-0"}`} />
                  <span>English</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale("ko")} className="gap-2 cursor-pointer">
                  <Check className={`size-4 ${locale === "ko" ? "opacity-100" : "opacity-0"}`} />
                  <span>한국어</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale("zh")} className="gap-2 cursor-pointer">
                  <Check className={`size-4 ${locale === "zh" ? "opacity-100" : "opacity-0"}`} />
                  <span>中文</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="gap-2 cursor-pointer">
              <Settings className="size-4" />
              <span>{t("navigation.settings")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="gap-2 cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="size-4" />
              <span>{t("navigation.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
