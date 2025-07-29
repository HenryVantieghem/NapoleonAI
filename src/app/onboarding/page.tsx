"use client"

import { useState } from "react"
import { Crown, Mail, MessageSquare, Users, ArrowRight, CheckCircle, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([])
  
  // For MVP, use a simple fallback user
  const user = { firstName: 'Executive' }

  const handleConnect = (provider: string) => {
    // In MVP, we'll simulate connection
    setConnectedAccounts([...connectedAccounts, provider])
    
    // In production, this would trigger OAuth flow
    setTimeout(() => {
      console.log(`Connected to ${provider}`)
    }, 1000)
  }

  const handleFinish = () => {
    router.push('/dashboard')
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] to-white flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-[#0A0A0A] to-[#333333] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Crown className="w-10 h-10 text-[#D4AF37]" />
          </div>
          
          <h1 className="text-4xl font-bold text-[#0A0A0A] mb-4">
            Welcome to Napoleon AI, {user?.firstName}!
          </h1>
          
          <p className="text-xl text-[#666661] mb-8">
            Let's connect your communication accounts to get started.
          </p>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-6">Step 1: Connect Your Accounts</h2>
            <p className="text-[#666661] mb-8">Connect your email and messaging platforms to unify your communications.</p>

            <div className="space-y-4">
              <button
                onClick={() => handleConnect('gmail')}
                disabled={connectedAccounts.includes('gmail')}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  connectedAccounts.includes('gmail')
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 hover:border-[#D4AF37] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-red-500" />
                  <div className="text-left">
                    <div className="font-semibold text-[#0A0A0A]">Gmail</div>
                    <div className="text-sm text-[#666661]">Connect your Gmail account</div>
                  </div>
                </div>
                {connectedAccounts.includes('gmail') ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <ArrowRight className="w-6 h-6 text-[#666661]" />
                )}
              </button>

              <button
                onClick={() => handleConnect('slack')}
                disabled={connectedAccounts.includes('slack')}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  connectedAccounts.includes('slack')
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 hover:border-[#D4AF37] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-6 h-6 text-purple-500" />
                  <div className="text-left">
                    <div className="font-semibold text-[#0A0A0A]">Slack</div>
                    <div className="text-sm text-[#666661]">Connect your Slack workspace</div>
                  </div>
                </div>
                {connectedAccounts.includes('slack') ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <ArrowRight className="w-6 h-6 text-[#666661]" />
                )}
              </button>

              <button
                onClick={() => handleConnect('teams')}
                disabled={connectedAccounts.includes('teams')}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  connectedAccounts.includes('teams')
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 hover:border-[#D4AF37] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-blue-500" />
                  <div className="text-left">
                    <div className="font-semibold text-[#0A0A0A]">Microsoft Teams</div>
                    <div className="text-sm text-[#666661]">Connect your Teams account</div>
                  </div>
                </div>
                {connectedAccounts.includes('teams') ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <ArrowRight className="w-6 h-6 text-[#666661]" />
                )}
              </button>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="text-[#666661] hover:text-[#0A0A0A] transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={connectedAccounts.length === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  connectedAccounts.length > 0
                    ? 'bg-[#0A0A0A] text-white hover:bg-[#333333]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>

          <div className="text-sm text-[#666661]">
            Step 1 of 2 • Connect accounts to prioritize your messages
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] to-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-[#0A0A0A] to-[#333333] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <Crown className="w-10 h-10 text-[#D4AF37]" />
        </div>
        
        <h1 className="text-4xl font-bold text-[#0A0A0A] mb-4">
          You're All Set!
        </h1>
        
        <p className="text-xl text-[#666661] mb-8">
          Welcome to your executive command center.
        </p>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-[#0A0A0A] mb-6">Step 2: See Your Dashboard</h2>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-[#0A0A0A]">AI is analyzing your messages</div>
                <div className="text-sm text-[#666661]">Prioritizing communications by importance</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-[#0A0A0A]">VIP contacts identified</div>
                <div className="text-sm text-[#666661]">Important stakeholders highlighted</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-[#0A0A0A]">Time savings active</div>
                <div className="text-sm text-[#666661]">Start saving 2+ hours daily</div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleFinish}
              className="w-full bg-[#0A0A0A] text-white py-4 rounded-lg text-lg font-medium hover:bg-[#333333] transition-all duration-300"
            >
              Enter Your Dashboard
            </button>
          </div>
        </div>

        <div className="text-sm text-[#666661]">
          Step 2 of 2 • Ready to command your communications
        </div>
      </div>
    </div>
  )
}