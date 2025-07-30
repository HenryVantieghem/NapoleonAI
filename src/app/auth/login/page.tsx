"use client"

import { SignIn } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Crown, Shield, Sparkles } from "lucide-react"

export default function LoginPage() {
  // Fallback for when Clerk is not available (build time)
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  if (!clerkPublishableKey || clerkPublishableKey.includes('placeholder')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center p-4">
        <div className="text-center">
          <Crown className="w-16 h-16 text-navy-600 mx-auto mb-4" />
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
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center p-4">
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
              className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold-lg mx-auto"
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
                <Sparkles className="w-3 h-3 text-gold-400" />
              </motion.div>
            ))}
          </div>

          <h1 className="text-4xl font-serif font-bold text-white mb-2">
            Take Command Now
          </h1>
          <p className="text-gold-200">
            Your executive intelligence headquarters
          </p>
        </motion.div>

        {/* Clerk SignIn Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <SignIn 
            path="/auth/login"
            routing="path"
            signUpUrl="/auth/signup"
            appearance={{
              baseTheme: undefined,
              variables: {
                colorPrimary: '#D4AF37',
                colorText: '#1B2951',
                colorTextSecondary: '#6B7280',
                colorBackground: '#FFFFFF',
                colorInputBackground: '#F9FAFB',
                colorInputText: '#1B2951',
                fontFamily: 'Inter, sans-serif',
                borderRadius: '0.5rem'
              },
              elements: {
                card: 'shadow-luxury border border-gold-200/20 bg-white/95 backdrop-blur-luxury',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 
                  'border-2 border-gray-200 hover:border-gold-300 hover:bg-gold-50 transition-all duration-200 font-medium',
                socialButtonsBlockButtonText: 'font-medium',
                formButtonPrimary: 
                  'bg-gradient-gold hover:shadow-gold-lg text-navy-900 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105',
                formFieldInput: 
                  'border-gray-200 focus:border-gold-400 focus:ring-gold-200 transition-all duration-200 focus:bg-gold-50/20',
                footerActionLink: 'text-gold-600 hover:text-gold-700 font-medium',
                dividerLine: 'bg-gray-200',
                dividerText: 'text-gray-500 bg-white',
                formFieldLabel: 'text-gray-700 font-medium',
                identityPreviewText: 'text-gray-700',
                identityPreviewEditButton: 'text-gold-600 hover:text-gold-700'
              }
            }}
          />
        </motion.div>

        {/* Executive Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/95 backdrop-blur-luxury rounded-2xl p-6 shadow-luxury border border-gold-200/30 mt-8"
        >
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-navy-900 mb-2">
              Executive Command Center
            </h3>
            <p className="text-sm text-navy-600">
              Intelligence-driven leadership platform
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Crown className="w-5 h-5 text-gold-700" />
              </div>
              <span className="text-sm font-medium text-navy-700">VIP Intelligence</span>
            </div>
            
            <div>
              <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-gold-700" />
              </div>
              <span className="text-sm font-medium text-navy-700">Command Security</span>
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
          <p className="text-xs text-gold-200">
            By signing in, you agree to our{" "}
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