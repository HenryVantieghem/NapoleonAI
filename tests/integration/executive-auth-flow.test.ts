import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ 
          data: mockExecutiveProfile, 
          error: null 
        }))
      }))
    })),
    insert: vi.fn(() => Promise.resolve({ data: mockExecutiveProfile, error: null })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: mockExecutiveProfile, error: null }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  })),
  auth: {
    getUser: vi.fn(() => Promise.resolve({ 
      data: { user: mockClerkUser }, 
      error: null 
    }))
  },
  rpc: vi.fn(() => Promise.resolve({ data: [], error: null }))
}

// Mock Clerk
const mockClerkUser = {
  id: 'clerk_test_user_123',
  firstName: 'John',
  lastName: 'Smith', 
  emailAddresses: [{ emailAddress: 'john.smith@fortune500.com' }],
  publicMetadata: {
    role: 'CEO',
    company: 'Fortune 500 Corp',
    executiveLevel: 'C-Suite'
  }
}

const mockExecutiveProfile = {
  id: 'exec_profile_123',
  clerk_user_id: 'clerk_test_user_123',
  email: 'john.smith@fortune500.com',
  first_name: 'John',
  last_name: 'Smith',
  role: 'CEO',
  company: 'Fortune 500 Corp',
  executive_level: 'C-Suite',
  preferred_communication_style: 'concise',
  luxury_preferences: {
    theme: 'private-jet',
    animations: true,
    glassmorphism: true
  },
  vip_contacts: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Mock modules
vi.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabase
}))

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: mockClerkUser,
    isSignedIn: true,
    isLoaded: true
  }),
  useAuth: () => ({
    isSignedIn: true,
    isLoaded: true,
    userId: mockClerkUser.id,
    getToken: vi.fn(() => Promise.resolve('mock_jwt_token'))
  })
}))

describe('Executive Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Executive Profile Creation', () => {
    it('creates executive profile with private-jet luxury preferences', async () => {
      // Mock the auth service
      const { createExecutiveProfile } = await import('@/lib/auth/auth-service')
      
      const profileData = {
        clerkUserId: mockClerkUser.id,
        email: 'john.smith@fortune500.com',
        firstName: 'John',
        lastName: 'Smith',
        role: 'CEO',
        company: 'Fortune 500 Corp',
        executiveLevel: 'C-Suite'
      }

      const result = await createExecutiveProfile(profileData)

      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
      expect(result).toEqual(expect.objectContaining({
        clerk_user_id: mockClerkUser.id,
        email: 'john.smith@fortune500.com',
        executive_level: 'C-Suite',
        luxury_preferences: expect.objectContaining({
          theme: 'private-jet',
          animations: true,
          glassmorphism: true
        })
      }))
    })

    it('applies executive-level security policies', async () => {
      const { validateExecutiveAccess } = await import('@/lib/auth/auth-service')
      
      const hasAccess = await validateExecutiveAccess(mockClerkUser.id)
      
      expect(hasAccess).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
    })

    it('configures luxury UX preferences during onboarding', async () => {
      const { updateLuxuryPreferences } = await import('@/lib/auth/auth-service')
      
      const luxuryPrefs = {
        theme: 'private-jet',
        animations: true,
        glassmorphism: true,
        hapticFeedback: true,
        premiumTransitions: true
      }

      await updateLuxuryPreferences(mockClerkUser.id, luxuryPrefs)

      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          luxury_preferences: luxuryPrefs
        })
      )
    })
  })

  describe('Executive Session Management', () => {
    it('maintains executive session with luxury context', async () => {
      const { getExecutiveSession } = await import('@/lib/auth/session-service')
      
      const session = await getExecutiveSession()
      
      expect(session).toEqual(expect.objectContaining({
        user: expect.objectContaining({
          id: mockClerkUser.id,
          executiveLevel: 'C-Suite'
        }),
        luxuryPreferences: expect.objectContaining({
          theme: 'private-jet'
        })
      }))
    })

    it('applies executive-grade security headers', async () => {
      const { validateExecutiveSession } = await import('@/lib/auth/session-service')
      
      const isValid = await validateExecutiveSession('mock_jwt_token')
      
      expect(isValid).toBe(true)
    })

    it('handles executive privilege escalation', async () => {
      const { escalateExecutivePrivileges } = await import('@/lib/auth/session-service')
      
      const escalated = await escalateExecutivePrivileges(mockClerkUser.id, 'board-access')
      
      expect(escalated).toEqual(expect.objectContaining({
        userId: mockClerkUser.id,
        privilegeLevel: 'board-access',
        granted: true
      }))
    })
  })

  describe('VIP Contact Management', () => {
    it('creates VIP contact with champagne gold priority', async () => {
      const { addVipContact } = await import('@/lib/auth/auth-service')
      
      const vipContact = {
        email: 'board.chairman@fortune500.com',
        name: 'Board Chairman',
        priority: 'executive',
        relationship: 'board-member',
        champagneGoldStatus: true
      }

      await addVipContact(mockClerkUser.id, vipContact)
      
      expect(mockSupabase.from).toHaveBeenCalledWith('vip_contacts')
    })

    it('applies executive priority boosting to VIP communications', async () => {
      const { boostVipCommunication } = await import('@/lib/auth/auth-service')
      
      const boosted = await boostVipCommunication(
        mockClerkUser.id, 
        'board.chairman@fortune500.com'
      )
      
      expect(boosted.priorityScore).toBeGreaterThan(90)
      expect(boosted.luxuryStatus).toBe('champagne-gold')
    })
  })

  describe('Executive Dashboard Access', () => {
    it('validates executive dashboard permissions', async () => {
      const { validateDashboardAccess } = await import('@/lib/auth/auth-service')
      
      const access = await validateDashboardAccess(mockClerkUser.id)
      
      expect(access).toEqual(expect.objectContaining({
        granted: true,
        level: 'C-Suite',
        features: expect.arrayContaining([
          'command-center',
          'ai-intelligence',
          'vip-communications',
          'strategic-digest'
        ])
      }))
    })

    it('applies luxury UI preferences to dashboard', async () => {
      const { getDashboardConfig } = await import('@/lib/auth/auth-service')
      
      const config = await getDashboardConfig(mockClerkUser.id)
      
      expect(config).toEqual(expect.objectContaining({
        theme: 'private-jet',
        colors: expect.objectContaining({
          primary: '#D4AF37', // champagneGold
          background: '#0B0D11', // jetBlack
          secondary: '#122039' // midnightBlue
        }),
        animations: true,
        glassmorphism: true
      }))
    })
  })

  describe('Row Level Security (RLS) Integration', () => {
    it('enforces executive-only data access', async () => {
      const { testRLSPolicy } = await import('@/lib/supabase/server')
      
      // Test that non-executive users cannot access executive data
      const result = await testRLSPolicy('user_profiles', 'non_exec_user')
      
      expect(result.canAccess).toBe(false)
      expect(result.errorType).toBe('insufficient_privileges')
    })

    it('allows executive access to own profile and VIP data', async () => {
      const { testRLSPolicy } = await import('@/lib/supabase/server')
      
      const result = await testRLSPolicy('user_profiles', mockClerkUser.id)
      
      expect(result.canAccess).toBe(true)
      expect(result.dataLevel).toBe('executive')
    })

    it('protects VIP contact information with executive RLS', async () => {
      const { testVipRLS } = await import('@/lib/supabase/server')
      
      const result = await testVipRLS(mockClerkUser.id)
      
      expect(result.canAccessVipContacts).toBe(true)
      expect(result.canModifyVipContacts).toBe(true)
    })
  })

  describe('Executive OAuth Integration', () => {
    it('handles Gmail OAuth with executive security', async () => {
      const { handleGmailOAuth } = await import('@/lib/integrations/gmail-api')
      
      const mockTokens = {
        access_token: 'gmail_access_token',
        refresh_token: 'gmail_refresh_token',
        scope: 'https://www.googleapis.com/auth/gmail.readonly'
      }

      await handleGmailOAuth(mockClerkUser.id, mockTokens)
      
      expect(mockSupabase.from).toHaveBeenCalledWith('connected_accounts')
    })

    it('encrypts OAuth tokens for executive security', async () => {
      const { encryptOAuthTokens } = await import('@/lib/integrations/integration-service')
      
      const tokens = {
        access_token: 'sensitive_access_token',
        refresh_token: 'sensitive_refresh_token'
      }

      const encrypted = await encryptOAuthTokens(tokens)
      
      expect(encrypted.access_token).not.toBe(tokens.access_token)
      expect(encrypted.refresh_token).not.toBe(tokens.refresh_token)
      expect(encrypted.encrypted).toBe(true)
    })
  })

  describe('Executive Error Handling', () => {
    it('provides luxury error messages for authentication failures', async () => {
      const { handleExecutiveAuthError } = await import('@/lib/auth/auth-service')
      
      const error = new Error('Authentication failed')
      const luxuryError = await handleExecutiveAuthError(error)
      
      expect(luxuryError).toEqual(expect.objectContaining({
        message: expect.stringContaining('executive access'),
        luxury: true,
        theme: 'private-jet',
        actionable: true
      }))
    })

    it('maintains executive context during error recovery', async () => {
      const { recoverExecutiveSession } = await import('@/lib/auth/session-service')
      
      const recovery = await recoverExecutiveSession(mockClerkUser.id)
      
      expect(recovery).toEqual(expect.objectContaining({
        recovered: true,
        executiveLevel: 'C-Suite',
        luxuryPreferences: expect.objectContaining({
          theme: 'private-jet'
        })
      }))
    })
  })
})