# Napoleon AI Onboarding Flow Documentation

## Overview

The Napoleon AI onboarding flow is a luxury, concierge-style three-step process designed to onboard Fortune 500 executives in under 3 minutes. The flow prioritizes executive time and provides intelligent defaults while offering concierge assistance at every step.

## Architecture

### State Management
- **Store**: Zustand with persistence (`src/stores/onboardingStore.ts`)
- **Persistence**: localStorage with `napoleon-onboarding` key
- **Real-time**: State changes persist across page refreshes and browser sessions

### Components
- **Main Flow**: `src/app/onboarding/page.tsx`
- **SelectableCard**: `src/components/onboarding/SelectableCard.tsx`
- **VipCard**: `src/components/onboarding/VipCard.tsx`
- **Mock Data**: `src/lib/mockVipContacts.ts`

### Design System
- **Colors**: Navy (#1B2951) and Gold (#D4AF37) luxury theme
- **Typography**: Playfair Display for headers, Inter for body text
- **Animations**: Framer Motion with 300ms transitions
- **Layout**: 8px spacing system, Cartier-inspired 128px grid

## Three-Step Flow

### Step 1: Profile Setup (60 seconds)
**Objective**: Capture executive role and key pain points

**Features**:
- Executive role selection (CEO, COO, CFO, CTO, Founder, VP, Director, Other)
- Pain point selection (max 3): Email Overload, Prioritization, Meeting Prep, Responsiveness, Strategic Clarity, Delegation
- Real-time validation and progress tracking
- Skip and concierge options available

**Validation**:
- Role selection required to proceed
- Pain points optional but recommended
- Maximum 3 pain points enforced

**UX Details**:
- SelectableCard components with luxury styling
- Visual feedback on selection with gold highlights
- Smooth animations on hover and selection

### Step 2: Platform Connections (30 seconds)
**Objective**: Connect Gmail for message analysis (MVP focus)

**Features**:
- Gmail OAuth connection simulation (production-ready structure)
- Slack and Teams placeholders for Phase 2
- Connection status tracking with loading states
- Error handling and retry capabilities

**OAuth Flow** (MVP Simulation):
1. User clicks "Connect Gmail"
2. Loading state for 2 seconds
3. Success state with email display
4. Status persisted in Zustand store

**Production OAuth**:
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    scopes: 'https://www.googleapis.com/auth/gmail.readonly',
    redirectTo: `${window.location.origin}/onboarding?step=2&connected=gmail`
  }
})
```

### Step 3: VIP Configuration (90 seconds)
**Objective**: Select VIP contacts for priority treatment

**Features**:
- AI-powered contact suggestions based on executive role
- Real-time search with instant filtering
- Relationship type categorization (Board Member, Investor, Executive, Client, Partner)
- Minimum 3 contacts recommended
- Source indicators (AI Suggested, Imported, Manual)

**AI Suggestions Logic**:
- **CEO/Founder**: Board Members → Investors → Executives → Clients → Partners
- **COO**: Executives → Clients → Partners → Board Members → Investors
- **CFO**: Investors → Board Members → Executives → Clients → Partners
- **CTO**: Executives → Partners → Clients → Board Members → Investors

**Search Features**:
- Real-time filtering by name, email, company, relationship type
- Clear search functionality
- No results state with clear search option
- Animated entry/exit of results

## Concierge Experience

### Skip Options
Available at every step for executives with limited time:
- Step 1: Skip profile setup (proceed with defaults)
- Step 2: Skip platform connections (can connect later)
- Step 3: Skip VIP selection (AI will suggest during usage)

### Concierge Assistance
- **Step 1**: "Schedule Concierge" for personalized setup
- **Step 2**: "Need Help?" for technical assistance
- **Step 3**: "Schedule Setup Call" for VIP configuration help

### Concierge Implementation
```typescript
const handleConcierge = () => {
  requestConcierge()
  // Production: Open calendar widget (Calendly/Cal.com integration)
  // MVP: Show alert with scheduling message
}
```

## Completion & Celebration

### Success Experience
- Canvas confetti animation with brand colors
- Crown icon and executive messaging
- 3-second auto-redirect to dashboard
- Immediate access to "Enter Dashboard" button

### Data Persistence
All onboarding data persists to Supabase `user_profiles` table:

```typescript
const persistProgress = async () => {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: user.id,
      profile_data: {
        role,
        painPoints: selectedPainPoints,
        onboardingStep: currentStep
      },
      onboarding_completed: onboardingComplete,
      updated_at: new Date().toISOString()
    })
}
```

## Technical Implementation

### State Structure
```typescript
interface OnboardingData {
  // Step 1: Profile Setup
  role: string
  painPoints: string[]
  companySize: string
  
  // Step 2: Platform Connections
  connectedAccounts: {
    provider: string
    status: 'connecting' | 'connected' | 'error'
    accountId?: string
    error?: string
  }[]
  
  // Step 3: VIP Configuration
  vipContacts: {
    email: string
    name: string
    relationshipType: string
    priorityLevel: number
    source: 'suggested' | 'manual' | 'imported'
  }[]
  
  // Progress tracking
  currentStep: number
  completedSteps: number[]
  onboardingComplete: boolean
}
```

### Key Actions
```typescript
// Navigation
nextStep(): void
prevStep(): void
setStep(step: number): void

// Profile setup
setRole(role: string): void
togglePainPoint(painPoint: string): void

// Platform connections
setAccountStatus(provider, status, accountId?, error?): void

// VIP management
toggleVipContact(contact): void
addVipContact(contact): void
removeVipContact(email: string): void

// Completion
completeOnboarding(): void
requestSkip(): void
requestConcierge(scheduledAt?): void
```

## Performance & Accessibility

### Performance Optimizations
- Lazy loading of mock VIP data
- Debounced search (300ms)
- Optimized re-renders with React.memo patterns
- Efficient Zustand state updates

### Accessibility Features
- WCAG AA compliant color contrast
- Keyboard navigation support
- Screen reader compatible
- Focus management between steps
- Alternative text for all icons

### Mobile Optimization
- Responsive grid layouts
- Touch-friendly button sizes (44px minimum)
- Haptic feedback on mobile devices
- Optimized for portrait orientation

## Testing Coverage

### Unit Tests (61 tests passing)
- **OnboardingStore**: 23 tests covering all state management
- **SelectableCard**: 14 tests for interaction and styling
- **VipCard**: 24 tests for contact display and selection

### E2E Tests (Playwright)
- Complete onboarding flow (happy path)
- Skip functionality from each step
- Concierge request handling
- Navigation between steps
- Field validation
- Search functionality
- Mobile responsiveness
- Keyboard navigation

### Test Commands
```bash
# Unit tests
npm run test:onboarding

# E2E tests
npm run test:e2e

# All tests
npm run test:all

# Coverage report
npm run test:coverage
```

## Metrics & Analytics

### Target Completion Times
- **Step 1**: 60 seconds (role + pain points)
- **Step 2**: 30 seconds (Gmail connection)
- **Step 3**: 90 seconds (VIP selection)
- **Total**: 3 minutes target

### Success Metrics
- Completion rate: Target 85%+
- Skip rate: Target <20%
- Concierge request rate: Target <10%
- Time to completion: Target <3 minutes
- User satisfaction: Target 4.5/5 stars

### Data Collection Points
```typescript
// Analytics events to track
onboardingStarted(userId, timestamp)
stepCompleted(userId, step, duration)
stepSkipped(userId, step, reason)
conciergeRequested(userId, step)
onboardingCompleted(userId, totalDuration)
vipContactsSelected(userId, count, types)
```

## Future Enhancements

### Phase 2 Features
- Slack and Teams OAuth integration
- Calendar integration for meetings context
- Email signature extraction
- Company directory import
- Advanced VIP relationship mapping

### Executive Intelligence Features
- Meeting attendee VIP detection
- Board member communication priority
- Investor update scheduling
- Executive assistant delegation
- Cross-platform message threading

### Personalization
- Learning from usage patterns
- Dynamic pain point suggestions
- Contextual concierge recommendations
- Adaptive VIP suggestions based on email analysis

## Production Deployment

### Environment Variables
```bash
# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# Calendly Integration (for concierge)
CALENDLY_ACCESS_TOKEN=your_calendly_token
CALENDLY_WEBHOOK_SECRET=your_webhook_secret
```

### Production Checklist
- [ ] OAuth callback URLs configured
- [ ] Supabase RLS policies enabled
- [ ] Calendar integration tested
- [ ] Error tracking configured (Sentry)
- [ ] Analytics events implemented
- [ ] Performance monitoring enabled
- [ ] Mobile testing completed
- [ ] Accessibility audit passed

This onboarding flow represents the gold standard for executive user experience, balancing speed, intelligence, and luxury to create an experience worthy of Fortune 500 leadership.