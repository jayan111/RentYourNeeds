import { Request, Response, NextFunction } from 'express';
import { redis, getCacheKey, CACHE_TTL } from '../config/redis';

export const cacheMiddleware = (ttl: number, keyGenerator: (req: Request) => string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cacheKey = keyGenerator(req);
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = function(data: any) {
        // Cache the response
        redis.setex(cacheKey, ttl, JSON.stringify(data)).catch(console.error);
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Specific cache middlewares
export const cacheProducts = cacheMiddleware(
  CACHE_TTL.PRODUCTS,
  (req) => getCacheKey.products(req.query)
);

export const cacheProduct = cacheMiddleware(
  CACHE_TTL.PRODUCTS,
  (req) => getCacheKey.product(req.params.id)
);

export const cacheInventory = cacheMiddleware(
  CACHE_TTL.INVENTORY,
  (req) => getCacheKey.inventory(req.query)
);

export const cacheDashboard = cacheMiddleware(
  CACHE_TTL.DASHBOARD,
  () => getCacheKey.dashboard()
);

// Cache invalidation helpers
export const invalidateCache = {
  products: async () => {
    const keys = await redis.keys('products:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
  
  product: async (id: string) => {
    await redis.del(getCacheKey.product(id));
    await invalidateCache.products();
  },
  
  inventory: async () => {
    const keys = await redis.keys('inventory:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
  
  dashboard: async () => {
    await redis.del(getCacheKey.dashboard());
  }
};