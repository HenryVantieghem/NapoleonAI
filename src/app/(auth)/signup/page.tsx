'use client'

import { useAuth, useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Crown, Mail } from 'lucide-react'

export default function GmailSignUp() {
  const { signUp } = useSignUp()
  const { isSignedIn } = useAuth()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard')
    }
  }, [isSignedIn, router])

  const handleGmailOAuth = async () => {
    setLoading(true)
    setError('')
    
    try {
      await signUp?.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      })
    } catch (err: any) {
      setError('Gmail authentication failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0D11] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Crown className="w-10 h-10 text-[#0B0D11]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Gmail Smart Inbox</h1>
          <p className="text-gray-300">Connect your Gmail to get started</p>
        </div>

        {/* Gmail OAuth Button */}
        <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-lg p-8">
          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleGmailOAuth}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-[#D4AF37] text-[#0B0D11] px-6 py-4 rounded-lg text-lg font-semibold hover:bg-[#F4C842] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-[#0B0D11]/30 border-t-[#0B0D11] rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Mail className="w-6 h-6" />
                <span>Continue with Gmail</span>
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/sign-in" className="text-[#D4AF37] hover:text-[#F4C842] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-[#D4AF37] hover:text-[#F4C842] transition-colors">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#D4AF37] hover:text-[#F4C842] transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}