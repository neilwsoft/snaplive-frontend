export type Platform = "douyin" | "xiaohongshu" | "taobao" | "custom" | "snaplive";

export interface DateTimeRange {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

export interface PlatformSelection {
  douyin: boolean;
  xiaohongshu: boolean;
  taobao: boolean;
}

export type ReportTopic =
  | "connectivity_reliability"
  | "avg_latency"
  | "stream_quality"
  | "viewer_engagement"
  | "revenue_analytics"
  | "technical_errors";

export interface ReportFilters {
  dateTimeRange: DateTimeRange;
  platforms: PlatformSelection;
  topics: ReportTopic[];
}

export interface ConnectivityStats {
  platform: Platform;
  rate: number; // Percentage 0-100
  successfulTime: number; // in hours
  scheduledTime: number; // in hours
}

export interface LatencyDataPoint {
  timestamp: string; // ISO 8601 format
  latency: number; // in milliseconds
}

export interface LatencyStats {
  platform: Platform;
  averageLatency: number; // in milliseconds
  dataPoints: LatencyDataPoint[];
}

export interface PlatformStatus {
  platform: Platform;
  isConnected: boolean;
  lastUpdated: string;
}

export interface StatisticsReport {
  generatedAt: string;
  filters: ReportFilters;
  connectivityStats: ConnectivityStats[];
  latencyStats: LatencyStats[];
}
