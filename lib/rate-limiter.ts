/**
 * Best-effort in-memory rate limiter per spec §12.4.
 *
 * NOTE: Serverless/Edge instances do not share memory across separate executions.
 * This in-memory window limiter provides basic throttling per instance.
 * A distributed Redis store (e.g., Upstash) is scheduled for Phase-2.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  intervalMs: number; // Time window in ms (e.g., 60,000 for 1 min)
  maxRequests: number; // Max requests allowed within window
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { intervalMs: 60000, maxRequests: 20 }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Periodic cleanup if map grows too large
  if (rateLimitMap.size > 5000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || record.resetAt < now) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + options.intervalMs,
    };
    rateLimitMap.set(identifier, newRecord);
    return { allowed: true, remaining: options.maxRequests - 1, resetAt: newRecord.resetAt };
  }

  if (record.count >= options.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: options.maxRequests - record.count, resetAt: record.resetAt };
}
