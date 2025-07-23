-- Napoleon AI MVP - Simplified Database Schema
-- This migration creates only the essential tables for MVP functionality

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Drop complex tables that are not needed for MVP
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP TABLE IF EXISTS public.quick_responses CASCADE;
DROP TABLE IF EXISTS public.calendar_events CASCADE;
DROP TABLE IF EXISTS public.executive_insights CASCADE;
DROP TABLE IF EXISTS public.communication_insights CASCADE;
DROP TABLE IF EXISTS public.decision_contexts CASCADE;
DROP TABLE IF EXISTS public.delegation_rules CASCADE;
DROP TABLE IF EXISTS public.delegation_tasks CASCADE;
DROP TABLE IF EXISTS public.smart_notifications CASCADE;
DROP TABLE IF EXISTS public.notification_rules CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.search_queries CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.vip_rules CASCADE;
DROP TABLE IF EXISTS public.relationship_insights CASCADE;
DROP TABLE IF EXISTS public.message_analysis CASCADE;
DROP TABLE IF EXISTS public.executive_summaries CASCADE;

-- Keep core tables and ensure they exist with simplified structure

-- Users table (essential)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  role text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- User profiles (simplified - basic settings only)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid references public.users(id) on delete cascade primary key,
  preferences jsonb default '{}'::jsonb,
  onboarding_completed boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Connected accounts (essential for OAuth)
CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  provider text not null check (provider in ('gmail', 'slack', 'teams')),
  account_id text not null,
  account_email text,
  account_name text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  status text default 'active' check (status in ('active', 'inactive', 'error')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, provider, account_id)
);

-- Messages (essential - unified communication)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  source text not null check (source in ('gmail', 'slack', 'teams')),
  external_id text not null,
  thread_id text,
  subject text,
  content text not null,
  sender_email text not null,
  sender_name text,
  recipients jsonb default '[]'::jsonb,
  priority_score integer default 0 check (priority_score >= 0 and priority_score <= 100),
  ai_summary text,
  sentiment text check (sentiment in ('positive', 'neutral', 'negative', 'urgent')),
  is_vip boolean default false,
  status text default 'unread' check (status in ('unread', 'read', 'archived', 'snoozed')),
  snoozed_until timestamptz,
  has_attachments boolean default false,
  message_date timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, source, external_id)
);

-- Action items (essential - task extraction)
CREATE TABLE IF NOT EXISTS public.action_items (
  id uuid default gen_random_uuid() primary key,
  message_id uuid references public.messages(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  due_date timestamptz,
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_to text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- VIP contacts (essential - core relationship management)
CREATE TABLE IF NOT EXISTS public.vip_contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  email text not null,
  name text,
  company text,
  priority_level integer default 5 check (priority_level >= 1 and priority_level <= 10),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, email)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_messages_user_priority ON public.messages(user_id, priority_score desc, message_date desc);
CREATE INDEX IF NOT EXISTS idx_messages_user_status ON public.messages(user_id, status, message_date desc);
CREATE INDEX IF NOT EXISTS idx_messages_user_vip ON public.messages(user_id, is_vip, message_date desc);
CREATE INDEX IF NOT EXISTS idx_action_items_user_status ON public.action_items(user_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user ON public.connected_accounts(user_id, provider, status);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (essential security)
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own profiles" ON public.user_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own accounts" ON public.connected_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own messages" ON public.messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own action items" ON public.action_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own vip contacts" ON public.vip_contacts FOR ALL USING (auth.uid() = user_id);