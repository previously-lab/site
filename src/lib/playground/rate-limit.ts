/**
 * Sliding-window rate limiter for the playground API.
 *
 * Module-level in-memory state — under serverless this is per-instance, a
 * known and accepted limitation for a demo endpoint (a determined abuser can
 * bypass it across instances; the preset whitelist + response cache keep the
 * real cost bounded anyway).
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Milliseconds until the oldest request in the window expires. */
  retryAfterMs: number;
}

interface WindowState {
  timestamps: number[];
}

export class SlidingWindowRateLimiter {
  private readonly windows = new Map<string, WindowState>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /** Record one request for `key` and report whether it is allowed. */
  check(key: string, now: number = Date.now()): RateLimitResult {
    let state = this.windows.get(key);
    if (!state) {
      state = { timestamps: [] };
      this.windows.set(key, state);
    }

    const cutoff = now - this.windowMs;
    state.timestamps = state.timestamps.filter((t) => t > cutoff);

    if (state.timestamps.length >= this.limit) {
      return {
        allowed: false,
        retryAfterMs: state.timestamps[0] + this.windowMs - now,
      };
    }

    state.timestamps.push(now);
    return { allowed: true, retryAfterMs: 0 };
  }

  /** Test hook — drop all tracked windows. */
  reset(): void {
    this.windows.clear();
  }
}

/** 20 requests per hour per IP, per the playground design memo. */
export const playgroundRateLimiter = new SlidingWindowRateLimiter(
  20,
  60 * 60 * 1000,
);
