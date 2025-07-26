"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/nextjs'
import { type UserWithProfile } from "@/types/database"

interface AuthContextType {
  // Clerk user data
  user: any
  clerkUser: any
  profile: UserWithProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  isExecutive: boolean
  error: string | null
  
  // Auth actions (Clerk handles these automatically)
  signOut: () => Promise<void>
  
  // Profile actions
  updateProfile: (updates: any) => Promise<{ success: boolean; error?: string }>
  refreshProfile: () => Promise<void>
  
  // Utility actions
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, signOut: clerkSignOut } = useClerkAuth()
  const { user: clerkUser } = useClerkUser()
  
  const [profile, setProfile] = useState<UserWithProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExecutive, setIsExecutive] = useState(false)

  const isAuthenticated = isSignedIn || false

  // Initialize auth state with Clerk
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*, users!inner(*)')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (profile) {
        // Map the joined data to the expected UserWithProfile format
        const userWithProfile = {
          ...profile.users,
          user_profiles: {
            user_id: profile.user_id,
            preferences: profile.preferences,
            onboarding_completed: profile.onboarding_completed,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          }
        }
        setProfile(userWithProfile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }, [])

  const checkExecutiveStatus = useCallback(async () => {
    try {
      if (!profile?.role) {
        setIsExecutive(false)
        return
      }
      
      const role = profile.role
      const executiveRoles = ['CEO', 'COO', 'CFO', 'CTO', 'CMO', 'CHRO', 'President', 'VP', 'Director', 'Executive', 'Founder', 'Partner']
      const isExec = executiveRoles.some(execRole => 
        role.toLowerCase().includes(execRole.toLowerCase())
      )
      setIsExecutive(isExec)
    } catch (error) {
      console.error('Error checking executive status:', error)
      setIsExecutive(false)
    }
  }, [profile])

  useEffect(() => {
    async function initializeAuth() {
      if (!isLoaded) return

      try {
        setIsLoading(true)
        
        // Load user profile if authenticated
        if (isSignedIn && clerkUser) {
          await loadUserProfile(clerkUser.id)
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error)
        setError('Failed to initialize authentication')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [isLoaded, isSignedIn, clerkUser, loadUserProfile])

  // Handle auth state changes with Clerk
  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn && clerkUser) {
      // User signed in, load profile
      loadUserProfile(clerkUser.id)
      setError(null)
    } else {
      // User signed out, clear profile
      setProfile(null)
      setIsExecutive(false)
      setError(null)
    }
  }, [isSignedIn, clerkUser, isLoaded, loadUserProfile])

  // Check executive status when profile changes
  useEffect(() => {
    checkExecutiveStatus()
  }, [checkExecutiveStatus])


  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Sign out method using Clerk
  const signOut = useCallback(async () => {
    try {
      clearError()
      await clerkSignOut()
      setProfile(null)
      setIsExecutive(false)
    } catch (error: any) {
      setError('Failed to sign out')
    }
  }, [clerkSignOut, clearError])

  // Profile methods
  const refreshProfile = useCallback(async () => {
    if (clerkUser) {
      await loadUserProfile(clerkUser.id)
    }
  }, [clerkUser, loadUserProfile])

  const updateProfile = useCallback(async (updates: any) => {
    clearError()
    
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      if (!clerkUser) return { success: false, error: 'User not authenticated' }
      
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', clerkUser.id)
      
      if (error) throw error
      
      await refreshProfile()
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [clerkUser, clearError, refreshProfile])


  const value: AuthContextType = {
    user: clerkUser, // For backward compatibility
    clerkUser,
    profile,
    isLoading: !isLoaded || isLoading,
    isAuthenticated,
    isExecutive,
    error,
    
    signOut,
    updateProfile,
    refreshProfile,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Specialized hooks for common use cases
export function useUser() {
  const { user, clerkUser, isLoading, isAuthenticated } = useAuth()
  return { user, clerkUser, isLoading, isAuthenticated }
}

export function useProfile() {
  const { profile, updateProfile, refreshProfile, isLoading } = useAuth()
  return { profile, updateProfile, refreshProfile, isLoading }
}

export function useExecutiveStatus() {
  const { isExecutive, profile } = useAuth()
  const role = profile?.role || ''
  
  return {
    isExecutive,
    role,
    subscriptionStatus: 'trial', // Simplified for MVP
    onboardingCompleted: profile?.user_profiles?.onboarding_completed || false
  }
}

// Auth guard hook for protected routes
export function useAuthGuard() {
  const { isAuthenticated, isLoading, user } = useAuth()
  
  return {
    isAuthenticated,
    isLoading,
    user,
    requireAuth: !isLoading && !isAuthenticated,
    isReady: !isLoading
  }
}