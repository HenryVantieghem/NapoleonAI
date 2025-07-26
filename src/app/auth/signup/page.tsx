"use client"

import { SignUp } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Crown, Shield, Sparkles } from "lucide-react"

export default function SignUpPage() {
  // Fallback for when Clerk is not available (build time)
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  if (!clerkPublishableKey || clerkPublishableKey.includes('placeholder')) {
    return (
      <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
        <div className="text-center">
          <Crown className="w-16 h-16 text-burgundy-600 mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Napoleon AI
          </h1>
          <p className="text-gray-600">
            Authentication service is being configured...
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
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
              className="w-16 h-16 bg-gradient-burgundy rounded-full flex items-center justify-center shadow-burgundy-lg mx-auto"
            >
              <Crown className="w-8 h-8 text-white" />
            </motion.div>
            
            {/* Floating sparkles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: "easeInOut"
                }}
                className="absolute"
                style={{
                  top: `${10 + i * 15}px`,
                  left: `${60 + (i % 2 ? 20 : -20)}px`
                }}
              >
                <Sparkles className="w-3 h-3 text-burgundy-400" />
              </motion.div>
            ))}
          </div>

          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Join Napoleon AI
          </h1>
          <p className="text-gray-600">
            Command your executive communications with AI
          </p>
        </motion.div>

        {/* Clerk SignUp Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <SignUp 
            path="/auth/signup"
            routing="path"
            signInUrl="/auth/login"
            appearance={{
              baseTheme: undefined,
              variables: {
                colorPrimary: '#801B2B',
                colorText: '#111827',
                colorTextSecondary: '#6B7280',
                colorBackground: '#FFFFFF',
                colorInputBackground: '#F9FAFB',
                colorInputText: '#111827',
                fontFamily: 'Inter, sans-serif',
                borderRadius: '0.5rem'
              },
              elements: {
                card: 'shadow-luxury border border-gray-100 bg-white/95 backdrop-blur-sm',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 
                  'border-2 border-gray-200 hover:border-burgundy-200 hover:bg-burgundy-50 transition-all duration-200 font-medium',
                socialButtonsBlockButtonText: 'font-medium',
                formButtonPrimary: 
                  'bg-gradient-to-r from-burgundy-600 to-burgundy-700 hover:from-burgundy-700 hover:to-burgundy-800 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl',
                formFieldInput: 
                  'border-gray-200 focus:border-burgundy-300 focus:ring-burgundy-200 transition-colors duration-200',
                footerActionLink: 'text-burgundy-600 hover:text-burgundy-700 font-medium',
                dividerLine: 'bg-gray-200',
                dividerText: 'text-gray-500 bg-white',
                formFieldLabel: 'text-gray-700 font-medium',
                identityPreviewText: 'text-gray-700',
                identityPreviewEditButton: 'text-burgundy-600 hover:text-burgundy-700'
              }
            }}
          />
        </motion.div>

        {/* Executive Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-luxury border border-burgundy-100 mt-8"
        >
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Executive Benefits
            </h3>
            <p className="text-sm text-gray-600">
              Luxury productivity for C-suite leaders
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-burgundy-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <Crown className="w-4 h-4 text-burgundy-600" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Unified Command Center</span>
                <p className="text-gray-500">Gmail, Slack, and Teams in one place</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-burgundy-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <Shield className="w-4 h-4 text-burgundy-600" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">AI Prioritization</span>
                <p className="text-gray-500">Focus on what matters most</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-burgundy-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-burgundy-600" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">8+ Hours Saved Weekly</span>
                <p className="text-gray-500">Transform chaos into clarity</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-gray-500">
            By signing up, you agree to our{" "}
            <a href="/terms" className="text-burgundy-600 hover:text-burgundy-700">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-burgundy-600 hover:text-burgundy-700">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}