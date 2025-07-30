"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Timer, Sparkles, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { useSignupStore, EXECUTIVE_ROLES, COMPANY_SIZES, PAIN_POINTS } from '@/lib/stores/signup-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileFormData {
  name: string
  role: string
  companySize: string
  painPoints: string[]
}

export function EnhancedSignup() {
  const {
    profile,
    currentStep,
    startTime,
    updateProfile,
    nextStep,
    prevStep,
    startSignup,
    completeSignup,
    getCompletionTime,
    isProfileComplete
  } = useSignupStore()

  const [timeElapsed, setTimeElapsed] = useState(0)
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      name: profile.name || '',
      role: profile.role || '',
      companySize: profile.companySize || '',
      painPoints: profile.painPoints || []
    }
  })

  // Start timer when component mounts
  useEffect(() => {
    if (!startTime) {
      startSignup()
    }
  }, [startTime, startSignup])

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(getCompletionTime())
    }, 1000)
    return () => clearInterval(interval)
  }, [getCompletionTime])

  // Watch form changes and update store
  const watchedValues = watch()
  useEffect(() => {
    updateProfile(watchedValues)
  }, [watchedValues, updateProfile])

  // Auto-advance on role selection for speed
  const handleRoleSelect = (role: string) => {
    updateProfile({ role })
    // Auto-advance after 500ms for smooth UX
    setTimeout(() => {
      if (currentStep === 1) nextStep()
    }, 500)
  }

  // Auto-advance on company size selection
  const handleCompanySizeSelect = (size: string) => {
    updateProfile({ companySize: size })
    setTimeout(() => {
      if (currentStep === 2) nextStep()
    }, 500)
  }

  const onSubmit = (data: ProfileFormData) => {
    updateProfile(data)
    completeSignup()
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Timer */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-gold-200/20"
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Timer className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium">Setup Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-lg font-bold ${timeElapsed <= 30 ? 'text-gold-400' : 'text-gold-200'}`}>
              {Math.floor(timeElapsed)}s
            </span>
            <span className="text-xs text-gold-200">/ 30s target</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 bg-navy-800 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-gold"
          />
        </div>
      </motion.div>

      {/* Step Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Role Selection */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/95 backdrop-blur-luxury rounded-2xl p-6 shadow-luxury border border-gold-200/30"
            >
              <div className="text-center mb-6">
                <Crown className="w-8 h-8 text-gold-600 mx-auto mb-2" />
                <h3 className="text-xl font-serif font-bold text-navy-900 mb-1">
                  Your Executive Role
                </h3>
                <p className="text-sm text-navy-600">
                  Help us tailor your command center
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {EXECUTIVE_ROLES.slice(0, 12).map((role) => (
                  <motion.button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                      profile.role === role
                        ? 'border-gold-400 bg-gold-50 text-gold-800'
                        : 'border-gray-200 hover:border-gold-300 hover:bg-gold-50/50 text-navy-700'
                    }`}
                  >
                    {role}
                  </motion.button>
                ))}
              </div>

              {/* Quick name input */}
              <div className="mt-6">
                <Label className="text-navy-700 font-medium">Your Name</Label>
                <Input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Enter your name"
                  className="mt-1 border-gray-300 focus:border-gold-400 focus:ring-gold-200"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Company Size */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/95 backdrop-blur-luxury rounded-2xl p-6 shadow-luxury border border-gold-200/30"
            >
              <div className="text-center mb-6">
                <Sparkles className="w-8 h-8 text-gold-600 mx-auto mb-2" />
                <h3 className="text-xl font-serif font-bold text-navy-900 mb-1">
                  Organization Scale
                </h3>
                <p className="text-sm text-navy-600">
                  Size influences your communication patterns
                </p>
              </div>

              <div className="space-y-3">
                {COMPANY_SIZES.map((size) => (
                  <motion.button
                    key={size}
                    type="button"
                    onClick={() => handleCompanySizeSelect(size)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      profile.companySize === size
                        ? 'border-gold-400 bg-gold-50 text-gold-800'
                        : 'border-gray-200 hover:border-gold-300 hover:bg-gold-50/50 text-navy-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{size.split('(')[0].trim()}</span>
                      <span className="text-sm text-navy-500">
                        {size.includes('(') && size.split('(')[1]?.replace(')', '')}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Pain Points & Completion */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/95 backdrop-blur-luxury rounded-2xl p-6 shadow-luxury border border-gold-200/30"
            >
              <div className="text-center mb-6">
                <Check className="w-8 h-8 text-gold-600 mx-auto mb-2" />
                <h3 className="text-xl font-serif font-bold text-navy-900 mb-1">
                  Communication Challenges
                </h3>
                <p className="text-sm text-navy-600">
                  Which resonate most with your experience?
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {PAIN_POINTS.map((painPoint) => (
                  <label
                    key={painPoint}
                    className="flex items-center p-3 rounded-xl border-2 border-gray-200 hover:border-gold-300 hover:bg-gold-50/50 cursor-pointer transition-all duration-200"
                  >
                    <input
                      type="checkbox"
                      {...register('painPoints')}
                      value={painPoint}
                      className="w-4 h-4 text-gold-600 border-gray-300 rounded focus:ring-gold-200"
                    />
                    <span className="ml-3 text-sm font-medium text-navy-700">
                      {painPoint}
                    </span>
                  </label>
                ))}
              </div>

              {/* Profile Summary */}
              <div className="bg-gold-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-navy-900 mb-2">Your Executive Profile</h4>
                <div className="text-sm text-navy-700 space-y-1">
                  <p><span className="font-medium">Name:</span> {profile.name}</p>
                  <p><span className="font-medium">Role:</span> {profile.role}</p>
                  <p><span className="font-medium">Company:</span> {profile.companySize}</p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-gold hover:shadow-gold-lg text-navy-900 font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                disabled={!isProfileComplete()}
              >
                Complete Setup ({Math.floor(timeElapsed)}s)
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {currentStep < 3 && (
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="text-gold-200 hover:text-gold-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    step <= currentStep ? 'bg-gold-400' : 'bg-gold-200/30'
                  }`}
                />
              ))}
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={nextStep}
              disabled={
                (currentStep === 1 && (!profile.name || !profile.role)) ||
                (currentStep === 2 && !profile.companySize)
              }
              className="text-gold-200 hover:text-gold-100 disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}