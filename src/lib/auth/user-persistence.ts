import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@clerk/nextjs'
import { SignupProfile } from '@/lib/stores/signup-store'

export interface UserProfileData {
  clerk_id: string
  email: string
  name: string
  role: string
  company_size: string
  pain_points?: string[]
  communication_tools?: string[]
  onboarding_completed: boolean
  preferences: {
    notifications: boolean
    ai_suggestions: boolean
    vip_only_mode: boolean
    timezone: string
  }
}

export class UserPersistenceService {
  private supabase = createClient()

  /**
   * Create or update user profile after successful Clerk authentication
   */
  async createUserProfile(profile: SignupProfile, clerkUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First, create or update the main users record
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .upsert({
          id: clerkUserId,
          email: profile.email!,
          name: profile.name!,
          role: profile.role!,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'clerk_id'
        })
        .select()
        .single()

      if (userError) {
        console.error('Error creating user:', userError)
        return { success: false, error: userError.message }
      }

      // Then create the user profile with detailed preferences
      const { error: profileError } = await this.supabase
        .from('user_profiles')
        .upsert({
          user_id: userData.id,
          preferences: {
            company_size: profile.companySize,
            pain_points: profile.painPoints || [],
            communication_tools: profile.communicationTools || [],
            notifications: true,
            ai_suggestions: true,
            vip_only_mode: this.isExecutiveRole(profile.role!),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        return { success: false, error: profileError.message }
      }

      return { success: true }
    } catch (error) {
      console.error('User persistence error:', error)
      return { success: false, error: 'Failed to save user profile' }
    }
  }

  /**
   * Get user profile for AI personalization
   */
  async getUserProfile(clerkUserId: string): Promise<UserProfileData | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select(`
          *,
          user_profiles (
            preferences,
            onboarding_completed
          )
        `)
        .eq('id', clerkUserId)
        .single()

      if (error || !data) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return {
        clerk_id: data.id,
        email: data.email,
        name: data.name || '',
        role: data.role || '',
        company_size: (data.user_profiles as any)?.preferences?.company_size || '',
        pain_points: (data.user_profiles as any)?.preferences?.pain_points || [],
        communication_tools: (data.user_profiles as any)?.preferences?.communication_tools || [],
        onboarding_completed: (data.user_profiles as any)?.onboarding_completed || false,
        preferences: (data.user_profiles as any)?.preferences || {
          notifications: true,
          ai_suggestions: true,
          vip_only_mode: false,
          timezone: 'UTC'
        }
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  /**
   * Update user preferences for AI personalization
   */
  async updateUserPreferences(
    clerkUserId: string, 
    preferences: Partial<UserProfileData['preferences']>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user ID first
      const { data: user } = await this.supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkUserId)
        .single()

      if (!user) {
        return { success: false, error: 'User not found' }
      }

      // Update preferences
      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          preferences: {
            ...preferences
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating preferences:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating user preferences:', error)
      return { success: false, error: 'Failed to update preferences' }
    }
  }

  /**
   * Add to waitlist if accounts aren't ready
   */
  async addToWaitlist(waitlistData: {
    email: string
    name: string
    role: string
    company: string
    priority: 'urgent' | 'high' | 'normal'
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Implement waitlist functionality when waitlist table is added
      console.log('Waitlist signup (placeholder):', waitlistData)
      return { success: true }
    } catch (error) {
      console.error('Waitlist error:', error)
      return { success: false, error: 'Failed to join waitlist' }
    }
  }

  /**
   * Initialize VIP contacts based on role and company size
   */
  async initializeVIPContacts(clerkUserId: string, role: string, companySize: string) {
    try {
      // Get user ID
      const { data: user } = await this.supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkUserId)
        .single()

      if (!user) return

      // Create default VIP contact categories based on executive role
      const vipCategories = this.getDefaultVIPCategories(role, companySize)
      
      // This would typically integrate with the user's existing contacts
      // For now, we just set up the categories in preferences
      await this.supabase
        .from('user_profiles')
        .update({
          vip_contacts: vipCategories,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

    } catch (error) {
      console.error('Error initializing VIP contacts:', error)
    }
  }

  private isExecutiveRole(role: string): boolean {
    const executiveRoles = ['CEO', 'COO', 'CFO', 'CTO', 'CMO', 'CHRO', 'President', 'Founder']
    return executiveRoles.includes(role)
  }

  private getDefaultVIPCategories(role: string, companySize: string): string[] {
    const categories = ['Board Members', 'Direct Reports']
    
    if (role.includes('CEO') || role.includes('Founder')) {
      categories.push('Investors', 'Board Members', 'Key Clients')
    }
    
    if (companySize.includes('Enterprise') || companySize.includes('Public')) {
      categories.push('Shareholders', 'Regulatory Contacts')
    }
    
    return categories
  }
}

// React hook for easy component usage
export function useUserPersistence() {
  const { userId } = useAuth()
  const service = new UserPersistenceService()

  return {
    createUserProfile: (profile: SignupProfile) => 
      userId ? service.createUserProfile(profile, userId) : Promise.resolve({ success: false, error: 'No user ID' }),
    
    getUserProfile: () => 
      userId ? service.getUserProfile(userId) : Promise.resolve(null),
    
    updateUserPreferences: (preferences: Partial<UserProfileData['preferences']>) =>
      userId ? service.updateUserPreferences(userId, preferences) : Promise.resolve({ success: false, error: 'No user ID' }),
    
    initializeVIPContacts: (role: string, companySize: string) =>
      userId ? service.initializeVIPContacts(userId, role, companySize) : Promise.resolve(),
    
    addToWaitlist: service.addToWaitlist.bind(service)
  }
}