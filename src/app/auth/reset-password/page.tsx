"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Crown, Mail, ArrowLeft, CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthError } from "@/components/auth/auth-error"
import { AuthLoading } from "@/components/auth/auth-loading"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ResetState {
  email: string
  isLoading: boolean
  isSuccess: boolean
  error: string | null
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [state, setState] = useState<ResetState>({
    email: '',
    isLoading: false,
    isSuccess: false,
    error: null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!state.email) {
      setState(prev => ({ ...prev, error: 'Please enter your email address' }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // In production, this would use Clerk's password reset
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isSuccess: true 
      }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to send reset email. Please try again.' 
      }))
    }
  }

  if (state.isLoading) {
    return (
      <AuthLoading 
        message="Sending reset instructions..."
        submessage="Preparing secure executive password reset"
      />
    )
  }

  if (state.isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We've sent password reset instructions to{" "}
              <span className="font-medium text-gray-900">{state.email}</span>
            </p>
            
            <div className="bg-white rounded-2xl p-6 shadow-luxury border border-burgundy-100 mb-6">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-burgundy-600 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900 mb-1">
                    Executive Priority Support
                  </h3>
                  <p className="text-sm text-gray-600">
                    Can't find the email? Check your spam folder or contact our executive support team for immediate assistance.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                variant="luxury"
                size="lg"
                className="w-full"
              >
                Send Another Email
              </Button>
              
              <Link href="/auth/login">
                <Button variant="ghost" size="lg" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </motion.div>
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
            Reset Your Password
          </h1>
          <p className="text-gray-600">
            Enter your email to receive reset instructions
          </p>
        </motion.div>

        {/* Reset Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card-luxury p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Executive Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={state.email}
                    onChange={(e) => setState(prev => ({ 
                      ...prev, 
                      email: e.target.value,
                      error: null 
                    }))}
                    placeholder="your.email@company.com"
                    className="mt-2 border-gray-200 focus:border-burgundy-300 focus:ring-burgundy-200"
                    required
                  />
                </div>
                
                {state.error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <span className="text-sm text-red-700">{state.error}</span>
                  </motion.div>
                )}
              </div>
            </div>
            
            <Button
              type="submit"
              variant="luxury"
              size="lg"
              className="w-full"
              disabled={state.isLoading}
            >
              <Mail className="w-5 h-5 mr-2" />
              Send Reset Instructions
            </Button>
          </form>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Link 
            href="/auth/login"
            className="inline-flex items-center text-burgundy-600 hover:text-burgundy-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </motion.div>

        {/* Executive Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 bg-white rounded-2xl p-6 shadow-luxury border border-burgundy-100"
        >
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">
              Executive Support Available
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Need immediate assistance? Our executive support team is standing by.
            </p>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open('mailto:support@napoleonai.com')}
            >
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}