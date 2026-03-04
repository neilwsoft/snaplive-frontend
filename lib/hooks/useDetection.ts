/**
 * Hook for real-time object detection using Grounding DINO
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { detectFrame, Detection, DetectFrameResponse } from '../api/detection';

export interface UseDetectionOptions {
  enabled: boolean;
  roomName: string;
  videoElement: HTMLVideoElement | null;
  fps?: number; // Frames per second to process (default: 1.5)
  confidenceThreshold?: number; // Minimum box confidence (default: 0.4)
  textThreshold?: number; // Minimum text matching threshold (default: 0.3)
  textPrompts?: string[]; // Text prompts for detection (default: backend defaults)
  imageSize?: number; // Image size for inference (default: 480)
  onDetection?: (response: DetectFrameResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseDetectionReturn {
  detections: Detection[];
  isProcessing: boolean;
  lastInferenceTime: number;
  error: Error | null;
  frameCount: number;
  actualFps: number;
}

/**
 * Hook for capturing video frames and running object detection
 */
export function useDetection(options: UseDetectionOptions): UseDetectionReturn {
  const {
    enabled,
    roomName,
    videoElement,
    fps = 1.5,
    confidenceThreshold = 0.4,
    textThreshold = 0.3,
    textPrompts,
    imageSize = 480,
    onDetection,
    onError,
  } = options;

  const [detections, setDetections] = useState<Detection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastInferenceTime, setLastInferenceTime] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [actualFps, setActualFps] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);
  const lastFrameTimeRef = useRef<number>(0);

  /**
   * Capture a frame from the video element and convert to base64
   */
  const captureFrame = useCallback((): string | null => {
    if (!videoElement || videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
      return null;
    }

    // Create canvas if it doesn't exist
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return null;

    // Set canvas size to video dimensions
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Convert to base64 JPEG (for smaller payload)
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      return dataUrl;
    } catch (err) {
      console.error('Failed to capture frame:', err);
      return null;
    }
  }, [videoElement]);

  /**
   * Process a single frame for object detection
   */
  const processFrame = useCallback(async () => {
    // Skip if already processing (frame throttling)
    if (processingRef.current || !enabled || !videoElement) {
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);

    try {
      // Capture frame
      const imageData = captureFrame();
      if (!imageData) {
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }

      // Send to backend for detection
      const response = await detectFrame({
        image_data: imageData,
        room_name: roomName,
        confidence_threshold: confidenceThreshold,
        text_threshold: textThreshold,
        text_prompts: textPrompts,
        image_size: imageSize,
      });

      // Track actual FPS
      const now = performance.now();
      if (lastFrameTimeRef.current > 0) {
        const elapsed = now - lastFrameTimeRef.current;
        if (elapsed > 0) {
          setActualFps(1000 / elapsed);
        }
      }
      lastFrameTimeRef.current = now;

      // Update state
      setDetections(response.detections);
      setLastInferenceTime(response.inference_time_ms);
      setFrameCount((prev) => prev + 1);
      setError(null);

      // Call callback if provided
      if (onDetection) {
        onDetection(response);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Detection failed');
      setError(error);
      if (onError) {
        onError(error);
      }
      console.error('Detection error:', error);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [
    enabled,
    videoElement,
    roomName,
    confidenceThreshold,
    textThreshold,
    textPrompts,
    imageSize,
    captureFrame,
    onDetection,
    onError,
  ]);

  /**
   * Start/stop detection loop based on enabled state
   */
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!enabled || !videoElement) {
      setDetections([]);
      setIsProcessing(false);
      return;
    }

    // Start detection loop
    const interval = 1000 / fps; // Convert FPS to milliseconds
    intervalRef.current = setInterval(() => {
      processFrame();
    }, interval);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, videoElement, fps, processFrame]);

  return {
    detections,
    isProcessing,
    lastInferenceTime,
    error,
    frameCount,
    actualFps,
  };
}
