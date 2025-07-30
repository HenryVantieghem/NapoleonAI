"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Crown, Shield, AlertTriangle, CheckCircle, Fingerprint } from "lucide-react"
import { useAuth, useUser } from '@clerk/nextjs'
import { Button } from "@/components/ui/button"
import { AuthLoading } from "./auth-loading"
import { AuthError } from "./auth-error"
import { useRouter } from "next/navigation"

interface ExecutiveAuthGuardProps {
  children: React.ReactNode
  requireBiometric?: boolean
  fallbackComponent?: React.ReactNode
}

interface AuthState {
  isChecking: boolean
  isExecutive: boolean
  hasRequiredBiometric: boolean
  error: string | null
  needsRoleVerification: boolean
}

// Executive roles for validation
const EXECUTIVE_ROLES = [
  'CEO', 'Chief Executive Officer',
  'COO', 'Chief Operating Officer', 
  'CFO', 'Chief Financial Officer',
  'CTO', 'Chief Technology Officer',
  'CMO', 'Chief Marketing Officer',
  'CHRO', 'Chief Human Resources Officer',
  'President', 'Vice President', 'VP',
  'Director', 'Executive Director', 'Managing Director',
  'Founder', 'Co-Founder', 'Partner',
  'Executive', 'Senior Executive'
]

function validateExecutiveRole(role: string): boolean {
  return EXECUTIVE_ROLES.some(execRole => 
    role.toLowerCase().includes(execRole.toLowerCase())
  )
}

export function ExecutiveAuthGuard({ 
  children, 
  requireBiometric = false, 
  fallbackComponent 
}: ExecutiveAuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    isChecking: true,
    isExecutive: false,
    hasRequiredBiometric: false,
    error: null,
    needsRoleVerification: false
  })

  useEffect(() => {
    async function validateExecutiveAccess() {
      if (!isLoaded) return
      
      // Not signed in
      if (!isSignedIn || !user) {
        setAuthState({
          isChecking: false,
          isExecutive: false,
          hasRequiredBiometric: false,
          error: 'Authentication required',
          needsRoleVerification: false
        })
        return
      }

      try {
        // Check executive role
        const role = (user.publicMetadata?.role as string) || ''
        const isExecutive = validateExecutiveRole(role)
        
        if (!isExecutive) {
          setAuthState({
            isChecking: false,
            isExecutive: false,
            hasRequiredBiometric: false,
            error: null,
            needsRoleVerification: true
          })
          return
        }

        // Check biometric requirement
        let hasRequiredBiometric = true
        if (requireBiometric) {
          const biometricEnabled = user.publicMetadata?.biometricEnabled || false
          hasRequiredBiometric = biometricEnabled
        }

        setAuthState({
          isChecking: false,
          isExecutive: true,
          hasRequiredBiometric,
          error: null,
          needsRoleVerification: false
        })
      } catch (error) {
        console.error('Executive validation error:', error)
        setAuthState({
          isChecking: false,
          isExecutive: false,
          hasRequiredBiometric: false,
          error: 'Validation failed. Please try again.',
          needsRoleVerification: false
        })
      }
    }

    validateExecutiveAccess()
  }, [isLoaded, isSignedIn, user, requireBiometric])

  // Loading state
  if (!isLoaded || authState.isChecking) {
    return (
      <AuthLoading 
        message="Verifying executive credentials..."
        submessage="Ensuring secure access to your command center"
      />
    )
  }

  // Not signed in - redirect to login
  if (!isSignedIn) {
    router.push('/auth/login')
    return (
      <AuthLoading 
        message="Redirecting to sign in..."
        submessage="Please authenticate to continue"
      />
    )
  }

  // Needs role verification
  if (authState.needsRoleVerification) {
    return (
      <ExecutiveRoleVerification 
        onVerified={() => {
          setAuthState(prev => ({ 
            ...prev, 
            isExecutive: true, 
            needsRoleVerification: false 
          }))
        }}
        onFallback={() => {
          if (fallbackComponent) {
            return fallbackComponent
          }
          router.push('/auth/executive-required')
        }}
      />
    )
  }

  // Error state
  if (authState.error) {
    return (
      <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
        <AuthError
          error={{ message: authState.error, code: 'executive_verification_failed' }}
          onRetry={() => {
            setAuthState(prev => ({ ...prev, isChecking: true, error: null }))
            window.location.reload()
          }}
          onBack={() => router.push('/')}
        />
      </div>
    )
  }

  // Missing required biometric
  if (requireBiometric && !authState.hasRequiredBiometric) {
    return (
      <BiometricSetupRequired 
        onSetup={() => router.push('/auth/biometric-setup')}
        onSkip={() => {
          // Allow access but warn about security
          setAuthState(prev => ({ ...prev, hasRequiredBiometric: true }))
        }}
      />
    )
  }

  // All checks passed - render children
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="executive-content"
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

// Role verification component
function ExecutiveRoleVerification({ 
  onVerified, 
  onFallback 
}: { 
  onVerified: () => void
  onFallback: () => void 
}) {
  const [selectedRole, setSelectedRole] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const { user } = useUser()

  const handleRoleUpdate = async () => {
    if (!selectedRole || !user) return
    
    setIsUpdating(true)
    
    try {
      await user.update({
        publicMetadata: {
          ...user.publicMetadata,
          role: selectedRole,
          isExecutive: true,
          executiveVerified: true,
          verificationDate: new Date().toISOString()
        }
      })
      
      onVerified()
    } catch (error) {
      console.error('Role update failed:', error)
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-amber-600" />
          </div>
          
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Executive Role Verification
          </h1>
          <p className="text-lg text-gray-600">
            Please select your executive role to continue
          </p>
        </motion.div>

        <div className="card-luxury p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {EXECUTIVE_ROLES.slice(0, 12).map((role) => (
              <motion.button
                key={role}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole(role)}
                className={`p-3 text-left rounded-lg border-2 transition-all ${
                  selectedRole === role
                    ? 'border-burgundy-300 bg-burgundy-50 text-burgundy-900'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{role}</span>
                  {selectedRole === role && (
                    <CheckCircle className="w-4 h-4 text-burgundy-600" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleRoleUpdate}
              variant="luxury"
              size="lg"
              className="w-full"
              disabled={!selectedRole || isUpdating}
            >
              {isUpdating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 mr-2"
                >
                  <Crown className="w-5 h-5" />
                </motion.div>
              ) : (
                <Crown className="w-5 h-5 mr-2" />
              )}
              Verify Executive Status
            </Button>
            
            <Button
              onClick={onFallback}
              variant="ghost"
              size="lg"
              className="w-full"
              disabled={isUpdating}
            >
              Not an Executive?
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Biometric setup required component
function BiometricSetupRequired({ 
  onSetup, 
  onSkip 
}: { 
  onSetup: () => void
  onSkip: () => void 
}) {
  return (
    <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Fingerprint className="w-10 h-10 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Biometric Authentication Required
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            This feature requires biometric authentication for enhanced security.
          </p>
        </motion.div>

        <div className="card-luxury p-6 mb-6">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-burgundy-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Executive Security</h3>
              <p className="text-sm text-gray-600">Enhanced protection for sensitive executive communications</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={onSetup}
              variant="luxury"
              size="lg"
              className="w-full"
            >
              <Fingerprint className="w-5 h-5 mr-2" />
              Setup Biometric Authentication
            </Button>
            
            <Button
              onClick={onSkip}
              variant="ghost"
              size="lg"
              className="w-full"
            >
              Continue Without Biometric
            </Button>
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800 mb-1">Security Notice</h4>
              <p className="text-sm text-amber-700">
                Proceeding without biometric authentication reduces your account security. 
                We recommend enabling it for full executive protection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExecutiveAuthGuard