"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Timer, Users, AlertCircle } from 'lucide-react'
import { useAuth, useUser } from '@clerk/nextjs'
import { EnhancedSignup } from '@/components/auth/enhanced-signup'
import { WaitlistForm } from '@/components/auth/waitlist-form'
import { useSignupStore } from '@/lib/stores/signup-store'
import { useUserPersistence } from '@/lib/auth/user-persistence'
import { Button } from '@/components/ui/button'

type SignupMode = 'choose' | 'signup' | 'waitlist' | 'completing'

export default function EnhancedSignupPage() {
  const [mode, setMode] = useState<SignupMode>('choose')
  const [isProcessing, setIsProcessing] = useState(false)
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const { profile, isCompleting, reset } = useSignupStore()
  const { createUserProfile, initializeVIPContacts } = useUserPersistence()

  const handleProfileCompletion = useCallback(async () => {
    if (!userId || !user) return
    
    setIsProcessing(true)
    
    try {
      // Add email from Clerk to profile
      const completeProfile = {
        ...profile,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: profile.name || 'Executive User',
        role: profile.role || 'CEO',
        companySize: profile.companySize || '1-10',
        painPoints: profile.painPoints || [],
        communicationTools: profile.communicationTools || []
      }
      
      // Save to Supabase
      const result = await createUserProfile(completeProfile)
      
      if (result.success) {
        // Initialize VIP contacts based on role
        await initializeVIPContacts(profile.role!, profile.companySize!)
        
        // Redirect to dashboard
        window.location.href = '/dashboard'
      } else {
        console.error('Failed to save profile:', result.error)
        // Could show an error message here
      }
    } catch (error) {
      console.error('Profile completion error:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [userId, user, profile, createUserProfile, initializeVIPContacts])

  // Handle completion after Clerk signup
  useEffect(() => {
    if (isSignedIn && isCompleting && profile.name && profile.role) {
      handleProfileCompletion()
    }
  }, [isSignedIn, isCompleting, profile, handleProfileCompletion])

  const handleModeSelect = (selectedMode: 'signup' | 'waitlist') => {
    setMode(selectedMode)
    if (selectedMode === 'signup') {
      reset() // Reset any previous signup state
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block mb-6">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold-lg mx-auto"
            >
              <Crown className="w-8 h-8 text-navy-900" />
            </motion.div>
          </div>

          <h1 className="text-4xl font-serif font-bold text-white mb-2">
            Take Command Now
          </h1>
          <p className="text-gold-200">
            Your executive intelligence awaits
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Mode Selection */}
          {mode === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/95 backdrop-blur-luxury rounded-2xl p-6 shadow-luxury border border-gold-200/30 cursor-pointer"
                onClick={() => handleModeSelect('signup')}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-gold rounded-xl flex items-center justify-center mr-4">
                    <Crown className="w-6 h-6 text-navy-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-navy-900">
                      Immediate Access
                    </h3>
                    <p className="text-sm text-navy-600">
                      Start commanding now (30-second setup)
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-navy-700">
                  <div className="flex items-center">
                    <Timer className="w-4 h-4 text-gold-600 mr-2" />
                    <span>30-second executive onboarding</span>
                  </div>
                  <div className="flex items-center">
                    <Crown className="w-4 h-4 text-gold-600 mr-2" />
                    <span>Full access to all features</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/95 backdrop-blur-luxury rounded-2xl p-6 shadow-luxury border border-gold-200/30 cursor-pointer"
                onClick={() => handleModeSelect('waitlist')}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-navy-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-navy-900">
                      Executive Waitlist
                    </h3>
                    <p className="text-sm text-navy-600">
                      Priority access for C-suite leaders
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-navy-700">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-navy-600 mr-2" />
                    <span>Exclusive executive preview</span>
                  </div>
                  <div className="flex items-center">
                    <Crown className="w-4 h-4 text-navy-600 mr-2" />
                    <span>Personal onboarding session</span>
                  </div>
                </div>
              </motion.div>

              <div className="bg-gold-50/10 backdrop-blur-sm rounded-xl p-4 border border-gold-200/20">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-gold-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gold-200 leading-relaxed">
                      <strong>For C-suite executives:</strong> Both options provide the same luxury experience. 
                      Choose immediate access if you're ready to transform your communications today.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Signup Flow */}
          {mode === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <EnhancedSignup />
              
              <div className="mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setMode('choose')}
                  className="text-gold-200 hover:text-gold-100 w-full"
                >
                  ← Back to options
                </Button>
              </div>
            </motion.div>
          )}

          {/* Waitlist Form */}
          {mode === 'waitlist' && (
            <motion.div
              key="waitlist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <WaitlistForm />
              
              <div className="mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setMode('choose')}
                  className="text-gold-200 hover:text-gold-100 w-full"
                >
                  ← Back to options
                </Button>
              </div>
            </motion.div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/95 backdrop-blur-luxury rounded-2xl p-8 shadow-luxury border border-gold-200/30 text-center"
            >
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Crown className="w-8 h-8 text-navy-900" />
                </motion.div>
              </div>
              
              <h3 className="text-xl font-serif font-bold text-navy-900 mb-2">
                Preparing Your Command Center
              </h3>
              
              <p className="text-navy-600 mb-4">
                Setting up your executive intelligence platform...
              </p>
              
              <div className="bg-gold-50 rounded-xl p-3">
                <p className="text-sm text-navy-700">
                  Initializing VIP contacts, AI preferences, and security settings
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-gold-200">
            By proceeding, you agree to our{" "}
            <a href="/terms" className="text-gold-400 hover:text-gold-300 underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-gold-400 hover:text-gold-300 underline">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}