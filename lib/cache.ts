interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map()
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  set<T>(key: string, data: T, ttlMs: number = this.DEFAULT_TTL): void {
    const expiresAt = Date.now() + ttlMs
    this.store.set(key, { data, expiresAt })
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }

    return entry.data as T
  }

  invalidate(key: string): void {
    this.store.delete(key)
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key)
      }
    }
  }

  clear(): void {
    this.store.clear()
  }
}

// Singleton instance
export const cache = new Cache()

// Cache key generators
export const cacheKeys = {
  products: (params?: Record<string, any>) => {
    if (!params || Object.keys(params).length === 0) {
      return 'products:all'
    }
    const queryString = new URLSearchParams(params).toString()
    return `products:${queryString}`
  },
  product: (id: string) => `product:${id}`,
  inventory: (params?: Record<string, any>) => {
    if (!params || Object.keys(params).length === 0) {
      return 'inventory:all'
    }
    const queryString = new URLSearchParams(params).toString()
    return `inventory:${queryString}`
  },
}
