'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTracks, useRoomContext } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DetectionOverlay, DetectionStats } from '../../DetectionOverlay';
import { DetectionControls } from '../../DetectionControls';
import { StreamingStatsAccordion } from '../widgets/StreamingStatsAccordion';
import { RealTimeMetrics } from '../widgets/RealTimeMetrics';
import { HourlyViewersChart } from '../widgets/HourlyViewersChart';
import { ChannelPerformance } from '../widgets/ChannelPerformance';
import { SocialStatsBar } from '../widgets/SocialStatsBar';
import { DestinationPanel } from '@/components/liveconnect/DestinationManager';
import { useLivestreamStore } from '@/lib/stores/livestreamStore';
import { useDetection } from '@/lib/hooks/useDetection';
import type { SimulcastStats, BroadcastInfo, SocialStats } from '@/lib/types/simulcast';
import type { EgressResult, EgressStatusInfo } from '@/lib/api/streaming';
import Image from 'next/image';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Loader2,
  Users,
  Settings,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Package,
  X,
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveBroadcastPanelProps {
  roomName: string;
  onEndStream?: () => void;
  stats?: SimulcastStats;
  broadcastInfo?: BroadcastInfo;
  socialStats?: SocialStats;
  egressResults?: EgressResult[];
  egressStatuses?: EgressStatusInfo[];
  isEgressActive?: boolean;
  className?: string;
}

/**
 * Center panel - Live broadcast video with overlaid stats, top toolbar, and info bar
 */
// Platform icon paths
const PLATFORM_ICONS: Record<string, string> = {
  taobao: '/images/platforms/taobao.svg',
  douyin: '/images/platforms/douyin.svg',
  xiaohongshu: '/images/platforms/xiaohongshu.svg',
};

const PLATFORM_NAMES: Record<string, string> = {
  taobao: 'Taobao',
  douyin: 'Douyin',
  xiaohongshu: 'Xiaohongshu',
};

export function LiveBroadcastPanel({
  roomName,
  onEndStream,
  stats,
  broadcastInfo,
  socialStats,
  egressResults = [],
  egressStatuses = [],
  isEgressActive = false,
  className,
}: LiveBroadcastPanelProps) {
  const room = useRoomContext();
  const {
    stats: storeStats,
    detectionSettings,
    featuredProducts,
    highlightedProductId,
    aiDetectedProductId,
  } = useLivestreamStore();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [showStatsOverlay, setShowStatsOverlay] = useState(true);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Duration timer
  const [duration, setDuration] = useState('00:00:00');

  useEffect(() => {
    if (!broadcastInfo?.startTime) return;

    const updateDuration = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((now.getTime() - broadcastInfo.startTime.getTime()) / 1000));
      const hours = Math.floor(diff / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const seconds = (diff % 60).toString().padStart(2, '0');
      setDuration(`${hours}:${minutes}:${seconds}`);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [broadcastInfo?.startTime]);

  // Cooldown ref for AI product detection — avoid rapid switching
  const lastAiProductTimeRef = useRef<number>(0);
  const AI_PRODUCT_COOLDOWN_MS = 3000; // 3 second cooldown between auto-selections

  // Callback when detection results arrive — auto-highlight matched products
  const handleDetection = useCallback(
    (response: import('@/lib/api/detection').DetectFrameResponse) => {
      const now = Date.now();
      if (now - lastAiProductTimeRef.current < AI_PRODUCT_COOLDOWN_MS) return;

      // Find highest-confidence detection that has a matched product
      const matched = response.detections
        .filter((d) => d.matched_product_id)
        .sort((a, b) => b.confidence - a.confidence)[0];

      if (!matched?.matched_product_id) return;

      const store = useLivestreamStore.getState();
      // Skip if same product is already highlighted
      if (store.aiDetectedProductId === matched.matched_product_id) return;

      lastAiProductTimeRef.current = now;
      store.setAiDetectedProduct(matched.matched_product_id);

      // Broadcast AI highlight to viewers via LiveKit data stream
      try {
        room.localParticipant?.sendText(
          JSON.stringify({
            type: 'ai_product_highlight',
            productId: matched.matched_product_id,
            productName: matched.matched_product_name,
            confidence: matched.confidence,
          }),
          { topic: 'products' }
        );
      } catch (err) {
        console.warn('Failed to broadcast AI product highlight:', err);
      }
    },
    [room]
  );

  // Use detection hook for host
  const {
    detections,
    isProcessing,
    lastInferenceTime,
    frameCount,
  } = useDetection({
    enabled: detectionSettings.enabled,
    roomName,
    videoElement,
    fps: detectionSettings.fps,
    confidenceThreshold: detectionSettings.confidenceThreshold,
    textThreshold: detectionSettings.textThreshold,
    textPrompts: detectionSettings.textPrompts,
    onDetection: handleDetection,
  });

  // Track video dimensions for detection overlay
  useEffect(() => {
    if (!videoElement) return;

    const updateDimensions = () => {
      setVideoDimensions({
        width: videoElement.clientWidth,
        height: videoElement.clientHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [videoElement]);

  // Only show host's camera track
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false, updateOnlyOn: [] }
  ).filter((track) => track.participant.isLocal);

  // Sync local state with room track state
  useEffect(() => {
    if (!room?.localParticipant) return;

    const updateTrackStates = () => {
      const localParticipant = room.localParticipant;
      const cameraTrack = localParticipant.getTrackPublication(Track.Source.Camera);
      const micTrack = localParticipant.getTrackPublication(Track.Source.Microphone);

      if (cameraTrack) {
        setIsCameraOn(!cameraTrack.isMuted);
      }
      if (micTrack) {
        setIsMicOn(!micTrack.isMuted);
      }
    };

    updateTrackStates();
    const interval = setInterval(updateTrackStates, 500);
    return () => clearInterval(interval);
  }, [room]);

  const toggleCamera = async () => {
    try {
      await room.localParticipant.setCameraEnabled(!isCameraOn);
      setIsCameraOn(!isCameraOn);
    } catch (error) {
      console.error('Failed to toggle camera:', error);
    }
  };

  const toggleMicrophone = async () => {
    try {
      await room.localParticipant.setMicrophoneEnabled(!isMicOn);
      setIsMicOn(!isMicOn);
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
    }
  };

  const handleEndStream = async () => {
    if (confirm('Are you sure you want to end the livestream?')) {
      await room.disconnect();
      onEndStream?.();
    }
  };

  // Derive highlighted product for the overlay
  const highlightedProduct = featuredProducts.find(
    (p) => p.id === highlightedProductId
  );
  const isAiHighlight = highlightedProductId === aiDetectedProductId;

  const dismissHighlight = useCallback(() => {
    useLivestreamStore.getState().highlightProduct(null);
  }, []);

  const formatDateLocale = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}年${m}月${d}日`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className={cn('bg-zinc-900 flex-1 h-full overflow-hidden relative', className)}>
      {/* Video container */}
      <div
        ref={videoContainerRef}
        className="absolute inset-0 overflow-hidden"
      >
        {tracks.length > 0 && tracks[0]?.publication?.track ? (
          <>
            <video
              ref={(el) => {
                if (el && tracks[0]?.publication?.track) {
                  tracks[0].publication.track.attach(el);
                  setVideoElement(el);
                }
              }}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            {/* Detection overlay */}
            {detectionSettings.enabled && videoElement && (
              <>
                <DetectionOverlay
                  detections={detections}
                  videoElement={videoElement}
                  containerWidth={videoDimensions.width}
                  containerHeight={videoDimensions.height}
                  originalWidth={videoElement.videoWidth}
                  originalHeight={videoElement.videoHeight}
                  visible={true}
                  showLabels={detectionSettings.showLabels}
                  showConfidence={detectionSettings.showConfidence}
                />
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <div className="text-center text-white">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
              <p>Starting camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* ============ TOP TOOLBAR (center controls) ============ */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-1.5 py-1">
          {/* Camera toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCamera}
            className={cn(
              'h-8 w-8 rounded-full p-0',
              isCameraOn
                ? 'text-white hover:bg-white/20'
                : 'text-red-400 bg-red-500/20 hover:bg-red-500/30',
            )}
            title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>

          {/* YOLO toggle with settings */}
          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-0.5">
            <Switch
              checked={detectionSettings.enabled}
              onCheckedChange={() => {
                const { toggleDetection } = useLivestreamStore.getState();
                toggleDetection();
              }}
              className="h-4 w-7 data-[state=checked]:bg-green-500"
            />
            <span className="text-xs font-medium text-white/80">
              YOLO {detectionSettings.enabled ? 'On' : 'Off'}
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="text-white/60 hover:text-white transition-colors"
                  title="Detection settings"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="center"
                className="w-80 p-0 bg-zinc-900 border-white/10"
              >
                <DetectionControls room={room} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Mic toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMicrophone}
            className={cn(
              'h-8 w-8 rounded-full p-0',
              isMicOn
                ? 'text-white hover:bg-white/20'
                : 'text-red-400 bg-red-500/20 hover:bg-red-500/30',
            )}
            title={isMicOn ? 'Mute' : 'Unmute'}
          >
            {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>

          <div className="w-px h-5 bg-white/20 mx-0.5" />

          {/* End Live Simulcast */}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEndStream}
            className="bg-red-600 hover:bg-red-700 text-xs h-7 px-3 rounded-full"
          >
            End Live Simulcast
          </Button>
        </div>
      </div>

      {/* LIVE badge + viewer count + platform status (top right) */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <Badge className="bg-red-600 text-white font-bold px-2 py-0.5 text-xs animate-pulse">
          LIVE
        </Badge>
        <Badge variant="secondary" className="bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-0.5 border-white/10">
          <Users className="h-3 w-3 mr-1" />
          {storeStats.viewerCount}
        </Badge>

        {/* Platform streaming status */}
        {egressResults.length > 0 && (
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 border border-white/10">
            <Radio className="h-3 w-3 text-white/60 mr-0.5" />
            {egressResults.map((result) => {
              const platform = result.platform || 'custom';
              const iconPath = PLATFORM_ICONS[platform];
              const name = PLATFORM_NAMES[platform] || platform;

              // Check live status from polling
              const liveStatus = egressStatuses.find(
                (s) => s.destination_id === result.destination_id
              );
              const isStreaming =
                result.success &&
                (!liveStatus ||
                  liveStatus.status === 'EGRESS_ACTIVE' ||
                  liveStatus.status === 'EGRESS_STARTING');
              const isFailed =
                !result.success ||
                liveStatus?.status === 'EGRESS_FAILED';

              return (
                <div
                  key={result.destination_id}
                  className="flex items-center gap-1 px-1"
                  title={
                    isFailed
                      ? `${name}: Failed - ${result.error || liveStatus?.error || 'Unknown error'}`
                      : isStreaming
                      ? `${name}: Live`
                      : `${name}: ${liveStatus?.status || 'Unknown'}`
                  }
                >
                  {iconPath ? (
                    <div className="w-4 h-4 relative shrink-0">
                      <Image src={iconPath} alt={name} fill className="object-contain" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-white/70">{name}</span>
                  )}
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      isFailed
                        ? 'bg-red-500'
                        : isStreaming
                        ? 'bg-green-500 animate-pulse'
                        : 'bg-yellow-500'
                    )}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============ BROADCAST INFO CARD (upper left) ============ */}
      <div className="absolute top-3 left-3 z-20 w-[340px] rounded-lg bg-black/40 backdrop-blur-sm overflow-hidden">
        <div className="p-3 flex flex-col gap-2">
          {/* Row 1: Date, Time, Duration */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-white/80">
              {broadcastInfo?.startTime && (
                <>
                  <span>{formatDateLocale(broadcastInfo.startTime)}</span>
                  <span>{formatTime(broadcastInfo.startTime)}</span>
                </>
              )}
            </div>
            <span className="font-mono text-white/90">{duration}</span>
          </div>

          {/* Row 2: Title */}
          <h3 className="text-base font-bold text-white truncate">
            {broadcastInfo?.title || 'Untitled'}
          </h3>

          {/* Row 3: Category + Quality */}
          <div className="flex items-center justify-between">
            {broadcastInfo?.category && (
              <span className="text-xs border border-white/30 rounded px-2 py-0.5 text-white/80">
                {broadcastInfo.category}
              </span>
            )}
            {broadcastInfo?.quality && (
              <span className="text-sm font-medium text-white/80">
                {broadcastInfo.quality}
              </span>
            )}
          </div>

          {/* Row 4: Social stats */}
          {socialStats && (
            <SocialStatsBar stats={socialStats} className="mt-1" />
          )}
        </div>
      </div>

      {/* ============ STATS OVERLAY (right side) ============ */}
      <div
        className={cn(
          'absolute top-14 right-0 bottom-0 z-20 transition-all duration-300 ease-in-out',
          showStatsOverlay ? 'w-[280px]' : 'w-0',
        )}
      >
        {/* Toggle button */}
        <button
          onClick={() => setShowStatsOverlay(!showStatsOverlay)}
          className={cn(
            'absolute top-2 z-10 h-8 w-8 flex items-center justify-center',
            'bg-black/50 backdrop-blur-sm rounded-l-md text-white/70 hover:text-white transition-colors',
            showStatsOverlay ? '-left-8' : 'left-0 rounded-l-none rounded-r-md',
          )}
          title={showStatsOverlay ? 'Hide stats' : 'Show stats'}
        >
          {showStatsOverlay ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </button>

        {/* Stats content */}
        {showStatsOverlay && (
          <div className="h-full bg-black/40 backdrop-blur-sm overflow-hidden">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-3 p-3">
                {/* Streaming Stats Accordion */}
                <StreamingStatsAccordion dark />

                {/* Real Time Metrics */}
                {stats && (
                  <RealTimeMetrics
                    orders={stats.orders}
                    revenue={stats.revenue}
                    conversion={stats.conversion}
                    dark
                  />
                )}

                {/* Hourly Viewers Chart */}
                {stats && (
                  <HourlyViewersChart
                    data={stats.hourlyViewers}
                    currentViewers={stats.viewerCount}
                    dark
                  />
                )}

                {/* Channel Performance */}
                {stats && (
                  <ChannelPerformance channels={stats.channelPerformance} dark />
                )}

                {/* Streaming Destinations */}
                <div className="border-t border-white/10 pt-3">
                  <DestinationPanel />
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Stats overlay toggle when hidden — floating button on right edge */}
      {!showStatsOverlay && (
        <button
          onClick={() => setShowStatsOverlay(true)}
          className="absolute top-16 right-0 z-20 h-8 w-8 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-l-md text-white/70 hover:text-white transition-colors"
          title="Show stats"
        >
          <PanelRightOpen className="h-4 w-4" />
        </button>
      )}

      {/* ============ HIGHLIGHTED PRODUCT OVERLAY (bottom-left) ============ */}
      {highlightedProduct && (
        <div className="absolute bottom-4 left-4 z-20 max-w-[320px] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-black/60 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="flex gap-3 p-3">
              {/* Product image */}
              <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-white/10">
                {highlightedProduct.image && !highlightedProduct.image.includes('placeholder') ? (
                  <img
                    src={highlightedProduct.image}
                    alt={highlightedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-white/40" />
                  </div>
                )}
                {/* AI badge on image */}
                {isAiHighlight && (
                  <div className="absolute top-1 left-1">
                    <div className="flex items-center gap-0.5 bg-emerald-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI
                    </div>
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <p className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                    {highlightedProduct.name}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-emerald-400">
                    CN¥{highlightedProduct.price.toLocaleString('zh-CN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  {highlightedProduct.stock > 0 && (
                    <span className="text-[10px] text-white/50">
                      {highlightedProduct.stock} in stock
                    </span>
                  )}
                </div>
              </div>

              {/* Dismiss button */}
              <button
                onClick={dismissHighlight}
                className="self-start p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detection stats (bottom-left, when YOLO active — shifts up when product is shown) */}
      {detectionSettings.enabled && videoElement && (
        <div className={cn(
          'absolute left-4 z-20 transition-all duration-300',
          highlightedProduct ? 'bottom-[120px]' : 'bottom-4'
        )}>
          <DetectionStats
            detectionCount={detections.length}
            inferenceTime={lastInferenceTime}
            frameCount={frameCount}
          />
        </div>
      )}
    </div>
  );
}
