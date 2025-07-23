import { createClient } from '@/lib/supabase/client'
import type { UserWithProfile } from '@/types/database'

export class UserProfileClientService {
  // Client-side: Get user profile
  static async getUserProfile(userId: string): Promise<UserWithProfile | null> {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          users!inner(*)
        `)
        .eq('user_id', userId)
        .single()
      
      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }
  
  // Client-side: Update user profile
  static async updateProfile(userId: string, updates: any) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
    
    if (error) throw error
    
    return { success: true }
  }
  
  // Get VIP contacts
  static async getVipContacts(userId: string) {
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
    
    return data || []
  }
  
  // Add VIP contact
  static async addVipContact(userId: string, contact: {
    email: string
    name?: string
    relationship_type?: 'investor' | 'board' | 'client' | 'partner' | 'team' | 'vendor'
    priority_level?: number
    notes?: string
  }) {
    const supabase = createClient()
    
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