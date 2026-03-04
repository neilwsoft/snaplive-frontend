'use client';

/**
 * LiveRoom Component
 * Enhanced livestreaming component with e-commerce features
 */

import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  useRoomContext,
} from '@livekit/components-react';
import { Track, Room } from 'livekit-client';
import { LivestreamChat } from './LivestreamChat';
import { ReactionsPanel } from './ReactionsPanel';
import { ProductOverlay } from './ProductOverlay';
import { LiveCart } from './LiveCart';
import { HostProductList } from './HostProductList';
import { ProductQuickView } from './ProductQuickView';
import { DetectionOverlay, DetectionStats, DetectionProductCards } from './DetectionOverlay';
import { DetectionControls } from './DetectionControls';
import { useLivestreamStore } from '@/lib/stores/livestreamStore';
import { useDetection } from '@/lib/hooks/useDetection';
import {
  getEgressStatus,
  stopEgress,
  type EgressStatusInfo,
} from '@/lib/api/streaming';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MonitorUp,
  Maximize,
  Minimize,
  Settings,
  Users,
  BarChart3,
  Video,
  Mic,
  MicOff,
  VideoOff,
  X,
  MessageCircle,
  Gift as GiftIcon,
  Loader2,
} from 'lucide-react';

interface LiveRoomProps {
  token: string;
  serverUrl: string;
  roomName: string;
  participantName: string;
  onDisconnected?: () => void;
}

export function LiveRoom({
  token,
  serverUrl,
  roomName,
  participantName,
  onDisconnected,
}: LiveRoomProps) {
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
        onDisconnected={onDisconnected}
      >
        {/* Custom layout for livestreaming */}
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

/**
 * Enhanced viewer interface with chat, reactions, and shopping
 */
export function ViewerRoom({
  token,
  serverUrl,
  roomName,
  onDisconnected,
}: Omit<LiveRoomProps, 'participantName'>) {
  const [showViewerList, setShowViewerList] = useState(false);
  const { selectedProduct, selectProduct, setRoomName, setIsHost, setIsConnected } =
    useLivestreamStore();

  useEffect(() => {
    setRoomName(roomName);
    setIsHost(false);
  }, [roomName, setRoomName, setIsHost]);

  return (
    <div className="h-full w-full bg-black">
      <LiveKitRoom
        video={false}
        audio={false}
        token={token}
        serverUrl={serverUrl}
        connect={true}
        data-lk-theme="default"
        style={{ height: '100%' }}
        onConnected={() => setIsConnected(true)}
        onDisconnected={() => {
          setIsConnected(false);
          onDisconnected?.();
        }}
      >
        <ViewerLayoutEnhanced
          showViewerList={showViewerList}
          setShowViewerList={setShowViewerList}
        />
        <RoomAudioRenderer />

        {/* Chat Overlay - Positioned absolutely within LiveKit room */}
        <ViewerChatOverlay />

        {/* Product Quick View Modal */}
        <ProductQuickView
          open={!!selectedProduct}
          onOpenChange={(open) => !open && selectProduct(null)}
          product={selectedProduct}
        />

        {/* Shopping Cart */}
        <LiveCart />
      </LiveKitRoom>
    </div>
  );
}

/**
 * Chat overlay wrapper for viewer that accesses room context
 */
function ViewerChatOverlay() {
  const room = useRoomContext();
  return <LivestreamChat room={room} />;
}

/**
 * Enhanced layout for viewers with all features
 */
function ViewerLayoutEnhanced({
  showViewerList,
  setShowViewerList,
}: {
  showViewerList: boolean;
  setShowViewerList: (show: boolean) => void;
}) {
  const room = useRoomContext();
  const [showProducts, setShowProducts] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

  const {
    detectionSettings,
    setDetectionEnabled,
    setDetectionVisibleToViewers,
  } = useLivestreamStore();

  // Only get host's camera track
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
    ],
    { onlySubscribed: true }
  ).filter(track => !track.participant.isLocal);

  const { stats, selectedProduct, selectProduct, featuredProducts, viewers } = useLivestreamStore();

  // Use detection hook
  const {
    detections,
    isProcessing,
    lastInferenceTime,
    frameCount,
    actualFps,
  } = useDetection({
    enabled: detectionSettings.enabled && detectionSettings.visibleToViewers,
    roomName: room?.name || '',
    videoElement,
    fps: detectionSettings.fps,
    confidenceThreshold: detectionSettings.confidenceThreshold,
  });

  const matchedCount = detections.filter((d) => !!d.matched_product_id).length;

  // Listen for detection control messages from host
  useEffect(() => {
    if (!room) return;

    const handleTextStream = async (reader: any, participantInfo: { identity: string }) => {
      try {
        const text = await reader.readAll();
        const data = JSON.parse(text);

        if (data.type === 'detection_state') {
          setDetectionEnabled(data.enabled);
          setDetectionVisibleToViewers(data.visibleToViewers);
        }
      } catch (error) {
        console.error('Error reading detection state:', error);
      }
    };

    // Register handler for detection control messages
    try {
      room.registerTextStreamHandler('detection', handleTextStream);
    } catch (error) {
      console.warn('Detection stream handler already registered:', error);
    }
  }, [room, setDetectionEnabled, setDetectionVisibleToViewers]);

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

  return (
    <div className="h-full w-full bg-black">
      {/* Main video area - Full screen */}
      <div className="w-full h-full relative">
        {/* Host's livestream feed - Full screen */}
        <div className="absolute inset-0">
          {tracks.length > 0 && tracks[0]?.publication?.track && (
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
              {/* Detection overlay for bounding boxes */}
              {detectionSettings.enabled && detectionSettings.visibleToViewers && videoElement && (
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
                  <DetectionProductCards
                    detections={detections}
                    containerWidth={videoDimensions.width}
                    containerHeight={videoDimensions.height}
                    originalWidth={videoElement.videoWidth}
                    originalHeight={videoElement.videoHeight}
                  />
                  <DetectionStats
                    detectionCount={detections.length}
                    inferenceTime={lastInferenceTime}
                    frameCount={frameCount}
                    matchedCount={matchedCount}
                    isProcessing={isProcessing}
                    actualFps={actualFps}
                  />
                </>
              )}
            </>
          )}
          {tracks.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                <p>Waiting for host to start streaming...</p>
              </div>
            </div>
          )}
        </div>

        {/* Top overlay - Live badge and stats */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-red-600 text-white font-bold px-3 py-1.5 animate-pulse">
                🔴 LIVE
              </Badge>
              <Badge
                variant="secondary"
                className="bg-black/50 text-white backdrop-blur-sm cursor-pointer hover:bg-black/70 transition-colors"
                onClick={() => setShowViewerList(true)}
              >
                <Users className="h-3.5 w-3.5 mr-1.5" />
                {stats.viewerCount}
              </Badge>
            </div>
          </div>
        </div>

        {/* Product Overlay - Bottom */}
        <ProductOverlay
          room={room}
          isHost={false}
          onProductClick={(product) => selectProduct(product)}
        />

        {/* Bottom controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Left - Reactions */}
            <div>
              <ReactionsPanel room={room} />
            </div>

            {/* Center - Products button */}
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowProducts(!showProducts)}
                className="rounded-full px-6 shadow-2xl"
              >
                <GiftIcon className="h-5 w-5 mr-2" />
                Products {featuredProducts.length > 0 && `(${featuredProducts.length})`}
              </Button>
            </div>

            {/* Right - spacer */}
            <div className="w-12"></div>
          </div>
        </div>

        {/* Viewer List Modal */}
        {showViewerList && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setShowViewerList(false)}>
            <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Viewers ({stats.viewerCount})
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowViewerList(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="max-h-96">
                <div className="space-y-2">
                  {viewers.map((viewer) => (
                    <div key={viewer.identity} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {viewer.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{viewer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(viewer.joinedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {viewers.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No viewers yet</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Enhanced host interface with full controls and product management
 */
export function HostRoom({
  token,
  serverUrl,
  roomName,
  participantName,
  onDisconnected,
}: LiveRoomProps) {
  const {
    selectedProduct,
    selectProduct,
    setRoomName,
    setIsHost,
    setIsConnected,
    isConnected,
    stats,
  } = useLivestreamStore();
  const [egressStatuses, setEgressStatuses] = useState<EgressStatusInfo[]>([]);

  useEffect(() => {
    setRoomName(roomName);
    setIsHost(true);
  }, [roomName, setRoomName, setIsHost]);

  // Poll egress status every 10 seconds while connected
  useEffect(() => {
    if (!isConnected || !roomName) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await getEgressStatus(roomName);
        if (!cancelled) {
          setEgressStatuses(res.egresses);
        }
      } catch {
        // Silently ignore polling errors
      }
    };

    poll();
    const interval = setInterval(poll, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isConnected, roomName]);

  const handleError = (error: Error) => {
    console.error('LiveKit connection error:', error);

    // Handle permission denied errors
    if (error.name === 'NotAllowedError' || error.message.includes('Permission denied')) {
      alert('Camera and microphone access was denied.\n\nPlease:\n1. Click the camera icon in your browser address bar\n2. Allow camera and microphone access\n3. Refresh the page');
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
        onConnected={() => {
          console.log('Host connected to room:', roomName);
          setIsConnected(true);
        }}
        onDisconnected={() => {
          console.log('Host disconnected from room');
          setIsConnected(false);
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
        {isConnected && <HostLayoutEnhanced roomName={roomName} egressStatuses={egressStatuses} />}
        <RoomAudioRenderer />

        {/* Chat Overlay - Positioned absolutely within LiveKit room */}
        {isConnected && <HostChatOverlay />}

        {/* Host Product List - Lower left floating panel */}
        {isConnected && <HostProductListOverlay />}

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
 * Chat overlay wrapper for host that accesses room context
 */
function HostChatOverlay() {
  const room = useRoomContext();
  return <LivestreamChat room={room} />;
}

/**
 * Product list overlay wrapper for host that accesses room context
 */
function HostProductListOverlay() {
  const room = useRoomContext();
  return <HostProductList room={room} />;
}

/**
 * Enhanced host layout with professional streaming UI
 */
function HostLayoutEnhanced({
  roomName,
  egressStatuses = [],
}: {
  roomName: string;
  egressStatuses?: EgressStatusInfo[];
}) {
  const room = useRoomContext();
  const { stats, selectedProduct, selectProduct, viewers, detectionSettings } = useLivestreamStore();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

  // Use detection hook for host
  const {
    detections,
    isProcessing,
    lastInferenceTime,
    frameCount,
    actualFps,
  } = useDetection({
    enabled: detectionSettings.enabled,
    roomName,
    videoElement,
    fps: detectionSettings.fps,
    confidenceThreshold: detectionSettings.confidenceThreshold,
    textThreshold: detectionSettings.textThreshold,
    textPrompts: detectionSettings.textPrompts,
  });

  const matchedCount = detections.filter((d) => !!d.matched_product_id).length;

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
    [
      { source: Track.Source.Camera, withPlaceholder: true },
    ],
    {
      onlySubscribed: false,
      updateOnlyOn: []
    }
  ).filter(track => track.participant.isLocal);

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

    // Listen for track changes
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
      // Stop all platform RTMP egresses before disconnecting
      try {
        await stopEgress(roomName);
      } catch (e) {
        console.warn('Failed to stop egress on end stream:', e);
      }
      await room.disconnect();
    }
  };

  return (
    <div className="h-full w-full bg-black">
      {/* Main video area - Full screen livestream */}
      <div className="w-full h-full relative">
        {/* Host's camera feed - Full screen */}
        <div className="absolute inset-0">
          {tracks.length > 0 && tracks[0]?.publication?.track && (
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
                muted={false}
              />
              {/* Detection overlay for bounding boxes */}
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
                  <DetectionProductCards
                    detections={detections}
                    containerWidth={videoDimensions.width}
                    containerHeight={videoDimensions.height}
                    originalWidth={videoElement.videoWidth}
                    originalHeight={videoElement.videoHeight}
                  />
                  <DetectionStats
                    detectionCount={detections.length}
                    inferenceTime={lastInferenceTime}
                    frameCount={frameCount}
                    matchedCount={matchedCount}
                    isProcessing={isProcessing}
                    actualFps={actualFps}
                  />
                </>
              )}
            </>
          )}
          {tracks.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                <p>Starting camera...</p>
              </div>
            </div>
          )}
        </div>

        {/* Detection Controls - Top Right */}
        <div className="absolute top-4 left-4 z-30 max-w-xs">
          <DetectionControls room={room} />
        </div>

        {/* Top overlay - Live badge and stats */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-red-600 text-white font-bold px-3 py-1.5 animate-pulse">
                🔴 LIVE
              </Badge>
              <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-sm">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                {stats.viewerCount}
              </Badge>
              {/* Platform egress status badges */}
              {egressStatuses.map((eg) => {
                const isActive = eg.status === 'active' || eg.status === 'starting';
                const isError = eg.status === 'failed' || eg.status === 'aborted';
                const platformLabel = eg.platform || eg.egress_id.slice(0, 8);
                return (
                  <Badge
                    key={eg.egress_id}
                    variant="secondary"
                    className={`backdrop-blur-sm text-white text-xs ${
                      isActive
                        ? 'bg-green-600/70'
                        : isError
                        ? 'bg-red-600/70'
                        : 'bg-gray-600/70'
                    }`}
                  >
                    <span className="mr-1">{isActive ? '🟢' : isError ? '🔴' : '⚪'}</span>
                    {platformLabel}
                  </Badge>
                );
              })}
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndStream}
              className="bg-red-600 hover:bg-red-700"
            >
              End Stream
            </Button>
          </div>
        </div>

        {/* Product Overlay - Bottom */}
        <ProductOverlay
          room={room}
          isHost={true}
          onProductClick={(product) => selectProduct(product)}
        />

        {/* Bottom controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Left - Reactions */}
            <div>
              <ReactionsPanel room={room} />
            </div>

            {/* Center - Main controls */}
            <div className="flex items-center gap-4">
              <Button
                variant={isMicOn ? "secondary" : "destructive"}
                size="lg"
                onClick={toggleMicrophone}
                className="rounded-full h-14 w-14 shadow-2xl"
                title={isMicOn ? "Mute" : "Unmute"}
              >
                {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </Button>

              <Button
                variant={isCameraOn ? "secondary" : "destructive"}
                size="lg"
                onClick={toggleCamera}
                className="rounded-full h-14 w-14 shadow-2xl"
                title={isCameraOn ? "Turn off camera" : "Turn on camera"}
              >
                {isCameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
            </div>

            {/* Right - spacer */}
            <div className="w-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
