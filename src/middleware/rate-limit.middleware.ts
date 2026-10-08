import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export interface RateLimitConfig {
  windowMs?: number;
  max?: number;     
  message?: string; 
  skipSuccessfulRequests?: boolean;
}


export const createRateLimiter = (config: RateLimitConfig = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    max = 100,                  // 100 requests default
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
  } = config;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,   
    skipSuccessfulRequests,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message,
      });
    },
  });
};

/**
 * General rate limiter for standard public endpoints across the API
 * Allows 100 requests per 15 minutes
 */
export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

/**
 * Strict rate limiter for authentication endpoints (Login, Register)
 * Prevents brute-force credential stuffing and registration spam (10 requests per 15 minutes)
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please try again after 15 minutes',
});

/**
 * Strict rate limiter for sensitive transactional operations (Order creation)
 * Prevents automated checkout abuse and inventory holding (15 orders per 15 minutes)
 */
export const orderLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many checkout attempts. Please wait before placing another order',
});
