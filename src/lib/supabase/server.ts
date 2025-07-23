import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Service role client for admin operations
export function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No-op for service role client
        },
      },
    }
  )
}

// Helper to get current user server-side
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

// Helper to get user with profile
export async function getUserWithProfile(userId?: string) {
  const supabase = createClient()
  
  let targetUserId = userId
  if (!targetUserId) {
    const user = await getCurrentUser()
    if (!user) return null
    targetUserId = user.id
  }
  
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      user_profiles (*)
    `)
    .eq('id', targetUserId)
    .single()
    
  if (error) {
    console.error('Error fetching user with profile:', error)
    return null
  }
  
  return data
}

// Database query helpers
export async function getMessages(userId: string, options?: {
  status?: string
  isVip?: boolean
  limit?: number
  offset?: number
}) {
  const supabase = createClient()
  
  let query = supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('message_date', { ascending: false })
  
  if (options?.status) {
    query = query.eq('status', options.status as 'unread' | 'read' | 'archived' | 'snoozed')
  }
  
  if (options?.isVip !== undefined) {
    query = query.eq('is_vip', options.isVip)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }
  
  return data
}

export async function getActionItems(userId: string, options?: {
  status?: string
  priority?: string
  limit?: number
}) {
  const supabase = createClient()
  
  let query = supabase
    .from('action_items')
    .select(`
      *,
      messages (
        subject,
        sender_name,
        sender_email
      )
    `)
    .eq('user_id', userId)
    .order('due_date', { ascending: true, nullsFirst: false })
  
  if (options?.status) {
    query = query.eq('status', options.status as 'pending' | 'in_progress' | 'completed' | 'cancelled')
  }
  
  if (options?.priority) {
    query = query.eq('priority', options.priority as 'low' | 'medium' | 'high' | 'urgent')
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching action items:', error)
    return []
  }
  
  return data
}

export async function getVipContacts(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('vip_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('priority_level', { ascending: false })
  
  if (error) {
    console.error('Error fetching VIP contacts:', error)
    return []
  }
  
  return data
}

export async function getConnectedAccounts(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
  
  if (error) {
    console.error('Error fetching connected accounts:', error)
    return []
  }
  
  return data
}

export async function getRelationshipInsights(userId: string, contactEmail?: string) {
  // Simplified for MVP - no relationship insights table
  return []
}