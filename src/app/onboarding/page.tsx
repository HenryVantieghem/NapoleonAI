"use client"

import { useState } from "react"
import { Crown, Mail, MessageSquare, Users, ArrowRight, CheckCircle, Clock, UserPlus, Building, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export const dynamic = 'force-dynamic'

interface OnboardingData {
  role: string
  painPoints: string[]
  connectedAccounts: string[]
  vipContacts: string[]
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    role: '',
    painPoints: [],
    connectedAccounts: [],
    vipContacts: []
  })
  
  // For MVP, use a simple fallback user
  const user = { firstName: 'Executive' }

  const handleRoleSelect = (role: string) => {
    setOnboardingData(prev => ({ ...prev, role }))
  }

  const handlePainPointToggle = (painPoint: string) => {
    setOnboardingData(prev => ({
      ...prev,
      painPoints: prev.painPoints.includes(painPoint)
        ? prev.painPoints.filter(p => p !== painPoint)
        : [...prev.painPoints, painPoint]
    }))
  }

  const handleConnect = (provider: string) => {
    // In MVP, we'll simulate connection
    setOnboardingData(prev => ({
      ...prev,
      connectedAccounts: [...prev.connectedAccounts, provider]
    }))
    
    setTimeout(() => {
      console.log(`Connected to ${provider}`)
    }, 1000)
  }

  const handleVipToggle = (contact: string) => {
    setOnboardingData(prev => ({
      ...prev,
      vipContacts: prev.vipContacts.includes(contact)
        ? prev.vipContacts.filter(c => c !== contact)
        : [...prev.vipContacts, contact]
    }))
  }

  const handleFinish = () => {
    console.log('Onboarding completed:', onboardingData)
    router.push('/dashboard')
  }

  const roles = [
    { id: 'ceo', title: 'CEO', description: 'Chief Executive Officer' },
    { id: 'coo', title: 'COO', description: 'Chief Operating Officer' },
    { id: 'cfo', title: 'CFO', description: 'Chief Financial Officer' },
    { id: 'cto', title: 'CTO', description: 'Chief Technology Officer' },
    { id: 'founder', title: 'Founder', description: 'Company Founder' },
    { id: 'vp', title: 'VP', description: 'Vice President' }
  ]

  const painPoints = [
    'Too many communication channels',
    'Missing important messages',
    'Information overload',
    'Slow response times',
    'Difficulty prioritizing',
    'Context switching fatigue'
  ]

  const mockVipContacts = [
    'Board Chair - Sarah Johnson',
    'Lead Investor - Michael Chen',
    'Co-Founder - David Wilson',
    'Head of Sales - Lisa Rodriguez',
    'Board Member - Robert Taylor',
    'Key Client - Jennifer Brown'
  ]

  // Step 1: Role & Pain Points Selection
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold-lg">
            <Crown className="w-10 h-10 text-navy-900" />
          </div>
          
          <h1 className="text-4xl font-serif font-bold text-white mb-4">
            Welcome to Napoleon AI, {user?.firstName}!
          </h1>
          
          <p className="text-xl text-gold-200 mb-8">
            Let's personalize your executive command center
          </p>

          <div className="bg-white/95 backdrop-blur-luxury rounded-2xl p-8 shadow-luxury border border-gold-200/20 mb-8">
            <h2 className="text-2xl font-semibold text-navy-900 mb-6">Step 1: Your Executive Role</h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    onboardingData.role === role.id
                      ? 'border-gold bg-gold-50 shadow-md'
                      : 'border-gray-200 hover:border-gold-300 hover:bg-gold-50/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      onboardingData.role === role.id ? 'bg-gold' : 'bg-gray-100'
                    }`}>
                      <Building className={`w-5 h-5 ${
                        onboardingData.role === role.id ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <div className="font-semibold text-navy-900">{role.title}</div>
                      <div className="text-sm text-navy-600">{role.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <h3 className="text-xl font-semibold text-navy-900 mb-4">What are your biggest communication challenges?</h3>
            <div className="grid md:grid-cols-2 gap-3 mb-8">
              {painPoints.map((point) => (
                <button
                  key={point}
                  onClick={() => handlePainPointToggle(point)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    onboardingData.painPoints.includes(point)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      onboardingData.painPoints.includes(point) ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}>
                      {onboardingData.painPoints.includes(point) && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-navy-700">{point}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="text-navy-600 hover:text-navy-900 transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!onboardingData.role}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  onboardingData.role
                    ? 'bg-gradient-gold text-navy-900 hover:shadow-gold-lg transform hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>

          <div className="text-sm text-gold-200">
            Step 1 of 3 • Personalize your executive experience
          </div>
        </motion.div>
      </div>
    )
  }

  // Step 2: Platform Connections
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold-lg">
            <Crown className="w-10 h-10 text-navy-900" />
          </div>
          
          <h1 className="text-4xl font-serif font-bold text-white mb-4">
            Connect Your Platforms
          </h1>
          
          <p className="text-xl text-gold-200 mb-8">
            Unify your communication channels for strategic clarity
          </p>

          <div className="bg-white/95 backdrop-blur-luxury rounded-2xl p-8 shadow-luxury border border-gold-200/20 mb-8">
            <h2 className="text-2xl font-semibold text-navy-900 mb-6">Step 2: Platform Integration</h2>
            <p className="text-navy-600 mb-8">Connect Gmail now. Slack and Teams coming in Phase 2.</p>

            <div className="space-y-4">
              <button
                onClick={() => handleConnect('gmail')}
                disabled={onboardingData.connectedAccounts.includes('gmail')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  onboardingData.connectedAccounts.includes('gmail')
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gold hover:bg-gold-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-navy-900">Gmail</div>
                    <div className="text-sm text-navy-600">Connect your Gmail account</div>
                  </div>
                </div>
                {onboardingData.connectedAccounts.includes('gmail') ? (
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                ) : (
                  <ArrowRight className="w-6 h-6 text-navy-600" />
                )}
              </button>

              {/* Disabled placeholders for Phase 2 */}
              <div className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 opacity-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-navy-900">Slack</div>
                    <div className="text-sm text-navy-600">Coming in Phase 2</div>
                  </div>
                </div>
                <Clock className="w-6 h-6 text-gray-400" />
              </div>

              <div className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 opacity-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-navy-900">Microsoft Teams</div>
                    <div className="text-sm text-navy-600">Coming in Phase 2</div>
                  </div>
                </div>
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="text-navy-600 hover:text-navy-900 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-lg font-semibold bg-gradient-gold text-navy-900 hover:shadow-gold-lg transition-all transform hover:scale-105"
              >
                Continue
              </button>
            </div>
          </div>

          <div className="text-sm text-gold-200">
            Step 2 of 3 • Connect platforms for unified intelligence
          </div>
        </motion.div>
      </div>
    )
  }

  // Step 3: VIP Selection & Completion
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold-lg">
          <Crown className="w-10 h-10 text-navy-900" />
        </div>
        
        <h1 className="text-4xl font-serif font-bold text-white mb-4">
          Select Your VIP Contacts
        </h1>
        
        <p className="text-xl text-gold-200 mb-8">
          Mark board members, investors, and key stakeholders for priority treatment
        </p>

        <div className="bg-white/95 backdrop-blur-luxury rounded-2xl p-8 shadow-luxury border border-gold-200/20 mb-8">
          <h2 className="text-2xl font-semibold text-navy-900 mb-6">Step 3: VIP Intelligence</h2>
          <p className="text-navy-600 mb-8">AI will prioritize messages from these contacts and ensure they never get missed.</p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {mockVipContacts.map((contact) => (
              <button
                key={contact}
                onClick={() => handleVipToggle(contact)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  onboardingData.vipContacts.includes(contact)
                    ? 'border-gold bg-gold-50 shadow-md'
                    : 'border-gray-200 hover:border-gold-300 hover:bg-gold-50/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    onboardingData.vipContacts.includes(contact) ? 'bg-gold' : 'bg-gray-100'
                  }`}>
                    <Star className={`w-5 h-5 ${
                      onboardingData.vipContacts.includes(contact) ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900">{contact.split(' - ')[1]}</div>
                    <div className="text-sm text-navy-600">{contact.split(' - ')[0]}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-emerald-900 mb-4">🎉 Your Executive Command Center is Ready!</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-emerald-900">AI Analysis Active</div>
                  <div className="text-emerald-700">Messages prioritized</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-emerald-900">VIP Tracking</div>
                  <div className="text-emerald-700">{onboardingData.vipContacts.length} contacts marked</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-navy-500 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-emerald-900">Time Savings</div>
                  <div className="text-emerald-700">2+ hours daily</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(2)}
                className="text-navy-600 hover:text-navy-900 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="text-navy-600 hover:text-navy-900 transition-colors"
              >
                Skip VIP Selection
              </button>
            </div>
            <motion.button
              onClick={handleFinish}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-lg font-semibold bg-gradient-gold text-navy-900 hover:shadow-gold-lg transition-all flex items-center space-x-2"
            >
              <Crown className="w-5 h-5" />
              <span>Enter Command Center</span>
            </motion.button>
          </div>
        </div>

        <div className="text-sm text-gold-200">
          Step 3 of 3 • Ready to command your communications
        </div>
      </motion.div>
    </div>
  )
}