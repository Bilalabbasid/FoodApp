/**
 * Simple in-memory cache to replace Redis functionality
 * This is a basic implementation for development purposes
 */

interface CacheItem {
  value: any;
  expiry?: number;
}

class MemoryCache {
  private cache: Map<string, CacheItem> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired items every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Set a value in cache with optional expiry
   * @param key Cache key
   * @param value Value to cache
   * @param ttlSeconds Time to live in seconds (optional)
   */
  set(key: string, value: any, ttlSeconds?: number): void {
    const item: CacheItem = {
      value,
      expiry: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : undefined
    };
    this.cache.set(key, item);
  }

  /**
   * Get a value from cache
   * @param key Cache key
   * @returns The cached value or null if not found/expired
   */
  get(key: string): any {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Delete a value from cache
   * @param key Cache key
   */
  del(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Check if key exists in cache
   * @param key Cache key
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if expired
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get all keys matching a pattern
   * @param pattern Simple pattern with * wildcard
   */
  keys(pattern: string): string[] {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  stats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && now > item.expiry) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && now > item.expiry) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }

  /**
   * Destroy the cache and cleanup intervals
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Create a singleton instance
export const memoryCache = new MemoryCache();

// Session management helpers
export class SessionManager {
  private static SESSION_PREFIX = 'session:';
  private static USER_SESSION_PREFIX = 'user_sessions:';
  
  /**
   * Store session data
   */
  static setSession(sessionId: string, data: any, ttlSeconds: number = 24 * 60 * 60): void {
    memoryCache.set(this.SESSION_PREFIX + sessionId, data, ttlSeconds);
  }

  /**
   * Get session data
   */
  static getSession(sessionId: string): any {
    return memoryCache.get(this.SESSION_PREFIX + sessionId);
  }

  /**
   * Delete session
   */
  static deleteSession(sessionId: string): boolean {
    return memoryCache.del(this.SESSION_PREFIX + sessionId);
  }

  /**
   * Store user session mapping
   */
  static setUserSession(userId: string, sessionId: string, ttlSeconds: number = 24 * 60 * 60): void {
    const existingSessions = this.getUserSessions(userId) || [];
    if (!existingSessions.includes(sessionId)) {
      existingSessions.push(sessionId);
    }
    memoryCache.set(this.USER_SESSION_PREFIX + userId, existingSessions, ttlSeconds);
  }

  /**
   * Get all sessions for a user
   */
  static getUserSessions(userId: string): string[] | null {
    return memoryCache.get(this.USER_SESSION_PREFIX + userId);
  }

  /**
   * Remove user session mapping
   */
  static removeUserSession(userId: string, sessionId: string): void {
    const sessions = this.getUserSessions(userId);
    if (sessions) {
      const updatedSessions = sessions.filter(id => id !== sessionId);
      if (updatedSessions.length > 0) {
        memoryCache.set(this.USER_SESSION_PREFIX + userId, updatedSessions);
      } else {
        memoryCache.del(this.USER_SESSION_PREFIX + userId);
      }
    }
  }

  /**
   * Clear all sessions for a user
   */
  static clearUserSessions(userId: string): void {
    const sessions = this.getUserSessions(userId);
    if (sessions) {
      sessions.forEach(sessionId => this.deleteSession(sessionId));
      memoryCache.del(this.USER_SESSION_PREFIX + userId);
    }
  }
}

// Rate limiting helpers
export class RateLimiter {
  private static RATE_LIMIT_PREFIX = 'rate_limit:';

  /**
   * Check and increment rate limit counter
   */
  static checkLimit(key: string, maxRequests: number, windowSeconds: number): boolean {
    const fullKey = this.RATE_LIMIT_PREFIX + key;
    const current = memoryCache.get(fullKey) || 0;
    
    if (current >= maxRequests) {
      return false; // Rate limit exceeded
    }

    memoryCache.set(fullKey, current + 1, windowSeconds);
    return true; // Request allowed
  }

  /**
   * Get current usage for a key
   */
  static getUsage(key: string): number {
    return memoryCache.get(this.RATE_LIMIT_PREFIX + key) || 0;
  }

  /**
   * Reset rate limit for a key
   */
  static reset(key: string): void {
    memoryCache.del(this.RATE_LIMIT_PREFIX + key);
  }
}

export default memoryCache;
