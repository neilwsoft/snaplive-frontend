'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, LogIn, LayoutGrid, Play, Trophy } from 'lucide-react';
import { useLocale } from '@/lib/locale-context';

export function GuestSidebar() {
  const pathname = usePathname();
  const { t } = useLocale();
  const isExploreActive = pathname === '/explore' || pathname === '/';
  const isLoginActive = pathname === '/login' || pathname === '/register';

  return (
    <aside className="w-[312px] h-screen bg-white shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] flex flex-col shrink-0 relative sticky top-0 overflow-hidden">
      {/* Collapse Button */}
      <button
        className="absolute top-[72px] -right-2 z-50 w-10 h-10 bg-white rounded-[3px] flex items-center justify-center p-0 cursor-pointer"
        aria-label="Toggle Sidebar"
      >
        <LayoutGrid className="w-6 h-6 text-[#27272a]" />
      </button>

      {/* Logo - matching app-sidebar.tsx */}
      <div className="px-4 py-10 shrink-0">
        <Link href="/explore" className="flex items-center gap-2">
          <div className="text-[32px] font-extrabold leading-none tracking-tight flex items-end gap-2">
            <span className="text-[#27272a]">SNAP</span>
            <span className="text-[#ffdf20]">LIVE</span>
            <span className="text-[#ffdf20] text-[18px] font-extrabold">2.0</span>
          </div>
        </Link>
      </div>

      {/* Navigation - scrollable area */}
      <nav className="px-4 flex flex-col gap-2 flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        {/* Explore */}
        <Link
          href="/explore"
          className={`h-8 rounded-[6px] px-3 gap-3 flex items-center text-[#27272a] font-normal text-sm leading-5 transition-colors shrink-0 ${
            isExploreActive
              ? 'bg-[#e4e4e7]'
              : 'hover:bg-[#f8fafc]'
          }`}
        >
          <Sparkles className="size-5 shrink-0" />
          <span className="flex-1">{t('navigation.explore')}</span>
        </Link>

        {/* Promotional Text */}
        <p className="text-base font-normal text-[#27272a] leading-6 w-full py-2 shrink-0">
          Login to experience SnapLive 2.0&apos;s live simulcasting!
        </p>

        {/* Login/Register */}
        <Link
          href="/login"
          className={`h-8 rounded-[6px] px-3 gap-3 flex items-center text-[#27272a] font-normal text-sm leading-5 transition-colors shrink-0 ${
            isLoginActive
              ? 'bg-[#e4e4e7]'
              : 'hover:bg-[#f8fafc]'
          }`}
        >
          <LogIn className="size-5 shrink-0" />
          <span className="flex-1">Login/Register</span>
        </Link>

        {/* Recommended Section Label */}
        <div className="py-2 mt-2 shrink-0">
          <span className="text-[14px] font-medium leading-6 text-[#27272a]">
            {t('navigation.recommended')}
          </span>
        </div>

        {/* Live Simulcasts */}
        <Link
          href="/explore"
          className="h-8 rounded-[6px] px-3 gap-3 flex items-center text-[#27272a] font-normal text-sm leading-5 transition-colors hover:bg-[#f8fafc] shrink-0"
        >
          <Play className="size-5 shrink-0" />
          <span className="flex-1">{t('navigation.liveSimulcasts')}</span>
        </Link>

        {/* Top Simulcasters */}
        <Link
          href="/explore"
          className="h-8 rounded-[6px] px-3 gap-3 flex items-center text-[#27272a] font-normal text-sm leading-5 transition-colors hover:bg-[#f8fafc] shrink-0"
        >
          <Trophy className="size-5 shrink-0" />
          <span className="flex-1">{t('navigation.topSimulcasters')}</span>
        </Link>
      </nav>
    </aside>
  );
}
