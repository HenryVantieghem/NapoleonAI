import { renderHook, act } from '@testing-library/react'
import { useOnboardingStore } from '../onboardingStore'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      upsert: jest.fn().mockResolvedValue({ error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
      update: jest.fn().mockResolvedValue({ error: null }),
      delete: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      signInWithOAuth: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  }),
}))

// Mock console methods to suppress test output
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('OnboardingStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { result } = renderHook(() => useOnboardingStore())
    act(() => {
      result.current.resetOnboarding()
    })
    localStorage.clear()
  })

  describe('Navigation', () => {
    it('should initialize with step 1', () => {
      const { result } = renderHook(() => useOnboardingStore())
      expect(result.current.currentStep).toBe(1)
    })

    it('should advance to next step and mark current as complete', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.nextStep()
      })
      
      expect(result.current.currentStep).toBe(2)
      expect(result.current.completedSteps).toContain(1)
    })

    it('should go back to previous step', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.nextStep()
        result.current.prevStep()
      })
      
      expect(result.current.currentStep).toBe(1)
    })

    it('should not go below step 1', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.prevStep()
      })
      
      expect(result.current.currentStep).toBe(1)
    })

    it('should not go above step 3', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.nextStep()
        result.current.nextStep()
        result.current.nextStep()
        result.current.nextStep()
      })
      
      expect(result.current.currentStep).toBe(3)
    })
  })

  describe('Profile Setup', () => {
    it('should set executive role', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.setRole('ceo')
      })
      
      expect(result.current.role).toBe('ceo')
    })

    it('should toggle pain points', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.togglePainPoint('email-overload')
      })
      
      expect(result.current.painPoints).toContain('email-overload')
      
      act(() => {
        result.current.togglePainPoint('email-overload')
      })
      
      expect(result.current.painPoints).not.toContain('email-overload')
    })

    it('should limit pain points to 3 maximum', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.togglePainPoint('email-overload')
        result.current.togglePainPoint('prioritization')
        result.current.togglePainPoint('meetings')
        result.current.togglePainPoint('responsiveness')
      })
      
      expect(result.current.painPoints).toHaveLength(3)
      expect(result.current.painPoints).not.toContain('responsiveness')
    })

    it('should set company size', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.setCompanySize('200+')
      })
      
      expect(result.current.companySize).toBe('200+')
    })
  })

  describe('Platform Connections', () => {
    it('should add new account connection', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.setAccountStatus('gmail', 'connecting')
      })
      
      expect(result.current.connectedAccounts).toHaveLength(1)
      expect(result.current.connectedAccounts[0]).toEqual({
        provider: 'gmail',
        status: 'connecting',
        accountId: undefined,
        error: undefined
      })
    })

    it('should update existing account status', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.setAccountStatus('gmail', 'connecting')
        result.current.setAccountStatus('gmail', 'connected', 'user@gmail.com')
      })
      
      expect(result.current.connectedAccounts).toHaveLength(1)
      expect(result.current.connectedAccounts[0]).toEqual({
        provider: 'gmail',
        status: 'connected',
        accountId: 'user@gmail.com',
        error: undefined
      })
    })

    it('should handle connection errors', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.setAccountStatus('gmail', 'error', undefined, 'Connection failed')
      })
      
      expect(result.current.connectedAccounts[0]).toEqual({
        provider: 'gmail',
        status: 'error',
        accountId: undefined,
        error: 'Connection failed'
      })
    })

    it('should remove account connection', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.setAccountStatus('gmail', 'connected', 'user@gmail.com')
        result.current.removeAccount('gmail')
      })
      
      expect(result.current.connectedAccounts).toHaveLength(0)
    })
  })

  describe('VIP Contact Management', () => {
    const mockContact = {
      email: 'john.doe@company.com',
      name: 'John Doe',
      relationshipType: 'Board Member',
      source: 'suggested' as const
    }

    it('should add VIP contact', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.addVipContact(mockContact)
      })
      
      expect(result.current.vipContacts).toHaveLength(1)
      expect(result.current.vipContacts[0]).toEqual({
        ...mockContact,
        priorityLevel: 1
      })
    })

    it('should not add duplicate VIP contacts', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.addVipContact(mockContact)
        result.current.addVipContact(mockContact)
      })
      
      expect(result.current.vipContacts).toHaveLength(1)
    })

    it('should toggle VIP contact selection', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.toggleVipContact(mockContact)
      })
      
      expect(result.current.vipContacts).toHaveLength(1)
      
      act(() => {
        result.current.toggleVipContact(mockContact)
      })
      
      expect(result.current.vipContacts).toHaveLength(0)
    })

    it('should remove VIP contact by email', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.addVipContact(mockContact)
        result.current.removeVipContact(mockContact.email)
      })
      
      expect(result.current.vipContacts).toHaveLength(0)
    })

    it('should set VIP contacts list', () => {
      const { result } = renderHook(() => useOnboardingStore())
      const contacts = [
        { ...mockContact, priorityLevel: 1 },
        { 
          email: 'jane.smith@investor.com',
          name: 'Jane Smith',
          relationshipType: 'Investor',
          source: 'manual' as const,
          priorityLevel: 2
        }
      ]
      
      act(() => {
        result.current.setVipContacts(contacts)
      })
      
      expect(result.current.vipContacts).toHaveLength(2)
      expect(result.current.vipContacts).toEqual(contacts)
    })
  })

  describe('Completion & Concierge', () => {
    it('should complete onboarding', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.completeOnboarding()
      })
      
      expect(result.current.onboardingComplete).toBe(true)
      expect(result.current.completedSteps).toEqual([1, 2, 3])
      expect(result.current.completedAt).toBeDefined()
    })

    it('should request skip', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.requestSkip()
      })
      
      expect(result.current.skipRequested).toBe(true)
    })

    it('should request concierge', () => {
      const { result } = renderHook(() => useOnboardingStore())
      const scheduledTime = '2024-01-15T10:00:00Z'
      
      act(() => {
        result.current.requestConcierge(scheduledTime)
      })
      
      expect(result.current.conciergeRequested).toBe(true)
      expect(result.current.conciergeScheduledAt).toBe(scheduledTime)
    })

    it('should auto-set concierge time if not provided', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.requestConcierge()
      })
      
      expect(result.current.conciergeRequested).toBe(true)
      expect(result.current.conciergeScheduledAt).toBeDefined()
    })
  })

  describe('Persistence', () => {
    it('should persist state to localStorage', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.setRole('ceo')
        result.current.togglePainPoint('email-overload')
      })
      
      // Check localStorage contains the persisted state
      const persistedState = localStorage.getItem('napoleon-onboarding')
      expect(persistedState).toBeDefined()
      expect(JSON.parse(persistedState!).state.role).toBe('ceo')
      expect(JSON.parse(persistedState!).state.painPoints).toContain('email-overload')
    })

    it('should reset onboarding to initial state', () => {
      const { result } = renderHook(() => useOnboardingStore())
      
      act(() => {
        result.current.setRole('ceo')
        result.current.nextStep()
        result.current.completeOnboarding()
        result.current.resetOnboarding()
      })
      
      expect(result.current.role).toBe('')
      expect(result.current.currentStep).toBe(1)
      expect(result.current.onboardingComplete).toBe(false)
      expect(result.current.completedSteps).toEqual([])
      expect(result.current.startedAt).toBeDefined()
    })
  })
})