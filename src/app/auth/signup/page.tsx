"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SignUp, useUser, useClerk } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Crown, Shield, Sparkles, Mail, MessageSquare, Users, CheckCircle, Building } from "lucide-react"

// Zod schema for form validation
const signUpSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["ceo", "coo", "cfo", "cto", "founder", "vp", "director", "manager", "entrepreneur", "other"], {
    required_error: "Please select your role"
  }),
  companySize: z.enum(["1-10", "11-50", "51-200", "200+"], {
    required_error: "Please select your company size"
  }),
  consentTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions"
  })
})

type SignUpFormData = z.infer<typeof signUpSchema>

const roleOptions = [
  { value: "ceo", label: "CEO", description: "Chief Executive Officer" },
  { value: "coo", label: "COO", description: "Chief Operating Officer" },
  { value: "cfo", label: "CFO", description: "Chief Financial Officer" },
  { value: "cto", label: "CTO", description: "Chief Technology Officer" },
  { value: "founder", label: "Founder", description: "Company Founder" },
  { value: "vp", label: "VP", description: "Vice President" },
  { value: "director", label: "Director", description: "Executive Director" },
  { value: "manager", label: "Manager", description: "Senior Manager" },
  { value: "entrepreneur", label: "Entrepreneur", description: "Business Owner" },
  { value: "other", label: "Other", description: "Other Executive Role" }
]

const companySizeOptions = [
  { value: "1-10", label: "1-10 employees", description: "Startup/Small team" },
  { value: "11-50", label: "11-50 employees", description: "Growing company" },
  { value: "51-200", label: "51-200 employees", description: "Mid-size company" },
  { value: "200+", label: "200+ employees", description: "Large enterprise" }
]

export default function SignUpPage() {
  const router = useRouter()
  const { user } = useUser()
  const { clerk } = useClerk()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [profileStored, setProfileStored] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema)
  })

  const handleProfileSubmit = async (data: SignUpFormData) => {
    setIsSubmitting(true)
    try {
      // Store profile data in localStorage to be set as public metadata after signup
      localStorage.setItem('pendingProfile', JSON.stringify(data))
      setProfileStored(true)
      
      // Show Clerk signup component
      setShowForm(false)
      
      console.log('Profile data stored:', data)
    } catch (error) {
      console.error('Error storing profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Effect to handle user creation and metadata setting
  useEffect(() => {
    const handleUserCreated = async () => {
      if (user && profileStored) {
        try {
          const pendingProfile = localStorage.getItem('pendingProfile')
          if (pendingProfile) {
            const profileData = JSON.parse(pendingProfile)
            
            // Update user's public metadata with profile data
            await user.update({
              publicMetadata: {
                ...user.publicMetadata,
                profileData,
                onboardingCompleted: false,
                subscriptionStatus: 'trial'
              }
            })
            
            // Clear localStorage
            localStorage.removeItem('pendingProfile')
            
            // Redirect to onboarding
            router.push('/onboarding')
          }
        } catch (error) {
          console.error('Error setting user metadata:', error)
        }
      }
    }

    handleUserCreated()
  }, [user, profileStored, router])

  // Fallback for when Clerk is not available (build time)
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  if (!clerkPublishableKey || clerkPublishableKey.includes('placeholder')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center p-4">
        <div className="text-center">
          <Crown className="w-16 h-16 text-navy-600 mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold text-white mb-2">
            Napoleon AI
          </h1>
          <p className="text-gold-200">
            Authentication service is being configured...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo and Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block mb-6">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold-lg mx-auto"
            >
              <Crown className="w-8 h-8 text-navy-900" />
            </motion.div>
            
            {/* Floating sparkles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: "easeInOut"
                }}
                className="absolute"
                style={{
                  top: `${10 + i * 15}px`,
                  left: `${60 + (i % 2 ? 20 : -20)}px`
                }}
              >
                <Sparkles className="w-3 h-3 text-gold-400" />
              </motion.div>
            ))}
          </div>

          <h1 className="text-4xl font-serif font-bold text-white mb-2">
            Take Command Now
          </h1>
          <p className="text-gold-200">
            Join the elite executive intelligence platform
          </p>
        </motion.div>

        {showForm ? (
          /* Custom Profile Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/95 backdrop-blur-luxury rounded-2xl p-8 shadow-luxury border border-gold-200/20"
          >
            <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-navy-900 mb-2">
                  Executive Profile Setup
                </h2>
                <p className="text-navy-600">
                  Personalize your command center experience
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-navy-700 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  {...register("fullName")}
                  className="w-full px-4 py-3 border border-gold-200/30 rounded-xl focus:border-gold-400 focus:ring-2 focus:ring-gold-200 focus:bg-gold-50/20 transition-all duration-200 text-navy-900"
                  placeholder="Your executive name"
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="mt-1 text-sm text-red-600">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-3">
                  Executive Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roleOptions.map((option) => (
                    <label
                      key={option.value}
                      className="relative flex items-center p-3 border border-gold-200/30 rounded-xl cursor-pointer hover:border-gold-400 hover:bg-gold-50/20 transition-all duration-200"
                    >
                      <input
                        type="radio"
                        value={option.value}
                        {...register("role")}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center">
                          <Building className="w-4 h-4 text-gold-700" />
                        </div>
                        <div>
                          <div className="font-semibold text-navy-900">{option.label}</div>
                          <div className="text-xs text-navy-600">{option.description}</div>
                        </div>
                      </div>
                      {watch("role") === option.value && (
                        <CheckCircle className="w-5 h-5 text-gold-600 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
                {errors.role && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Company Size */}
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-3">
                  Company Size
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {companySizeOptions.map((option) => (
                    <label
                      key={option.value}
                      className="relative flex items-center p-3 border border-gold-200/30 rounded-xl cursor-pointer hover:border-gold-400 hover:bg-gold-50/20 transition-all duration-200"
                    >
                      <input
                        type="radio"
                        value={option.value}
                        {...register("companySize")}
                        className="sr-only"
                      />
                      <div>
                        <div className="font-semibold text-navy-900">{option.label}</div>
                        <div className="text-xs text-navy-600">{option.description}</div>
                      </div>
                      {watch("companySize") === option.value && (
                        <CheckCircle className="w-5 h-5 text-gold-600 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
                {errors.companySize && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.companySize.message}
                  </p>
                )}
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start space-x-3">
                <input
                  id="consentTerms"
                  type="checkbox"
                  {...register("consentTerms")}
                  className="mt-1 w-4 h-4 text-gold-600 border-gold-200 rounded focus:ring-gold-200"
                />
                <label htmlFor="consentTerms" className="text-sm text-navy-700">
                  I agree to the{" "}
                  <a href="/terms" className="text-gold-600 hover:text-gold-700 underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-gold-600 hover:text-gold-700 underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.consentTerms && (
                <p className="text-sm text-red-600">
                  {errors.consentTerms.message}
                </p>
              )}

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 px-4 border border-gold-200/30 rounded-xl text-navy-700 font-semibold hover:bg-gold-50/20 transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-gradient-gold text-navy-900 font-semibold rounded-xl hover:shadow-gold-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Continue to Sign Up"}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* Clerk SignUp Component */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setShowForm(true)}
                className="bg-gold-100 text-navy-900 px-6 py-3 rounded-xl font-semibold hover:bg-gold-200 transition-all duration-200 border border-gold-200/30"
              >
                Complete Profile First
              </button>
            </div>
            
            <SignUp 
              path="/auth/signup"
              routing="path"
              signInUrl="/auth/login"
              appearance={{
                baseTheme: undefined,
                variables: {
                  colorPrimary: '#D4AF37',
                  colorText: '#1B2951',
                  colorTextSecondary: '#6B7280',
                  colorBackground: '#FFFFFF',
                  colorInputBackground: '#F9FAFB',
                  colorInputText: '#1B2951',
                  fontFamily: 'Inter, sans-serif',
                  borderRadius: '0.75rem'
                },
                elements: {
                  card: 'shadow-luxury border border-gold-200/20 bg-white/95 backdrop-blur-luxury rounded-2xl',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 
                    'border-2 border-gold-200/30 hover:border-gold-400 hover:bg-gold-50 transition-all duration-300 font-medium rounded-xl py-3 px-4 text-navy-900',
                  socialButtonsBlockButtonText: 'font-semibold text-navy-900',
                  socialButtonsBlockButtonArrow: 'text-gold',
                  formButtonPrimary: 
                    'bg-gradient-gold hover:shadow-gold-lg text-navy-900 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 rounded-xl',
                  formFieldInput: 
                    'border-gold-200/30 focus:border-gold-400 focus:ring-gold-200 transition-all duration-200 focus:bg-gold-50/20 rounded-lg',
                  footerActionLink: 'text-gold-600 hover:text-gold-700 font-semibold',
                  dividerLine: 'bg-gold-200/30',
                  dividerText: 'text-navy-600 bg-white font-medium',
                  formFieldLabel: 'text-navy-700 font-semibold',
                  identityPreviewText: 'text-navy-700',
                  identityPreviewEditButton: 'text-gold-600 hover:text-gold-700 font-medium'
                }
              }}
            />
          </motion.div>
        )}

        {/* Executive Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/95 backdrop-blur-luxury rounded-2xl p-6 shadow-luxury border border-gold-200/30 mt-8"
        >
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-navy-900 mb-2">
              Executive Command Intelligence
            </h3>
            <p className="text-sm text-navy-600">
              Transform communication chaos into strategic clarity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-navy-700">Gmail</span>
              <span className="text-xs text-navy-500">Ready</span>
            </div>
            
            <div className="flex flex-col items-center opacity-60">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-navy-700">Slack</span>
              <span className="text-xs text-navy-500">Phase 2</span>
            </div>
            
            <div className="flex flex-col items-center opacity-60">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-navy-700">Teams</span>
              <span className="text-xs text-navy-500">Phase 2</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}