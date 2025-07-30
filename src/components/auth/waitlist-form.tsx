"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Crown, Mail, Sparkles, Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EXECUTIVE_ROLES } from '@/lib/stores/signup-store'

interface WaitlistFormData {
  email: string
  name: string
  role: string
  company: string
  priority: 'urgent' | 'high' | 'normal'
}

export function WaitlistForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<WaitlistFormData>()

  const onSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true)
    
    try {
      // TODO: Integrate with actual waitlist API (Supabase or external service)
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      
      // Store in localStorage for now (replace with actual API)
      const waitlistEntry = {
        ...data,
        timestamp: new Date().toISOString(),
        source: 'napoleon-ai-landing'
      }
      
      localStorage.setItem('napoleon-waitlist-entry', JSON.stringify(waitlistEntry))
      setIsSubmitted(true)
    } catch (error) {
      console.error('Waitlist submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 backdrop-blur-luxury rounded-2xl p-8 shadow-luxury border border-gold-200/30 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Check className="w-8 h-8 text-navy-900" />
        </motion.div>
        
        <h3 className="text-2xl font-serif font-bold text-navy-900 mb-2">
          Welcome to the Command Center
        </h3>
        
        <p className="text-navy-600 mb-6">
          You're now on the exclusive waitlist for Napoleon AI. We'll notify you as soon as your executive command center is ready.
        </p>
        
        <div className="bg-gold-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-navy-900 mb-2">What happens next?</h4>
          <div className="text-sm text-navy-700 space-y-2 text-left">
            <div className="flex items-center">
              <Sparkles className="w-4 h-4 text-gold-600 mr-2 flex-shrink-0" />
              <span>Priority access based on executive level</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 text-gold-600 mr-2 flex-shrink-0" />
              <span>Personal onboarding session with our team</span>
            </div>
            <div className="flex items-center">
              <Crown className="w-4 h-4 text-gold-600 mr-2 flex-shrink-0" />
              <span>Exclusive features designed for C-suite users</span>
            </div>
          </div>
        </div>
        
        <Button
          onClick={() => window.location.href = '/'}
          className="bg-gradient-gold hover:shadow-gold-lg text-navy-900 font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
        >
          Return to Homepage
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/95 backdrop-blur-luxury rounded-2xl p-6 shadow-luxury border border-gold-200/30"
    >
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-3">
          <Crown className="w-6 h-6 text-navy-900" />
        </div>
        <h3 className="text-xl font-serif font-bold text-navy-900 mb-1">
          Join the Executive Waitlist
        </h3>
        <p className="text-sm text-navy-600">
          Be among the first executives to command their communications with AI
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <Label className="text-navy-700 font-medium">Executive Email</Label>
          <Input
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            placeholder="your.email@company.com"
            className="mt-1 border-gray-300 focus:border-gold-400 focus:ring-gold-200"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <Label className="text-navy-700 font-medium">Full Name</Label>
          <Input
            {...register('name', { required: 'Name is required' })}
            placeholder="Your full name"
            className="mt-1 border-gray-300 focus:border-gold-400 focus:ring-gold-200"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <Label className="text-navy-700 font-medium">Executive Role</Label>
          <select
            {...register('role', { required: 'Role is required' })}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gold-400 focus:ring-gold-200 bg-white"
          >
            <option value="">Select your role</option>
            {EXECUTIVE_ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          {errors.role && (
            <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
          )}
        </div>

        {/* Company */}
        <div>
          <Label className="text-navy-700 font-medium">Company</Label>
          <Input
            {...register('company', { required: 'Company is required' })}
            placeholder="Your company name"
            className="mt-1 border-gray-300 focus:border-gold-400 focus:ring-gold-200"
          />
          {errors.company && (
            <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>
          )}
        </div>

        {/* Priority Level */}
        <div>
          <Label className="text-navy-700 font-medium">Access Priority</Label>
          <div className="mt-2 space-y-2">
            {[
              { value: 'urgent', label: 'Urgent - Need immediate access', badge: 'VIP' },
              { value: 'high', label: 'High - Ready to evaluate soon', badge: 'Priority' },
              { value: 'normal', label: 'Normal - Interested in updates', badge: 'Standard' }
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gold-300 hover:bg-gold-50/50 cursor-pointer transition-all duration-200"
              >
                <input
                  type="radio"
                  {...register('priority', { required: 'Priority is required' })}
                  value={option.value}
                  className="w-4 h-4 text-gold-600 border-gray-300 focus:ring-gold-200"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-navy-700">
                      {option.label}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      option.value === 'urgent' ? 'bg-gold-100 text-gold-800' :
                      option.value === 'high' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {option.badge}
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.priority && (
            <p className="text-red-500 text-xs mt-1">{errors.priority.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-gold hover:shadow-gold-lg text-navy-900 font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin mr-2" />
              Joining Waitlist...
            </div>
          ) : (
            <>
              Join Executive Waitlist
              <Crown className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-xs text-navy-500">
          Priority access for C-suite executives. We respect your time and privacy.
        </p>
      </div>
    </motion.div>
  )
}