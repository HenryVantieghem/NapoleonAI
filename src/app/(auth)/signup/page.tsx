'use client'

import { useAuth, useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/luxury-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Typography } from '@/components/ui/typography'
import { Card } from '@/components/ui/luxury-card'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SignUpPage() {
  const { signUp, setActive } = useSignUp()
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState('')

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

  const handleOAuthSignUp = async (strategy: 'oauth_google') => {
    setLoading(true)
    try {
      await signUp?.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/onboarding',
      })
    } catch (err) {
      setError('OAuth sign up failed')
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 bg-white/95 backdrop-blur-luxury shadow-luxury-lg">
            <Typography variant="h3" className="text-center text-navy mb-6">
              Verify your email
            </Typography>
            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  className="mt-1"
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-white/95 backdrop-blur-luxury shadow-luxury-lg">
          <div className="text-center mb-8">
            <Typography variant="h2" className="text-navy mb-2">
              Join Napoleon AI
            </Typography>
            <Typography variant="body" className="text-gray-600">
              Transform your executive communication
            </Typography>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="executive@company.com"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <Button
            onClick={() => handleOAuthSignUp('oauth_google')}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </Button>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/sign-in" className="text-navy hover:text-navy-600 font-medium">
                Sign in
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-navy hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-navy hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}