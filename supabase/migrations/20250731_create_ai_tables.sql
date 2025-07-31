-- Napoleon AI - AI Processing Tables Migration
-- Creates comprehensive data model for Gmail message analysis and AI processing
-- Migration: 20250731_create_ai_tables.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS public.ai_processing_logs CASCADE;
DROP TABLE IF EXISTS public.concierge_requests CASCADE;
DROP TABLE IF EXISTS public.action_items CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.connected_accounts CASCADE;

-- Enhance existing messages table or create if not exists
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source varchar(50) NOT NULL CHECK (source IN ('gmail', 'slack', 'teams')),
  external_id varchar(255) NOT NULL,
  sender text NOT NULL,
  subject text,
  content text NOT NULL,
  priority_score integer CHECK (priority_score >= 0 AND priority_score <= 100),
  ai_summary text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  -- Additional AI processing metadata
  processing_status varchar(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_attempts integer DEFAULT 0,
  last_processing_error text,
  -- VIP and context flags for AI processing
  is_vip boolean DEFAULT false,
  urgency_keywords text[],
  -- Unique constraint to prevent duplicate messages
  UNIQUE(user_id, source, external_id)
);

-- Action items extracted from messages
CREATE TABLE IF NOT EXISTS public.action_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  due_date date,
  status varchar(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  priority varchar(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  extracted_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  -- AI confidence score for extraction quality
  confidence_score decimal(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  -- Metadata for action item context
  context_snippet text,
  estimated_duration interval
);

-- Connected accounts for OAuth integrations
CREATE TABLE IF NOT EXISTS public.connected_accounts (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider varchar(50) NOT NULL CHECK (provider IN ('gmail', 'slack', 'teams', 'outlook')),
  account_id varchar(255) NOT NULL,
  account_email varchar(255),
  account_name varchar(255),
  -- Encrypted token storage
  tokens jsonb NOT NULL,
  status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'expired')),
  -- OAuth metadata
  scope_granted text[],
  permissions_level varchar(20) DEFAULT 'read' CHECK (permissions_level IN ('read', 'write', 'admin')),
  last_sync_at timestamptz,
  sync_error text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, provider, account_id)
);

-- Enhanced user preferences for AI personalization
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  -- Profile setup from onboarding
  profile_setup jsonb DEFAULT '{
    "role": null,
    "company_size": null,
    "communication_patterns": [],
    "priority_keywords": [],
    "working_hours": {"start": "09:00", "end": "17:00", "timezone": "UTC"}
  }'::jsonb,
  onboarding_complete boolean DEFAULT false,
  -- VIP contacts for priority boosting
  vip_contacts jsonb DEFAULT '[]'::jsonb,
  -- AI processing preferences
  ai_preferences jsonb DEFAULT '{
    "auto_summarize": true,
    "auto_extract_actions": true,
    "priority_threshold": 70,
    "summary_length": "medium",
    "action_item_sensitivity": "medium"
  }'::jsonb,
  -- Notification preferences
  notification_preferences jsonb DEFAULT '{
    "email_digest": true,
    "high_priority_alerts": true,
    "action_item_reminders": true,
    "digest_frequency": "daily"
  }'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Concierge requests for premium support
CREATE TABLE IF NOT EXISTS public.concierge_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_type varchar(50) NOT NULL CHECK (request_type IN ('integration_help', 'ai_tuning', 'priority_setup', 'custom_workflow', 'general_support')),
  subject text NOT NULL,
  description text NOT NULL,
  priority varchar(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status varchar(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'closed')),
  assigned_to varchar(255),
  requested_at timestamptz DEFAULT now() NOT NULL,
  resolved_at timestamptz,
  -- Context for better support
  context_data jsonb DEFAULT '{}'::jsonb,
  internal_notes text
);

-- AI processing logs for monitoring and debugging
CREATE TABLE IF NOT EXISTS public.ai_processing_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  batch_id uuid DEFAULT gen_random_uuid(),
  operation_type varchar(50) NOT NULL CHECK (operation_type IN ('summarize', 'prioritize', 'extract_actions', 'batch_process')),
  message_count integer NOT NULL DEFAULT 1,
  -- Performance metrics
  processing_time_ms integer NOT NULL,
  tokens_used integer,
  cost_cents integer,
  -- Success metrics
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  -- Model information
  model_used varchar(100),
  model_version varchar(50),
  -- Timestamp
  processed_at timestamptz DEFAULT now() NOT NULL,
  -- Error details if any
  error_details jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_source ON public.messages(source);
CREATE INDEX IF NOT EXISTS idx_messages_priority_score ON public.messages(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_messages_processing_status ON public.messages(processing_status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_ai_summary ON public.messages(ai_summary) WHERE ai_summary IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_action_items_user_id ON public.action_items(user_id);
CREATE INDEX IF NOT EXISTS idx_action_items_message_id ON public.action_items(message_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON public.action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date ON public.action_items(due_date);
CREATE INDEX IF NOT EXISTS idx_action_items_priority ON public.action_items(priority);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON public.connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_status ON public.connected_accounts(status);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_last_sync ON public.connected_accounts(last_sync_at);

CREATE INDEX IF NOT EXISTS idx_concierge_requests_user_id ON public.concierge_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_concierge_requests_status ON public.concierge_requests(status);
CREATE INDEX IF NOT EXISTS idx_concierge_requests_priority ON public.concierge_requests(priority);

CREATE INDEX IF NOT EXISTS idx_ai_processing_logs_user_id ON public.ai_processing_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_processing_logs_batch_id ON public.ai_processing_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_ai_processing_logs_processed_at ON public.ai_processing_logs(processed_at DESC);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concierge_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_processing_logs ENABLE ROW LEVEL SECURITY;

-- Messages table policies
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
CREATE POLICY "Users can insert own messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
CREATE POLICY "Users can delete own messages" ON public.messages
  FOR DELETE USING (auth.uid() = user_id);

-- Action items table policies
DROP POLICY IF EXISTS "Users can view own action items" ON public.action_items;
CREATE POLICY "Users can view own action items" ON public.action_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own action items" ON public.action_items;
CREATE POLICY "Users can insert own action items" ON public.action_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own action items" ON public.action_items;
CREATE POLICY "Users can update own action items" ON public.action_items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own action items" ON public.action_items;
CREATE POLICY "Users can delete own action items" ON public.action_items
  FOR DELETE USING (auth.uid() = user_id);

-- Connected accounts table policies
DROP POLICY IF EXISTS "Users can view own connected accounts" ON public.connected_accounts;
CREATE POLICY "Users can view own connected accounts" ON public.connected_accounts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own connected accounts" ON public.connected_accounts;
CREATE POLICY "Users can insert own connected accounts" ON public.connected_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own connected accounts" ON public.connected_accounts;
CREATE POLICY "Users can update own connected accounts" ON public.connected_accounts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own connected accounts" ON public.connected_accounts;
CREATE POLICY "Users can delete own connected accounts" ON public.connected_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- User preferences table policies
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Concierge requests table policies
DROP POLICY IF EXISTS "Users can view own concierge requests" ON public.concierge_requests;
CREATE POLICY "Users can view own concierge requests" ON public.concierge_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own concierge requests" ON public.concierge_requests;
CREATE POLICY "Users can insert own concierge requests" ON public.concierge_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own concierge requests" ON public.concierge_requests;
CREATE POLICY "Users can update own concierge requests" ON public.concierge_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- AI processing logs table policies (read-only for users)
DROP POLICY IF EXISTS "Users can view own processing logs" ON public.ai_processing_logs;
CREATE POLICY "Users can view own processing logs" ON public.ai_processing_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert processing logs
DROP POLICY IF EXISTS "Service role can insert processing logs" ON public.ai_processing_logs;
CREATE POLICY "Service role can insert processing logs" ON public.ai_processing_logs
  FOR INSERT WITH CHECK (true);

-- Functions for maintaining updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_connected_accounts_updated_at ON public.connected_accounts;
CREATE TRIGGER update_connected_accounts_updated_at
    BEFORE UPDATE ON public.connected_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.action_items TO authenticated;
GRANT ALL ON public.connected_accounts TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.concierge_requests TO authenticated;
GRANT SELECT ON public.ai_processing_logs TO authenticated;

-- Grant permissions to service role for AI processing
GRANT ALL ON public.messages TO service_role;
GRANT ALL ON public.action_items TO service_role;
GRANT ALL ON public.ai_processing_logs TO service_role;

COMMENT ON TABLE public.messages IS 'Unified message storage for Gmail, Slack, and Teams with AI processing metadata';
COMMENT ON TABLE public.action_items IS 'Action items extracted from messages using AI processing';
COMMENT ON TABLE public.connected_accounts IS 'OAuth connected accounts for external integrations';
COMMENT ON TABLE public.user_preferences IS 'User preferences and VIP contacts for AI personalization';
COMMENT ON TABLE public.concierge_requests IS 'Premium concierge support requests for executives';
COMMENT ON TABLE public.ai_processing_logs IS 'Monitoring and debugging logs for AI operations';