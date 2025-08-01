import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingData {
  // Step 1: Profile Setup
  role: string
  painPoints: string[]
  companySize: string
  
  // Step 2: Platform Connections
  connectedAccounts: {
    provider: string
    status: 'connecting' | 'connected' | 'error'
    accountId?: string
    error?: string
  }[]
  
  // Step 3: VIP Configuration
  vipContacts: {
    email: string
    name: string
    relationshipType: string
    priorityLevel: number
    source: 'suggested' | 'manual' | 'imported'
  }[]
  
  // Progress tracking
  currentStep: number
  completedSteps: number[]
  startedAt: string
  completedAt?: string
  onboardingComplete: boolean
  
  // Concierge options
  skipRequested: boolean
  conciergeRequested: boolean
  conciergeScheduledAt?: string
}

interface OnboardingActions {
  // Navigation
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  markStepComplete: (step: number) => void
  
  // Profile setup
  setRole: (role: string) => void
  togglePainPoint: (painPoint: string) => void
  setCompanySize: (size: string) => void
  
  // Platform connections
  setAccountStatus: (provider: string, status: 'connecting' | 'connected' | 'error', accountId?: string, error?: string) => void
  removeAccount: (provider: string) => void
  
  // VIP management
  addVipContact: (contact: Omit<OnboardingData['vipContacts'][0], 'priorityLevel'>) => void
  removeVipContact: (email: string) => void
  toggleVipContact: (contact: Omit<OnboardingData['vipContacts'][0], 'priorityLevel'>) => void
  setVipContacts: (contacts: OnboardingData['vipContacts']) => void
  
  // Completion & concierge
  completeOnboarding: () => Promise<void>
  requestSkip: () => void
  requestConcierge: (scheduledAt?: string) => void
  
  // Reset
  resetOnboarding: () => void
}

type OnboardingStore = OnboardingData & OnboardingActions

const initialState: OnboardingData = {
  role: '',
  painPoints: [],
  companySize: '',
  connectedAccounts: [],
  vipContacts: [],
  currentStep: 1,
  completedSteps: [],
  startedAt: new Date().toISOString(),
  onboardingComplete: false,
  skipRequested: false,
  conciergeRequested: false,
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Navigation
      setStep: (step: number) => set({ currentStep: step }),
      
      nextStep: () => {
        const { currentStep, completedSteps } = get()
        const nextStep = Math.min(currentStep + 1, 3)
        set({ 
          currentStep: nextStep,
          completedSteps: [...new Set([...completedSteps, currentStep])]
        })
      },
      
      prevStep: () => {
        const { currentStep } = get()
        set({ currentStep: Math.max(currentStep - 1, 1) })
      },
      
      markStepComplete: (step: number) => {
        const { completedSteps } = get()
        set({ completedSteps: [...new Set([...completedSteps, step])] })
      },
      
      // Profile setup
      setRole: (role: string) => set({ role }),
      
      togglePainPoint: (painPoint: string) => {
        const { painPoints } = get()
        const newPainPoints = painPoints.includes(painPoint)
          ? painPoints.filter(p => p !== painPoint)
          : [...painPoints, painPoint].slice(0, 3) // Limit to 3 pain points
        set({ painPoints: newPainPoints })
      },
      
      setCompanySize: (companySize: string) => set({ companySize }),
      
      // Platform connections
      setAccountStatus: (provider: string, status: 'connecting' | 'connected' | 'error', accountId?: string, error?: string) => {
        const { connectedAccounts } = get()
        const existingIndex = connectedAccounts.findIndex(acc => acc.provider === provider)
        
        if (existingIndex >= 0) {
          const updatedAccounts = [...connectedAccounts]
          updatedAccounts[existingIndex] = { provider, status, accountId, error }
          set({ connectedAccounts: updatedAccounts })
        } else {
          set({ 
            connectedAccounts: [...connectedAccounts, { provider, status, accountId, error }]
          })
        }
      },
      
      removeAccount: (provider: string) => {
        const { connectedAccounts } = get()
        set({ 
          connectedAccounts: connectedAccounts.filter(acc => acc.provider !== provider)
        })
      },
      
      // VIP management
      addVipContact: (contact) => {
        const { vipContacts } = get()
        if (!vipContacts.find(c => c.email === contact.email)) {
          set({ 
            vipContacts: [...vipContacts, { ...contact, priorityLevel: 1 }]
          })
        }
      },
      
      removeVipContact: (email: string) => {
        const { vipContacts } = get()
        set({ vipContacts: vipContacts.filter(c => c.email !== email) })
      },
      
      toggleVipContact: (contact) => {
        const { vipContacts } = get()
        const exists = vipContacts.find(c => c.email === contact.email)
        
        if (exists) {
          set({ vipContacts: vipContacts.filter(c => c.email !== contact.email) })
        } else {
          set({ 
            vipContacts: [...vipContacts, { ...contact, priorityLevel: 1 }]
          })
        }
      },
      
      setVipContacts: (contacts) => set({ vipContacts: contacts }),
      
      // Completion & concierge
      completeOnboarding: async () => {
        const state = get()
        
        try {
          // Save onboarding data to database
          const response = await fetch('/api/onboarding/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: state.role,
              painPoints: state.painPoints,
              companySize: state.companySize,
              vipContacts: state.vipContacts,
              connectedAccounts: state.connectedAccounts
            })
          })
          
          if (!response.ok) {
            throw new Error('Failed to save onboarding data')
          }
          
          console.log('Onboarding data saved successfully')
        } catch (error) {
          console.error('Error saving onboarding data:', error)
          // Continue with local completion even if API fails
        }
        
        set({ 
          onboardingComplete: true,
          completedAt: new Date().toISOString(),
          completedSteps: [1, 2, 3]
        })
      },
      
      requestSkip: () => set({ skipRequested: true }),
      
      requestConcierge: (scheduledAt?: string) => {
        set({ 
          conciergeRequested: true,
          conciergeScheduledAt: scheduledAt || new Date().toISOString()
        })
      },
      
      // Reset
      resetOnboarding: () => set({
        ...initialState,
        startedAt: new Date().toISOString()
      })
    }),
    {
      name: 'napoleon-onboarding',
      partialize: (state) => ({
        role: state.role,
        painPoints: state.painPoints,
        companySize: state.companySize,
        connectedAccounts: state.connectedAccounts,
        vipContacts: state.vipContacts,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        startedAt: state.startedAt,
        onboardingComplete: state.onboardingComplete,
        skipRequested: state.skipRequested,
        conciergeRequested: state.conciergeRequested,
        conciergeScheduledAt: state.conciergeScheduledAt,
      })
    }
  )
)