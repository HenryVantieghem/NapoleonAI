"use client"

import { motion } from "framer-motion"
import { Crown, Shield, Users, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth, useUser } from '@clerk/nextjs'
import { useState } from "react"

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

interface RoleUpdateState {
  selectedRole: string
  company: string
  isLoading: boolean
  error: string | null
}

export default function ExecutiveRequiredPage() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { user } = useUser()
  const [state, setState] = useState<RoleUpdateState>({
    selectedRole: '',
    company: '',
    isLoading: false,
    error: null
  })

  const handleRoleUpdate = async () => {
    if (!state.selectedRole || !state.company) {
      setState(prev => ({ ...prev, error: 'Please select your role and enter your company name' }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Update user metadata with Clerk
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role: state.selectedRole,
          company: state.company,
          isExecutive: true,
          executiveVerified: true,
          verificationDate: new Date().toISOString()
        }
      })

      // Redirect to dashboard or onboarding
      router.push('/dashboard')
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to update profile. Please try again.' 
      }))
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
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
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-600" />
          </div>
          
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Executive Access Required
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Napoleon AI is exclusively designed for C-suite executives and senior leadership.
            Please verify your executive status to continue.
          </p>
        </motion.div>

        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-luxury p-8 mb-6"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
              <Crown className="w-5 h-5 text-burgundy-600 mr-2" />
              Executive Role Verification
            </h2>
            <p className="text-gray-600">
              Select your current executive position and company details
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Executive Role
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXECUTIVE_ROLES.map((role) => (
                  <motion.button
                    key={role}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setState(prev => ({ ...prev, selectedRole: role, error: null }))}
                    className={`p-3 text-left rounded-lg border-2 transition-all ${
                      state.selectedRole === role
                        ? 'border-burgundy-300 bg-burgundy-50 text-burgundy-900'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{role}</span>
                      {state.selectedRole === role && (
                        <CheckCircle className="w-4 h-4 text-burgundy-600" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                id="company"
                type="text"
                value={state.company}
                onChange={(e) => setState(prev => ({ ...prev, company: e.target.value, error: null }))}
                placeholder="Your company name"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-burgundy-300 focus:ring-burgundy-200 focus:ring-2 focus:ring-opacity-50 transition-colors"
              />
            </div>

            {state.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertTriangle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                <span className="text-sm text-red-700">{state.error}</span>
              </motion.div>
            )}

            <Button
              onClick={handleRoleUpdate}
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
                <Crown className="w-5 h-5 mr-2" />
              )}
              Verify Executive Status
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Executive Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-luxury p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 text-burgundy-600 mr-2" />
            Executive Features Include
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Unified command center for all communications',
              'AI-powered message prioritization and summaries',
              'VIP contact management and relationship insights',
              'Strategic daily digest with executive briefings',
              'Advanced privacy and security controls',
              'Priority support from our executive team'
            ].map((feature, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alternative Options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-4"
        >
          <p className="text-sm text-gray-600">
            Not an executive? Napoleon AI is designed specifically for C-suite leaders.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="ghost" 
              onClick={() => window.open('mailto:sales@napoleonai.com')}
            >
              <Users className="w-4 h-4 mr-2" />
              Enterprise Inquiries
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}