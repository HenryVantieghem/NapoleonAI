claude.md
# Napoleon AI - Executive Communication Commander

## Mission: Build Production-Ready MVP
Create a luxury productivity platform that transforms communication chaos into strategic clarity for C-suite executives. Deploy fully functional MVP to Vercel with all integrations working.

## Complete Tech Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI**: OpenAI GPT-4 via Vercel AI SDK
- **Integrations**: Gmail API + Slack Web API + Microsoft Graph API
- **Deployment**: Vercel + GitHub Actions
- **UI Components**: shadcn/ui + Custom luxury components

## Luxury Design System - Cartier Theme
```css
/* Color Palette - Use Exactly */
:root {
  --white: #FFFFFF;
  --black: #000000;
  --cream: #F8F6F0;
  --burgundy: #801B2B;
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-900: #111827;
}

/* Typography System */
--font-serif: 'Playfair Display', serif;  /* Headers */
--font-sans: 'Inter', sans-serif;         /* Body */
--font-script: 'Dancing Script', cursive; /* Logo */

/* Spacing: 8px grid system */
/* Animations: 300ms ease-in-out */
/* Shadows: Subtle, elegant depth */
/* Borders: 1px solid with high contrast */
```

## Complete Database Schema
```sql
-- Enable RLS
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

-- User profiles
create table public.user_profiles (
  user_id uuid references public.users(id) on delete cascade primary key,
  preferences jsonb default '{}'::jsonb,
  vip_contacts jsonb default '[]'::jsonb,
  settings jsonb default '{}'::jsonb,
  onboarding_completed boolean default false,
  subscription_status text default 'trial',
  updated_at timestamptz default now() not null
);

-- Connected accounts
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

-- Messages
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

-- Action items
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

-- VIP contacts
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

-- Relationship insights
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

-- Indexes for performance
create index idx_messages_user_priority on public.messages(user_id, priority_score desc, message_date desc);
create index idx_messages_user_status on public.messages(user_id, status, message_date desc);
create index idx_messages_user_vip on public.messages(user_id, is_vip, message_date desc);
create index idx_action_items_user_status on public.action_items(user_id, status, due_date);
create index idx_connected_accounts_user on public.connected_accounts(user_id, provider, status);

-- RLS Policies
create policy "Users can view own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);

create policy "Users can manage own profiles" on public.user_profiles for all using (auth.uid() = user_id);
create policy "Users can manage own accounts" on public.connected_accounts for all using (auth.uid() = user_id);
create policy "Users can manage own messages" on public.messages for all using (auth.uid() = user_id);
create policy "Users can manage own action items" on public.action_items for all using (auth.uid() = user_id);
create policy "Users can manage own vip contacts" on public.vip_contacts for all using (auth.uid() = user_id);
create policy "Users can manage own insights" on public.relationship_insights for all using (auth.uid() = user_id);

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.messages enable row level security;
alter table public.action_items enable row level security;
alter table public.vip_contacts enable row level security;
alter table public.relationship_insights enable row level security;
```

## Complete File Structure
```
napoleon-ai/
├── .env.local                 # Environment variables
├── .env.example              # Environment template
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind with luxury theme
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── supabase/
│   ├── migrations/           # Database migrations
│   └── seed.sql             # Sample data
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing page
│   │   ├── dashboard/       # Main application
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── onboarding/      # Setup flow
│   │   │   ├── page.tsx
│   │   │   ├── profile/
│   │   │   ├── connect/
│   │   │   ├── vips/
│   │   │   └── tour/
│   │   └── api/             # API endpoints
│   │       ├── auth/
│   │       ├── messages/
│   │       ├── ai/
│   │       └── webhooks/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── landing/         # Landing page sections
│   │   │   ├── hero-section.tsx
│   │   │   ├── value-proposition.tsx
│   │   │   ├── social-proof.tsx
│   │   │   └── cta-section.tsx
│   │   ├── onboarding/      # Onboarding components
│   │   │   ├── profile-setup.tsx
│   │   │   ├── account-connection.tsx
│   │   │   ├── vip-configuration.tsx
│   │   │   └── guided-tour.tsx
│   │   ├── dashboard/       # Dashboard components
│   │   │   ├── command-menu.tsx
│   │   │   ├── strategic-digest.tsx
│   │   │   ├── message-list.tsx
│   │   │   ├── message-item.tsx
│   │   │   ├── action-items-sidebar.tsx
│   │   │   ├── context-panel.tsx
│   │   │   └── ai-reply-modal.tsx
│   │   └── shared/          # Shared components
│   │       ├── navbar.tsx
│   │       ├── footer.tsx
│   │       └── loading.tsx
│   ├── lib/                 # Utilities and services
│   │   ├── supabase/        # Database client
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── types.ts
│   │   ├── integrations/    # API integrations
│   │   │   ├── gmail.ts
│   │   │   ├── slack.ts
│   │   │   ├── teams.ts
│   │   │   └── oauth.ts
│   │   ├── ai/              # AI processing
│   │   │   ├── openai.ts
│   │   │   ├── message-analysis.ts
│   │   │   ├── priority-scoring.ts
│   │   │   └── action-extraction.ts
│   │   ├── utils/           # Helper functions
│   │   │   ├── cn.ts
│   │   │   ├── date.ts
│   │   │   ├── validation.ts
│   │   │   └── constants.ts
│   │   └── hooks/           # Custom React hooks
│   │       ├── use-messages.ts
│   │       ├── use-action-items.ts
│   │       └── use-auth.ts
│   ├── types/               # TypeScript definitions
│   │   ├── database.ts
│   │   ├── integrations.ts
│   │   └── ai.ts
│   └── styles/              # Additional styles
│       └── components.css
└── docs/                    # Documentation
    ├── API.md
    ├── DEPLOYMENT.md
    └── DEVELOPMENT.md
```

## Required Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Production
VERCEL_URL=
```

## Core Features Implementation Requirements

### 1. Landing Page (Cartier Luxury Design)
- Hero section with "Transform Communication Chaos into Strategic Clarity"
- Elegant typography with Playfair Display + Inter
- Burgundy CTA button "Take Command Now"
- Executive testimonials and social proof
- Mobile-responsive with luxury aesthetics
- Smooth scroll animations with Framer Motion

### 2. Authentication & OAuth
- Supabase Auth with Google, Microsoft, Slack providers
- Biometric authentication support (Face ID/Touch ID)
- Secure token storage with encryption
- Automatic token refresh handling
- Error handling for OAuth failures

### 3. Onboarding Flow (3 minutes max)
- **Step 1**: Profile setup (role, pain points) - 30 seconds
- **Step 2**: Account connections (Gmail, Slack, Teams) - 60 seconds
- **Step 3**: VIP contact designation - 90 seconds
- **Step 4**: Guided dashboard tour - 30 seconds
- Progress indicators and skip options
- Celebration moments (crown icon completion)

### 4. Command Center Dashboard
- **Three-panel layout**: Navigation | Main | Context
- **Strategic Daily Digest**: Top priority summary
- **Unified Message List**: AI-prioritized across platforms
- **Action Items Sidebar**: Extracted tasks with due dates
- **Context Panel**: Contact info and AI insights
- Real-time updates via Supabase subscriptions

### 5. AI Processing Pipeline
- Message summarization with OpenAI GPT-4
- Priority scoring algorithm (VIP 40%, urgency 25%, sentiment 20%, time 15%)
- Action item extraction from email/Slack content
- Sentiment analysis for communication tone
- VIP relationship tracking and insights

### 6. API Integrations
- **Gmail API**: Fetch emails, send replies, real-time webhooks
- **Slack Web API**: Channel messages, direct messages, posting
- **Microsoft Graph**: Outlook emails, Teams chats
- Rate limiting and error handling for all APIs
- OAuth token management and refresh

## Production Deployment Requirements
- Vercel deployment with environment variables
- Custom domain setup (optional)
- Error monitoring with Sentry
- Analytics with PostHog or Vercel Analytics
- Performance monitoring and optimization
- SSL certificates and security headers
- Database backup and recovery procedures

## Performance Targets
- Page load time: <2 seconds
- API response time: <200ms
- Real-time update latency: <1 second
- AI processing time: <5 seconds
- Mobile performance: 90+ Lighthouse score
- Accessibility: WCAG AA compliance

## Security Requirements
- Row Level Security (RLS) on all database tables
- OAuth token encryption at rest
- HTTPS enforcement
- CORS configuration
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure environment variable handling

## Success Metrics to Track
- Time to first value: <60 seconds
- Onboarding completion rate: >80%
- Daily active users: >70% of registered
- Message processing accuracy: >85%
- User session duration: 5-10 minutes
- Weekly time savings: >2 hours per user

## Development Instructions
1. Initialize Next.js 14 project with all dependencies
2. Set up Supabase with complete database schema
3. Implement authentication with OAuth providers
4. Build luxury design system with Tailwind CSS
5. Create landing page with Cartier-inspired design
6. Implement onboarding flow with account connections
7. Build three-panel dashboard with real-time updates
8. Integrate AI processing for message analysis
9. Add Gmail, Slack, and Teams API integrations
10. Deploy to Vercel with production configuration

## Critical Success Factors
- Every interaction must feel premium and luxury
- AI must be invisible but intelligent
- Cross-platform unification is the key differentiator
- Executive time savings must be immediate and obvious
- Security and privacy are non-negotiable
- Performance must be flawless for executive users

Build this as a production-ready application that an executive would pay $300-500/month for. Focus on quality, luxury experience, and immediate value delivery.22