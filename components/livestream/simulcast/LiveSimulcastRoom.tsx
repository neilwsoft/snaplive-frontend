'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from '@livekit/components-react';
import { useLivestreamStore } from '@/lib/stores/livestreamStore';
import { ProductSelectionPanel } from './panels/ProductSelectionPanel';
import { LiveBroadcastPanel } from './panels/LiveBroadcastPanel';
import { LivestreamChat } from '../LivestreamChat';
import { ProductQuickView } from '../ProductQuickView';
import type { ProductState, SimulcastStats, SocialStats } from '@/lib/types/simulcast';
import {
  startSession,
  endSession,
  type LivestreamSession,
} from '@/lib/api/livestream-sessions';
import {
  startEgress,
  stopEgress,
  getEgressStatus,
  type EgressResult,
  type EgressStatusInfo,
} from '@/lib/api/streaming';
import { toast } from 'sonner';

interface LiveSimulcastRoomProps {
  token: string;
  serverUrl: string;
  roomName: string;
  participantName: string;
  session?: LivestreamSession | null;
  destinationIds?: string[];
  onDisconnected?: () => void;
}

// Initial simulcast stats
const initialSimulcastStats: SimulcastStats = {
  orders: 0,
  revenue: 0,
  conversion: 0,
  viewerCount: 0,
  hourlyViewers: [
    { hour: '12:00', viewers: 0 },
    { hour: '13:00', viewers: 0 },
    { hour: '14:00', viewers: 0 },
    { hour: '15:00', viewers: 0 },
  ],
  channelPerformance: [
    { platform: 'douyin', platformName: 'Douyin', viewers: 0 },
    { platform: 'xiaohongshu', platformName: 'Xiaohongshu', viewers: 0 },
    { platform: 'taobao', platformName: 'Taobao', viewers: 0 },
  ],
};

/**
 * Main Live Simulcast Room component with 2-panel layout
 * Stats are overlaid on the video panel instead of a separate column
 */
export function LiveSimulcastRoom({
  token,
  serverUrl,
  roomName,
  participantName,
  session,
  destinationIds = [],
  onDisconnected,
}: LiveSimulcastRoomProps) {
  const {
    setRoomName,
    setSessionId,
    setIsHost,
    setIsConnected,
    setFeaturedProducts,
    isConnected,
    selectedProduct,
    selectProduct,
    featuredProducts,
    stats,
    aiDetectedProductId,
  } = useLivestreamStore();

  // Panel state
  const [leftPanelWidth, setLeftPanelWidth] = useState(296);
  const [productStates, setProductStates] = useState<Record<string, ProductState>>({});
  const [simulcastStats, setSimulcastStats] = useState<SimulcastStats>(initialSimulcastStats);
  const [socialStats] = useState<SocialStats>({ views: 0, likes: 0, comments: 0 });

  // Egress state
  const [egressResults, setEgressResults] = useState<EgressResult[]>([]);
  const [isEgressActive, setIsEgressActive] = useState(false);
  const [egressStatuses, setEgressStatuses] = useState<EgressStatusInfo[]>([]);

  // Initialize room state and products from session
  useEffect(() => {
    setRoomName(roomName);
    setIsHost(true);
    if (session?._id) {
      setSessionId(session._id);
    }

    // Populate featured products from session
    if (session?.products && session.products.length > 0) {
      const productsFromSession = session.products.map((p) => ({
        id: p.product_id,
        name: p.product_name?.en || p.product_name?.ko || 'Unknown Product',
        price: p.unit_cost || 0,
        image: p.image_url || '/placeholder-product.png',
        stock: p.available_at_start || 0,
        isHighlighted: false,
      }));
      setFeaturedProducts(productsFromSession);
      console.log('Loaded', productsFromSession.length, 'products from session');
    }
  }, [roomName, session, setRoomName, setSessionId, setIsHost, setFeaturedProducts]);

  // Initialize product states when featuredProducts change
  useEffect(() => {
    if (featuredProducts.length > 0) {
      const initialStates: Record<string, ProductState> = {};
      featuredProducts.forEach((p, index) => {
        initialStates[p.id] = index === 0 ? 'active' : 'waiting';
      });
      setProductStates(initialStates);
    }
  }, [featuredProducts]);

  // Auto-activate AI-detected product
  useEffect(() => {
    if (!aiDetectedProductId) return;

    setProductStates((prev) => {
      // Skip if product is already active or done
      const currentState = prev[aiDetectedProductId];
      if (currentState === 'active' || currentState === 'done') return prev;

      // Mark current active as done, set detected product as active
      const updated: Record<string, ProductState> = { ...prev };
      const activeProductId = Object.entries(prev).find(
        ([, state]) => state === 'active'
      )?.[0];
      if (activeProductId) {
        updated[activeProductId] = 'done';
      }
      updated[aiDetectedProductId] = 'active';
      return updated;
    });
  }, [aiDetectedProductId]);

  // Update simulcast stats from store stats
  useEffect(() => {
    setSimulcastStats((prev) => ({
      ...prev,
      viewerCount: stats.viewerCount,
    }));
  }, [stats.viewerCount]);

  // Poll for live stats (TODO: connect to backend)
  useEffect(() => {
    if (!session?._id || !isConnected) return;

    const fetchStats = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await getLiveStats(session._id);
        // setSimulcastStats(response);

        // Demo: simulate stats updates
        setSimulcastStats((prev) => ({
          ...prev,
          orders: prev.orders + Math.floor(Math.random() * 2),
          revenue: prev.revenue + Math.random() * 100,
          conversion: Math.min(10, prev.conversion + Math.random() * 0.1),
          viewerCount: stats.viewerCount,
        }));
      } catch (error) {
        console.error('Failed to fetch live stats:', error);
      }
    };

    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [session?._id, isConnected, stats.viewerCount]);

  // Poll egress status every 10 seconds
  useEffect(() => {
    if (!isEgressActive || !isConnected) return;

    const pollStatus = async () => {
      try {
        const status = await getEgressStatus(roomName);
        setEgressStatuses(status.egresses);

        // Detect failures
        const newErrors = status.egresses.filter(
          (e) => e.status === 'EGRESS_FAILED' || e.status === 'EGRESS_ENDING'
        );
        if (newErrors.length > 0) {
          newErrors.forEach((e) => {
            toast.warning(`Platform stream ended: ${e.platform || e.egress_id}`);
          });
        }

        // Check if all egresses have ended
        const allEnded = status.egresses.every(
          (e) => e.status === 'EGRESS_COMPLETE' || e.status === 'EGRESS_FAILED'
        );
        if (allEnded && status.egresses.length > 0) {
          setIsEgressActive(false);
        }
      } catch (error) {
        console.error('Failed to poll egress status:', error);
      }
    };

    const interval = setInterval(pollStatus, 10000);
    return () => clearInterval(interval);
  }, [isEgressActive, isConnected, roomName]);

  // Handle panel resize
  const handleLeftPanelResize = useCallback((deltaX: number) => {
    setLeftPanelWidth((prev) => Math.max(200, Math.min(500, prev + deltaX)));
  }, []);

  // Handle product click - cycle through states
  const handleProductClick = useCallback((productId: string) => {
    setProductStates((prev) => {
      const currentState = prev[productId] || 'waiting';
      let newState: ProductState;

      // Find current active product
      const activeProductId = Object.entries(prev).find(
        ([, state]) => state === 'active'
      )?.[0];

      if (currentState === 'waiting') {
        // Clicking waiting product makes it active
        const updated: Record<string, ProductState> = { ...prev };
        if (activeProductId) {
          updated[activeProductId] = 'done';
        }
        updated[productId] = 'active';
        return updated;
      } else if (currentState === 'active') {
        // Clicking active product marks as done
        return { ...prev, [productId]: 'done' };
      }

      // Done products stay done
      return prev;
    });
  }, []);

  // Handle connection error
  const handleError = (error: Error) => {
    console.error('LiveKit connection error:', error);

    if (error.name === 'NotAllowedError' || error.message.includes('Permission denied')) {
      alert(
        'Camera and microphone access was denied.\n\nPlease:\n1. Click the camera icon in your browser address bar\n2. Allow camera and microphone access\n3. Refresh the page'
      );
    } else if (error.message.includes('permissions')) {
      alert('Camera and microphone permissions are required. Please allow access and refresh.');
    } else {
      alert(`Connection error: ${error.message}`);
    }
  };

  return (
    <div className="h-full w-full">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        connect={true}
        data-lk-theme="default"
        style={{ height: '100%' }}
        onConnected={async () => {
          console.log('Host connected to room:', roomName);
          setIsConnected(true);
          // Transition session: pending → live
          if (session?._id) {
            startSession(session._id).catch((err) =>
              console.warn('Failed to start session:', err)
            );
          }
          // Start RTMP egress after host is connected
          if (destinationIds.length > 0) {
            try {
              toast.info('Starting platform streams...');
              const response = await startEgress({
                room_name: roomName,
                destination_ids: destinationIds,
              });
              setEgressResults(response.results);
              setIsEgressActive(true);

              const succeeded = response.results.filter((r) => r.success);
              const failed = response.results.filter((r) => !r.success);
              if (succeeded.length > 0) {
                toast.success(`Streaming to ${succeeded.length} platform(s)`);
              }
              if (failed.length > 0) {
                failed.forEach((r) => {
                  toast.error(`Failed to stream to ${r.platform || 'platform'}: ${r.error || 'Unknown error'}`);
                });
              }
            } catch (error) {
              console.error('Failed to start egress:', error);
              toast.error('Failed to start platform streams. You can still broadcast via WebRTC.');
            }
          }
        }}
        onDisconnected={async () => {
          console.log('Host disconnected from room');
          setIsConnected(false);
          // Stop RTMP egress before ending session
          if (isEgressActive) {
            try {
              await stopEgress(roomName);
              setIsEgressActive(false);
              setEgressResults([]);
              setEgressStatuses([]);
              console.log('Egress stopped for room:', roomName);
            } catch (err) {
              console.warn('Failed to stop egress:', err);
            }
          }
          // Transition session: live/pending → ended
          if (session?._id) {
            endSession(session._id).catch((err) =>
              console.warn('Failed to end session:', err)
            );
          }
          onDisconnected?.();
        }}
        onError={handleError}
        options={{
          videoCaptureDefaults: {
            resolution: {
              width: 1280,
              height: 720,
              frameRate: 30,
            },
          },
          audioCaptureDefaults: {
            autoGainControl: true,
            echoCancellation: true,
            noiseSuppression: true,
          },
        }}
      >
        {/* Main 2-panel layout — stats overlaid on video */}
        {isConnected && (
          <div className="flex h-full w-full bg-slate-100">
            {/* Left Panel - Product Selection */}
            <ProductSelectionPanel
              width={leftPanelWidth}
              onResize={handleLeftPanelResize}
              productStates={productStates}
              onProductClick={handleProductClick}
            />

            {/* Center Panel - Live Broadcast with overlay stats */}
            <LiveBroadcastPanel
              roomName={roomName}
              onEndStream={onDisconnected}
              stats={simulcastStats}
              broadcastInfo={{
                title: session?.title || 'Untitled Livestream',
                category: 'Live Commerce',
                startTime: session?.started_at ? new Date(session.started_at) : new Date(),
                quality: 'HD',
              }}
              socialStats={socialStats}
              egressResults={egressResults}
              egressStatuses={egressStatuses}
              isEgressActive={isEgressActive}
            />
          </div>
        )}

        {/* Loading state */}
        {!isConnected && (
          <div className="h-full w-full flex items-center justify-center bg-zinc-900">
            <div className="text-center text-white">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p>Connecting to livestream...</p>
            </div>
          </div>
        )}

        <RoomAudioRenderer />

        {/* Chat Overlay */}
        {isConnected && <SimulcastChatOverlay />}

        {/* Product Quick View Modal */}
        <ProductQuickView
          open={!!selectedProduct}
          onOpenChange={(open) => !open && selectProduct(null)}
          product={selectedProduct}
        />
      </LiveKitRoom>
    </div>
  );
}

/**
 * Chat overlay wrapper that accesses room context
 * Must be rendered inside LiveKitRoom
 */
function SimulcastChatOverlay() {
  const room = useRoomContext();

  // Guard against room not being available yet
  if (!room) {
    return null;
  }

  return <LivestreamChat room={room} />;
}

export default LiveSimulcastRoom;
