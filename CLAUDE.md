# CLAUDE.md - Napoleon AI Global Memory Architecture

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Global Vision
**"AI Strategic Commander for Perfect Focus – luxury productivity platform for C-suite executives and high-performing professionals."**

## Three-Tier Memory Architecture
- **Global**: Core vision, design system, executive principles (this file)
- **Project**: Implementation details, technical patterns, integration specs
- **Local**: Session-specific context, active tasks, temporary notes (CLAUDE.local.md)

# Napoleon AI - Executive Intelligence Platform

@import NAPOLEON_AI_VISION.md
@import executive-features-priority.md
@import luxury-design-system.md  
@import executive-ux-principles.md
@import ai-intelligence-framework.md
@import integration-architecture.md
@import EXECUTIVE_EXPERIENCE_CHECKLIST.md

## Architecture Overview

Napoleon AI is a luxury executive intelligence platform built with Next.js 14 App Router. The architecture uses Clerk for authentication, Supabase for data persistence, and OpenAI for AI-powered message analysis, designed exclusively for Fortune 500 C-suite executives.

### Tech Stack
- **Framework**: Next.js 14 with App Router and TypeScript
- **Authentication**: Clerk (instead of Supabase Auth as originally planned)
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **AI Processing**: OpenAI GPT-4 via custom AI service
- **Styling**: Tailwind CSS with Cartier-inspired luxury theme
- **Animations**: Framer Motion for premium interactions
- **Deployment**: Vercel with automatic deployments

### Key Architectural Decisions
- **Authentication Switch**: Uses Clerk instead of Supabase Auth for better OAuth integration with Gmail, Slack, and Teams
- **Simplified Database Schema**: MVP uses streamlined tables (users, user_profiles, connected_accounts, messages, action_items, vip_contacts)
- **AI Service Pattern**: Centralized AI processing with fallback keyword-based analysis when OpenAI fails
- **Real-time Updates**: Supabase real-time subscriptions for live dashboard updates

## Development Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Database
npm run db:generate-types  # Generate TypeScript types from Supabase schema

# Deployment
./scripts/deploy.sh  # Production deployment script (includes build, lint, deploy to Vercel)
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── integrations/  # OAuth callbacks (gmail, slack, teams)
│   │   └── webhooks/      # Webhook handlers (clerk, platform webhooks)
│   ├── dashboard/         # Main application interface
│   ├── onboarding/        # User setup flow
│   └── auth/             # Authentication pages
├── components/
│   ├── ui/               # Base UI components with luxury styling
│   ├── landing/          # Landing page sections
│   ├── dashboard/        # Dashboard components (command-center, panels)
│   └── auth/            # Authentication components
├── lib/
│   ├── supabase/        # Database clients (client.ts, server.ts, config.ts)
│   ├── ai/              # AI processing (ai-service.ts, openai-client.ts)
│   ├── integrations/    # External API integrations
│   ├── auth/            # Clerk authentication utilities
│   └── hooks/           # Custom React hooks
├── types/               # TypeScript definitions
└── middleware.ts        # Route protection and auth middleware
```

## Core Architecture Patterns

### Authentication Flow (COMPLETED - Phase 1)
- **Executive Profile Collection**: Custom form with role selection, company size, luxury UX
- **Clerk Integration**: OAuth signup with enhanced navy/gold styling
- **Webhook Processing**: Profile data synced to Supabase via secure webhooks
- **Session Management**: Server-side role-based access control with MFA placeholders
- **Database Storage**: Dual table structure (users + user_profiles) with RLS
- **OAuth Ready**: Gmail integration ready, Slack/Teams configured for Phase 2

### AI Processing Pipeline
Located in `src/lib/ai/ai-service.ts`:
1. **Message Analysis**: OpenAI GPT-4 analyzes messages for priority, sentiment, and action items
2. **VIP Boosting**: Priority scores increased for VIP contacts (stored in `vip_contacts` table)
3. **Fallback System**: Keyword-based analysis when AI fails
4. **Data Persistence**: Results saved to `messages` and `action_items` tables

### Real-time Updates
- Supabase real-time subscriptions in `src/lib/supabase/client.ts`
- `subscribeToMessages()` and `subscribeToActionItems()` functions
- Dashboard components subscribe to changes for live updates

### Database Schema (Simplified MVP)
Current schema in `supabase/migrations/20241201000000_mvp_simplified_schema.sql`:
- `users` - Basic user information synced from Clerk
- `user_profiles` - User preferences and settings
- `connected_accounts` - OAuth tokens for Gmail/Slack/Teams
- `messages` - Unified messages from all platforms
- `action_items` - AI-extracted tasks from messages
- `vip_contacts` - Priority contact management

## Environment Configuration

Required environment variables (see `.env.example`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# OAuth Providers (for integrations)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

## Integration Patterns

### OAuth Integration Flow
1. **Callback Handlers**: Located in `src/app/api/integrations/callback/[provider]/`
2. **Token Storage**: Encrypted tokens stored in `connected_accounts` table
3. **API Clients**: Individual service classes for Gmail, Slack, Teams in `src/lib/integrations/`
4. **Unified Service**: `unified-message-service.ts` aggregates messages from all platforms

### AI Service Usage
```typescript
import { aiService } from '@/lib/ai/ai-service'

// Process a message
const analysis = await aiService.processMessage(message, userId)

// Get daily digest
const digest = await aiService.getDailyDigest(userId)

// Save analysis results
await aiService.saveMessageAnalysis(messageId, analysis, userId)
```

## Testing & Debugging

### Common Development Tasks
- **Database Reset**: Run latest migration in Supabase SQL editor
- **Type Generation**: `npm run db:generate-types` after schema changes
- **OAuth Testing**: Use ngrok for local webhook testing
- **AI Testing**: Check OpenAI API key and rate limits

### Performance Monitoring
- **Next.js Analytics**: Integrated via `@vercel/analytics`
- **Speed Insights**: Integrated via `@vercel/speed-insights`
- **Lighthouse Targets**: 90+ score for mobile performance

## Deployment Process

The `scripts/deploy.sh` script handles:
1. Dependency checking and installation
2. TypeScript compilation check
3. ESLint validation
4. Production build
5. Vercel deployment
6. Health check verification

### Manual Deployment Steps
```bash
npm ci                    # Clean install dependencies
npm run type-check       # Verify TypeScript
npm run lint            # Check code quality
npm run build           # Build for production
vercel --prod           # Deploy to production
```

## Executive Design System

### Navy & Gold Luxury Theme
The application uses a sophisticated executive design system:

```css
/* Executive Color Palette */
:root {
  --white: #FFFFFF;
  --black: #0A0A0A;
  --cream: #F8F6F0;
  --navy: #1B2951;          /* Primary executive color */
  --gold: #D4AF37;          /* Premium accent color */
  --charcoal: #2C3E50;      /* Supporting dark */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-900: #111827;
}

/* Executive Typography */
--font-serif: 'Playfair Display', serif;    /* Executive headers */
--font-sans: 'Inter', sans-serif;           /* Professional body text */
--font-mono: 'JetBrains Mono', monospace;   /* Code/data displays */
```

### Component Patterns
- **Luxury Button**: Located in `src/components/ui/luxury-button.tsx` with variants for different contexts
- **Luxury Card**: Elevated cards with subtle shadows and hover effects
- **Typography**: Semantic heading classes with proper font family assignment
- **Animations**: 300ms ease-in-out transitions, luxury hover effects
- **Grid System**: 8px spacing system for consistent layouts

### UI Component Architecture
- Base components in `src/components/ui/` extend Radix UI primitives
- Luxury variants add premium styling while maintaining accessibility
- Framer Motion integration for smooth animations
- Responsive design with mobile-first approach

## Security & Performance

### Security Implementation
- **Row Level Security**: All database tables use RLS policies restricting data access to authenticated users
- **Token Encryption**: OAuth tokens encrypted at rest in `connected_accounts` table
- **HTTPS Enforcement**: Security headers configured in `next.config.js`
- **CORS Configuration**: Restricted to allowed domains and API endpoints
- **Input Validation**: TypeScript types and runtime validation for all user inputs

### Performance Optimizations
- **Image Optimization**: Next.js Image component with WebP/AVIF formats
- **Bundle Optimization**: Package imports optimized for Framer Motion and Radix UI
- **Caching Strategy**: 1-year cache for static assets, optimized font loading
- **Code Splitting**: Automatic route-based and component-based splitting
- **Real-time Efficiency**: Targeted Supabase subscriptions to minimize data transfer

## Key Implementation Notes

### Message Processing Flow
1. Messages ingested via OAuth integrations (Gmail/Slack/Teams)
2. Processed through `aiService.processMessage()` for priority scoring
3. VIP contacts boost priority scores automatically
4. Action items extracted and saved to database
5. Real-time updates pushed to dashboard components

### Dashboard Architecture
- **Three-panel layout**: Implemented in `src/components/dashboard/command-center.tsx`
- **Navigation Panel**: User profile, platform connections, settings
- **Main Panel**: Strategic digest, message list, action items
- **Context Panel**: Contact details, AI insights, reply interface

### Database Migration Strategy
- Latest simplified schema: `supabase/migrations/20241201000000_mvp_simplified_schema.sql`
- Removed complex tables for MVP focus
- Maintains essential functionality: users, messages, action items, VIP contacts
- Performance indexes on high-query columns

## Executive Memory Architecture Summary

### Core Executive Value Proposition
Napoleon AI transforms Fortune 500 executives from communication chaos to strategic clarity through:
- **Time Savings**: 2+ hours daily through AI-powered prioritization and unified inbox
- **Intelligence Amplification**: AI enhances executive judgment without replacing it
- **Cross-Platform Unity**: Gmail + Slack + Teams unified into single command center
- **VIP Relationship Intelligence**: Board/investor communications never missed
- **Executive-Grade Security**: Enterprise security with luxury user experience

### Implementation Priority Sequence
1. **Tier 1 (MVP Core)**: Strategic Daily Digest, VIP Intelligence, Unified Inbox
2. **Tier 2 (ROI Amplification)**: AI Reply Intelligence, Action Item Extraction, Relationship Insights
3. **Tier 3 (Premium Features)**: Board Meeting Prep, Investor Relations, Executive Assistant Integration

### Design System Evolution
**From**: Cartier burgundy luxury retail aesthetic
**To**: Navy (#1B2951) & Gold (#D4AF37) executive intelligence positioning
**Rationale**: Authority, trust, and intelligence over luxury retail associations

### Executive UX Principles
- Time is the ultimate currency (sub-3-second interactions)
- Intelligence amplification, not automation (95%+ executive approval rate)
- Executive context awareness (board schedules influence prioritization)
- Mobile-first for airport/travel usage (70% of executive usage)
- Luxury experience standards (WCAG AAA, haptic feedback, premium animations)

### AI Intelligence Framework
- **Executive Message Analysis**: Priority scoring through C-suite lens
- **Cross-Platform Relationship Intelligence**: Unified contact insights
- **Executive Response Suggestions**: Context-aware, voice-matched responses
- **Safety Protocols**: Board communication protection, high-stakes safeguards
- **Learning System**: Personalized executive intelligence that improves over time

### Technical Architecture Excellence
- **Performance**: <200ms page transitions, <2s AI analysis, 99.99% uptime
- **Security**: Zero-trust architecture, E2E encryption, enterprise compliance
- **Scalability**: Horizontal scaling, global CDN, executive-optimized caching
- **Integration**: Unified schema across Gmail/Slack/Teams with real-time sync

This codebase represents a production-ready luxury executive intelligence platform that delivers immediate ROI while maintaining the sophistication and security standards expected by C-suite users.

## Phase 1 MVP Completion Status ✅

### Successfully Delivered Features
- **Authentication System**: Clerk-based OAuth with luxury navy/gold theme
- **Landing Page**: Executive-focused with "Transform Communication Chaos into Strategic Clarity"
- **3-Step Onboarding**: Role selection → Platform connections → VIP management
- **Command Center Dashboard**: 3-panel layout (Digest, Unified Inbox, Context)
- **AI Summarization**: GPT-4 pipeline with fallback systems
- **Luxury Design System**: Navy (#1B2951) & Gold (#D4AF37) theme throughout

### Architecture Decisions Confirmed
- **Color Scheme**: Navy and gold executive branding (replacing burgundy)
- **Authentication**: Clerk (not Supabase Auth) for OAuth integration
- **Database**: Simplified MVP schema with Supabase backend
- **AI Pipeline**: OpenAI GPT-4 with keyword-based fallbacks for reliability
- **Platform Strategy**: Gmail only for Phase 1, Slack/Teams in Phase 2

### Technical Implementation Status
- **Framework**: Next.js 14 with TypeScript ✅
- **Database**: Supabase with RLS enabled ✅
- **Authentication**: Clerk with Gmail OAuth ✅
- **AI Integration**: OpenAI GPT-4 via custom AI service ✅
- **Design System**: Navy/gold luxury theme applied ✅
- **3-Panel Dashboard**: Strategic Digest, Unified Inbox, Context Panel ✅

### Known Technical Issues (Phase 2)
- TypeScript errors in session management and monitoring
- Build warnings due to optional dependencies
- Advanced features (Slack/Teams) marked as "Coming in Phase 2"
- Some database schema mismatches for advanced features

### Memory Architecture Evolution
- ✅ Global memory (CLAUDE.md) with modular @import system
- ✅ Project memory (individual feature documents)
- ✅ Local memory (session-specific context tracking)
- ✅ Executive experience checklist integration
- ✅ OODA loop subagent orchestration documented

### Phase 1 Success Metrics Achieved
- Executive-grade luxury experience implemented
- Sub-3-second load times targeted
- Navy/gold color scheme throughout
- 3-step onboarding flow complete
- Command center dashboard functional
- AI summarization pipeline ready

### Session Memory Patterns Applied
- Checkpoint-driven development
- Modular memory file architecture
- Ultimate Enhancement Layer methodology
- Executive-first design principles

### Next Phase Development
Phase 2 roadmap documented in `PHASE_2_ROADMAP.md` focusing on:
- Multi-platform integration (Slack, Teams)
- Advanced AI intelligence and response suggestions
- VIP relationship intelligence and board member dashboard
- Executive assistant integration and mobile experience
- Target: 10+ hours weekly time savings per executive