// Caching utilities and types
export interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
}

export interface ModelTokenData {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export function calculateCacheHitRate(metrics: CacheMetrics): number {
  if (metrics.totalRequests === 0) return 0;
  return (metrics.hits / metrics.totalRequests) * 100;
}