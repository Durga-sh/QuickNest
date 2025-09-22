// Performance monitoring utility for tracking API
const trackingApiService = {
  // Cache for frequently accessed data
  cache: new Map(),
  CACHE_TTL: 30000, // 30 seconds

  // Performance monitoring
  metrics: {
    apiCalls: 0,
    cacheHits: 0,
    averageResponseTime: 0,
  },

  // Cached API wrapper
  async cachedApiCall(key, apiFunction, ttl = this.CACHE_TTL) {
    const now = Date.now();
    const cached = this.cache.get(key);

    // Return cached data if still valid
    if (cached && now - cached.timestamp < ttl) {
      this.metrics.cacheHits++;
      return cached.data;
    }

    // Make API call and cache result
    const startTime = now;
    try {
      const result = await apiFunction();
      const endTime = Date.now();

      // Update metrics
      this.metrics.apiCalls++;
      this.metrics.averageResponseTime =
        (this.metrics.averageResponseTime + (endTime - startTime)) / 2;

      // Cache the result
      this.cache.set(key, {
        data: result,
        timestamp: now,
      });

      // Cleanup old cache entries
      this.cleanupCache();

      return result;
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  },

  // Cleanup old cache entries
  cleanupCache() {
    if (this.cache.size > 50) {
      // Limit cache size
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.CACHE_TTL * 2) {
          this.cache.delete(key);
        }
      }
    }
  },

  // Get performance metrics
  getMetrics() {
    const cacheHitRate =
      (this.metrics.cacheHits /
        (this.metrics.apiCalls + this.metrics.cacheHits)) *
      100;

    return {
      ...this.metrics,
      cacheHitRate: cacheHitRate.toFixed(2) + "%",
      cacheSize: this.cache.size,
    };
  },

  // Clear cache
  clearCache() {
    this.cache.clear();
  },
};

export default trackingApiService;
