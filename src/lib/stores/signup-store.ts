import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface SignupProfile {
  name: string
  email: string
  role: string
  companySize: string
  painPoints: string[]
  communicationTools: string[]
}

interface SignupState {
  // Profile data
  profile: Partial<SignupProfile>
  
  // Flow control
  currentStep: number
  isCompleting: boolean
  startTime: number
  
  // Actions
  setProfile: (profile: Partial<SignupProfile>) => void
  updateProfile: (updates: Partial<SignupProfile>) => void
  nextStep: () => void
  prevStep: () => void
  setCurrentStep: (step: number) => void
  startSignup: () => void
  completeSignup: () => void
  reset: () => void
  
  // Computed
  getCompletionTime: () => number
  isProfileComplete: () => boolean
}

// Executive role options with priority ordering
export const EXECUTIVE_ROLES = [
  'CEO', 'COO', 'CFO', 'CTO', 'CMO', 'CHRO',
  'President', 'VP', 'Director', 'Partner', 'Founder',
  'Board Member', 'Executive Assistant', 'Other'
] as const

// Company size options
export const COMPANY_SIZES = [
  'Startup (1-10)', 'Small (11-50)', 'Medium (51-200)', 
  'Large (201-1000)', 'Enterprise (1000+)', 'Public Company'
] as const

// Communication pain points
export const PAIN_POINTS = [
  'Too many emails daily', 'Missing important messages', 
  'Context switching between platforms', 'Poor email prioritization',
  'Information overload', 'Delayed responses to VIPs'
] as const

// Communication tools
export const COMMUNICATION_TOOLS = [
  'Gmail', 'Outlook', 'Slack', 'Microsoft Teams', 
  'WhatsApp Business', 'Telegram', 'Other'
] as const

export const useSignupStore = create<SignupState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        profile: {},
        currentStep: 1,
        isCompleting: false,
        startTime: 0,
        
        // Actions
        setProfile: (profile) => set({ profile }),
        
        updateProfile: (updates) => 
          set((state) => ({ 
            profile: { ...state.profile, ...updates } 
          })),
        
        nextStep: () => 
          set((state) => ({ 
            currentStep: Math.min(state.currentStep + 1, 3) 
          })),
        
        prevStep: () => 
          set((state) => ({ 
            currentStep: Math.max(state.currentStep - 1, 1) 
          })),
        
        setCurrentStep: (step) => set({ currentStep: step }),
        
        startSignup: () => set({ startTime: Date.now() }),
        
        completeSignup: () => set({ isCompleting: true }),
        
        reset: () => set({
          profile: {},
          currentStep: 1,
          isCompleting: false,
          startTime: 0
        }),
        
        // Computed values
        getCompletionTime: () => {
          const startTime = get().startTime
          return startTime ? (Date.now() - startTime) / 1000 : 0
        },
        
        isProfileComplete: () => {
          const { profile } = get()
          return !!(profile.name && profile.role && profile.companySize)
        }
      }),
      {
        name: 'napoleon-signup-store',
        partialize: (state) => ({ 
          profile: state.profile, 
          currentStep: state.currentStep,
          startTime: state.startTime 
        })
      }
    ),
    { name: 'SignupStore' }
  )
)