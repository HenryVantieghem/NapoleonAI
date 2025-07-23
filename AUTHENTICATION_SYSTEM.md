# Napoleon AI Authentication System

## Overview

Napoleon AI uses a hybrid authentication architecture that separates user authentication from API integrations:

- **User Authentication**: Clerk (handles login, signup, user management)
- **Database**: Supabase PostgreSQL (user profiles, application data)
- **API Integrations**: Direct OAuth (Gmail, Slack, Teams for API access)

## Architecture

### Authentication Flow

1. **User Registration/Login**
   - Handled entirely by Clerk
   - Supports OAuth providers (Google, Microsoft) for user authentication
   - Custom branded authentication pages at `/auth/login` and `/auth/signup`

2. **User Profile Sync**
   - Clerk webhook automatically syncs user data to Supabase
   - User profiles stored in `users` and `user_profiles` tables
   - Executive role validation based on user metadata

3. **API Integration Setup**
   - After authentication, users connect Gmail/Slack/Teams accounts
   - OAuth tokens stored in `connected_accounts` table
   - Separate from user authentication - purely for API access

### Key Components

#### 1. Clerk Configuration

```typescript
// app/layout.tsx
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
  afterSignInUrl="/dashboard"
  afterSignUpUrl="/onboarding"
  appearance={{
    variables: {
      colorPrimary: '#801B2B', // Burgundy brand color
      // ... luxury theme configuration
    }
  }}
>
```

#### 2. Middleware Protection

```typescript
// middleware.ts
export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req) && !auth().userId) {
    return auth().redirectToSignIn()
  }
  // ... security headers and routing logic
})
```

#### 3. User Profile Sync

```typescript
// api/webhooks/clerk/route.ts
export async function POST(req: Request) {
  // Handles user.created, user.updated, user.deleted events
  // Syncs user data between Clerk and Supabase
}
```

#### 4. OAuth Integration Service

```typescript
// lib/integrations/integration-service.ts
export class IntegrationService {
  static generateOAuthUrl(provider: IntegrationProvider): string
  static storeIntegrationTokens(...)
  static getConnectedAccounts(userId: string)
  static disconnectIntegration(provider, userId)
}
```

## Authentication Pages

### Login Page (`/auth/login`)
- Uses Clerk's `<SignIn />` component
- Custom luxury styling matching brand
- Executive-focused messaging
- Automatic redirect to dashboard after login

### Signup Page (`/auth/signup`)
- Uses Clerk's `<SignUp />` component
- Executive benefits highlighting
- Onboarding flow setup

### Integration Page (`/dashboard/integrations`)
- Post-authentication OAuth setup
- Gmail, Slack, Teams connection management
- Token status and disconnection options

## Security Features

### Authentication Security
- Clerk handles all user authentication security
- Session management with automatic token refresh
- Built-in protection against common attacks

### API Security
- All API routes protected by Clerk authentication
- OAuth tokens encrypted at rest in Supabase
- Row Level Security (RLS) on all database tables
- Rate limiting headers on API responses

### Headers & CORS
```typescript
// Middleware adds security headers
response.headers.set('X-Frame-Options', 'DENY')
response.headers.set('X-Content-Type-Options', 'nosniff')
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
response.headers.set('X-XSS-Protection', '1; mode=block')
```

## Environment Variables

### Required Variables
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OAuth for API Integrations
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
TEAMS_CLIENT_ID=...
TEAMS_CLIENT_SECRET=...
TEAMS_TENANT_ID=...
```

## Database Schema

### User Management
```sql
-- Users table (synced from Clerk)
CREATE TABLE users (
  id uuid PRIMARY KEY, -- Clerk user ID
  email text UNIQUE NOT NULL,
  name text,
  role text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User profiles (application data)
CREATE TABLE user_profiles (
  user_id uuid REFERENCES users(id) PRIMARY KEY,
  preferences jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  onboarding_completed boolean DEFAULT false,
  subscription_status text DEFAULT 'trial'
);
```

### OAuth Integration
```sql
-- Connected accounts for API access
CREATE TABLE connected_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) NOT NULL,
  provider text NOT NULL CHECK (provider IN ('gmail', 'slack', 'teams')),
  account_id text NOT NULL,
  account_email text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  status text DEFAULT 'active'
);
```

### Row Level Security
```sql
-- All tables have RLS enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

-- Policies ensure users can only access their own data
CREATE POLICY "Users can manage own data" ON users
  FOR ALL USING (auth.uid() = id);
```

## Integration Flows

### Gmail Integration
1. User clicks "Connect Gmail" in dashboard
2. Redirected to Google OAuth with required scopes
3. Callback handler exchanges code for tokens
4. Tokens stored in `connected_accounts` table
5. Gmail API calls use stored tokens

### Slack Integration
1. User clicks "Connect Slack" in dashboard
2. Redirected to Slack OAuth with workspace scopes
3. Callback handler processes Slack-specific OAuth response
4. Team and user info stored with tokens

### Teams Integration
1. User clicks "Connect Teams" in dashboard
2. Redirected to Microsoft Graph OAuth
3. Callback handler exchanges for Microsoft Graph tokens
4. Tokens provide access to Teams chats and Outlook

## Error Handling

### Authentication Errors
- Clerk handles most authentication errors automatically
- Custom error pages for edge cases
- Graceful fallbacks for network issues

### Integration Errors
- Token expiration detection and refresh
- Connection status monitoring
- User-friendly error messages for OAuth failures

### Database Errors
- Connection pooling and retry logic
- RLS policy violations handled gracefully
- Data validation at API layer

## Testing Strategy

### Authentication Testing
- Clerk provides built-in testing tools
- User flow testing with test accounts
- Role-based access control validation

### Integration Testing
- OAuth flow testing with sandbox accounts
- Token refresh and expiration handling
- API call authentication verification

### Security Testing
- RLS policy verification
- CORS and header security validation
- Rate limiting and abuse prevention

## Deployment Considerations

### Production Checklist
- [ ] Clerk webhooks configured for production domain
- [ ] Supabase RLS policies active
- [ ] OAuth redirect URLs updated for production
- [ ] Environment variables secured
- [ ] Rate limiting implemented
- [ ] Monitoring and logging active

### Scaling Considerations
- Clerk handles authentication scaling automatically
- Supabase connection pooling for database scaling
- OAuth token refresh distributed across multiple instances
- Session management works across multiple servers

## Troubleshooting

### Common Issues

1. **Clerk Authentication Not Working**
   - Check publishable key configuration
   - Verify domain settings in Clerk dashboard
   - Ensure middleware is properly configured

2. **OAuth Integration Failures**
   - Verify redirect URLs match exactly
   - Check OAuth app permissions and scopes
   - Validate environment variables

3. **Database Connection Issues**
   - Confirm Supabase connection strings
   - Verify RLS policies don't block legitimate access
   - Check service role key permissions

4. **User Profile Sync Issues**
   - Verify Clerk webhook endpoint is accessible
   - Check webhook signature verification
   - Monitor webhook delivery in Clerk dashboard

### Monitoring
- Clerk provides authentication analytics
- Supabase offers database performance metrics
- Custom logging for integration success rates
- Error tracking with proper alerting