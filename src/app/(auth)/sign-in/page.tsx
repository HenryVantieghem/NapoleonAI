'use client'

import { useAuth, useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Crown, Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react'
import { tokens } from '@/design-system/tokens'

export default function LuxurySignInPage() {
  const { signIn, setActive } = useSignIn()
  const { isSignedIn } = useAuth()
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rippleKey, setRippleKey] = useState(0)

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard')
    }
  }, [isSignedIn, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn?.create({
        identifier: email,
        password,
      })

      if (result?.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGmailOAuth = async () => {
    setLoading(true)
    setRippleKey(prev => prev + 1)
    
    try {
      await signIn?.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      })
    } catch (err) {
      setError('Gmail authentication failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-jetBlack flex items-center justify-center p-4 relative overflow-hidden">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-champagneGold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-midnightBlue/20 rounded-full blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: tokens.animations.easings.luxury 
        }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glass Morphism Card */}
        <div className="glass-card p-10 bg-midnightBlue/10 backdrop-blur-[30px] border border-platinumSilver/20 rounded-2xl shadow-executive">
          
          {/* Napoleon Logo & Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center shadow-champagne-glow">
                <Crown className="w-8 h-8 text-jetBlack" />
              </div>
            </div>
            <h1 className="text-3xl font-serif font-bold text-warmIvory mb-2">
              Napoleon AI
            </h1>
            <p className="text-platinumSilver text-lg">
              Executive Command Center
            </p>
            <p className="text-platinumSilver/80 text-sm mt-2">
              Luxury intelligence for Fortune 500 leaders
            </p>
          </motion.div>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-warmIvory mb-2">
                Executive Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Mail className="w-5 h-5 text-platinumSilver" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ceo@fortune500.com"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-jetBlack/50 border border-platinumSilver/20 rounded-xl text-warmIvory placeholder-platinumSilver/60 focus:border-champagneGold focus:ring-2 focus:ring-champagneGold/20 transition-all duration-300 luxury-focus"
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-warmIvory mb-2">
                Security Credentials
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-5 h-5 text-platinumSilver" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-jetBlack/50 border border-platinumSilver/20 rounded-xl text-warmIvory placeholder-platinumSilver/60 focus:border-champagneGold focus:ring-2 focus:ring-champagneGold/20 transition-all duration-300 luxury-focus"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-platinumSilver hover:text-champagneGold transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Sign In Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="luxury-button ripple-effect w-full py-4 bg-gradient-gold text-jetBlack font-semibold rounded-xl shadow-champagne hover:shadow-champagne-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-jetBlack/30 border-t-jetBlack rounded-full animate-spin mr-3" />
                  Authenticating...
                </div>
              ) : (
                'Access Command Center'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-platinumSilver/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-midnightBlue/10 text-platinumSilver">
                Executive OAuth
              </span>
            </div>
          </div>

          {/* Gmail OAuth Button */}
          <motion.button
            onClick={handleGmailOAuth}
            disabled={loading}
            className="luxury-button shimmer-effect w-full py-4 bg-transparent border-2 border-champagneGold text-champagneGold font-semibold rounded-xl hover:bg-champagneGold hover:text-jetBlack disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-600 executive-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center justify-center">
              <Mail className="w-5 h-5 mr-3" />
              Continue with Gmail
            </div>
          </motion.button>

          {/* Footer Links */}
          <motion.div 
            className="mt-8 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <div className="text-center">
              <Link
                href="/auth/reset-password"
                className="text-sm text-platinumSilver hover:text-champagneGold transition-colors"
              >
                Forgot security credentials?
              </Link>
            </div>
            
            <div className="text-center text-sm text-platinumSilver">
              New to Napoleon AI?{' '}
              <Link 
                href="/auth/signup" 
                className="text-champagneGold hover:text-champagneGold/80 font-medium transition-colors"
              >
                Join the Executive Suite
              </Link>
            </div>
          </motion.div>

          {/* Security Badge */}
          <motion.div 
            className="mt-8 pt-6 border-t border-platinumSilver/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="flex items-center justify-center space-x-3 text-xs text-platinumSilver/80">
              <Shield className="w-4 h-4 text-champagneGold" />
              <span>Bank-grade encryption</span>
              <span>•</span>
              <span>SOC 2 Type II compliant</span>
              <span>•</span>
              <span>Zero-trust architecture</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}