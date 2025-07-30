"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Crown, 
  Fingerprint, 
  Smartphone, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth, useUser } from '@clerk/nextjs'
import Link from "next/link"

interface BiometricState {
  isSupported: boolean
  isLoading: boolean
  isSetup: boolean
  error: string | null
  step: 'check' | 'setup' | 'complete'
}

export default function BiometricSetupPage() {
  const router = useRouter()
  const { user } = useUser()
  const [state, setState] = useState<BiometricState>({
    isSupported: false,
    isLoading: true,
    isSetup: false,
    error: null,
    step: 'check'
  })

  // Check biometric support on component mount
  useEffect(() => {
    checkBiometricSupport()
  }, [])

  const checkBiometricSupport = async () => {
    try {
      if (typeof window !== 'undefined' && 'PublicKeyCredential' in window) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setState(prev => ({ 
          ...prev, 
          isSupported: available, 
          isLoading: false,
          step: available ? 'setup' : 'check'
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          isSupported: false, 
          isLoading: false 
        }))
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isSupported: false, 
        isLoading: false,
        error: 'Unable to check biometric support'
      }))
    }
  }

  const setupBiometric = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Create credential request options
      const publicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32), // In production, get from server
        rp: {
          name: "Napoleon AI",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(user?.id || 'user'),
          name: user?.emailAddresses[0]?.emailAddress || 'executive@company.com',
          displayName: user?.firstName && user?.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : 'Executive User',
        },
        pubKeyCredParams: [{alg: -7, type: "public-key"}],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        timeout: 60000,
        attestation: "direct"
      }

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      })

      if (credential) {
        // Update user metadata to indicate biometric setup
        await user?.update({
          publicMetadata: {
            ...user.publicMetadata,
            biometricEnabled: true,
            biometricSetupDate: new Date().toISOString()
          }
        })

        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isSetup: true, 
          step: 'complete' 
        }))
      }
    } catch (error: any) {
      console.error('Biometric setup failed:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error.name === 'NotAllowedError' 
          ? 'Biometric setup was cancelled. Please try again.'
          : 'Failed to setup biometric authentication. Please try again.'
      }))
    }
  }

  const handleComplete = () => {
    // Check if coming from onboarding
    const urlParams = new URLSearchParams(window.location.search)
    const returnTo = urlParams.get('returnTo') || '/dashboard'
    router.push(returnTo)
  }

  const handleSkip = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const returnTo = urlParams.get('returnTo') || '/dashboard'
    router.push(returnTo)
  }

  if (state.isLoading && state.step === 'check') {
    return (
      <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-burgundy rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Crown className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-gray-600">Checking biometric support...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            state.step === 'complete' 
              ? 'bg-green-100' 
              : state.isSupported 
                ? 'bg-blue-100'
                : 'bg-amber-100'
          }`}>
            {state.step === 'complete' ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : state.isSupported ? (
              <Fingerprint className="w-10 h-10 text-blue-600" />
            ) : (
              <AlertCircle className="w-10 h-10 text-amber-600" />
            )}
          </div>
          
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            {state.step === 'complete' 
              ? 'Biometric Authentication Enabled'
              : state.isSupported 
                ? 'Executive Security Setup'
                : 'Biometric Authentication Unavailable'
            }
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            {state.step === 'complete'
              ? 'Your executive account is now secured with biometric authentication.'
              : state.isSupported
                ? 'Secure your Napoleon AI account with Face ID or Touch ID for executive-grade protection.'
                : 'Biometric authentication is not available on this device or browser.'
            }
          </p>
        </motion.div>

        {/* Content based on step */}
        {state.step === 'complete' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="card-luxury p-8 mb-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Enhanced Security Active
                  </h3>
                  <p className="text-gray-600">
                    Your account is now protected with biometric authentication
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">What's Protected:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    Account sign-in
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    Sensitive data access
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    Executive communications
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    Integration connections
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleComplete}
                variant="luxury"
                size="lg"
                className="w-full"
              >
                Continue to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        ) : state.isSupported ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-luxury p-8 mb-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Fingerprint className="w-6 h-6 text-burgundy-600 mr-2" />
                  Executive Biometric Security
                </h2>
                
                <div className="bg-gradient-to-r from-burgundy-50 to-blue-50 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-burgundy-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <Shield className="w-5 h-5 text-burgundy-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Enhanced Security</h4>
                        <p className="text-sm text-gray-600">Military-grade biometric protection for your executive communications</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Seamless Access</h4>
                        <p className="text-sm text-gray-600">Quick authentication with Face ID or Touch ID</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {state.error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg mb-6"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                  <span className="text-sm text-red-700">{state.error}</span>
                </motion.div>
              )}

              <div className="space-y-4">
                <Button
                  onClick={setupBiometric}
                  variant="luxury"
                  size="lg"
                  className="w-full"
                  disabled={state.isLoading}
                >
                  {state.isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 mr-2"
                    >
                      <Crown className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Fingerprint className="w-5 h-5 mr-2" />
                  )}
                  {state.isLoading ? 'Setting up...' : 'Enable Biometric Authentication'}
                </Button>
                
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  disabled={state.isLoading}
                >
                  Skip for now
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-luxury p-8 mb-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Biometric Authentication Not Available
                </h2>
                
                <div className="bg-amber-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 mb-4">
                    Biometric authentication requires a compatible device and browser. 
                    Your account is still protected with:
                  </p>
                  
                  <div className="space-y-2 text-left">
                    {[
                      'Strong password requirements',
                      'Multi-factor authentication options',
                      'Session security monitoring',
                      'Enterprise-grade encryption'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={handleSkip}
                  variant="luxury"
                  size="lg"
                  className="w-full"
                >
                  Continue to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        {state.step !== 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Link 
              href="/dashboard"
              className="inline-flex items-center text-burgundy-600 hover:text-burgundy-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}