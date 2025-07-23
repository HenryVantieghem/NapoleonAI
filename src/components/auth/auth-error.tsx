"use client"

import { motion } from "framer-motion"
import { AlertCircle, RefreshCw, ArrowLeft, Crown, Shield, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type AuthError } from "@/lib/auth/auth-service"
import { cn } from "@/lib/utils"

interface AuthErrorProps {
  error: AuthError
  onRetry?: () => void
  onBack?: () => void
  className?: string
}

const errorConfig = {
  email_not_confirmed: {
    title: "Email Verification Required",
    description: "Please check your email and click the confirmation link to access your executive account.",
    severity: "warning" as const,
    showRetry: false,
    actionText: "Resend verification email"
  },
  invalid_credentials: {
    title: "Invalid Credentials",
    description: "The email or password you entered is incorrect. Please verify your credentials and try again.",
    severity: "error" as const,
    showRetry: true,
    actionText: "Try again"
  },
  rate_limit_exceeded: {
    title: "Too Many Attempts",
    description: "You've made too many login attempts. Please wait a few minutes before trying again.",
    severity: "warning" as const,
    showRetry: false,
    actionText: "Wait and retry"
  },
  access_denied: {
    title: "Access Denied",
    description: "Access was denied during authentication. Please ensure you grant the necessary permissions for Gmail, Outlook, or Slack integration.",
    severity: "error" as const,
    showRetry: true,
    actionText: "Grant permissions"
  },
  oauth_error: {
    title: "Authentication Failed",
    description: "There was an issue connecting to your account. This may be a temporary problem with the service provider.",
    severity: "error" as const,
    showRetry: true,
    actionText: "Try again"
  },
  biometric_error: {
    title: "Biometric Setup Failed",
    description: "Unable to set up biometric authentication on this device. You can still use traditional login methods.",
    severity: "warning" as const,
    showRetry: true,
    actionText: "Try again"
  },
  biometric_auth_failed: {
    title: "Biometric Authentication Failed",
    description: "Face ID or Touch ID authentication failed. Please try again or use your password.",
    severity: "error" as const,
    showRetry: true,
    actionText: "Retry biometric"
  },
  network_error: {
    title: "Connection Issue",
    description: "Unable to connect to our servers. Please check your internet connection and try again.",
    severity: "error" as const,
    showRetry: true,
    actionText: "Check connection"
  },
  executive_access_required: {
    title: "Executive Access Required",
    description: "Napoleon AI is exclusively designed for C-suite executives. Please ensure your role is correctly specified.",
    severity: "warning" as const,
    showRetry: false,
    actionText: "Update profile"
  },
  subscription_required: {
    title: "Subscription Required",
    description: "Your trial has expired. Please upgrade to continue accessing your executive communication command center.",
    severity: "info" as const,
    showRetry: false,
    actionText: "Upgrade now"
  },
  unknown_error: {
    title: "Something went wrong",
    description: "An unexpected error occurred. Our team has been notified and is working to resolve this issue.",
    severity: "error" as const,
    showRetry: true,
    actionText: "Try again"
  }
}

export function AuthError({ error, onRetry, onBack, className }: AuthErrorProps) {
  const config = errorConfig[error.code as keyof typeof errorConfig] || errorConfig.unknown_error
  
  const severityStyles = {
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800", 
    info: "bg-blue-50 border-blue-200 text-blue-800"
  }

  const iconStyles = {
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("w-full max-w-md mx-auto", className)}
    >
      {/* Error Card */}
      <div className="card-luxury p-6 mb-6 border-l-4 border-l-red-500">
        <div className="flex items-start">
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4",
            severityStyles[config.severity]
          )}>
            <AlertCircle className={cn("w-5 h-5", iconStyles[config.severity])} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {config.title}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              {config.description}
            </p>
            
            {/* Error Details (for development) */}
            {process.env.NODE_ENV === 'development' && error.details && (
              <details className="mt-3">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Technical details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto text-gray-700">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>

        {/* Provider-specific messaging */}
        {error.provider && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center text-sm text-gray-700">
              <Info className="w-4 h-4 mr-2 text-gray-500" />
              <span>
                Issue connecting to {error.provider}. Please ensure you have the necessary permissions.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {config.showRetry && onRetry && (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onRetry}
              variant="luxury"
              size="lg"
              className="w-full group"
            >
              <RefreshCw className="w-5 h-5 mr-3 group-hover:animate-spin" />
              <span>{config.actionText}</span>
            </Button>
          </motion.div>
        )}

        {/* Special actions for specific error types */}
        {error.code === 'subscription_required' && (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => window.open('/pricing', '_blank')}
              variant="luxury"
              size="lg"
              className="w-full group"
            >
              <Crown className="w-5 h-5 mr-3 group-hover:animate-pulse" />
              <span>Upgrade to Premium</span>
            </Button>
          </motion.div>
        )}

        {error.code === 'email_not_confirmed' && (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => {
                // In real app, trigger resend verification email
                console.log('Resending verification email...')
              }}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              <span>Resend Verification Email</span>
            </Button>
          </motion.div>
        )}

        {onBack && (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onBack}
              variant="ghost"
              size="lg"
              className="w-full"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              <span>Back to Login</span>
            </Button>
          </motion.div>
        )}
      </div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <div className="inline-flex items-center bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
          <Shield className="w-4 h-4 text-burgundy-600 mr-2" />
          <span className="text-sm text-gray-600">
            Need help? Contact our{" "}
            <button 
              className="text-burgundy-600 hover:text-burgundy-700 font-medium"
              onClick={() => window.open('mailto:support@napoleonai.com')}
            >
              executive support team
            </button>
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Inline error component for forms
export function InlineAuthError({ error, className }: { error: AuthError; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={cn("flex items-center p-3 bg-red-50 border border-red-200 rounded-lg", className)}
    >
      <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
      <span className="text-sm text-red-700">{error.message}</span>
    </motion.div>
  )
}

// Network error boundary component
export function NetworkErrorBoundary({ children, onRetry }: { 
  children: React.ReactNode
  onRetry?: () => void 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-luxury p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">
          Connection Lost
        </h2>
        
        <p className="text-gray-600 mb-6">
          Unable to connect to Napoleon AI servers. Please check your internet connection.
        </p>
        
        {onRetry && (
          <Button onClick={onRetry} variant="luxury" size="lg">
            <RefreshCw className="w-5 h-5 mr-2" />
            <span>Try Again</span>
          </Button>
        )}
      </div>
    </div>
  )
}