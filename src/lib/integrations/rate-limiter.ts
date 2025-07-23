interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (identifier: string) => string
}

interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

class RateLimiter {
  private windows: Map<string, { count: number; resetTime: number }> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
    this.startCleanupTimer()
  }

  /**
   * Check if request is allowed within rate limits
   */
  isAllowed(identifier: string): RateLimitResult {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier
    const now = Date.now()
    
    // Get or create window for this identifier
    let window = this.windows.get(key)
    
    if (!window || now >= window.resetTime) {
      // Create new window
      window = {
        count: 0,
        resetTime: now + this.config.windowMs
      }
      this.windows.set(key, window)
    }

    const allowed = window.count < this.config.maxRequests
    
    if (allowed) {
      window.count++
    }

    return {
      allowed,
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - window.count),
      resetTime: window.resetTime,
      retryAfter: allowed ? undefined : Math.ceil((window.resetTime - now) / 1000)
    }
  }

  /**
   * Reset rate limit for specific identifier
   */
  reset(identifier: string): void {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier
    this.windows.delete(key)
  }

  /**
   * Get current status for identifier
   */
  getStatus(identifier: string): RateLimitResult | null {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier
    const window = this.windows.get(key)
    const now = Date.now()
    
    if (!window || now >= window.resetTime) {
      return null
    }

    return {
      allowed: window.count < this.config.maxRequests,
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - window.count),
      resetTime: window.resetTime,
      retryAfter: window.count >= this.config.maxRequests ? 
        Math.ceil((window.resetTime - now) / 1000) : undefined
    }
  }

  /**
   * Clean up expired windows
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now()
      for (const key of Array.from(this.windows.keys())) {
        const window = this.windows.get(key)
        if (!window) continue
        if (now >= window.resetTime) {
          this.windows.delete(key)
        }
      }
    }, 60000) // Clean up every minute
  }
}

// Rate limiters for different APIs
export const apiRateLimiters = {
  // Gmail API limits: 250 quota units per user per 100 seconds
  gmail: new RateLimiter({
    windowMs: 100 * 1000, // 100 seconds
    maxRequests: 250
  }),

  // Slack API limits: Tier 3 - 50+ requests per minute
  slack: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50
  }),

  // Microsoft Graph limits: 10,000 requests per 10 minutes per user
  teams: new RateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 10000
  }),

  // OpenAI API limits: 3,500 requests per minute for GPT-4
  openai: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3500
  }),

  // General API rate limiter for webhooks and internal APIs
  general: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  })
}

/**
 * Rate limiting middleware for API routes
 */
export function withRateLimit(
  rateLimiter: RateLimiter,
  identifier: (request: Request) => string = (req) => req.headers.get('x-forwarded-for') || 'anonymous'
) {
  return (handler: Function) => {
    return async (request: Request, ...args: any[]) => {
      const id = identifier(request)
      const result = rateLimiter.isAllowed(id)

      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            limit: result.limit,
            remaining: result.remaining,
            resetTime: result.resetTime,
            retryAfter: result.retryAfter
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': result.limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toString(),
              'Retry-After': result.retryAfter?.toString() || '60'
            }
          }
        )
      }

      // Add rate limit headers to successful responses
      const response = await handler(request, ...args)
      
      if (response instanceof Response) {
        response.headers.set('X-RateLimit-Limit', result.limit.toString())
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
        response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
      }

      return response
    }
  }
}

/**
 * Exponential backoff retry decorator
 */
export class RetryHandler {
  private maxRetries: number
  private baseDelay: number
  private maxDelay: number
  private backoffMultiplier: number

  constructor(options: {
    maxRetries?: number
    baseDelay?: number
    maxDelay?: number
    backoffMultiplier?: number
  } = {}) {
    this.maxRetries = options.maxRetries || 3
    this.baseDelay = options.baseDelay || 1000
    this.maxDelay = options.maxDelay || 30000
    this.backoffMultiplier = options.backoffMultiplier || 2
  }

  /**
   * Execute function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    isRetryable: (error: Error) => boolean = this.defaultRetryCondition
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === this.maxRetries || !isRetryable(lastError)) {
          throw lastError
        }

        const delay = Math.min(
          this.baseDelay * Math.pow(this.backoffMultiplier, attempt),
          this.maxDelay
        )

        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error)
        await this.sleep(delay)
      }
    }

    throw lastError!
  }

  /**
   * Default retry condition for common API errors
   */
  private defaultRetryCondition(error: Error): boolean {
    // Retry on network errors, rate limits, and server errors
    const retryableErrors = [
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'NETWORK_ERROR',
      'RATE_LIMIT_ERROR'
    ]

    const errorMessage = error.message.toLowerCase()
    
    return retryableErrors.some(err => 
      errorMessage.includes(err.toLowerCase())
    ) || this.isRetryableHttpStatus(error)
  }

  /**
   * Check if HTTP status code is retryable
   */
  private isRetryableHttpStatus(error: Error): boolean {
    const statusMatch = error.message.match(/status:?\s*(\d+)/i)
    if (!statusMatch) return false

    const status = parseInt(statusMatch[1])
    
    // Retry on rate limits, server errors, and specific client errors
    return status === 429 || // Rate limit
           status === 502 || // Bad gateway
           status === 503 || // Service unavailable
           status === 504 || // Gateway timeout
           status === 408    // Request timeout
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * API error types for better error handling
 */
export class APIError extends Error {
  public code: string
  public status?: number
  public retryable: boolean
  public platform?: string

  constructor(
    message: string,
    code: string,
    status?: number,
    retryable: boolean = false,
    platform?: string
  ) {
    super(message)
    this.name = 'APIError'
    this.code = code
    this.status = status
    this.retryable = retryable
    this.platform = platform
  }

  static isRateLimitError(error: Error): boolean {
    return error.message.toLowerCase().includes('rate limit') ||
           (error as APIError).code === 'RATE_LIMIT_ERROR' ||
           (error as APIError).status === 429
  }

  static isAuthError(error: Error): boolean {
    return error.message.toLowerCase().includes('unauthorized') ||
           error.message.toLowerCase().includes('authentication') ||
           (error as APIError).status === 401 ||
           (error as APIError).status === 403
  }

  static isNetworkError(error: Error): boolean {
    const networkErrors = ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT']
    return networkErrors.some(err => error.message.includes(err))
  }
}

/**
 * Circuit breaker for API calls
 */
export class CircuitBreaker {
  private failures: number = 0
  private lastFailureTime: number = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.recoveryTimeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new APIError(
          'Circuit breaker is OPEN',
          'CIRCUIT_BREAKER_OPEN',
          503,
          true
        )
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN'
    }
  }

  getState(): string {
    return this.state
  }

  getFailureCount(): number {
    return this.failures
  }
}

// Circuit breakers for different APIs
export const apiCircuitBreakers = {
  gmail: new CircuitBreaker(5, 60000),
  slack: new CircuitBreaker(5, 60000),
  teams: new CircuitBreaker(5, 60000),
  openai: new CircuitBreaker(3, 30000) // More sensitive for AI API
}

// Global retry handler
export const defaultRetryHandler = new RetryHandler({
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
})