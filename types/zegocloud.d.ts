/**
 * TypeScript declarations for ZegoCloud UIKit Prebuilt
 * Based on ZegoCloud UIKit documentation
 */

declare global {
  interface Window {
    ZegoUIKitPrebuilt: typeof ZegoUIKitPrebuilt;
  }
}

export interface ZegoCloudScenario {
  mode?: unknown;
  config?: Partial<ZegoCloudConfig>;
}

export interface ZegoSharedLink {
  name: string;
  url: string;
}

export interface ZegoCloudConfig {
  container?: HTMLElement;
  sharedLinks?: ZegoSharedLink[];
  scenario?: {
    mode?: unknown;
    config?: Partial<ZegoCloudConfig>;
  };
  turnOnMicrophoneWhenJoining?: boolean;
  turnOnCameraWhenJoining?: boolean;
  showMyCameraToggleButton?: boolean;
  showMyMicrophoneToggleButton?: boolean;
  showAudioVideoSettingsButton?: boolean;
  showScreenSharingButton?: boolean;
  showTextChat?: boolean;
  showUserList?: boolean;
  maxUsers?: number;
  layout?: 'Auto' | 'Sidebar' | 'Grid';
  showLayoutButton?: boolean;
  showNonVideoUser?: boolean;
  showOnlyAudioUser?: boolean;
  videoResolutionDefault?: string;
  showPreJoinView?: boolean;
  onLeaveRoom?: () => void;
}

export interface ZegoCloudUser {
  userID: string;
  userName: string;
}

export class ZegoUIKitPrebuilt {
  constructor(
    appID: number,
    serverSecret: string,
    kitToken: string,
    userID: string,
    userName: string,
    config?: Partial<ZegoCloudConfig>
  );

  static generateKitTokenForTest(
    appID: number,
    serverSecret: string,
    roomID: string,
    userID: string,
    userName: string
  ): string;

  static create(kitToken: string): ZegoUIKitPrebuilt;

  joinRoom(config?: Partial<ZegoCloudConfig>): void;

  static VideoConference: ZegoCloudScenario;
  static OneONoneCall: ZegoCloudScenario;
  static GroupCall: ZegoCloudScenario;
  static LiveStreaming: ZegoCloudScenario;
}

export interface ZegoCloudProps {
  roomID: string;
  userID?: string;
  userName?: string;
  onLeave?: () => void;
}

export {};
