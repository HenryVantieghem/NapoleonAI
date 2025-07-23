export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          user_id: string
          preferences: Json
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          preferences?: Json
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          preferences?: Json
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      connected_accounts: {
        Row: {
          id: string
          user_id: string
          provider: 'gmail' | 'slack' | 'teams'
          account_id: string
          account_email: string | null
          account_name: string | null
          access_token: string | null
          refresh_token: string | null
          expires_at: string | null
          status: 'active' | 'inactive' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'gmail' | 'slack' | 'teams'
          account_id: string
          account_email?: string | null
          account_name?: string | null
          access_token?: string | null
          refresh_token?: string | null
          expires_at?: string | null
          status?: 'active' | 'inactive' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: 'gmail' | 'slack' | 'teams'
          account_id?: string
          account_email?: string | null
          account_name?: string | null
          access_token?: string | null
          refresh_token?: string | null
          expires_at?: string | null
          status?: 'active' | 'inactive' | 'error'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connected_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          user_id: string
          source: 'gmail' | 'slack' | 'teams'
          external_id: string
          thread_id: string | null
          subject: string | null
          content: string
          sender_email: string
          sender_name: string | null
          recipients: Json
          priority_score: number
          ai_summary: string | null
          sentiment: 'positive' | 'neutral' | 'negative' | 'urgent' | null
          is_vip: boolean
          status: 'unread' | 'read' | 'archived' | 'snoozed'
          snoozed_until: string | null
          has_attachments: boolean
          message_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source: 'gmail' | 'slack' | 'teams'
          external_id: string
          thread_id?: string | null
          subject?: string | null
          content: string
          sender_email: string
          sender_name?: string | null
          recipients?: Json
          priority_score?: number
          ai_summary?: string | null
          sentiment?: 'positive' | 'neutral' | 'negative' | 'urgent' | null
          is_vip?: boolean
          status?: 'unread' | 'read' | 'archived' | 'snoozed'
          snoozed_until?: string | null
          has_attachments?: boolean
          message_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source?: 'gmail' | 'slack' | 'teams'
          external_id?: string
          thread_id?: string | null
          subject?: string | null
          content?: string
          sender_email?: string
          sender_name?: string | null
          recipients?: Json
          priority_score?: number
          ai_summary?: string | null
          sentiment?: 'positive' | 'neutral' | 'negative' | 'urgent' | null
          is_vip?: boolean
          status?: 'unread' | 'read' | 'archived' | 'snoozed'
          snoozed_until?: string | null
          has_attachments?: boolean
          message_date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      action_items: {
        Row: {
          id: string
          message_id: string
          user_id: string
          title: string
          description: string
          due_date: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          assigned_to: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          title: string
          description: string
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          assigned_to?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          title?: string
          description?: string
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          assigned_to?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      vip_contacts: {
        Row: {
          id: string
          user_id: string
          email: string
          name: string | null
          company: string | null
          priority_level: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          name?: string | null
          company?: string | null
          priority_level?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          name?: string | null
          company?: string | null
          priority_level?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vip_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

// Type exports for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type ConnectedAccount = Database['public']['Tables']['connected_accounts']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type ActionItem = Database['public']['Tables']['action_items']['Row']
export type VipContact = Database['public']['Tables']['vip_contacts']['Row']

export type UserWithProfile = User & {
  user_profiles?: UserProfile
}

export type MessageWithActions = Message & {
  action_items?: ActionItem[]
}