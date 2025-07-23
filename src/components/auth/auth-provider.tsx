"use client"

import { useState, useEffect } from "react"
import { useAuth, useUser } from '@clerk/nextjs'
import { AuthLoading } from "./auth-loading"
import { AuthError } from "./auth-error"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
// Removed complex user profile service for MVP

interface AuthWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireExecutive?: boolean
  fallbackPath?: string
}

// Auth guard component using Clerk
export function AuthWrapper({ 
  children, 
  requireAuth = false, 
  requireExecutive = false,
  fallbackPath = "/auth/login"
}: AuthWrapperProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user: clerkUser } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isExecutive, setIsExecutive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user profile and executive status
  useEffect(() => {
    async function loadUserData() {
      if (!isLoaded || !isSignedIn || !clerkUser) {
        setIsLoading(false)
        return
      }

      try {
        // Simplified profile management for MVP
        const profile = {
          user_id: clerkUser.id,
          preferences: {},
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        setUserProfile(profile)
        
        // Check executive status from Clerk metadata
        const role = String(clerkUser.publicMetadata?.role || 'executive')
        const executiveRoles = ['CEO', 'COO', 'CFO', 'CTO', 'CMO', 'CHRO', 'President', 'VP', 'Director', 'Executive', 'Founder', 'Partner']
        const isExec = executiveRoles.some(execRole => 
          role.toLowerCase().includes(execRole.toLowerCase())
        )
        setIsExecutive(isExec)
      } catch (err) {
        console.error('Error loading user data:', err)
        setError('Failed to load user profile')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [isLoaded, isSignedIn, clerkUser])

  // Handle redirects
  useEffect(() => {
    if (!isLoaded || isLoading) return

    // Handle authentication requirement
    if (requireAuth && !isSignedIn) {
      const currentPath = window.location.pathname
      const redirectUrl = new URL(fallbackPath, window.location.origin)
      redirectUrl.searchParams.set('redirectTo', currentPath)
      redirectUrl.searchParams.set('message', 'Please sign in to continue')
      router.push(redirectUrl.toString())
      return
    }

    // Handle executive requirement
    if (requireExecutive && isSignedIn && !isExecutive) {
      router.push('/auth/executive-required')
      return
    }

    // Handle onboarding requirement
    if (isSignedIn && userProfile && !userProfile.onboarding_completed) {
      const currentPath = window.location.pathname
      if (!currentPath.startsWith('/onboarding')) {
        router.push('/onboarding/welcome')
        return
      }
    }
  }, [
    isLoaded,
    isLoading,
    isSignedIn, 
    isExecutive, 
    requireAuth, 
    requireExecutive, 
    router, 
    fallbackPath,
    userProfile
  ])

  // Loading state
  if (!isLoaded || isLoading) {
    return <AuthLoading />
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
        <AuthError
          error={{ message: error, code: 'profile_error' }}
          onRetry={() => {
            setError(null)
            window.location.reload()
          }}
          onBack={() => router.push('/')}
        />
      </div>
    )
  }

  // Auth requirements not met (will redirect)
  if (requireAuth && !isSignedIn) {
    return <AuthLoading message="Redirecting to sign in..." />
  }

  if (requireExecutive && isSignedIn && !isExecutive) {
    return <AuthLoading message="Verifying executive access..." />
  }

  // All good, render children
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="auth-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Enhanced user experience component for executives
export function ExecutiveWelcomePrompt() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (
      isSignedIn && 
      user &&
      typeof window !== 'undefined' &&
      !localStorage.getItem('napoleon_welcome_shown')
    ) {
      // Show welcome after a delay
      const timer = setTimeout(() => setShowWelcome(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [isSignedIn, user])

  const handleDismiss = () => {
    localStorage.setItem('napoleon_welcome_shown', 'true')
    setShowWelcome(false)
  }

  if (!showWelcome) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-luxury border border-burgundy-100 p-6 max-w-sm"
    >
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-burgundy-500 to-burgundy-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            👑
          </motion.div>
        </div>
        
        <h4 className="font-serif font-semibold text-gray-900 mb-2">
          Welcome to Your Command Center
        </h4>
        
        <p className="text-sm text-gray-600 mb-4">
          Transform communication chaos into strategic clarity with AI-powered intelligence.
        </p>

        <button
          onClick={handleDismiss}
          className="w-full bg-gradient-to-r from-burgundy-600 to-burgundy-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-burgundy transition-all"
        >
          Take Command
        </button>
      </div>
    </motion.div>
  )
}

// Session timeout warning component
export function SessionTimeoutWarning() {
  const { isSignedIn } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(300) // 5 minutes
  
  useEffect(() => {
    if (!isSignedIn) return

    let warningTimer: NodeJS.Timeout
    let countdownTimer: NodeJS.Timeout

    // Show warning 5 minutes before session expires (Clerk default is 1 hour)
    const resetWarningTimer = () => {
      clearTimeout(warningTimer)
      clearTimeout(countdownTimer)
      
      warningTimer = setTimeout(() => {
        setShowWarning(true)
        setSecondsLeft(300)
        
        // Start countdown
        countdownTimer = setInterval(() => {
          setSecondsLeft(prev => {
            if (prev <= 1) {
              setShowWarning(false)
              return 300
            }
            return prev - 1
          })
        }, 1000)
      }, 55 * 60 * 1000) // 55 minutes
    }

    // Reset timer on user activity
    const resetOnActivity = () => {
      if (showWarning) {
        setShowWarning(false)
      }
      resetWarningTimer()
    }

    // Listen for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, resetOnActivity)
    })

    resetWarningTimer()

    return () => {
      clearTimeout(warningTimer)
      clearTimeout(countdownTimer)
      events.forEach(event => {
        document.removeEventListener(event, resetOnActivity)
      })
    }
  }, [isSignedIn, showWarning])

  if (!showWarning) return null

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg max-w-sm"
    >
      <div className="flex items-center space-x-3">
        <div className="text-amber-600">⚠️</div>
        <div className="flex-1">
          <h4 className="font-medium text-amber-800 mb-1">
            Session Expiring Soon
          </h4>
          <p className="text-sm text-amber-700">
            Your session will expire in {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
        </div>
        <button
          onClick={() => setShowWarning(false)}
          className="text-amber-600 hover:text-amber-800"
        >
          ✕
        </button>
      </div>
    </motion.div>
  )
}

// Biometric setup prompt component
export function BiometricSetupPrompt() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const [showPrompt, setShowPrompt] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if (!isSignedIn || !user) return

    // Check if biometric authentication is supported
    const checkBiometricSupport = async () => {
      if (typeof window !== 'undefined' && 'PublicKeyCredential' in window) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          setIsSupported(available)
          
          // Show prompt if supported and not already set up
          const hasSetup = localStorage.getItem('napoleon_biometric_setup')
          if (available && !hasSetup) {
            setTimeout(() => setShowPrompt(true), 5000) // Show after 5 seconds
          }
        } catch (error) {
          console.log('Biometric check failed:', error)
          setIsSupported(false)
        }
      }
    }

    checkBiometricSupport()
  }, [isSignedIn, user])

  const handleSetup = () => {
    // This would integrate with Clerk's passkey setup
    console.log('Setting up biometric authentication...')
    localStorage.setItem('napoleon_biometric_setup', 'true')
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('napoleon_biometric_dismissed', 'true')
    setShowPrompt(false)
  }

  if (!showPrompt || !isSupported) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 left-4 z-50 bg-white border border-gray-200 rounded-xl p-5 shadow-luxury max-w-sm"
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl">🔐</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-2">
            Secure Your Account
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Enable Face ID or Touch ID for faster, more secure access to your executive dashboard.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleSetup}
              className="bg-burgundy-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-burgundy-700 transition-colors"
            >
              Enable
            </button>
            <button
              onClick={handleDismiss}
              className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Export the main wrapper as default
export default AuthWrapper