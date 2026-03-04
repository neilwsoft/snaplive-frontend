/**
 * Types for Live Simulcast Interface
 */

export type ProductState = 'waiting' | 'active' | 'done';

export interface SimulcastProduct {
  id: string;
  name: string;
  nameKo?: string;
  nameZh?: string;
  price: number;
  currency: string;
  imageUrl: string;
  state: ProductState;
  sku?: string;
}

export interface SimulcastStats {
  orders: number;
  revenue: number;
  conversion: number;
  viewerCount: number;
  hourlyViewers: HourlyViewerData[];
  channelPerformance: ChannelStats[];
}

export interface HourlyViewerData {
  hour: string;
  viewers: number;
}

export interface ChannelStats {
  platform: 'douyin' | 'xiaohongshu' | 'taobao';
  platformName: string;
  viewers: number;
}

export interface SocialStats {
  views: number;
  likes: number;
  comments: number;
}

export interface BroadcastInfo {
  title: string;
  category: string;
  startTime: Date;
  quality: 'HD' | 'SD' | 'FHD';
}

export interface PanelWidths {
  left: number;
  right: number;
}

// API Response types
export interface LiveStatsResponse {
  session_id: string;
  orders: number;
  revenue: number;
  conversion: number;
  viewer_count: number;
  hourly_viewers: Array<{
    hour: string;
    viewers: number;
  }>;
  channel_performance: Array<{
    platform: string;
    platform_name: string;
    viewers: number;
  }>;
  social_stats: {
    views: number;
    likes: number;
    comments: number;
  };
}
