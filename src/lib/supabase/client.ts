import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Export singleton instance for use in client components
export const supabase = createClient()

// Real-time subscription helpers
export const subscribeToMessages = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToActionItems = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('action_items')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'action_items',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

// Database operations for user profile management
export const createUserProfile = async (userId: string, userData: any) => {
  const client = createClient()
  
  // Create user record
  const { error: userError } = await client
    .from('users')
    .upsert({
      id: userId,
      email: userData.email,
      name: userData.name,
      role: userData.role || '',
      avatar_url: userData.avatar_url || ''
    }, {
      onConflict: 'id'
    })

  if (userError) throw userError

  // Create user profile
  const { error: profileError } = await client
    .from('user_profiles')
    .upsert({
      user_id: userId,
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
      onboarding_completed: false,
      subscription_status: 'trial'
    }, {
      onConflict: 'user_id'
    })

  if (profileError) throw profileError
  return { success: true }
}

// Note: OAuth integrations (Gmail, Slack, Teams) are handled separately from Clerk auth