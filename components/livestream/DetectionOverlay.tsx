'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Detection } from '@/lib/api/detection';
import { cn } from '@/lib/utils';

/** Linear interpolation helper */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Smoothed bounding box for a single detection */
interface SmoothedBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
  class_name: string;
}

interface DetectionOverlayProps {
  detections: Detection[];
  videoElement: HTMLVideoElement | null;
  containerWidth: number;
  containerHeight: number;
  originalWidth: number;
  originalHeight: number;
  visible?: boolean;
  className?: string;
  showLabels?: boolean;
  showConfidence?: boolean;
}

/**
 * Overlay component that draws bounding boxes for detected objects
 * with smooth position transitions between frames.
 */
export function DetectionOverlay({
  detections,
  videoElement,
  containerWidth,
  containerHeight,
  originalWidth,
  originalHeight,
  visible = true,
  className,
  showLabels = true,
  showConfidence = true,
}: DetectionOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smoothedRef = useRef<Map<string, SmoothedBox>>(new Map());
  const animFrameRef = useRef<number>(0);
  const [scale, setScale] = useState({ x: 1, y: 1 });

  // Calculate scaling factors between original frame and displayed video
  useEffect(() => {
    if (!videoElement || !originalWidth || !originalHeight) return;
    setScale({
      x: containerWidth / originalWidth,
      y: containerHeight / originalHeight,
    });
  }, [videoElement, containerWidth, containerHeight, originalWidth, originalHeight]);

  /**
   * Build a key for a detection so we can track it across frames.
   * Uses class_name + approximate center to match same-object across frames.
   */
  const detectionKey = useCallback(
    (d: Detection) => {
      const cx = ((d.box.x1 + d.box.x2) / 2) * scale.x;
      const cy = ((d.box.y1 + d.box.y2) / 2) * scale.y;
      // Quantize center to ~60px grid so slight movements still match
      const qx = Math.round(cx / 60);
      const qy = Math.round(cy / 60);
      return `${d.class_name}_${qx}_${qy}`;
    },
    [scale],
  );

  // Draw bounding boxes on canvas with smooth transitions
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    if (!visible || !detections.length) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Fade out existing boxes
      smoothedRef.current.forEach((box) => {
        box.opacity = Math.max(0, box.opacity - 0.1);
      });
      // Remove fully faded
      smoothedRef.current.forEach((box, key) => {
        if (box.opacity <= 0) smoothedRef.current.delete(key);
      });
      if (smoothedRef.current.size === 0) return;
    }

    // Build target map from current detections
    const targetMap = new Map<string, { x1: number; y1: number; x2: number; y2: number; detection: Detection }>();
    detections.forEach((d) => {
      const key = detectionKey(d);
      targetMap.set(key, {
        x1: d.box.x1 * scale.x,
        y1: d.box.y1 * scale.y,
        x2: d.box.x2 * scale.x,
        y2: d.box.y2 * scale.y,
        detection: d,
      });
    });

    // Mark disappeared detections for fade-out
    smoothedRef.current.forEach((box, key) => {
      if (!targetMap.has(key)) {
        box.opacity = Math.max(0, box.opacity - 0.15);
        if (box.opacity <= 0) smoothedRef.current.delete(key);
      }
    });

    // Update or create smoothed boxes
    const LERP_SPEED = 0.3;
    targetMap.forEach((target, key) => {
      const existing = smoothedRef.current.get(key);
      if (existing) {
        existing.x1 = lerp(existing.x1, target.x1, LERP_SPEED);
        existing.y1 = lerp(existing.y1, target.y1, LERP_SPEED);
        existing.x2 = lerp(existing.x2, target.x2, LERP_SPEED);
        existing.y2 = lerp(existing.y2, target.y2, LERP_SPEED);
        existing.opacity = Math.min(1, existing.opacity + 0.15);
        existing.class_name = target.detection.class_name;
      } else {
        smoothedRef.current.set(key, {
          x1: target.x1,
          y1: target.y1,
          x2: target.x2,
          y2: target.y2,
          opacity: 0.3, // Start faded in
          class_name: target.detection.class_name,
        });
      }
    });

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detection) => {
      const key = detectionKey(detection);
      const smoothed = smoothedRef.current.get(key);
      if (!smoothed || smoothed.opacity <= 0) return;

      const { class_name, confidence, matched_product_id } = detection;
      const x1 = smoothed.x1;
      const y1 = smoothed.y1;
      const width = smoothed.x2 - smoothed.x1;
      const height = smoothed.y2 - smoothed.y1;
      const alpha = smoothed.opacity;

      // Choose color based on whether product is matched
      const isMatched = !!matched_product_id;
      const baseColor = isMatched ? [34, 197, 94] : [59, 130, 246]; // green / blue

      // Draw bounding box
      ctx.strokeStyle = `rgba(${baseColor.join(',')}, ${0.8 * alpha})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, width, height);

      // Draw semi-transparent fill
      ctx.fillStyle = `rgba(${baseColor.join(',')}, ${0.15 * alpha})`;
      ctx.fillRect(x1, y1, width, height);

      // Draw label
      if (showLabels) {
        const label = `${class_name}${showConfidence ? ` ${(confidence * 100).toFixed(0)}%` : ''}`;
        const labelPadding = 4;
        const fontSize = 14;

        ctx.font = `bold ${fontSize}px sans-serif`;
        const textMetrics = ctx.measureText(label);
        const labelWidth = textMetrics.width + labelPadding * 2;
        const labelHeight = fontSize + labelPadding * 2;

        const labelY = y1 > labelHeight + 5 ? y1 - labelHeight : y1;

        ctx.fillStyle = `rgba(${baseColor.join(',')}, ${0.9 * alpha})`;
        ctx.fillRect(x1, labelY, labelWidth, labelHeight);

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.textBaseline = 'top';
        ctx.fillText(label, x1 + labelPadding, labelY + labelPadding);
      }

      // Draw match indicator
      if (isMatched) {
        const indicatorSize = 12;
        const indicatorX = smoothed.x2 - indicatorSize - 5;
        const indicatorY = y1 + 5;

        ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
        ctx.beginPath();
        ctx.arc(indicatorX + indicatorSize / 2, indicatorY + indicatorSize / 2, indicatorSize / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(indicatorX + 3, indicatorY + indicatorSize / 2);
        ctx.lineTo(indicatorX + indicatorSize / 2.5, indicatorY + indicatorSize - 4);
        ctx.lineTo(indicatorX + indicatorSize - 3, indicatorY + 3);
        ctx.stroke();
      }
    });
  }, [detections, scale, containerWidth, containerHeight, visible, showLabels, showConfidence, detectionKey]);

  if (!visible) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'absolute top-0 left-0 pointer-events-none z-20',
        className
      )}
      width={containerWidth}
      height={containerHeight}
      style={{
        width: containerWidth,
        height: containerHeight,
      }}
    />
  );
}

/**
 * Product info cards displayed near matched detection bounding boxes (HTML overlay)
 */
interface DetectionProductCardsProps {
  detections: Detection[];
  containerWidth: number;
  containerHeight: number;
  originalWidth: number;
  originalHeight: number;
  visible?: boolean;
}

export function DetectionProductCards({
  detections,
  containerWidth,
  containerHeight,
  originalWidth,
  originalHeight,
  visible = true,
}: DetectionProductCardsProps) {
  if (!visible || !originalWidth || !originalHeight) return null;

  const scaleX = containerWidth / originalWidth;
  const scaleY = containerHeight / originalHeight;

  const matchedDetections = detections.filter(
    (d) => d.matched_product_id && d.matched_product_name,
  );

  return (
    <div
      className="absolute top-0 left-0 pointer-events-none z-25"
      style={{ width: containerWidth, height: containerHeight }}
    >
      <AnimatePresence mode="popLayout">
        {matchedDetections.map((detection) => {
          const x1 = detection.box.x1 * scaleX;
          const y2 = detection.box.y2 * scaleY;
          const boxWidth = (detection.box.x2 - detection.box.x1) * scaleX;

          // Position card below the bounding box, centered
          const cardLeft = Math.max(4, x1 + boxWidth / 2 - 80);
          const cardTop = Math.min(y2 + 4, containerHeight - 44);

          return (
            <motion.div
              key={`${detection.matched_product_id}_${detection.class_name}`}
              initial={{ opacity: 0, y: -8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute"
              style={{ left: cardLeft, top: cardTop }}
            >
              <div className="bg-green-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md shadow-lg flex items-center gap-2 whitespace-nowrap text-xs font-medium">
                <span className="truncate max-w-[120px]">
                  {detection.matched_product_name}
                </span>
                {detection.matched_product_price != null && (
                  <span className="text-green-100 font-bold">
                    ${detection.matched_product_price.toFixed(2)}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/**
 * Detection stats component to show inference metrics
 */
interface DetectionStatsProps {
  detectionCount: number;
  inferenceTime: number;
  frameCount: number;
  matchedCount?: number;
  isProcessing?: boolean;
  actualFps?: number;
  className?: string;
}

export function DetectionStats({
  detectionCount,
  inferenceTime,
  frameCount,
  matchedCount = 0,
  isProcessing = false,
  actualFps,
  className,
}: DetectionStatsProps) {
  return (
    <div
      className={cn(
        'absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-mono z-30',
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span>Objects: {detectionCount}</span>
          {matchedCount > 0 && (
            <span className="text-green-400">({matchedCount} matched)</span>
          )}
        </div>
        <div>Inference: {inferenceTime.toFixed(1)}ms</div>
        <div className="flex items-center gap-2">
          <span>Frames: {frameCount}</span>
          {actualFps != null && (
            <span className="text-blue-300">{actualFps.toFixed(1)} fps</span>
          )}
        </div>
        {isProcessing && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-green-300 text-xs">Processing</span>
          </div>
        )}
      </div>
    </div>
  );
}
