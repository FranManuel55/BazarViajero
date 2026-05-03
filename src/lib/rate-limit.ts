/**
 * Simple in-memory sliding-window rate limiter.
 *
 * NOTE: state is per-process, so on serverless platforms (Vercel)
 * each warm instance keeps its own counter — this is best-effort,
 * not a hard guarantee. For a low-traffic admin login it is plenty;
 * swap for Upstash Redis if you ever expose more attack surface.
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetInSeconds: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;

  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    const resetInSeconds = Math.max(
      0,
      Math.ceil((oldest + windowMs - now) / 1000)
    );
    buckets.set(key, bucket);
    return { success: false, remaining: 0, resetInSeconds };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return {
    success: true,
    remaining: limit - bucket.hits.length,
    resetInSeconds: windowSeconds,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}
