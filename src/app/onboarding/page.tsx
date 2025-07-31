"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Crown, Building, UserPlus, Zap, MessageSquare, Clock, Mail, Users, Star, CheckCircle, ArrowRight, ChevronRight, Calendar, Phone, Search, Filter, X } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"
import { useOnboardingStore } from "@/stores/onboardingStore"
import SelectableCard from "@/components/onboarding/SelectableCard"
import VipCard from "@/components/onboarding/VipCard"
import { mockVipContacts, getSuggestedVipContacts, searchVipContacts } from "@/lib/mockVipContacts"
import confetti from 'canvas-confetti'

export const dynamic = 'force-dynamic'

// Executive roles with luxury icons
const executiveRoles = [
  { id: 'ceo', title: 'CEO', description: 'Chief Executive Officer', icon: <Crown className="w-6 h-6" /> },
  { id: 'coo', title: 'COO', description: 'Chief Operating Officer', icon: <Building className="w-6 h-6" /> },
  { id: 'cfo', title: 'CFO', description: 'Chief Financial Officer', icon: <Zap className="w-6 h-6" /> },
  { id: 'cto', title: 'CTO', description: 'Chief Technology Officer', icon: <MessageSquare className="w-6 h-6" /> },
  { id: 'founder', title: 'Founder', description: 'Company Founder', icon: <Star className="w-6 h-6" /> },
  { id: 'vp', title: 'VP', description: 'Vice President', icon: <UserPlus className="w-6 h-6" /> },
  { id: 'director', title: 'Director', description: 'Executive Director', icon: <Building className="w-6 h-6" /> },
  { id: 'other', title: 'Other', description: 'Other Executive Role', icon: <Users className="w-6 h-6" /> }
]

// Executive pain points
const painPoints = [
  { id: 'email-overload', title: 'Email Overload', description: 'Too many messages to process' },
  { id: 'prioritization', title: 'Prioritization', description: 'Difficulty identifying urgent items' },
  { id: 'meetings', title: 'Meeting Prep', description: 'Context switching between calls' },
  { id: 'responsiveness', title: 'Responsiveness', description: 'Delayed responses to stakeholders' },
  { id: 'clarity', title: 'Strategic Clarity', description: 'Information scattered across platforms' },
  { id: 'delegation', title: 'Delegation', description: 'Hard to share context with team' }
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const supabase = createClient()
  
  // Zustand store
  const {
    currentStep,
    role,
    painPoints: selectedPainPoints,
    connectedAccounts,
    vipContacts,
    onboardingComplete,
    setRole,
    togglePainPoint,
    setAccountStatus,
    toggleVipContact,
    nextStep,
    prevStep,
    completeOnboarding,
    requestSkip,
    requestConcierge
  } = useOnboardingStore()
  
  // Local state
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredContacts, setFilteredContacts] = useState(mockVipContacts)
  const [suggestedContacts, setSuggestedContacts] = useState<typeof mockVipContacts>([])

  // Initialize suggested contacts based on role
  useEffect(() => {
    if (role) {
      const suggested = getSuggestedVipContacts(role, 12)
      setSuggestedContacts(suggested)
      setFilteredContacts(suggested)
    }
  }, [role])

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchVipContacts(searchQuery)
      setFilteredContacts(results)
    } else {
      setFilteredContacts(suggestedContacts)
    }
  }, [searchQuery, suggestedContacts])

  // Handle Gmail OAuth
  const handleGmailConnect = async () => {
    setIsLoading(true)
    setAccountStatus('gmail', 'connecting')
    
    try {
      // Simulate OAuth flow for MVP
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In production, this would be:
      // const { error } = await supabase.auth.signInWithOAuth({
      //   provider: 'google',
      //   options: {
      //     scopes: 'https://www.googleapis.com/auth/gmail.readonly',
      //     redirectTo: `${window.location.origin}/onboarding?step=2&connected=gmail`
      //   }
      // })
      
      setAccountStatus('gmail', 'connected', 'user@gmail.com')
      
      // Haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
      
    } catch (error) {
      console.error('Gmail connection error:', error)
      setAccountStatus('gmail', 'error', undefined, 'Connection failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle skip with persistence
  const handleSkip = async () => {
    requestSkip()
    await persistProgress()
    router.push('/dashboard')
  }

  // Handle concierge request
  const handleConcierge = () => {
    requestConcierge()
    // In production, would open calendar widget
    alert('Concierge call scheduling coming soon! Your request has been noted.')
  }

  // Handle completion
  const handleComplete = async () => {
    completeOnboarding()
    await persistProgress()
    
    // Trigger confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#1B2951', '#10B981']
    })
    
    setShowSuccess(true)
    
    // Auto-redirect after celebration
    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)
  }

  // Persist progress to Supabase
  const persistProgress = async () => {
    if (!user) return
    
    try {
      // Update user preferences
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          profile_data: {
            role,
            painPoints: selectedPainPoints,
            onboardingStep: currentStep
          },
          onboarding_completed: onboardingComplete,
          updated_at: new Date().toISOString()
        })
        
      if (error) {
        console.error('Error persisting onboarding progress:', error)
      }
    } catch (error) {
      console.error('Persistence error:', error)
    }
  }

  // Success modal
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-gold-lg">
            <Crown className="w-12 h-12 text-navy-900" />
          </div>
          
          <h1 className="text-4xl font-serif font-bold text-white mb-4">
            Welcome to Your Command Center!
          </h1>
          
          <p className="text-xl text-gold-200 mb-8">
            Your executive intelligence platform is ready
          </p>
          
          <motion.button
            onClick={() => router.push('/dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-gold text-navy-900 rounded-xl font-semibold shadow-gold-lg hover:shadow-gold-xl transition-all"
          >
            Enter Dashboard
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // Progress indicator
  const ProgressBar = () => (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gold-200">Step {currentStep} of 3</span>
        <span className="text-sm text-gold-200">{Math.round((currentStep / 3) * 100)}% complete</span>
      </div>
      <div className="w-full bg-navy-800 rounded-full h-2">
        <motion.div
          className="bg-gradient-gold h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / 3) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  )

  // Step 1: Profile Setup
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold-lg">
              <Crown className="w-10 h-10 text-navy-900" />
            </div>
            
            <h1 className="text-4xl font-serif font-bold text-white mb-4">
              Welcome, {user?.firstName || 'Executive'}!
            </h1>
            
            <p className="text-xl text-gold-200 mb-6">
              Let's personalize your executive command center
            </p>
            
            <ProgressBar />
          </div>

          {/* Main Content */}
          <div className="bg-white/95 backdrop-blur-luxury rounded-2xl p-8 shadow-luxury border border-gold-200/20">
            <h2 className="text-2xl font-serif font-semibold text-navy-900 mb-2">Executive Profile</h2>
            <p className="text-navy-600 mb-8">Complete in under 60 seconds</p>
            
            {/* Role Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Your Executive Role</h3>
              <div className="grid md:grid-cols-4 gap-3">
                {executiveRoles.map((roleOption) => (
                  <SelectableCard
                    key={roleOption.id}
                    icon={roleOption.icon}
                    title={roleOption.title}
                    description={roleOption.description}
                    selected={role === roleOption.id}
                    onClick={() => setRole(roleOption.id)}
                    variant="compact"
                  />
                ))}
              </div>
            </div>

            {/* Pain Points */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-navy-900 mb-2">
                Top Communication Challenges 
                <span className="text-sm font-normal text-navy-600 ml-2">(Select up to 3)</span>
              </h3>
              <div className="grid md:grid-cols-3 gap-3">
                {painPoints.map((point) => (
                  <SelectableCard
                    key={point.id}
                    icon={<Zap className="w-5 h-5" />}
                    title={point.title}
                    description={point.description}
                    selected={selectedPainPoints.includes(point.id)}
                    onClick={() => togglePainPoint(point.id)}
                    variant="compact"
                    disabled={!selectedPainPoints.includes(point.id) && selectedPainPoints.length >= 3}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button
                  onClick={handleSkip}
                  className="text-navy-600 hover:text-navy-900 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleConcierge}
                  className="text-gold-600 hover:text-gold-700 transition-colors flex items-center space-x-1"
                >
                  <Phone className="w-4 h-4" />
                  <span>Schedule Concierge</span>
                </button>
              </div>
              
              <motion.button
                onClick={nextStep}
                disabled={!role}
                whileHover={role ? { scale: 1.05 } : {}}
                whileTap={role ? { scale: 0.95 } : {}}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                  role
                    ? 'bg-gradient-gold text-navy-900 hover:shadow-gold-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Step 2: Connect Accounts  
  if (currentStep === 2) {
    const gmailAccount = connectedAccounts.find(acc => acc.provider === 'gmail')
    const isGmailConnected = gmailAccount?.status === 'connected'
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold-lg">
              <Crown className="w-10 h-10 text-navy-900" />
            </div>
            
            <h1 className="text-4xl font-serif font-bold text-white mb-4">
              Connect Your Platforms
            </h1>
            
            <p className="text-xl text-gold-200 mb-6">
              Unify your communication channels for strategic clarity
            </p>
            
            <ProgressBar />
          </div>

          {/* Main Content */}
          <div className="bg-white/95 backdrop-blur-luxury rounded-2xl p-8 shadow-luxury border border-gold-200/20">
            <h2 className="text-2xl font-serif font-semibold text-navy-900 mb-2">Platform Integration</h2>
            <p className="text-navy-600 mb-8">Connect Gmail now. Slack and Teams in Phase 2.</p>
            
            <div className="space-y-4 mb-8">
              {/* Gmail Connection */}
              <motion.button
                onClick={handleGmailConnect}
                disabled={isGmailConnected || isLoading}
                whileHover={!isGmailConnected && !isLoading ? { scale: 1.02 } : {}}
                whileTap={!isGmailConnected && !isLoading ? { scale: 0.98 } : {}}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  isGmailConnected
                    ? 'border-emerald-500 bg-emerald-50'
                    : isLoading && gmailAccount?.status === 'connecting'
                    ? 'border-gold bg-gold-50'
                    : 'border-gray-200 hover:border-gold hover:bg-gold-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-navy-900">Gmail</div>
                    <div className="text-sm text-navy-600">
                      {isGmailConnected ? 'Connected successfully' : 'Connect your Gmail account'}
                    </div>
                  </div>
                </div>
                
                {isGmailConnected ? (
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                ) : isLoading && gmailAccount?.status === 'connecting' ? (
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-6 h-6 text-navy-600" />
                )}
              </motion.button>

              {/* Placeholder integrations */}
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

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button
                  onClick={prevStep}
                  className="text-navy-600 hover:text-navy-900 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConcierge}
                  className="text-gold-600 hover:text-gold-700 transition-colors flex items-center space-x-1"
                >
                  <Phone className="w-4 h-4" />
                  <span>Need Help?</span>
                </button>
              </div>
              
              <motion.button
                onClick={nextStep}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl font-semibold bg-gradient-gold text-navy-900 hover:shadow-gold-lg transition-all flex items-center space-x-2"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Step 3: VIP Configuration
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold-lg">
            <Crown className="w-10 h-10 text-navy-900" />
          </div>
          
          <h1 className="text-4xl font-serif font-bold text-white mb-4">
            Select Your VIP Contacts
          </h1>
          
          <p className="text-xl text-gold-200 mb-6">
            Mark board members, investors, and key stakeholders for priority treatment
          </p>
          
          <ProgressBar />
        </div>

        {/* Main Content */}
        <div className="bg-white/95 backdrop-blur-luxury rounded-2xl p-8 shadow-luxury border border-gold-200/20">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-serif font-semibold text-navy-900">VIP Intelligence</h2>
              <p className="text-navy-600">AI will prioritize messages from these contacts</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gold-600">
                Selected {vipContacts.length}
              </div>
              <div className="text-sm text-navy-600">
                {vipContacts.length >= 3 ? 'Minimum reached' : `Select ${3 - vipContacts.length} more`}
              </div>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* VIP Contacts Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {filteredContacts.map((contact, index) => (
                <motion.div
                  key={contact.email}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <VipCard
                    contact={contact}
                    selected={vipContacts.some(v => v.email === contact.email)}
                    onClick={() => toggleVipContact(contact)}
                    showSource
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* No results */}
          {filteredContacts.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">No contacts found</div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-gold-600 hover:text-gold-700 transition-colors"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <button
                onClick={prevStep}
                className="text-navy-600 hover:text-navy-900 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSkip}
                className="text-navy-600 hover:text-navy-900 transition-colors"
              >
                Skip VIP Selection
              </button>
              <button
                onClick={handleConcierge}
                className="text-gold-600 hover:text-gold-700 transition-colors flex items-center space-x-1"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Setup Call</span>
              </button>
            </div>
            
            <motion.button
              onClick={handleComplete}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl font-semibold bg-gradient-gold text-navy-900 hover:shadow-gold-lg transition-all flex items-center space-x-2"
            >
              <Crown className="w-5 h-5" />
              <span>Enter Command Center</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}