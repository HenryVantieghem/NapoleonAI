# Napoleon AI Environment Variables

## Required Environment Variables

### Supabase Configuration
```bash
# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Clerk Authentication
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### OpenAI Integration
```bash
# OpenAI for AI Processing
OPENAI_API_KEY=sk-your_openai_api_key
```

### OAuth Provider Configuration

#### Google/Gmail OAuth
```bash
# Google OAuth for Gmail Integration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Required Gmail OAuth Scopes (configured in Clerk):
# - https://www.googleapis.com/auth/gmail.readonly
# - https://www.googleapis.com/auth/userinfo.email
# - https://www.googleapis.com/auth/userinfo.profile
```

#### Slack OAuth (Phase 2)
```bash
# Slack OAuth for Team Integration  
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret

# Required Slack OAuth Scopes:
# - channels:read
# - groups:read
# - im:read
# - mpim:read
# - users:read
# - users:read.email
```

#### Microsoft OAuth (Phase 2)
```bash
# Microsoft OAuth for Teams Integration
MICROSOFT_CLIENT_ID=your_microsoft_app_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# Required Microsoft OAuth Scopes:
# - https://graph.microsoft.com/Mail.Read
# - https://graph.microsoft.com/User.Read
# - https://graph.microsoft.com/Chat.Read
```

## OAuth Callback URLs

Configure these callback URLs in your OAuth providers:

### Development (localhost:3000)
- Gmail: `http://localhost:3000/api/auth/callback/oauth_google`
- Slack: `http://localhost:3000/api/auth/callback/oauth_slack`
- Microsoft: `http://localhost:3000/api/auth/callback/oauth_microsoft`

### Production (your-domain.com)
- Gmail: `https://your-domain.com/api/auth/callback/oauth_google`
- Slack: `https://your-domain.com/api/auth/callback/oauth_slack`
- Microsoft: `https://your-domain.com/api/auth/callback/oauth_microsoft`

## Environment Variable Setup

### .env.local (Development)
```bash
# Copy this template to .env.local and fill in your values
# DO NOT commit .env.local to version control

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# OpenAI
OPENAI_API_KEY=

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
```

### .env.example (Template)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# AI Processing
OPENAI_API_KEY=sk-your_openai_key_here

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

## Security Notes

### Environment Variable Security
- Never commit `.env.local` or actual secrets to version control
- Use different keys for development, staging, and production
- Rotate keys regularly (quarterly for production)
- Store production secrets in secure environment (Vercel, AWS Secrets Manager)

### OAuth Security
- Use HTTPS in production for all callback URLs
- Implement CSRF protection (handled by Clerk)
- Validate OAuth state parameters
- Store OAuth tokens encrypted in database

### Clerk Configuration
- Enable two-factor authentication for Clerk dashboard
- Configure allowed domains for OAuth callbacks
- Set up webhook endpoints for user synchronization
- Use separate Clerk instances for development and production

## Verification Checklist

### Development Setup
- [ ] All environment variables defined in `.env.local`
- [ ] Supabase connection working (`npm run db:test`)
- [ ] Clerk authentication working (sign-in page loads)
- [ ] OAuth providers configured in Clerk dashboard
- [ ] Webhook endpoints configured and responding

### Production Setup
- [ ] Environment variables configured in deployment platform
- [ ] OAuth callback URLs updated for production domain
- [ ] SSL certificates configured for HTTPS
- [ ] Webhook endpoints accessible and secured
- [ ] Rate limiting configured for API endpoints

This configuration ensures secure, enterprise-grade authentication for Napoleon AI's executive users.