import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';

// Enhanced rate limiting with Redis store
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.call(...args),
    }),
    windowMs,
    max,
    message: message || 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints
export const rateLimits = {
  // General API rate limit
  general: createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  
  // Strict rate limit for auth endpoints
  auth: createRateLimit(15 * 60 * 1000, 10), // 10 requests per 15 minutes
  
  // More lenient for product browsing
  products: createRateLimit(1 * 60 * 1000, 50), // 50 requests per minute
  
  // Admin endpoints
  admin: createRateLimit(5 * 60 * 1000, 30), // 30 requests per 5 minutes
  
  // Search endpoints
  search: createRateLimit(1 * 60 * 1000, 20), // 20 requests per minute
};