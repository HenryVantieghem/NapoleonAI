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
          vip_contacts: Json
          settings: Json
          onboarding_completed: boolean
          subscription_status: string
          updated_at: string
        }
        Insert: {
          user_id: string
          preferences?: Json
          vip_contacts?: Json
          settings?: Json
          onboarding_completed?: boolean
          subscription_status?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          preferences?: Json
          vip_contacts?: Json
          settings?: Json
          onboarding_completed?: boolean
          subscription_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
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
          scope: string | null
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
          scope?: string | null
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
          scope?: string | null
          status?: 'active' | 'inactive' | 'error'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connected_accounts_user_id_fkey"
            columns: ["user_id"]
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
          description: string
          due_date: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          assigned_to: string | null
          notes: string | null
          extracted_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          description: string
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          assigned_to?: string | null
          notes?: string | null
          extracted_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          description?: string
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          assigned_to?: string | null
          notes?: string | null
          extracted_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_items_message_id_fkey"
            columns: ["message_id"]
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_user_id_fkey"
            columns: ["user_id"]
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
          relationship_type: 'investor' | 'board' | 'client' | 'partner' | 'team' | 'vendor' | null
          priority_level: number
          notes: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          name?: string | null
          relationship_type?: 'investor' | 'board' | 'client' | 'partner' | 'team' | 'vendor' | null
          priority_level?: number
          notes?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          name?: string | null
          relationship_type?: 'investor' | 'board' | 'client' | 'partner' | 'team' | 'vendor' | null
          priority_level?: number
          notes?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vip_contacts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      relationship_insights: {
        Row: {
          id: string
          user_id: string
          contact_email: string
          last_contact: string | null
          interaction_frequency: number
          sentiment_score: number
          follow_up_needed: boolean
          insights: Json
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_email: string
          last_contact?: string | null
          interaction_frequency?: number
          sentiment_score?: number
          follow_up_needed?: boolean
          insights?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_email?: string
          last_contact?: string | null
          interaction_frequency?: number
          sentiment_score?: number
          follow_up_needed?: boolean
          insights?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_insights_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      // AI Processing Tables
      message_analysis: {
        Row: {
          id: string
          message_id: string
          user_id: string
          priority: 'critical' | 'high' | 'medium' | 'low'
          urgency: 'immediate' | 'today' | 'thisWeek' | 'normal'
          business_impact: 'very-high' | 'high' | 'medium' | 'low'
          sentiment: 'positive' | 'neutral' | 'negative' | 'urgent'
          topics: string[]
          action_required: boolean
          decision_required: boolean
          financial_impact: number
          stakeholder_level: 'board' | 'executive' | 'management' | 'staff' | 'external' | null
          time_to_decision: number | null
          risk_level: 'critical' | 'high' | 'medium' | 'low' | null
          confidence: number
          reasoning: string | null
          suggested_actions: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          priority: 'critical' | 'high' | 'medium' | 'low'
          urgency: 'immediate' | 'today' | 'thisWeek' | 'normal'
          business_impact: 'very-high' | 'high' | 'medium' | 'low'
          sentiment: 'positive' | 'neutral' | 'negative' | 'urgent'
          topics?: string[]
          action_required?: boolean
          decision_required?: boolean
          financial_impact?: number
          stakeholder_level?: 'board' | 'executive' | 'management' | 'staff' | 'external' | null
          time_to_decision?: number | null
          risk_level?: 'critical' | 'high' | 'medium' | 'low' | null
          confidence?: number
          reasoning?: string | null
          suggested_actions?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          priority?: 'critical' | 'high' | 'medium' | 'low'
          urgency?: 'immediate' | 'today' | 'thisWeek' | 'normal'
          business_impact?: 'very-high' | 'high' | 'medium' | 'low'
          sentiment?: 'positive' | 'neutral' | 'negative' | 'urgent'
          topics?: string[]
          action_required?: boolean
          decision_required?: boolean
          financial_impact?: number
          stakeholder_level?: 'board' | 'executive' | 'management' | 'staff' | 'external' | null
          time_to_decision?: number | null
          risk_level?: 'critical' | 'high' | 'medium' | 'low' | null
          confidence?: number
          reasoning?: string | null
          suggested_actions?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      executive_summaries: {
        Row: {
          id: string
          message_id: string
          user_id: string
          summary: string
          key_points: string[]
          decision_required: string | null
          business_impact: string | null
          recommended_action: string | null
          timeframe: string | null
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          summary: string
          key_points?: string[]
          decision_required?: string | null
          business_impact?: string | null
          recommended_action?: string | null
          timeframe?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          summary?: string
          key_points?: string[]
          decision_required?: string | null
          business_impact?: string | null
          recommended_action?: string | null
          timeframe?: string | null
          created_at?: string
        }
        Relationships: []
      }
      // Advanced Features Tables
      vip_rules: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          conditions: Json
          actions: Json
          is_active: boolean
          priority: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          conditions?: Json
          actions?: Json
          is_active?: boolean
          priority?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          conditions?: Json
          actions?: Json
          is_active?: boolean
          priority?: number
          created_at?: string
        }
        Relationships: []
      }
      search_queries: {
        Row: {
          id: string
          user_id: string
          query: string
          result_count: number
          processing_time_ms: number
          filters_used: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query: string
          result_count?: number
          processing_time_ms?: number
          filters_used?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          query?: string
          result_count?: number
          processing_time_ms?: number
          filters_used?: Json
          created_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          role: string
          department: string | null
          skills: string[]
          availability: Json
          workload: Json
          delegation_history: Json
          preferences: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          role: string
          department?: string | null
          skills?: string[]
          availability?: Json
          workload?: Json
          delegation_history?: Json
          preferences?: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          role?: string
          department?: string | null
          skills?: string[]
          availability?: Json
          workload?: Json
          delegation_history?: Json
          preferences?: Json
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      delegation_rules: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          conditions: Json
          actions: Json
          delegated_to: string
          approval_required: boolean
          escalation_rules: Json
          is_active: boolean
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          conditions?: Json
          actions?: Json
          delegated_to: string
          approval_required?: boolean
          escalation_rules?: Json
          is_active?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          conditions?: Json
          actions?: Json
          delegated_to?: string
          approval_required?: boolean
          escalation_rules?: Json
          is_active?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      delegation_tasks: {
        Row: {
          id: string
          user_id: string
          message_id: string
          delegated_to: string
          delegated_by: string
          status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'escalated' | 'rejected'
          priority: 'critical' | 'high' | 'medium' | 'low'
          due_date: string | null
          instructions: string
          context: Json
          response: string | null
          feedback: string | null
          completed_at: string | null
          escalated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message_id: string
          delegated_to: string
          delegated_by: string
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'escalated' | 'rejected'
          priority: 'critical' | 'high' | 'medium' | 'low'
          due_date?: string | null
          instructions: string
          context?: Json
          response?: string | null
          feedback?: string | null
          completed_at?: string | null
          escalated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message_id?: string
          delegated_to?: string
          delegated_by?: string
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'escalated' | 'rejected'
          priority?: 'critical' | 'high' | 'medium' | 'low'
          due_date?: string | null
          instructions?: string
          context?: Json
          response?: string | null
          feedback?: string | null
          completed_at?: string | null
          escalated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      smart_notifications: {
        Row: {
          id: string
          user_id: string
          message_id: string | null
          type: 'message_received' | 'priority_alert' | 'vip_communication' | 'deadline_reminder' | 'delegation_update' | 'meeting_reminder' | 'system_alert' | 'digest_summary'
          title: string
          content: string
          priority: 'critical' | 'high' | 'medium' | 'low'
          channels: string[]
          status: 'pending' | 'scheduled' | 'delivered' | 'read' | 'dismissed' | 'failed'
          intelligence_data: Json
          scheduled_for: string | null
          delivered_at: string | null
          read_at: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message_id?: string | null
          type: 'message_received' | 'priority_alert' | 'vip_communication' | 'deadline_reminder' | 'delegation_update' | 'meeting_reminder' | 'system_alert' | 'digest_summary'
          title: string
          content: string
          priority: 'critical' | 'high' | 'medium' | 'low'
          channels: string[]
          status?: 'pending' | 'scheduled' | 'delivered' | 'read' | 'dismissed' | 'failed'
          intelligence_data?: Json
          scheduled_for?: string | null
          delivered_at?: string | null
          read_at?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message_id?: string | null
          type?: 'message_received' | 'priority_alert' | 'vip_communication' | 'deadline_reminder' | 'delegation_update' | 'meeting_reminder' | 'system_alert' | 'digest_summary'
          title?: string
          content?: string
          priority?: 'critical' | 'high' | 'medium' | 'low'
          channels?: string[]
          status?: 'pending' | 'scheduled' | 'delivered' | 'read' | 'dismissed' | 'failed'
          intelligence_data?: Json
          scheduled_for?: string | null
          delivered_at?: string | null
          read_at?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      notification_rules: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          triggers: Json
          conditions: Json
          actions: Json
          schedule: Json
          quiet_hours: Json
          is_active: boolean
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          triggers?: Json
          conditions?: Json
          actions?: Json
          schedule?: Json
          quiet_hours?: Json
          is_active?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          triggers?: Json
          conditions?: Json
          actions?: Json
          schedule?: Json
          quiet_hours?: Json
          is_active?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          channels: Json
          batch_delivery: Json
          intelligent_summary: Json
          do_not_disturb: Json
          priorities: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          channels: Json
          batch_delivery?: Json
          intelligent_summary?: Json
          do_not_disturb?: Json
          priorities: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          channels?: Json
          batch_delivery?: Json
          intelligent_summary?: Json
          do_not_disturb?: Json
          priorities?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          subject_template: string | null
          body_template: string
          variables: string[]
          usage_count: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string
          subject_template?: string | null
          body_template: string
          variables?: string[]
          usage_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          subject_template?: string | null
          body_template?: string
          variables?: string[]
          usage_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      quick_responses: {
        Row: {
          id: string
          user_id: string
          trigger_keywords: string[]
          response_text: string
          tone: 'professional' | 'friendly' | 'formal' | 'brief'
          category: string
          usage_count: number
          effectiveness_score: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trigger_keywords?: string[]
          response_text: string
          tone?: 'professional' | 'friendly' | 'formal' | 'brief'
          category?: string
          usage_count?: number
          effectiveness_score?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trigger_keywords?: string[]
          response_text?: string
          tone?: 'professional' | 'friendly' | 'formal' | 'brief'
          category?: string
          usage_count?: number
          effectiveness_score?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          external_id: string | null
          title: string
          description: string | null
          start_time: string
          end_time: string
          location: string | null
          attendees: Json
          meeting_url: string | null
          platform: 'outlook' | 'google' | 'teams' | null
          status: 'confirmed' | 'tentative' | 'cancelled'
          related_messages: string[]
          metadata: Json
          synced_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          external_id?: string | null
          title: string
          description?: string | null
          start_time: string
          end_time: string
          location?: string | null
          attendees?: Json
          meeting_url?: string | null
          platform?: 'outlook' | 'google' | 'teams' | null
          status?: 'confirmed' | 'tentative' | 'cancelled'
          related_messages?: string[]
          metadata?: Json
          synced_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          external_id?: string | null
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          location?: string | null
          attendees?: Json
          meeting_url?: string | null
          platform?: 'outlook' | 'google' | 'teams' | null
          status?: 'confirmed' | 'tentative' | 'cancelled'
          related_messages?: string[]
          metadata?: Json
          synced_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      executive_insights: {
        Row: {
          id: string
          user_id: string
          insight_type: 'communication_pattern' | 'productivity_trend' | 'delegation_opportunity' | 'time_optimization' | 'stakeholder_analysis'
          title: string
          description: string
          data: Json
          confidence_score: number
          business_impact: 'high' | 'medium' | 'low' | null
          actionable_recommendations: string[]
          status: 'new' | 'acknowledged' | 'acted_upon' | 'dismissed'
          valid_until: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          insight_type: 'communication_pattern' | 'productivity_trend' | 'delegation_opportunity' | 'time_optimization' | 'stakeholder_analysis'
          title: string
          description: string
          data: Json
          confidence_score?: number
          business_impact?: 'high' | 'medium' | 'low' | null
          actionable_recommendations?: string[]
          status?: 'new' | 'acknowledged' | 'acted_upon' | 'dismissed'
          valid_until?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          insight_type?: 'communication_pattern' | 'productivity_trend' | 'delegation_opportunity' | 'time_optimization' | 'stakeholder_analysis'
          title?: string
          description?: string
          data?: Json
          confidence_score?: number
          business_impact?: 'high' | 'medium' | 'low' | null
          actionable_recommendations?: string[]
          status?: 'new' | 'acknowledged' | 'acted_upon' | 'dismissed'
          valid_until?: string | null
          created_at?: string
        }
        Relationships: []
      }
      // Integration Tables
      user_integrations: {
        Row: {
          id: string
          user_id: string
          platform: 'gmail' | 'slack' | 'teams'
          access_token: string
          refresh_token: string | null
          token_expires_at: string | null
          scope: string[]
          is_active: boolean
          metadata: Json
          last_sync_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'gmail' | 'slack' | 'teams'
          access_token: string
          refresh_token?: string | null
          token_expires_at?: string | null
          scope?: string[]
          is_active?: boolean
          metadata?: Json
          last_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'gmail' | 'slack' | 'teams'
          access_token?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          scope?: string[]
          is_active?: boolean
          metadata?: Json
          last_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      // Additional Missing Tables
      communication_insights: {
        Row: {
          id: string
          user_id: string
          patterns: Json
          recommendations: Json
          trends: Json
          delegation_opportunities: Json
          efficiency_metrics: Json
          generated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          patterns?: Json
          recommendations?: Json
          trends?: Json
          delegation_opportunities?: Json
          efficiency_metrics?: Json
          generated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          patterns?: Json
          recommendations?: Json
          trends?: Json
          delegation_opportunities?: Json
          efficiency_metrics?: Json
          generated_at?: string
        }
        Relationships: []
      }
      decision_contexts: {
        Row: {
          id: string
          message_id: string
          user_id: string
          decision_type: string
          stakeholders: Json
          timeline: Json
          risk_assessment: Json
          options: Json
          recommendations: string[]
          precedents: string[]
          status: 'pending' | 'in-progress' | 'decided' | 'cancelled'
          decision_made_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          decision_type: string
          stakeholders?: Json
          timeline?: Json
          risk_assessment?: Json
          options?: Json
          recommendations?: string[]
          precedents?: string[]
          status?: 'pending' | 'in-progress' | 'decided' | 'cancelled'
          decision_made_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          decision_type?: string
          stakeholders?: Json
          timeline?: Json
          risk_assessment?: Json
          options?: Json
          recommendations?: string[]
          precedents?: string[]
          status?: 'pending' | 'in-progress' | 'decided' | 'cancelled'
          decision_made_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type ConnectedAccount = Database['public']['Tables']['connected_accounts']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type ActionItem = Database['public']['Tables']['action_items']['Row']
export type VipContact = Database['public']['Tables']['vip_contacts']['Row']
export type RelationshipInsight = Database['public']['Tables']['relationship_insights']['Row']

// AI Processing Types
export type MessageAnalysis = Database['public']['Tables']['message_analysis']['Row']
export type ExecutiveSummary = Database['public']['Tables']['executive_summaries']['Row']

// Advanced Features Types
export type VipRule = Database['public']['Tables']['vip_rules']['Row']
export type SearchQuery = Database['public']['Tables']['search_queries']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type DelegationRule = Database['public']['Tables']['delegation_rules']['Row']
export type DelegationTask = Database['public']['Tables']['delegation_tasks']['Row']
export type SmartNotification = Database['public']['Tables']['smart_notifications']['Row']
export type NotificationRule = Database['public']['Tables']['notification_rules']['Row']
export type NotificationPreference = Database['public']['Tables']['notification_preferences']['Row']
export type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
export type QuickResponse = Database['public']['Tables']['quick_responses']['Row']
export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']
export type ExecutiveInsight = Database['public']['Tables']['executive_insights']['Row']
export type UserIntegration = Database['public']['Tables']['user_integrations']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type ConnectedAccountInsert = Database['public']['Tables']['connected_accounts']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type ActionItemInsert = Database['public']['Tables']['action_items']['Insert']
export type VipContactInsert = Database['public']['Tables']['vip_contacts']['Insert']
export type RelationshipInsightInsert = Database['public']['Tables']['relationship_insights']['Insert']
export type MessageAnalysisInsert = Database['public']['Tables']['message_analysis']['Insert']
export type ExecutiveSummaryInsert = Database['public']['Tables']['executive_summaries']['Insert']
export type VipRuleInsert = Database['public']['Tables']['vip_rules']['Insert']
export type SearchQueryInsert = Database['public']['Tables']['search_queries']['Insert']
export type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert']
export type DelegationRuleInsert = Database['public']['Tables']['delegation_rules']['Insert']
export type DelegationTaskInsert = Database['public']['Tables']['delegation_tasks']['Insert']
export type SmartNotificationInsert = Database['public']['Tables']['smart_notifications']['Insert']
export type NotificationRuleInsert = Database['public']['Tables']['notification_rules']['Insert']
export type NotificationPreferenceInsert = Database['public']['Tables']['notification_preferences']['Insert']
export type EmailTemplateInsert = Database['public']['Tables']['email_templates']['Insert']
export type QuickResponseInsert = Database['public']['Tables']['quick_responses']['Insert']
export type CalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert']
export type ExecutiveInsightInsert = Database['public']['Tables']['executive_insights']['Insert']
export type UserIntegrationInsert = Database['public']['Tables']['user_integrations']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
export type ConnectedAccountUpdate = Database['public']['Tables']['connected_accounts']['Update']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']
export type ActionItemUpdate = Database['public']['Tables']['action_items']['Update']
export type VipContactUpdate = Database['public']['Tables']['vip_contacts']['Update']
export type RelationshipInsightUpdate = Database['public']['Tables']['relationship_insights']['Update']
export type MessageAnalysisUpdate = Database['public']['Tables']['message_analysis']['Update']
export type ExecutiveSummaryUpdate = Database['public']['Tables']['executive_summaries']['Update']
export type VipRuleUpdate = Database['public']['Tables']['vip_rules']['Update']
export type SearchQueryUpdate = Database['public']['Tables']['search_queries']['Update']
export type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update']
export type DelegationRuleUpdate = Database['public']['Tables']['delegation_rules']['Update']
export type DelegationTaskUpdate = Database['public']['Tables']['delegation_tasks']['Update']
export type SmartNotificationUpdate = Database['public']['Tables']['smart_notifications']['Update']
export type NotificationRuleUpdate = Database['public']['Tables']['notification_rules']['Update']
export type NotificationPreferenceUpdate = Database['public']['Tables']['notification_preferences']['Update']
export type EmailTemplateUpdate = Database['public']['Tables']['email_templates']['Update']
export type QuickResponseUpdate = Database['public']['Tables']['quick_responses']['Update']
export type CalendarEventUpdate = Database['public']['Tables']['calendar_events']['Update']
export type ExecutiveInsightUpdate = Database['public']['Tables']['executive_insights']['Update']
export type UserIntegrationUpdate = Database['public']['Tables']['user_integrations']['Update']

// Extended types for joined data
export type MessageWithDetails = Message & {
  action_items?: ActionItem[]
  message_analysis?: MessageAnalysis
}

export type ActionItemWithMessage = ActionItem & {
  messages?: Pick<Message, 'subject' | 'sender_name' | 'sender_email'>
}

export type UserWithProfile = User & {
  user_profiles?: UserProfile
}