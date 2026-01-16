import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
};

// Main Redis client for caching
export const redis = new Redis(redisConfig);

// Separate Redis client for Bull queue
export const queueRedis = new Redis(redisConfig);

// Cache TTL constants
export const CACHE_TTL = {
  PRODUCTS: 300, // 5 minutes
  INVENTORY: 180, // 3 minutes
  DASHBOARD: 60,  // 1 minute
  USER_SESSION: 3600 // 1 hour
};

// Cache key generators
export const getCacheKey = {
  products: (filters: any) => `products:${JSON.stringify(filters)}`,
  product: (id: string) => `product:${id}`,
  inventory: (filters: any) => `inventory:${JSON.stringify(filters)}`,
  dashboard: () => 'dashboard:stats',
  userSession: (userId: string) => `session:${userId}`
};

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export default redis;