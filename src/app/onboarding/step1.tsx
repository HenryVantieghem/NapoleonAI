'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/luxury-card'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/luxury-button'
import SelectableCard from '@/components/onboarding/SelectableCard'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { Briefcase, Target, Clock, Users, ChevronRight } from 'lucide-react'

const roles = [
  { id: 'ceo', label: 'CEO', icon: Briefcase },
  { id: 'cto', label: 'CTO', icon: Target },
  { id: 'cfo', label: 'CFO', icon: Clock },
  { id: 'other_c_suite', label: 'Other C-Suite', icon: Users },
]

const painPoints = [
  { id: 'email_overload', label: 'Email Overload' },
  { id: 'meeting_fatigue', label: 'Meeting Fatigue' },
  { id: 'priority_chaos', label: 'Priority Chaos' },
  { id: 'context_switching', label: 'Context Switching' },
]

export default function OnboardingStep1() {
  const router = useRouter()
  const { role, painPoints: selectedPainPoints, setRole, togglePainPoint } = useOnboardingStore()
  const [localRole, setLocalRole] = useState(role)
  const [localPainPoints, setLocalPainPoints] = useState<string[]>(selectedPainPoints)

  const handleRoleSelect = (roleId: string) => {
    setLocalRole(roleId)
  }

  const handlePainPointToggle = (painPointId: string) => {
    setLocalPainPoints(prev =>
      prev.includes(painPointId)
        ? prev.filter(id => id !== painPointId)
        : [...prev, painPointId]
    )
  }

  const handleContinue = () => {
    setRole(localRole)
    // Update pain points using the store's API
    localPainPoints.forEach(point => {
      if (!selectedPainPoints.includes(point)) {
        togglePainPoint(point)
      }
    })
    router.push('/onboarding/step2')
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
              Welcome to Napoleon AI
            </Typography>
            <Typography variant="body" className="text-gray-600">
              Let's personalize your executive command center (60 seconds)
            </Typography>
          </div>

          <div className="space-y-8">
            <div>
              <Typography variant="h3" className="text-navy mb-4">
                Select your role
              </Typography>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {roles.map((r) => (
                  <SelectableCard
                    key={r.id}
                    icon={<r.icon className="w-8 h-8 text-navy" />}
                    title={r.label}
                    description={`Executive ${r.label.toLowerCase()} role`}
                    selected={localRole === r.id}
                    onClick={() => handleRoleSelect(r.id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <Typography variant="h3" className="text-navy mb-4">
                What's consuming your time? (Select all that apply)
              </Typography>
              <div className="grid grid-cols-2 gap-4">
                {painPoints.map((p) => (
                  <SelectableCard
                    key={p.id}
                    icon={<Clock className="w-6 h-6 text-navy" />}
                    title={p.label}
                    description="Common executive challenge"
                    selected={localPainPoints.includes(p.id)}
                    onClick={() => handlePainPointToggle(p.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-500"
            >
              Skip Setup
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!localRole}
              className="flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-gold rounded-full" />
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}