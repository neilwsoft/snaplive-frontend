'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/locale-context';

const bannerSlides = [
  { id: 1, gradient: 'from-blue-400 via-purple-300 to-blue-200' },
  { id: 2, gradient: 'from-rose-400 via-orange-300 to-amber-200' },
  { id: 3, gradient: 'from-emerald-400 via-teal-300 to-cyan-200' },
  { id: 4, gradient: 'from-violet-400 via-indigo-300 to-blue-200' },
];

export function ExploreBanner() {
  const { t } = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden h-[320px] group">
      {/* Slide */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r transition-all duration-500',
          bannerSlides[currentSlide].gradient
        )}
      >
        {/* Decorative circles */}
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-[20px] border-blue-300/40" />
        <div className="absolute right-10 top-8 w-24 h-24 rounded-full border-[16px] border-blue-400/30" />
        <div className="absolute right-0 bottom-0 w-64 h-64 rounded-full bg-blue-300/20 translate-x-1/3 translate-y-1/3" />

        {/* Dot patterns */}
        <div className="absolute left-16 bottom-8 grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-white/30" />
          ))}
        </div>
        <div className="absolute right-16 bottom-8 grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-white/30" />
          ))}
        </div>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="bg-blue-500/80 backdrop-blur-sm rounded-lg px-8 py-3 mb-2">
            <span className="text-white font-extrabold text-2xl tracking-widest uppercase">
              Stream is Currently
            </span>
          </div>
          <div className="bg-blue-400/60 backdrop-blur-sm rounded-lg px-12 py-4">
            <span className="text-white font-black text-6xl tracking-[0.2em] uppercase drop-shadow-lg">
              OFFLINE
            </span>
          </div>
          <p className="mt-6 text-zinc-600/80 text-lg font-medium">
            {t('explore.banner.visitProfile')}
          </p>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
        {bannerSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all',
              idx === currentSlide
                ? 'bg-white shadow-sm'
                : 'bg-white/50 hover:bg-white/70'
            )}
          />
        ))}
      </div>

      {/* Arrow buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-4 h-4 text-zinc-700" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-4 h-4 text-zinc-700" />
      </button>
    </div>
  );
}
