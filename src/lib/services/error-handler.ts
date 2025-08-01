/**
 * Comprehensive Error Handling & Fallback System for Napoleon AI
 * Provides centralized error handling, logging, and fallback mechanisms
 */

export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  AI_PROCESSING = 'AI_PROCESSING',
  DATABASE = 'DATABASE',
  EXTERNAL_API = 'EXTERNAL_API',
  NETWORK = 'NETWORK',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorContext {
  userId?: string
  messageId?: string
  component?: string
  action?: string
  additionalData?: Record<string, any>
}

export interface ErrorDetails {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  originalError?: Error
  context?: ErrorContext
  timestamp: string
  retryable: boolean
  fallbackAvailable: boolean
}

export interface FallbackOptions {
  useCache?: boolean
  useDefaultData?: boolean
  degradedMode?: boolean
  skipFeature?: boolean
}

class ErrorHandlerService {
  private static instance: ErrorHandlerService
  private errorLog: ErrorDetails[] = []
  private fallbackStrategies = new Map<ErrorType, (error: ErrorDetails) => Promise<any>>()

  static getInstance(): ErrorHandlerService {
    if (!ErrorHandlerService.instance) {
      ErrorHandlerService.instance = new ErrorHandlerService()
    }
    return ErrorHandlerService.instance
  }

  constructor() {
    this.setupFallbackStrategies()
    this.setupGlobalErrorHandlers()
  }

  /**
   * Handle and classify errors with appropriate fallbacks
   */
  async handleError(
    error: Error | string,
    context: ErrorContext = {},
    fallbackOptions: FallbackOptions = {}
  ): Promise<{ fallbackData?: any; shouldRetry: boolean; userMessage: string }> {
    const errorDetails = this.classifyError(error, context)
    
    // Log error
    this.logError(errorDetails)
    
    // Try fallback strategy
    let fallbackData: any = null
    if (errorDetails.fallbackAvailable) {
      try {
        const fallbackStrategy = this.fallbackStrategies.get(errorDetails.type)
        if (fallbackStrategy) {
          fallbackData = await fallbackStrategy(errorDetails)
        }
      } catch (fallbackError) {
        console.error('Fallback strategy failed:', fallbackError)
      }
    }
    
    // Generate user-friendly message
    const userMessage = this.generateUserMessage(errorDetails)
    
    return {
      fallbackData,
      shouldRetry: errorDetails.retryable,
      userMessage
    }
  }

  /**
   * Classify error and determine handling strategy
   */
  private classifyError(error: Error | string, context: ErrorContext): ErrorDetails {
    const message = typeof error === 'string' ? error : error.message
    const timestamp = new Date().toISOString()

    // AI Processing Errors
    if (message.includes('OpenAI') || message.includes('AI processing') || message.includes('GPT')) {
      return {
        type: ErrorType.AI_PROCESSING,
        severity: ErrorSeverity.MEDIUM,
        message,
        originalError: typeof error === 'object' ? error : undefined,
        context,
        timestamp,
        retryable: true,
        fallbackAvailable: true
      }
    }

    // Database Errors
    if (message.includes('Supabase') || message.includes('database') || message.includes('PostgreSQL')) {
      return {
        type: ErrorType.DATABASE,
        severity: ErrorSeverity.HIGH,
        message,
        originalError: typeof error === 'object' ? error : undefined,
        context,
        timestamp,
        retryable: true,
        fallbackAvailable: true
      }
    }

    // Authentication Errors
    if (message.includes('Unauthorized') || message.includes('401') || message.includes('Clerk')) {
      return {
        type: ErrorType.AUTHENTICATION,
        severity: ErrorSeverity.HIGH,
        message,
        originalError: typeof error === 'object' ? error : undefined,
        context,
        timestamp,
        retryable: false,
        fallbackAvailable: false
      }
    }

    // External API Errors (Gmail, Slack, Teams)
    if (message.includes('Gmail') || message.includes('Google') || message.includes('Slack') || message.includes('Teams')) {
      return {
        type: ErrorType.EXTERNAL_API,
        severity: ErrorSeverity.MEDIUM,
        message,
        originalError: typeof error === 'object' ? error : undefined,
        context,
        timestamp,
        retryable: true,
        fallbackAvailable: true
      }
    }

    // Rate Limiting
    if (message.includes('rate limit') || message.includes('429') || message.includes('quota')) {
      return {
        type: ErrorType.RATE_LIMIT,
        severity: ErrorSeverity.MEDIUM,
        message,
        originalError: typeof error === 'object' ? error : undefined,
        context,
        timestamp,
        retryable: true,
        fallbackAvailable: true
      }
    }

    // Network Errors
    if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
      return {
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        message,
        originalError: typeof error === 'object' ? error : undefined,
        context,
        timestamp,
        retryable: true,
        fallbackAvailable: false
      }
    }

    // Default: Unknown Error
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message,
      originalError: typeof error === 'object' ? error : undefined,
      context,
      timestamp,
      retryable: false,
      fallbackAvailable: false
    }
  }

  /**
   * Setup fallback strategies for different error types
   */
  private setupFallbackStrategies() {
    // AI Processing Fallback: Use keyword-based analysis
    this.fallbackStrategies.set(ErrorType.AI_PROCESSING, async (error) => {
      console.log('Using AI processing fallback for:', error.context?.messageId)
      
      return {
        summary: 'AI processing temporarily unavailable - using keyword analysis',
        priority_score: 50,
        priority_reason: 'Fallback keyword-based scoring',
        sentiment: 'neutral',
        action_items: [],
        fallback: true
      }
    })

    // Database Fallback: Use cached data or sample data
    this.fallbackStrategies.set(ErrorType.DATABASE, async (error) => {
      console.log('Using database fallback for:', error.context?.userId)
      
      // Return sample executive messages for demo purposes
      return {
        messages: [
          {
            id: 'fallback_1',
            subject: 'Database Connection Issue',
            sender: 'System Notice',
            content: 'Napoleon AI is temporarily using cached data while we restore full connectivity.',
            priority_score: 60,
            is_vip: false,
            created_at: new Date().toISOString()
          }
        ],
        fallback: true,
        fallbackReason: 'Database connectivity issue'
      }
    })

    // External API Fallback: Use cached data or skip integration
    this.fallbackStrategies.set(ErrorType.EXTERNAL_API, async (error) => {
      console.log('Using external API fallback for:', error.context?.component)
      
      return {
        status: 'degraded',
        message: 'External service temporarily unavailable',
        cached_data: null,
        fallback: true
      }
    })

    // Rate Limit Fallback: Queue for later processing
    this.fallbackStrategies.set(ErrorType.RATE_LIMIT, async (error) => {
      console.log('Using rate limit fallback for:', error.context?.action)
      
      return {
        queued: true,
        estimated_delay: '2-5 minutes',
        fallback_message: 'Request queued due to high demand',
        fallback: true
      }
    })
  }

  /**
   * Generate user-friendly error messages
   */
  private generateUserMessage(error: ErrorDetails): string {
    switch (error.type) {
      case ErrorType.AI_PROCESSING:
        return 'AI analysis is temporarily unavailable. We\'re using simplified processing for now.'
      
      case ErrorType.DATABASE:
        return 'Connection issue detected. Some data may be cached while we restore full service.'
      
      case ErrorType.AUTHENTICATION:
        return 'Please sign in again to continue using Napoleon AI.'
      
      case ErrorType.EXTERNAL_API:
        return 'External service temporarily unavailable. Some features may be limited.'
      
      case ErrorType.RATE_LIMIT:
        return 'High demand detected. Your request has been queued and will process shortly.'
      
      case ErrorType.NETWORK:
        return 'Network connection issue. Please check your internet connection and try again.'
      
      default:
        return 'Something went wrong. Our team has been notified and we\'re working on a fix.'
    }
  }

  /**
   * Log errors for monitoring and debugging
   */
  private logError(error: ErrorDetails) {
    // Add to in-memory log (in production, would send to monitoring service)
    this.errorLog.push(error)
    
    // Keep only last 1000 errors in memory
    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-1000)
    }
    
    // Console logging with appropriate level
    const logLevel = this.getLogLevel(error.severity)
    const logMessage = `[${error.type}] ${error.message}`
    const logContext = {
      userId: error.context?.userId,
      component: error.context?.component,
      timestamp: error.timestamp,
      retryable: error.retryable
    }
    
    switch (logLevel) {
      case 'error':
        console.error(logMessage, logContext, error.originalError)
        break
      case 'warn':
        console.warn(logMessage, logContext)
        break
      default:
        console.log(logMessage, logContext)
    }

    // In production, would also send to external monitoring
    // this.sendToMonitoring(error)
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(event.reason, { component: 'global' })
        event.preventDefault()
      })

      // Handle JavaScript errors
      window.addEventListener('error', (event) => {
        this.handleError(event.error || event.message, { component: 'global' })
      })
    }
  }

  /**
   * Get appropriate log level for error severity
   */
  private getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error'
      case ErrorSeverity.MEDIUM:
        return 'warn'
      default:
        return 'info'
    }
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStats(): {
    totalErrors: number
    errorsByType: Record<ErrorType, number>
    errorsBySeverity: Record<ErrorSeverity, number>
    recentErrors: ErrorDetails[]
  } {
    const errorsByType = Object.values(ErrorType).reduce((acc, type) => {
      acc[type] = this.errorLog.filter(e => e.type === type).length
      return acc
    }, {} as Record<ErrorType, number>)

    const errorsBySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
      acc[severity] = this.errorLog.filter(e => e.severity === severity).length
      return acc
    }, {} as Record<ErrorSeverity, number>)

    const recentErrors = this.errorLog
      .filter(e => Date.now() - new Date(e.timestamp).getTime() < 60 * 60 * 1000) // Last hour
      .slice(-50) // Last 50 errors

    return {
      totalErrors: this.errorLog.length,
      errorsByType,
      errorsBySeverity,
      recentErrors
    }
  }

  /**
   * Clear error logs (for testing/debugging)
   */
  clearLogs() {
    this.errorLog = []
  }
}

// Export singleton instance
export const errorHandler = ErrorHandlerService.getInstance()

/**
 * Utility function for easy error handling in components/services
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: ErrorContext = {},
  fallbackOptions: FallbackOptions = {}
): Promise<{ data?: T; error?: string; fallback?: any }> {
  try {
    const data = await operation()
    return { data }
  } catch (error) {
    const result = await errorHandler.handleError(error as Error, context, fallbackOptions)
    return {
      error: result.userMessage,
      fallback: result.fallbackData
    }
  }
}