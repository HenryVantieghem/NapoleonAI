'use client'

import React, { Component, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, ArrowLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/luxury-button'
import { LuxuryCard } from '@/components/ui/luxury-card'
import { errorHandler, ErrorType, ErrorSeverity } from '@/lib/services/error-handler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string
  retryCount: number
}

export class ExecutiveErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorId: '',
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error through error handler
    errorHandler.handleError(error, {
      component: 'ExecutiveErrorBoundary',
      additionalData: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        errorId: this.state.errorId
      }
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        retryCount: this.state.retryCount + 1
      })
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: '',
      retryCount: 0
    })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Executive-grade error display
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8 bg-gradient-to-br from-navy/5 via-white to-gold/5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-2xl"
          >
            <LuxuryCard variant="executive" className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-6 bg-navy/10 rounded-full flex items-center justify-center"
              >
                <AlertTriangle className="w-8 h-8 text-navy" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-serif font-bold text-navy mb-3">
                  Executive System Notice
                </h2>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Napoleon AI encountered an unexpected issue while processing your request. 
                  Our executive-grade systems are designed with multiple failsafes to ensure 
                  continuous operation.
                </p>

                <div className="bg-navy/5 rounded-lg p-4 mb-6 border border-navy/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-navy" />
                    <span className="font-medium text-navy text-sm">Error ID</span>
                  </div>
                  <code className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded">
                    {this.state.errorId}
                  </code>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {this.state.retryCount < this.maxRetries && (
                    <Button
                      onClick={this.handleRetry}
                      className="bg-navy hover:bg-navy/90 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry Operation
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={this.handleReset}
                    className="border-navy text-navy hover:bg-navy/5"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Dashboard
                  </Button>
                </div>

                {this.state.retryCount >= this.maxRetries && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 p-4 bg-gold/10 rounded-lg border border-gold/20"
                  >
                    <p className="text-sm text-navy">
                      <strong>Multiple retry attempts detected.</strong> 
                      {' '}Our engineering team has been automatically notified. 
                      For immediate assistance, please contact executive support.
                    </p>
                  </motion.div>
                )}

                <div className="mt-6 text-xs text-gray-500">
                  This error has been logged for our development team to review and improve the platform.
                </div>
              </motion.div>
            </LuxuryCard>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Lightweight error fallback for smaller components
 */
export function InlineErrorFallback({ 
  error, 
  retry, 
  className = '' 
}: { 
  error?: string
  retry?: () => void
  className?: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center gap-3 p-4 bg-navy/5 rounded-lg border border-navy/10 ${className}`}
    >
      <AlertTriangle className="w-5 h-5 text-navy flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-navy font-medium mb-1">
          Something went wrong
        </p>
        <p className="text-xs text-gray-600">
          {error || 'An unexpected error occurred'}
        </p>
      </div>
      {retry && (
        <Button
          size="sm"
          variant="outline"
          onClick={retry}
          className="border-navy text-navy hover:bg-navy/5 flex-shrink-0"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      )}
    </motion.div>
  )
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ExecutiveErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ExecutiveErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}