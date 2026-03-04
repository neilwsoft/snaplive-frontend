'use client';

import { useCallback, useEffect, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResizableHandleProps {
  onResize: (deltaX: number) => void;
  className?: string;
  direction?: 'left' | 'right';
}

/**
 * Drag handle component for resizable panels
 */
export function ResizableHandle({
  onResize,
  className,
  direction = 'right',
}: ResizableHandleProps) {
  const isDragging = useRef(false);
  const startX = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = direction === 'right'
        ? e.clientX - startX.current
        : startX.current - e.clientX;

      startX.current = e.clientX;
      onResize(deltaX);
    },
    [onResize, direction]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      className={cn(
        'flex items-center justify-center cursor-col-resize h-full w-6 hover:bg-slate-200/50 transition-colors',
        className
      )}
      onMouseDown={handleMouseDown}
    >
      <GripVertical className="w-4 h-4 text-slate-400" />
    </div>
  );
}
