"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ZegoCloudProps, ZegoUIKitPrebuilt } from "@/types/zegocloud";

// ZegoCloud Configuration
const ZEGOCLOUD_APP_ID = 879858320;
const ZEGOCLOUD_SERVER_SECRET = "b97f18eb59e536dfee265123b093c2e5";
const ZEGOCLOUD_SDK_URL = "https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js";

export function ZegoCloudLive({
  roomID,
  userID,
  userName,
  onLeave
}: ZegoCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const zegoInstanceRef = useRef<ZegoUIKitPrebuilt | null>(null);
  const initializingRef = useRef(false);
  const initializedRef = useRef(false);

  // Generate user credentials if not provided - use useRef to keep them stable
  const userCredentialsRef = useRef({
    userID: userID || `user_${Date.now()}`,
    userName: userName || `User_${Math.floor(Math.random() * 10000)}`
  });

  useEffect(() => {
    // Don't initialize until script is loaded
    if (!scriptLoaded) {
      console.log("Waiting for script to load...");
      return;
    }

    // Prevent multiple initializations
    if (initializingRef.current || initializedRef.current) {
      console.log("Already initializing or initialized, skipping...");
      return;
    }

    initializingRef.current = true;
    let mounted = true;

    const initializeZegoCloud = async () => {
      try {
        console.log("Starting ZegoCloud initialization...");
        setLoading(true);
        setError(null);

        // Wait a bit for the script to fully initialize
        await new Promise(resolve => setTimeout(resolve, 200));

        if (!mounted) {
          console.log("Component unmounted, aborting initialization");
          return;
        }

        // Check if ZegoUIKitPrebuilt is available
        console.log("Checking for ZegoUIKitPrebuilt...", typeof window.ZegoUIKitPrebuilt);
        if (typeof window.ZegoUIKitPrebuilt === "undefined") {
          throw new Error("ZegoCloud UI Kit not found. Please refresh the page.");
        }

        console.log("Generating kit token...");
        // Generate Kit Token with stable credentials
        const { userID: finalUserID, userName: finalUserName } = userCredentialsRef.current;
        const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
          ZEGOCLOUD_APP_ID,
          ZEGOCLOUD_SERVER_SECRET,
          roomID,
          finalUserID,
          finalUserName
        );

        console.log("Creating ZegoCloud instance...");
        // Create ZegoCloud instance
        const zp = window.ZegoUIKitPrebuilt.create(kitToken);
        zegoInstanceRef.current = zp;

        // Join room with configuration (matching zegoocloud.html)
        if (containerRef.current) {
          console.log("Container element found, joining room...");
          console.log("Room ID:", roomID, "User ID:", finalUserID, "User Name:", finalUserName);

          zp.joinRoom({
            container: containerRef.current,
            sharedLinks: [{
              name: 'Personal link',
              url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomID=' + roomID,
            }],
            scenario: {
              mode: window.ZegoUIKitPrebuilt.VideoConference,
            },
            turnOnMicrophoneWhenJoining: false,
            turnOnCameraWhenJoining: false,
            showMyCameraToggleButton: true,
            showMyMicrophoneToggleButton: true,
            showAudioVideoSettingsButton: true,
            showScreenSharingButton: true,
            showTextChat: true,
            showUserList: true,
            maxUsers: 50,
            layout: "Sidebar",
            showLayoutButton: true,
            showNonVideoUser: true,
            showOnlyAudioUser: true,
            showPreJoinView: false,
            onLeaveRoom: () => {
              console.log("User left the room");
              if (onLeave) {
                onLeave();
              }
            },
          });

          console.log("joinRoom called successfully");
        } else {
          console.error("Container element not found!");
          throw new Error("Video container not ready");
        }

        console.log("ZegoCloud initialization complete");
        initializedRef.current = true;
        setLoading(false);
      } catch (err) {
        initializingRef.current = false;
        if (mounted) {
          console.error("ZegoCloud initialization error:", err);
          setError(err instanceof Error ? err.message : "Failed to initialize video call");
          setLoading(false);
        }
      }
    };

    initializeZegoCloud();

    // Cleanup function
    return () => {
      mounted = false;
      console.log("Component unmounting, cleaning up...");
      // Don't reset initialization flags on unmount to prevent re-init
      if (zegoInstanceRef.current) {
        // ZegoCloud handles its own cleanup when the container is removed
        zegoInstanceRef.current = null;
      }
    };
  }, [scriptLoaded, roomID, onLeave]);

  return (
    <>
      {/* Load ZegoCloud UI Kit Script */}
      <Script
        src={ZEGOCLOUD_SDK_URL}
        strategy="afterInteractive"
        onLoad={() => {
          console.log("ZegoCloud script loaded successfully");
          setScriptLoaded(true);
        }}
        onError={(e) => {
          console.error("Failed to load ZegoCloud script:", e);
          setError("Failed to load video call library. Please check your internet connection.");
          setLoading(false);
        }}
      />

      {/* Show loading state */}
      {loading && (
        <div className="flex h-full w-full items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Loading video call...</p>
          </div>
        </div>
      )}

      {/* Show error state */}
      {error && !loading && (
        <div className="flex h-full w-full items-center justify-center bg-background">
          <div className="max-w-md text-center">
            <div className="mb-4 text-4xl">⚠️</div>
            <h2 className="mb-2 text-xl font-semibold text-destructive">
              Failed to Load Video Call
            </h2>
            <p className="text-muted-foreground">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Container for ZegoCloud UI */}
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{
          minHeight: '500px',
          display: loading || error ? 'none' : 'block'
        }}
      />
    </>
  );
}
