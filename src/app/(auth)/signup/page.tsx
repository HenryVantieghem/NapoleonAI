'use client'

import { useAuth, useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Crown, Mail, Lock, User, Eye, EyeOff, Check, Shield } from 'lucide-react'
import { tokens } from '@/design-system/tokens'

export default function LuxurySignUpPage() {
  const { signUp, setActive } = useSignUp()
  const { isSignedIn } = useAuth()
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState('')
  const [rippleKey, setRippleKey] = useState(0)

  useEffect(() => {
    if (isSignedIn) {
      router.push('/onboarding')
    }
  }, [isSignedIn, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signUp?.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      })

      await signUp?.prepareEmailAddressVerification({ strategy: 'email_code' })
      setVerifying(true)
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signUp?.attemptEmailAddressVerification({ code })
      
      if (result?.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/onboarding')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGmailOAuth = async () => {
    setLoading(true)
    setRippleKey(prev => prev + 1)
    
    try {
      await signUp?.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/onboarding',
      })
    } catch (err) {
      setError('Gmail authentication failed')
      setLoading(false)
    }
  }

  if (verifying) {
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
            
            {/* Header */}
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center shadow-champagne-glow">
                  <Check className="w-8 h-8 text-jetBlack" />
                </div>
              </div>
              <h1 className="text-3xl font-serif font-bold text-warmIvory mb-2">
                Verify Executive Access
              </h1>
              <p className="text-platinumSilver text-lg">
                Check your email for the verification code
              </p>
            </motion.div>

            {/* Verification Form */}
            <form onSubmit={handleVerification} className="space-y-6">
              
              {/* Code Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <label htmlFor="code" className="block text-sm font-medium text-warmIvory mb-2">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Lock className="w-5 h-5 text-platinumSilver" />
                  </div>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    required
                    maxLength={6}
                    className="w-full pl-12 pr-4 py-4 bg-jetBlack/50 border border-platinumSilver/20 rounded-xl text-warmIvory placeholder-platinumSilver/60 focus:border-champagneGold focus:ring-2 focus:ring-champagneGold/20 transition-all duration-300 luxury-focus text-center text-2xl tracking-widest"
                  />
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

              {/* Verify Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="luxury-button ripple-effect w-full py-4 bg-gradient-gold text-jetBlack font-semibold rounded-xl shadow-champagne hover:shadow-champagne-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-jetBlack/30 border-t-jetBlack rounded-full animate-spin mr-3" />
                    Verifying...
                  </div>
                ) : (
                  'Complete Executive Setup'
                )}
              </motion.button>
            </form>

            {/* Security Badge */}
            <motion.div 
              className="mt-8 pt-6 border-t border-platinumSilver/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="flex items-center justify-center space-x-3 text-xs text-platinumSilver/80">
                <Shield className="w-4 h-4 text-champagneGold" />
                <span>Secure email verification</span>
                <span>•</span>
                <span>End-to-end encrypted</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
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
        className="w-full max-w-lg relative z-10"
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
              Join Napoleon AI
            </h1>
            <p className="text-platinumSilver text-lg">
              Executive Command Center
            </p>
            <p className="text-platinumSilver/80 text-sm mt-2">
              Transform communication chaos into strategic clarity
            </p>
          </motion.div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <label htmlFor="firstName" className="block text-sm font-medium text-warmIvory mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <User className="w-5 h-5 text-platinumSilver" />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="CEO"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-jetBlack/50 border border-platinumSilver/20 rounded-xl text-warmIvory placeholder-platinumSilver/60 focus:border-champagneGold focus:ring-2 focus:ring-champagneGold/20 transition-all duration-300 luxury-focus"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
              >
                <label htmlFor="lastName" className="block text-sm font-medium text-warmIvory mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <User className="w-5 h-5 text-platinumSilver" />
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Executive"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-jetBlack/50 border border-platinumSilver/20 rounded-xl text-warmIvory placeholder-platinumSilver/60 focus:border-champagneGold focus:ring-2 focus:ring-champagneGold/20 transition-all duration-300 luxury-focus"
                  />
                </div>
              </motion.div>
            </div>

            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
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
              transition={{ delay: 0.45, duration: 0.6 }}
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
              <p className="text-xs text-platinumSilver/60 mt-2">
                Minimum 8 characters with uppercase, lowercase, and numbers
              </p>
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

            {/* Create Account Button */}
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
                  Creating Account...
                </div>
              ) : (
                'Join Executive Suite'
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
            <div className="text-center text-sm text-platinumSilver">
              Already have an account?{' '}
              <Link 
                href="/auth/sign-in" 
                className="text-champagneGold hover:text-champagneGold/80 font-medium transition-colors"
              >
                Access Command Center
              </Link>
            </div>
          </motion.div>

          {/* Terms & Privacy */}
          <motion.div 
            className="mt-6 pt-6 border-t border-platinumSilver/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <p className="text-xs text-platinumSilver/60 text-center">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-champagneGold hover:text-champagneGold/80 transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-champagneGold hover:text-champagneGold/80 transition-colors">
                Privacy Policy
              </Link>
            </p>
          </motion.div>

          {/* Security Badge */}
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
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