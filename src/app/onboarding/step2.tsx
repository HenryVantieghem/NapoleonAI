'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/luxury-card'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/luxury-button'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { ChevronLeft, ChevronRight, Mail, MessageSquare, Users, CheckCircle } from 'lucide-react'

const platforms = [
  {
    id: 'gmail',
    name: 'Gmail',
    icon: Mail,
    description: 'Connect your work email',
    available: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: MessageSquare,
    description: 'Coming in Phase 2',
    available: false,
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    icon: Users,
    description: 'Coming in Phase 2',
    available: false,
  },
]

export default function OnboardingStep2() {
  const router = useRouter()
  const { connectedAccounts, setAccountStatus, removeAccount } = useOnboardingStore()
  const [connecting, setConnecting] = useState<string | null>(null)

  const handleConnect = async (platformId: string) => {
    if (!platforms.find(p => p.id === platformId)?.available) return

    setConnecting(platformId)
    
    // Simulate OAuth flow
    setTimeout(() => {
      if (platformId === 'gmail') {
        // In real app, this would be OAuth redirect
        window.location.href = '/api/integrations/callback/gmail'
      }
      setAccountStatus(platformId, 'connected')
      setConnecting(null)
    }, 1500)
  }

  const handleDisconnect = (platformId: string) => {
    removeAccount(platformId)
  }

  const handleContinue = () => {
    router.push('/onboarding/step3')
  }

  const handleBack = () => {
    router.push('/onboarding/step1')
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <Card className="p-8 bg-white/95 backdrop-blur-luxury shadow-luxury-lg">
          <div className="mb-8">
            <Typography variant="h2" className="text-navy mb-2">
              Connect Your Platforms
            </Typography>
            <Typography variant="body" className="text-gray-600">
              Link your communication channels (30 seconds)
            </Typography>
          </div>

          <div className="space-y-4">
            {platforms.map((platform) => {
              const isConnected = connectedAccounts.some(acc => acc.provider === platform.id && acc.status === 'connected')
              const isConnecting = connecting === platform.id

              return (
                <div
                  key={platform.id}
                  className={`border rounded-lg p-6 transition-all ${
                    platform.available
                      ? 'border-gray-200 hover:border-navy/20'
                      : 'border-gray-100 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        isConnected ? 'bg-green-50' : 'bg-gray-50'
                      }`}>
                        <platform.icon className={`w-6 h-6 ${
                          isConnected ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <Typography variant="h3" className="text-navy">
                          {platform.name}
                        </Typography>
                        <Typography variant="body-sm" className="text-gray-600">
                          {platform.description}
                        </Typography>
                      </div>
                    </div>
                    
                    {platform.available ? (
                      <Button
                        onClick={() => isConnected ? handleDisconnect(platform.id) : handleConnect(platform.id)}
                        variant={isConnected ? 'outline' : 'luxury'}
                        disabled={isConnecting}
                        className="min-w-[120px]"
                      >
                        {isConnecting ? (
                          'Connecting...'
                        ) : isConnected ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Connected
                          </>
                        ) : (
                          'Connect'
                        )}
                      </Button>
                    ) : (
                      <span className="text-sm text-gray-500 italic">
                        Phase 2
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 p-4 bg-navy/5 rounded-lg">
            <Typography variant="body-sm" className="text-navy">
              🔒 Bank-grade encryption protects all your data. We never store your messages.
            </Typography>
          </div>

          <div className="mt-8 flex justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-500"
              >
                Skip Setup
              </Button>
              <Button
                onClick={handleContinue}
                disabled={connectedAccounts.filter(acc => acc.status === 'connected').length === 0}
                className="flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
              <div className="w-2 h-2 bg-gold rounded-full" />
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}