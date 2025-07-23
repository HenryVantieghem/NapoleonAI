import { auth, currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

// Executive role validation
export const executiveRoles = [
  'CEO', 'COO', 'CFO', 'CTO', 'CMO', 'CHRO',
  'President', 'VP', 'Vice President', 'Director', 
  'Executive Director', 'Managing Director',
  'Founder', 'Co-Founder', 'Partner', 'Executive'
] as const

export type ExecutiveRole = typeof executiveRoles[number]

export function validateExecutiveRole(role: string): boolean {
  return executiveRoles.some(execRole => 
    role.toLowerCase().includes(execRole.toLowerCase())
  )
}

// Server-side auth utilities
export async function getAuthUser() {
  const { userId } = await auth()
  if (!userId) return null
  
  try {
    const user = await currentUser()
    return user
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getAuthUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

// User metadata management
export async function updateUserMetadata(userId: string, metadata: Record<string, any>) {
  try {
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: metadata
    })
    return { success: true }
  } catch (error) {
    console.error('Error updating user metadata:', error)
    return { success: false, error }
  }
}

// Check if user has completed onboarding
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    return user.publicMetadata?.onboardingCompleted === true
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return false
  }
}

// Set onboarding as completed
export async function completeOnboarding(userId: string) {
  return updateUserMetadata(userId, {
    onboardingCompleted: true,
    onboardingCompletedAt: new Date().toISOString()
  })
}

// OAuth connection management
export interface OAuthConnection {
  provider: 'gmail' | 'slack' | 'teams'
  connected: boolean
  email?: string
  scopes?: string[]
}

export async function getOAuthConnections(userId: string): Promise<OAuthConnection[]> {
  // This will be managed separately in Supabase connected_accounts table
  // Clerk handles authentication, but OAuth for API access is separate
  return []
}

// Session management utilities
export async function getSessionInfo() {
  const { userId, sessionId, sessionClaims } = await auth()
  
  if (!userId || !sessionId) return null
  
  const user = await getAuthUser()
  if (!user) return null
  
  return {
    userId,
    sessionId,
    email: user.emailAddresses[0]?.emailAddress || '',
    name: user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.username || '',
    imageUrl: user.imageUrl,
    role: user.publicMetadata?.role as string || '',
    isExecutive: user.publicMetadata?.role 
      ? validateExecutiveRole(user.publicMetadata.role as string) 
      : false,
    metadata: user.publicMetadata
  }
}

// Error handling
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export function handleAuthError(error: any): AuthError {
  // Clerk error handling
  if (error?.errors) {
    const clerkError = error.errors[0]
    return new AuthError(
      clerkError.message || 'Authentication failed',
      clerkError.code || 'auth_error'
    )
  }
  
  if (error?.message) {
    return new AuthError(error.message, 'auth_error')
  }
  
  return new AuthError(
    'An unexpected error occurred. Please try again.',
    'unknown_error'
  )
}