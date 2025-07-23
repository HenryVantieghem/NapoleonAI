import { auth, currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'
import type { UserWithProfile } from '@/types/database'

export class UserProfileService {
  // Server-side: Create or update user profile in Supabase
  static async syncUserToSupabase(clerkUserId: string) {
    const supabase = createServiceClient()
    
    try {
      // Get user from Clerk
      const client = await clerkClient()
      const user = await client.users.getUser(clerkUserId)
      
      if (!user) {
        throw new Error('User not found in Clerk')
      }
      
      const email = user.emailAddresses[0]?.emailAddress
      if (!email) {
        throw new Error('User has no email address')
      }
      
      const name = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || ''
      
      // Upsert user record
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: clerkUserId,
          email,
          name,
          role: user.publicMetadata?.role as string || '',
          avatar_url: user.imageUrl || ''
        }, {
          onConflict: 'id'
        })
      
      if (userError) throw userError
      
      // Upsert user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: clerkUserId,
          preferences: {
            theme: 'light',
            notifications: {
              email: true,
              push: true,
              digest: 'daily'
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          settings: {
            autoArchive: 7,
            priorityThreshold: 70,
            vipAlerts: true
          },
          onboarding_completed: user.publicMetadata?.onboardingCompleted === true,
          subscription_status: user.publicMetadata?.subscriptionStatus as string || 'trial'
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
      
      if (profileError) throw profileError
      
      return { success: true }
    } catch (error) {
      console.error('Error syncing user to Supabase:', error)
      return { success: false, error }
    }
  }
  
  // Server-side: Get user profile
  static async getUserProfile(userId?: string): Promise<UserWithProfile | null> {
    const supabase = createServiceClient()
    
    try {
      // Get current user ID if not provided
      if (!userId) {
        const { userId: authUserId } = await auth()
        if (!authUserId) return null
        userId = authUserId
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          users!inner(*)
        `)
        .eq('user_id', userId)
        .single()
      
      if (error) {
        // If profile doesn't exist, try to sync from Clerk
        if (error.code === 'PGRST116') {
          await this.syncUserToSupabase(userId)
          
          // Try to fetch again
          const { data: retryData, error: retryError } = await supabase
            .from('user_profiles')
            .select(`
              *,
              users!inner(*)
            `)
            .eq('user_id', userId)
            .single()
          
          if (retryError) throw retryError
          return retryData
        }
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }
  
  // Client-side: Update user profile
  static async updateProfile(updates: any) {
    const { userId } = await auth()
    if (!userId) throw new Error('User not authenticated')
    
    const supabase = createClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
    
    if (error) throw error
    
    return { success: true }
  }
  
  // Server-side: Update user metadata in Clerk
  static async updateClerkMetadata(metadata: Record<string, any>) {
    const { userId } = await auth()
    if (!userId) throw new Error('User not authenticated')
    
    try {
      const client = await clerkClient()
      await client.users.updateUserMetadata(userId, {
        publicMetadata: metadata
      })
      
      // Sync to Supabase
      await this.syncUserToSupabase(userId)
      
      return { success: true }
    } catch (error) {
      console.error('Error updating Clerk metadata:', error)
      return { success: false, error }
    }
  }
  
  // Mark onboarding as complete
  static async completeOnboarding() {
    return this.updateClerkMetadata({
      onboardingCompleted: true,
      onboardingCompletedAt: new Date().toISOString()
    })
  }
  
  // Update subscription status
  static async updateSubscriptionStatus(status: string) {
    return this.updateClerkMetadata({
      subscriptionStatus: status,
      subscriptionUpdatedAt: new Date().toISOString()
    })
  }
  
  // Check if user has completed onboarding
  static async hasCompletedOnboarding(): Promise<boolean> {
    const profile = await this.getUserProfile()
    return profile?.onboarding_completed === true
  }
  
  // Get VIP contacts
  static async getVipContacts() {
    const { userId } = await auth()
    if (!userId) return []
    
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('vip_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('priority_level', { ascending: false })
    
    if (error) {
      console.error('Error fetching VIP contacts:', error)
      return []
    }
    
    return data || []
  }
  
  // Add VIP contact
  static async addVipContact(contact: {
    email: string
    name?: string
    relationship_type?: string
    priority_level?: number
    notes?: string
  }) {
    const { userId } = await auth()
    if (!userId) throw new Error('User not authenticated')
    
    const supabase = createServiceClient()
    
    const { error } = await supabase
      .from('vip_contacts')
      .insert({
        user_id: userId,
        ...contact
      })
    
    if (error) throw error
    
    return { success: true }
  }
}