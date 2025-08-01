import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
  avatarUrl?: string
  companySize?: string
  onboardingCompleted: boolean
  subscriptionStatus: string
  mfaEnabled: boolean
  lastLoginAt: string
}

/**
 * Get the current authenticated user session with profile data
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const user = await currentUser()
    if (!user) return null

    const supabase = createClient()
    
    // Get user profile from database
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select(`
        onboarding_completed,
        preferences,
        users!inner(*)
      `)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    const userData = profile.users as any

    return {
      id: user.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      avatarUrl: userData.avatar_url,
      companySize: userData.company_size,
      onboardingCompleted: profile.onboarding_completed || false,
      subscriptionStatus: 'trial', // TODO: Add subscription_status column to user_profiles table
      mfaEnabled: user.twoFactorEnabled || false,
      lastLoginAt: user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : new Date().toISOString()
    }
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

/**
 * Require authentication and redirect if not authenticated
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/login')
  }
  
  return session
}

/**
 * Require completed onboarding and redirect if not completed
 */
export async function requireOnboarding(): Promise<SessionUser> {
  const session = await requireAuth()
  
  if (!session.onboardingCompleted) {
    redirect('/onboarding')
  }
  
  return session
}

/**
 * Check if user has executive-level privileges
 */
export function isExecutiveUser(session: SessionUser): boolean {
  const executiveRoles = ['ceo', 'coo', 'cfo', 'cto', 'founder', 'vp', 'director']
  return executiveRoles.includes(session.role.toLowerCase())
}

/**
 * Check if user has C-suite level privileges
 */
export function isCSuiteUser(session: SessionUser): boolean {
  const cSuiteRoles = ['ceo', 'coo', 'cfo', 'cto', 'founder']
  return cSuiteRoles.includes(session.role.toLowerCase())
}

/**
 * Get priority threshold based on user role
 */
export function getUserPriorityThreshold(session: SessionUser): number {
  if (isCSuiteUser(session)) {
    return 80 // Higher threshold for C-suite (less noise)
  }
  
  if (isExecutiveUser(session)) {
    return 70 // Standard executive threshold
  }
  
  return 60 // Default threshold
}

/**
 * MFA Challenge Placeholder - Future Implementation
 */
export async function requireMFA(session: SessionUser): Promise<boolean> {
  // Placeholder for MFA implementation
  // This will integrate with Clerk's MFA features in Phase 2
  
  if (!session.mfaEnabled) {
    console.log('MFA not enabled for user:', session.id)
    return true // Allow access for now
  }
  
  // TODO: Implement actual MFA challenge
  console.log('MFA challenge would be triggered here for user:', session.id)
  return true
}

/**
 * Security audit log placeholder
 */
export async function logSecurityEvent(
  userId: string, 
  event: string, 
  metadata?: Record<string, any>
): Promise<void> {
  // Placeholder for security audit logging
  console.log('Security Event:', {
    userId,
    event,
    timestamp: new Date().toISOString(),
    metadata
  })
  
  // TODO: Implement actual audit logging to secure storage
}

/**
 * Session refresh utility
 */
export async function refreshSession(): Promise<SessionUser | null> {
  try {
    // Force fresh session data
    return await getSession()
  } catch (error) {
    console.error('Session refresh error:', error)
    return null
  }
}

/**
 * Redirect helpers based on user state
 */
export class AuthRedirect {
  static toLogin = () => redirect('/auth/login')
  static toSignup = () => redirect('/auth/signup') 
  static toOnboarding = () => redirect('/onboarding')
  static toDashboard = () => redirect('/dashboard')
  static toSettings = () => redirect('/settings')
  
  static conditional = (session: SessionUser | null) => {
    if (!session) {
      return AuthRedirect.toLogin()
    }
    
    if (!session.onboardingCompleted) {
      return AuthRedirect.toOnboarding()
    }
    
    return AuthRedirect.toDashboard()
  }
}