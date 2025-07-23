-- Napoleon AI - Complete Database Schema
-- This migration creates all required tables with proper RLS policies

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enable RLS on auth.users (if not already enabled)
alter table auth.users enable row level security;

-- Users table
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  role text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- User profiles table
create table public.user_profiles (
  user_id uuid references public.users(id) on delete cascade primary key,
  preferences jsonb default '{}'::jsonb,
  vip_contacts jsonb default '[]'::jsonb,
  settings jsonb default '{}'::jsonb,
  onboarding_completed boolean default false,
  subscription_status text default 'trial',
  updated_at timestamptz default now() not null
);

-- Connected accounts table
create table public.connected_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  provider text not null check (provider in ('gmail', 'slack', 'teams')),
  account_id text not null,
  account_email text,
  account_name text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  status text default 'active' check (status in ('active', 'inactive', 'error')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, provider, account_id)
);

-- Messages table
create table public.messages (
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

-- Action items table
create table public.action_items (
  id uuid default gen_random_uuid() primary key,
  message_id uuid references public.messages(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  description text not null,
  due_date timestamptz,
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_to text,
  notes text,
  extracted_at timestamptz default now() not null,
  completed_at timestamptz
);

-- VIP contacts table
create table public.vip_contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  email text not null,
  name text,
  relationship_type text check (relationship_type in ('investor', 'board', 'client', 'partner', 'team', 'vendor')),
  priority_level integer default 5 check (priority_level >= 1 and priority_level <= 10),
  notes text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, email)
);

-- Relationship insights table
create table public.relationship_insights (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  contact_email text not null,
  last_contact timestamptz,
  interaction_frequency integer default 0,
  sentiment_score decimal(3,2) default 0.50 check (sentiment_score >= 0 and sentiment_score <= 1),
  follow_up_needed boolean default false,
  insights jsonb default '{}'::jsonb,
  updated_at timestamptz default now() not null,
  unique(user_id, contact_email)
);

-- Create indexes for optimal performance
create index idx_messages_user_priority on public.messages(user_id, priority_score desc, message_date desc);
create index idx_messages_user_status on public.messages(user_id, status, message_date desc);
create index idx_messages_user_vip on public.messages(user_id, is_vip, message_date desc);
create index idx_messages_source_external on public.messages(source, external_id);
create index idx_action_items_user_status on public.action_items(user_id, status, due_date);
create index idx_action_items_message on public.action_items(message_id);
create index idx_connected_accounts_user on public.connected_accounts(user_id, provider, status);
create index idx_vip_contacts_user_email on public.vip_contacts(user_id, email);
create index idx_relationship_insights_user_contact on public.relationship_insights(user_id, contact_email);

-- Enable Row Level Security on all tables
alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.messages enable row level security;
alter table public.action_items enable row level security;
alter table public.vip_contacts enable row level security;
alter table public.relationship_insights enable row level security;

-- RLS Policies for users table
create policy "Users can view own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);

-- RLS Policies for user_profiles table
create policy "Users can manage own profiles" on public.user_profiles for all using (auth.uid() = user_id);

-- RLS Policies for connected_accounts table
create policy "Users can manage own accounts" on public.connected_accounts for all using (auth.uid() = user_id);

-- RLS Policies for messages table
create policy "Users can manage own messages" on public.messages for all using (auth.uid() = user_id);

-- RLS Policies for action_items table
create policy "Users can manage own action items" on public.action_items for all using (auth.uid() = user_id);

-- RLS Policies for vip_contacts table
create policy "Users can manage own vip contacts" on public.vip_contacts for all using (auth.uid() = user_id);

-- RLS Policies for relationship_insights table
create policy "Users can manage own insights" on public.relationship_insights for all using (auth.uid() = user_id);

-- Create function to automatically create user profile on user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  
  insert into public.user_profiles (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create user profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers to all relevant tables
create trigger update_users_updated_at before update on public.users
  for each row execute procedure public.update_updated_at_column();

create trigger update_user_profiles_updated_at before update on public.user_profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_connected_accounts_updated_at before update on public.connected_accounts
  for each row execute procedure public.update_updated_at_column();

create trigger update_messages_updated_at before update on public.messages
  for each row execute procedure public.update_updated_at_column();

create trigger update_vip_contacts_updated_at before update on public.vip_contacts
  for each row execute procedure public.update_updated_at_column();

create trigger update_relationship_insights_updated_at before update on public.relationship_insights
  for each row execute procedure public.update_updated_at_column();