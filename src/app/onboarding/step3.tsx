'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Card } from '@/components/ui/luxury-card'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/luxury-button'
import VipCard from '@/components/onboarding/VipCard'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { ChevronLeft, Search, Plus, Sparkles } from 'lucide-react'
import { mockVipContacts } from '@/lib/mockVipContacts'

export default function OnboardingStep3() {
  const router = useRouter()
  const { vipContacts, addVipContact, removeVipContact, completeOnboarding } = useOnboardingStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCustomAdd, setShowCustomAdd] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customEmail, setCustomEmail] = useState('')
  const [showCelebration, setShowCelebration] = useState(false)

  const filteredContacts = mockVipContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.relationshipType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleVipToggle = (contact: typeof mockVipContacts[0]) => {
    const isSelected = vipContacts.some(c => c.email === contact.email)
    if (isSelected) {
      removeVipContact(contact.email)
    } else {
      addVipContact(contact)
    }
  }

  const handleAddCustom = () => {
    if (customName && customEmail) {
      addVipContact({
        name: customName,
        email: customEmail,
        relationshipType: 'Other',
        source: 'manual' as const,
      })
      setCustomName('')
      setCustomEmail('')
      setShowCustomAdd(false)
    }
  }

  const handleComplete = async () => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#1B2951', '#FFFFFF'],
    })

    setShowCelebration(true)
    await completeOnboarding()
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  const handleBack = () => {
    router.push('/onboarding/step2')
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  if (showCelebration) {
    return (
      <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Sparkles className="w-16 h-16 text-gold mx-auto mb-4" />
          <Typography variant="h1" className="text-navy mb-4">
            Welcome to Napoleon AI!
          </Typography>
          <Typography variant="body" className="text-gray-600">
            Your executive command center is ready.
          </Typography>
        </motion.div>
      </div>
    )
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
              Define Your VIPs
            </Typography>
            <Typography variant="body" className="text-gray-600">
              Never miss critical communications (90 seconds)
            </Typography>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or relationship..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredContacts.map((contact) => (
              <VipCard
                key={contact.email}
                contact={contact}
                selected={vipContacts.some(c => c.email === contact.email)}
                onToggle={() => handleVipToggle(contact)}
              />
            ))}
          </div>

          {!showCustomAdd ? (
            <Button
              variant="outline"
              onClick={() => setShowCustomAdd(true)}
              className="mt-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Custom VIP
            </Button>
          ) : (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-navy/20"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-navy/20"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleAddCustom}
                  disabled={!customName || !customEmail}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCustomAdd(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-gold/10 rounded-lg">
            <Typography variant="body-sm" className="text-navy">
              💡 <strong>Pro tip:</strong> You can always update your VIP list from the dashboard settings.
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
                onClick={handleComplete}
                className="bg-gradient-gold"
              >
                Complete Setup
              </Button>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
              <div className="w-2 h-2 bg-gold rounded-full" />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}