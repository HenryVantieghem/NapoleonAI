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
  
  // Redirect to step1 by default
  useEffect(() => {
    router.push('/onboarding/step1')
  }, [router])
  
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

  // Success modal - Luxury Celebration
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-jet-black flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-champagneGold/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-32 right-16 w-96 h-96 bg-champagneGold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-champagneGold/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto relative z-10"
        >
          {/* Glassmorphic Success Card */}
          <div className="bg-jetBlack/40 backdrop-blur-executive rounded-3xl p-12 border border-champagneGold/30 shadow-private-jet-glass">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="w-32 h-32 bg-gradient-champagne/20 backdrop-blur-luxury rounded-full flex items-center justify-center mx-auto mb-8 shadow-champagne-glow border border-champagneGold/30"
            >
              <Crown className="w-16 h-16 text-champagneGold" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl font-serif font-bold text-text-primary mb-6"
            >
              Welcome to Your Command Center!
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-2xl text-text-secondary mb-8 leading-relaxed"
            >
              Your executive intelligence platform is ready to transform communication chaos into strategic clarity
            </motion.p>

            {/* Success Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-3 gap-6 mb-10"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-champagneGold mb-2">2+</div>
                <div className="text-sm text-text-secondary">Hours Saved Daily</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-champagneGold mb-2">95%</div>
                <div className="text-sm text-text-secondary">Priority Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-champagneGold mb-2">1</div>
                <div className="text-sm text-text-secondary">Unified Inbox</div>
              </div>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              onClick={() => router.push('/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-6 bg-gradient-champagne text-jetBlack rounded-2xl text-xl font-bold shadow-champagne-glow hover:shadow-champagne-lg transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <Crown className="w-6 h-6" />
              Enter Command Center
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Luxury Progress indicator
  const ProgressBar = () => (
    <div className="w-full max-w-lg mx-auto mb-12">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-medium text-text-secondary">Step {currentStep} of 3</span>
        <span className="text-lg font-medium text-champagneGold">{Math.round((currentStep / 3) * 100)}% Complete</span>
      </div>
      <div className="w-full bg-jetBlack/40 backdrop-blur-glass rounded-full h-3 border border-champagneGold/20 shadow-luxury-glass">
        <motion.div
          className="bg-gradient-champagne h-3 rounded-full shadow-champagne-glow"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / 3) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between mt-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <motion.div
              initial={false}
              animate={{
                scale: currentStep >= step ? 1.2 : 1,
                backgroundColor: currentStep >= step ? "#D4AF37" : "rgba(212, 175, 55, 0.3)"
              }}
              transition={{ duration: 0.3 }}
              className="w-3 h-3 rounded-full mb-2"
            />
            <span className={`text-sm font-medium ${currentStep >= step ? 'text-champagneGold' : 'text-text-secondary/60'}`}>
              {step === 1 ? 'Profile' : step === 2 ? 'Connect' : 'VIP Setup'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  // Step 1: Executive Profile Setup - Glassmorphic Luxury
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-jet-black flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-champagneGold/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-32 right-16 w-96 h-96 bg-midnightBlue/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-champagneGold/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto relative z-10"
        >
          {/* Luxury Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="w-24 h-24 bg-gradient-champagne/20 backdrop-blur-luxury rounded-full flex items-center justify-center mx-auto mb-8 shadow-champagne-glow border border-champagneGold/30"
            >
              <Crown className="w-12 h-12 text-champagneGold" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-6xl font-serif font-bold text-text-primary mb-6"
            >
              Welcome, {user?.firstName || 'Executive'}!
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-2xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Let's personalize your executive command center for strategic communication mastery
            </motion.p>
            
            <ProgressBar />
          </div>

          {/* Glassmorphic Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-jetBlack/40 backdrop-blur-executive rounded-3xl p-10 shadow-private-jet-glass border border-champagneGold/20"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-serif font-bold text-text-primary mb-3">Executive Profile</h2>
              <p className="text-xl text-text-secondary">Complete in under 60 seconds • Your time is precious</p>
            </div>
            
            {/* Role Selection with Animation */}
            <div className="mb-12">
              <h3 className="text-2xl font-serif font-semibold text-text-primary mb-6 text-center">Select Your Executive Role</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {executiveRoles.map((roleOption, index) => (
                  <motion.div
                    key={roleOption.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <SelectableCard
                      icon={roleOption.icon}
                      title={roleOption.title}
                      description={roleOption.description}
                      selected={role === roleOption.id}
                      onClick={() => setRole(roleOption.id)}
                      variant="luxury"
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pain Points with Staggered Animation */}
            <div className="mb-12">
              <h3 className="text-2xl font-serif font-semibold text-text-primary mb-3 text-center">
                Communication Challenges
              </h3>
              <p className="text-lg text-text-secondary mb-8 text-center">
                Select up to 3 areas where you need the most support
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {painPoints.map((point, index) => (
                  <motion.div
                    key={point.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <SelectableCard
                      icon={<Zap className="w-6 h-6" />}
                      title={point.title}
                      description={point.description}
                      selected={selectedPainPoints.includes(point.id)}
                      onClick={() => togglePainPoint(point.id)}
                      variant="luxury"
                      disabled={!selectedPainPoints.includes(point.id) && selectedPainPoints.length >= 3}
                    />
                  </motion.div>
                ))}
              </div>
              {selectedPainPoints.length >= 3 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-champagneGold font-medium mt-4"
                >
                  Perfect! You've selected your priority areas.
                </motion.p>
              )}
            </div>

            {/* Luxury Actions */}
            <div className="flex justify-between items-center pt-8 border-t border-champagneGold/20">
              <div className="flex space-x-6">
                <button
                  onClick={handleSkip}
                  className="text-text-secondary hover:text-text-primary transition-colors text-lg font-medium"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleConcierge}
                  className="text-champagneGold hover:text-champagneGold/80 transition-colors flex items-center space-x-2 text-lg font-medium"
                >
                  <Phone className="w-5 h-5" />
                  <span>Schedule Concierge</span>
                </button>
              </div>
              
              <motion.button
                onClick={nextStep}
                disabled={!role}
                whileHover={role ? { scale: 1.05 } : {}}
                whileTap={role ? { scale: 0.95 } : {}}
                className={`px-8 py-4 rounded-2xl text-xl font-bold transition-all flex items-center space-x-3 ${
                  role
                    ? 'bg-gradient-champagne text-jetBlack shadow-champagne-glow hover:shadow-champagne-lg'
                    : 'bg-jetBlack/20 border border-champagneGold/20 text-text-secondary/50 cursor-not-allowed'
                }`}
              >
                <span>Continue to Connections</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Step 2: Platform Connections - Glassmorphic Luxury
  if (currentStep === 2) {
    const gmailAccount = connectedAccounts.find(acc => acc.provider === 'gmail')
    const isGmailConnected = gmailAccount?.status === 'connected'
    
    return (
      <div className="min-h-screen bg-gradient-jet-black flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-champagneGold/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-32 right-16 w-96 h-96 bg-midnightBlue/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-champagneGold/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          {/* Luxury Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="w-24 h-24 bg-gradient-champagne/20 backdrop-blur-luxury rounded-full flex items-center justify-center mx-auto mb-8 shadow-champagne-glow border border-champagneGold/30"
            >
              <Crown className="w-12 h-12 text-champagneGold" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-6xl font-serif font-bold text-text-primary mb-6"
            >
              Connect Your Platforms
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-2xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Unify your communication channels for strategic clarity and executive intelligence
            </motion.p>
            
            <ProgressBar />
          </div>

          {/* Glassmorphic Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-jetBlack/40 backdrop-blur-executive rounded-3xl p-10 shadow-private-jet-glass border border-champagneGold/20"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-serif font-bold text-text-primary mb-3">Platform Integration</h2>
              <p className="text-xl text-text-secondary">Connect Gmail now • Slack and Teams launching in Phase 2</p>
            </div>
            
            <div className="space-y-6 mb-12">
              {/* Gmail Connection - Luxury Card */}
              <motion.button
                onClick={handleGmailConnect}
                disabled={isGmailConnected || isLoading}
                whileHover={!isGmailConnected && !isLoading ? { scale: 1.02 } : {}}
                whileTap={!isGmailConnected && !isLoading ? { scale: 0.98 } : {}}
                className={`w-full flex items-center justify-between p-6 rounded-2xl border transition-all ${
                  isGmailConnected
                    ? 'border-emerald-400 bg-emerald-500/10 backdrop-blur-glass shadow-emerald-500/20 shadow-lg'
                    : isLoading && gmailAccount?.status === 'connecting'
                    ? 'border-champagneGold bg-champagneGold/10 backdrop-blur-glass shadow-champagne'
                    : 'border-champagneGold/20 bg-jetBlack/20 backdrop-blur-glass hover:border-champagneGold/40 hover:bg-champagneGold/5 hover:shadow-champagne'
                }`}
              >
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-red-500/20 backdrop-blur-glass rounded-2xl flex items-center justify-center border border-red-400/30">
                    <Mail className="w-8 h-8 text-red-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-serif font-bold text-text-primary">Gmail</div>
                    <div className="text-lg text-text-secondary">
                      {isGmailConnected ? 'Connected successfully • Ready for intelligence' : 'Connect your Gmail account for unified inbox'}
                    </div>
                  </div>
                </div>
                
                {isGmailConnected ? (
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                ) : isLoading && gmailAccount?.status === 'connecting' ? (
                  <div className="w-8 h-8 border-2 border-champagneGold border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-8 h-8 text-champagneGold" />
                )}
              </motion.button>

              {/* Coming Soon Integrations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="w-full flex items-center justify-between p-6 rounded-2xl border border-champagneGold/10 bg-jetBlack/10 backdrop-blur-glass opacity-60"
              >
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-glass rounded-2xl flex items-center justify-center border border-purple-400/20">
                    <MessageSquare className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-serif font-bold text-text-primary">Slack</div>
                    <div className="text-lg text-text-secondary">Team communication integration • Coming in Phase 2</div>
                  </div>
                </div>
                <Clock className="w-8 h-8 text-text-secondary/50" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="w-full flex items-center justify-between p-6 rounded-2xl border border-champagneGold/10 bg-jetBlack/10 backdrop-blur-glass opacity-60"
              >
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-glass rounded-2xl flex items-center justify-center border border-blue-400/20">
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-serif font-bold text-text-primary">Microsoft Teams</div>
                    <div className="text-lg text-text-secondary">Enterprise collaboration platform • Coming in Phase 2</div>
                  </div>
                </div>
                <Clock className="w-8 h-8 text-text-secondary/50" />
              </motion.div>
            </div>

            {/* Connection Progress */}
            {isGmailConnected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-emerald-500/10 backdrop-blur-glass rounded-2xl p-6 mb-8 border border-emerald-400/20"
              >
                <div className="flex items-center justify-center space-x-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                  <div className="text-center">
                    <div className="text-xl font-serif font-bold text-text-primary mb-2">Platform Connected</div>
                    <div className="text-text-secondary">Your Gmail is now unified with Napoleon AI intelligence</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Luxury Actions */}
            <div className="flex justify-between items-center pt-8 border-t border-champagneGold/20">
              <div className="flex space-x-6">
                <button
                  onClick={prevStep}
                  className="text-text-secondary hover:text-text-primary transition-colors text-lg font-medium"
                >
                  Back to Profile
                </button>
                <button
                  onClick={handleConcierge}
                  className="text-champagneGold hover:text-champagneGold/80 transition-colors flex items-center space-x-2 text-lg font-medium"
                >
                  <Phone className="w-5 h-5" />
                  <span>Need Integration Help?</span>
                </button>
              </div>
              
              <motion.button
                onClick={nextStep}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-2xl text-xl font-bold bg-gradient-champagne text-jetBlack shadow-champagne-glow hover:shadow-champagne-lg transition-all flex items-center space-x-3"
              >
                <span>Continue to VIP Setup</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Step 3: VIP Configuration - Glassmorphic Luxury
  return (
    <div className="min-h-screen bg-gradient-jet-black flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-champagneGold/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-32 right-16 w-96 h-96 bg-midnightBlue/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-champagneGold/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto relative z-10"
        >
          {/* Luxury Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="w-24 h-24 bg-gradient-champagne/20 backdrop-blur-luxury rounded-full flex items-center justify-center mx-auto mb-8 shadow-champagne-glow border border-champagneGold/30"
            >
              <Crown className="w-12 h-12 text-champagneGold" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-6xl font-serif font-bold text-text-primary mb-6"
            >
              Select Your VIP Contacts
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-2xl text-text-secondary mb-8 max-w-4xl mx-auto leading-relaxed"
            >
              Mark board members, investors, and key stakeholders for priority treatment. AI will ensure their messages never go unnoticed.
            </motion.p>
            
            <ProgressBar />
          </div>

          {/* Glassmorphic Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-jetBlack/40 backdrop-blur-executive rounded-3xl p-10 shadow-private-jet-glass border border-champagneGold/20"
          >
            {/* Header with Selection Counter */}
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-serif font-bold text-text-primary mb-2">VIP Intelligence Network</h2>
                <p className="text-xl text-text-secondary">AI prioritizes messages from these critical relationships</p>
              </div>
              <div className="text-right">
                <div className="bg-champagneGold/10 backdrop-blur-glass rounded-2xl px-6 py-4 border border-champagneGold/20">
                  <div className="text-2xl font-bold text-champagneGold">
                    {vipContacts.length}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {vipContacts.length >= 3 ? 'VIPs Selected' : `Need ${3 - vipContacts.length} more`}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Luxury Search */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-champagneGold/60" />
              <input
                type="text"
                placeholder="Search executives, board members, investors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-12 py-4 bg-jetBlack/20 backdrop-blur-glass border border-champagneGold/20 rounded-2xl text-text-primary placeholder-text-secondary/60 focus:border-champagneGold/40 focus:ring-2 focus:ring-champagneGold/20 transition-all text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-champagneGold/60 hover:text-champagneGold transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* VIP Contacts Grid with Luxury Styling */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {filteredContacts.map((contact, index) => (
                  <motion.div
                    key={contact.email}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <VipCard
                      contact={contact}
                      selected={vipContacts.some(v => v.email === contact.email)}
                      onToggle={() => toggleVipContact(contact)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* No Results State */}
            {filteredContacts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-champagneGold/10 backdrop-blur-glass rounded-full flex items-center justify-center mx-auto mb-6 border border-champagneGold/20">
                  <Search className="w-10 h-10 text-champagneGold/60" />
                </div>
                <div className="text-xl text-text-secondary mb-4">No contacts found matching your search</div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-champagneGold hover:text-champagneGold/80 transition-colors text-lg font-medium"
                >
                  Clear search and view all contacts
                </button>
              </motion.div>
            )}

            {/* Selection Progress */}
            {vipContacts.length >= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-champagneGold/10 backdrop-blur-glass rounded-2xl p-6 mb-8 border border-champagneGold/20"
              >
                <div className="flex items-center justify-center space-x-4">
                  <CheckCircle className="w-8 h-8 text-champagneGold" />
                  <div className="text-center">
                    <div className="text-xl font-serif font-bold text-text-primary mb-2">VIP Network Ready</div>
                    <div className="text-text-secondary">Your priority contacts are configured for executive intelligence</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Luxury Actions */}
            <div className="flex justify-between items-center pt-8 border-t border-champagneGold/20">
              <div className="flex space-x-6">
                <button
                  onClick={prevStep}
                  className="text-text-secondary hover:text-text-primary transition-colors text-lg font-medium"
                >
                  Back to Connections
                </button>
                <button
                  onClick={handleSkip}
                  className="text-text-secondary hover:text-text-primary transition-colors text-lg font-medium"
                >
                  Skip VIP Selection
                </button>
                <button
                  onClick={handleConcierge}
                  className="text-champagneGold hover:text-champagneGold/80 transition-colors flex items-center space-x-2 text-lg font-medium"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Schedule Setup Call</span>
                </button>
              </div>
              
              <motion.button
                onClick={handleComplete}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 rounded-2xl text-xl font-bold bg-gradient-champagne text-jetBlack shadow-champagne-glow hover:shadow-champagne-lg transition-all flex items-center space-x-3"
              >
                <Crown className="w-6 h-6" />
                <span>Enter Command Center</span>
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
    </div>
  )
}