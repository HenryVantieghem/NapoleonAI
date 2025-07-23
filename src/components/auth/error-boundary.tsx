"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw, Home, Mail, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleContactSupport = () => {
    const errorDetails = {
      message: this.state.error?.message || 'Unknown error',
      stack: this.state.error?.stack || '',
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }

    const emailBody = `
Hello Napoleon AI Support,

I encountered an error while using the application. Please see the details below:

Error: ${errorDetails.message}
URL: ${errorDetails.url}
Time: ${errorDetails.timestamp}
Browser: ${errorDetails.userAgent}

Stack Trace:
${errorDetails.stack}

Thank you for your assistance.
    `.trim()

    const mailtoUrl = `mailto:support@napoleonai.com?subject=Authentication Error Report&body=${encodeURIComponent(emailBody)}`
    window.open(mailtoUrl)
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full"
          >
            {/* Error Card */}
            <div className="card-luxury p-8 text-center">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
                className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </motion.div>

              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Something went wrong
              </h2>

              <p className="text-gray-600 mb-6">
                We encountered an unexpected error with the authentication system. 
                Our team has been notified and is working to resolve this issue.
              </p>

              {/* Error details (development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="bg-gray-100 p-3 rounded-lg text-xs font-mono overflow-auto max-h-32">
                    <div className="text-red-600 font-semibold mb-1">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    <pre className="text-gray-700 whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={this.handleReset}
                  variant="luxury"
                  size="lg"
                  className="w-full group"
                >
                  <RefreshCw className="w-5 h-5 mr-3 group-hover:animate-spin" />
                  <span>Try Again</span>
                </Button>

                <Button
                  onClick={this.handleReload}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  <RefreshCw className="w-5 h-5 mr-3" />
                  <span>Reload Page</span>
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="ghost"
                  size="lg"
                  className="w-full"
                >
                  <Home className="w-5 h-5 mr-3" />
                  <span>Go Home</span>
                </Button>
              </div>
            </div>

            {/* Support Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center"
            >
              <div className="inline-flex items-center bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
                <Crown className="w-4 h-4 text-burgundy-600 mr-2" />
                <span className="text-sm text-gray-600">
                  Executive Support:{" "}
                  <button 
                    onClick={this.handleContactSupport}
                    className="text-burgundy-600 hover:text-burgundy-700 font-medium"
                  >
                    Contact us
                  </button>
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional error boundary for hooks
export function FunctionalErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <AuthErrorBoundary 
      fallback={fallback}
      onError={(error, errorInfo) => {
        console.error('Functional Error Boundary:', error, errorInfo)
      }}
    >
      {children}
    </AuthErrorBoundary>
  )
}

// Network error boundary
export function NetworkErrorBoundary({ 
  children,
  onRetry
}: { 
  children: React.ReactNode
  onRetry?: () => void 
}) {
  return (
    <AuthErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-luxury p-4">
          <div className="text-center max-w-md">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </motion.div>
            
            <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">
              Connection Lost
            </h2>
            
            <p className="text-gray-600 mb-6">
              Unable to connect to Napoleon AI servers. Please check your internet connection.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={onRetry || (() => window.location.reload())} 
                variant="luxury" 
                size="lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                <span>Try Again</span>
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="ghost" 
                size="lg"
              >
                <Home className="w-5 h-5 mr-2" />
                <span>Go Home</span>
              </Button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </AuthErrorBoundary>
  )
}

// Loading error boundary
export function LoadingErrorBoundary({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <AuthErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-64 p-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading Error
            </h3>
            <p className="text-gray-600 mb-4">
              Failed to load this component
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="secondary"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </AuthErrorBoundary>
  )
}