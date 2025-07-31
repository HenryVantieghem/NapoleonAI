# Napoleon AI - Message Ingestion Pipeline

## Overview

This document outlines the message ingestion pipeline for Napoleon AI, including both Phase 1 mock data import and Phase 2 Gmail API integration.

## Phase 1: Mock Data Import (Development)

### Current Implementation

**Script**: `scripts/mock-import-emails.ts`  
**Command**: `npm run mock-import`

**Features**:
- Imports 10 realistic executive email scenarios
- Calculates priority scores based on content analysis
- Generates realistic timestamps (last 7 days)
- Handles VIP sender identification
- Tracks urgency keywords

**Message Types**:
1. **Board Communications** - High priority, VIP senders
2. **Investment Updates** - Series funding, investor relations  
3. **Legal Reviews** - Contract analysis, compliance
4. **Executive Scheduling** - Meeting coordination, calendar management
5. **Strategic Partnerships** - Business development opportunities
6. **Operational Updates** - Team reports, metrics, decisions
7. **Industry Intelligence** - Market reports, competitive analysis

**Priority Scoring Algorithm**:
```typescript
Base Score: 30
+ VIP Sender: +40
+ Urgency Keywords: +15 each ('urgent', 'asap', 'deadline')
+ Executive Keywords: +10 each ('board', 'ceo', 'investor')
+ Time Keywords: +8 each ('today', 'tomorrow', 'this week')
+ Subject Urgency: +20 ('URGENT', 'Action Required')
Max Score: 100
```

### Data Model

```sql
INSERT INTO messages (
  user_id,           -- Clerk authenticated user ID
  source,            -- 'gmail' for Phase 1
  external_id,       -- Unique message identifier from source
  sender,            -- Email address of sender
  subject,           -- Message subject line
  content,           -- Full message body
  priority_score,    -- 0-100 calculated priority
  is_vip,           -- Boolean VIP sender flag
  urgency_keywords, -- Array of detected urgent terms
  created_at,       -- Message timestamp
  processing_status -- 'pending' for AI processing
)
```

## Phase 2: Gmail API Integration (Production)

### Architecture Overview

**Supabase Edge Function**: `supabase/functions/ingestGmail.ts`  
**Trigger**: Scheduled (every 15 minutes) + Webhook (real-time)  
**Authentication**: OAuth 2.0 tokens from `connected_accounts` table

### Implementation Plan

#### 1. OAuth Token Management

```typescript
// Retrieve and refresh OAuth tokens
async function getValidToken(userId: string): Promise<GmailToken> {
  const { data: account } = await supabase
    .from('connected_accounts')
    .select('tokens, status')
    .eq('user_id', userId)
    .eq('provider', 'gmail')
    .single()
  
  if (account.status === 'expired') {
    return await refreshToken(account.tokens)
  }
  
  return account.tokens
}
```

#### 2. Gmail API Fetching

```typescript
// Fetch new messages from Gmail API
async function fetchGmailMessages(token: GmailToken, lastSyncTime?: string) {
  const gmail = google.gmail({ version: 'v1', auth: token })
  
  const query = lastSyncTime 
    ? `after:${Math.floor(new Date(lastSyncTime).getTime() / 1000)}`
    : 'in:inbox'
  
  const { data } = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 100
  })
  
  // Fetch full message details
  const messages = await Promise.all(
    data.messages?.map(msg => 
      gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full'
      })
    ) || []
  )
  
  return messages
}
```

#### 3. Message Normalization

```typescript
// Convert Gmail API response to our schema
function normalizeGmailMessage(gmailMsg: any, userId: string): MessageInsert {
  const headers = gmailMsg.data.payload.headers
  const subject = headers.find(h => h.name === 'Subject')?.value || ''
  const from = headers.find(h => h.name === 'From')?.value || ''
  const date = headers.find(h => h.name === 'Date')?.value
  
  // Extract plain text content
  const content = extractTextContent(gmailMsg.data.payload)
  
  return {
    user_id: userId,
    source: 'gmail',
    external_id: gmailMsg.data.id,
    sender: extractEmail(from),
    subject,
    content,
    created_at: new Date(date).toISOString(),
    processing_status: 'pending',
    // VIP detection will be done by AI processing
    is_vip: false,
    urgency_keywords: []
  }
}
```

#### 4. Batch Processing & Deduplication

```typescript
// Insert messages with conflict resolution
async function ingestMessages(messages: MessageInsert[]) {
  const BATCH_SIZE = 50
  
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE)
    
    const { error } = await supabase
      .from('messages')
      .upsert(batch, {
        onConflict: 'user_id,source,external_id',
        ignoreDuplicates: true
      })
    
    if (error) {
      console.error('Batch insert error:', error)
      // Log to monitoring system
      await logIngestionError(batch, error)
    }
  }
}
```

### Scheduling & Triggers

#### Scheduled Sync (Primary)
- **Frequency**: Every 15 minutes during business hours
- **Off-hours**: Every hour (reduced frequency)
- **Weekends**: Every 4 hours
- **Implementation**: Supabase Edge Function with pg_cron

#### Webhook Sync (Real-time)
- **Trigger**: Gmail Push Notifications
- **Setup**: Google Pub/Sub integration
- **Latency**: Near real-time (< 30 seconds)
- **Fallback**: Scheduled sync catches missed messages

### Error Handling & Resilience

#### Token Management
- **Refresh Logic**: Automatic token refresh before expiration
- **Failure Handling**: Mark account as 'error' status, notify user
- **Re-authorization**: Email user with re-auth link

#### Rate Limiting
- **Gmail API**: 1 billion quota units/day (monitor usage)
- **Batch Size**: 100 messages per request (API limit)
- **Retry Logic**: Exponential backoff for rate limit errors

#### Data Integrity
- **Duplicate Prevention**: Unique constraint on (user_id, source, external_id)
- **Partial Failures**: Continue processing remaining batches
- **Monitoring**: Log all ingestion metrics to `ai_processing_logs`

### VIP Detection Enhancement

```typescript
// Enhanced VIP detection for production
async function detectVIPSender(sender: string, userId: string): Promise<boolean> {
  // Check user's VIP contacts list
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('vip_contacts')
    .eq('user_id', userId)
    .single()
  
  const vipContacts = prefs?.vip_contacts || []
  
  // Domain-based VIP detection
  const vipDomains = [
    'board.com', 'investor.com', 'vc.com',
    // User's company domain
    // Partner company domains
  ]
  
  // Frequency-based VIP (high interaction senders)
  const interactionScore = await calculateSenderInteraction(sender, userId)
  
  return vipContacts.includes(sender) || 
         vipDomains.some(domain => sender.includes(domain)) ||
         interactionScore > 0.8
}
```

### Monitoring & Observability

#### Metrics to Track
- **Ingestion Volume**: Messages per hour/day
- **Processing Latency**: Time from Gmail to database
- **Error Rates**: Failed syncs, token issues, API errors
- **User Engagement**: Active sync users, message interaction rates

#### Alerting
- **Token Expiration**: 24 hours before expiry
- **Sync Failures**: > 5 consecutive failures
- **API Quota**: > 80% usage
- **Database Errors**: Connection or constraint violations

### Security Considerations

#### Token Storage
- **Encryption**: AES-256 encryption for OAuth tokens
- **Access Control**: Service role only for ingestion function
- **Rotation**: Regular token refresh, old token cleanup

#### Data Privacy
- **Scope Limitation**: Request minimal Gmail permissions
- **Data Retention**: Configurable message retention periods
- **User Control**: Easy disconnect/delete options

#### Compliance
- **GDPR**: Right to deletion, data portability
- **SOC 2**: Audit logging, access controls
- **Privacy Policy**: Clear data usage disclosure

## Phase 3: Multi-Platform Expansion

### Slack Integration
- **API**: Slack Web API + Events API
- **Real-time**: Socket Mode for instant messages
- **Channels**: Selective channel monitoring based on user preferences

### Microsoft Teams
- **API**: Microsoft Graph API
- **Authentication**: Azure AD OAuth
- **Messages**: Chat and channel messages with proper threading

### Calendar Integration
- **Google Calendar**: Meeting context for email prioritization
- **Outlook Calendar**: Appointment-aware message scoring
- **Scheduling**: Automatic meeting preparation from email content

## Testing Strategy

### Development Testing
- **Mock Data**: Realistic test scenarios (current implementation)
- **API Mocking**: Gmail API responses for integration tests
- **Error Simulation**: Network failures, rate limits, auth errors

### Production Testing
- **Canary Rollout**: Limited user testing before full deployment
- **A/B Testing**: Different ingestion frequencies and batch sizes
- **Load Testing**: High-volume message processing scenarios

## Performance Optimization

### Database Optimization
- **Indexing**: Composite indexes on (user_id, source, created_at)
- **Partitioning**: Date-based partitioning for large message volumes
- **Archiving**: Move old messages to cold storage

### API Optimization
- **Connection Pooling**: Reuse Gmail API connections
- **Parallel Processing**: Concurrent user sync operations
- **Caching**: Message metadata caching for quick access

---

**Next Steps for Phase 2 Implementation**:
1. Set up Google Cloud Project and OAuth credentials
2. Implement Supabase Edge Function with Gmail API
3. Configure Pub/Sub webhooks for real-time sync
4. Add monitoring dashboard and alerting
5. Conduct security review and penetration testing
6. Plan gradual rollout to production users