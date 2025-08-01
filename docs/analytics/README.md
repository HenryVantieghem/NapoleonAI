# Analytics & Metrics Guide - Napoleon AI

## Overview

Napoleon AI provides comprehensive analytics to help executives understand their communication patterns, time savings, and productivity gains. This guide covers our analytics implementation, key metrics, and privacy controls.

## Analytics Infrastructure

### Segment Integration

We use Segment as our customer data platform to:
- Unify analytics across web, mobile, and API
- Send data to multiple analytics tools
- Maintain user privacy controls
- Enable real-time data pipelines

### Connected Services

1. **Google Analytics 4** - User behavior and funnel analysis
2. **Mixpanel** - Product analytics and cohort analysis
3. **Amplitude** - Executive journey mapping
4. **Datadog** - Performance and error tracking
5. **BigQuery** - Data warehouse for custom analysis

## Key Metrics Tracked

### Executive Productivity Metrics

#### Time Savings
```typescript
{
  metric: "time_saved_minutes",
  calculation: "AI processing time vs manual review",
  benchmark: "120+ minutes/day",
  tracking: "Per session and daily aggregate"
}
```

#### Message Efficiency
```typescript
{
  messages_processed: number,
  vip_response_time: "minutes",
  priority_accuracy: "percentage",
  action_items_completed: number
}
```

#### Platform Usage
```typescript
{
  daily_active_time: "minutes",
  feature_adoption: {
    ai_summaries: "percentage",
    vip_filtering: "percentage",
    action_extraction: "percentage"
  },
  platform_connections: ["gmail", "slack", "teams"]
}
```

### Business Impact Metrics

1. **Decision Velocity**
   - Time from message receipt to action
   - Comparison with industry benchmarks
   - Trend analysis over time

2. **Communication Effectiveness**
   - VIP response rates
   - Message prioritization accuracy
   - Stakeholder satisfaction scores

3. **ROI Indicators**
   - Hours saved per month
   - Cost per processed message
   - Value of automated workflows

## Event Tracking

### User Journey Events

#### Onboarding Flow
```javascript
analytics.track('Onboarding Started', {
  referral_source: 'organic',
  company_size: 'enterprise',
  role: 'CEO'
})

analytics.track('Onboarding Completed', {
  duration_seconds: 180,
  platforms_connected: ['gmail'],
  vip_contacts_added: 15,
  skipped_steps: []
})
```

#### Daily Usage
```javascript
analytics.track('Dashboard Viewed', {
  time_of_day: 'morning',
  device_type: 'desktop',
  message_count: 47,
  unread_count: 23
})

analytics.track('AI Summary Requested', {
  message_id: 'msg_123',
  message_type: 'email',
  sender_type: 'vip',
  word_count_original: 500,
  word_count_summary: 50
})
```

#### Feature Adoption
```javascript
analytics.track('Feature Used', {
  feature: 'vip_filter',
  first_time: false,
  context: 'morning_review',
  messages_filtered: 12
})
```

### Conversion Events

1. **Trial to Paid**: Free trial conversion with attribution
2. **Feature Activation**: First use of key features
3. **Retention Milestones**: 7-day, 30-day, 90-day retention
4. **Expansion Events**: Seat additions, plan upgrades

## Privacy & Compliance

### Data Minimization

We track only essential data:
- ✅ Feature usage and performance metrics
- ✅ Aggregated communication patterns
- ❌ Message content or personal information
- ❌ Contact details or email addresses

### User Controls

#### Opt-Out Mechanism
```javascript
// Global opt-out
analytics.optOut(userId)

// Granular controls
analytics.updatePreferences({
  usage_analytics: true,
  performance_monitoring: true,
  marketing_analytics: false,
  third_party_sharing: false
})
```

#### Data Export
Users can export their analytics data:
```javascript
GET /api/analytics/export
{
  "user_id": "user_123",
  "date_range": "last_90_days",
  "format": "csv"
}
```

#### Data Deletion
Complete data removal within 30 days:
```javascript
POST /api/analytics/delete
{
  "user_id": "user_123",
  "confirmation": "DELETE_ALL_DATA"
}
```

### GDPR Compliance

1. **Consent Management**
   - Explicit consent on signup
   - Granular consent options
   - Easy withdrawal mechanism

2. **Data Rights**
   - Right to access
   - Right to rectification
   - Right to erasure
   - Right to portability

3. **Data Protection**
   - Encryption in transit and at rest
   - Annual security audits
   - Data retention policies

## Custom Analytics Implementation

### Client-Side Tracking

```javascript
import analytics from '@/lib/analytics/segment'

// Identify user
analytics.identify(user.id, {
  email: user.email,
  name: user.name,
  role: user.role,
  company: user.company
})

// Track custom event
analytics.track(user.id, 'Custom Event', {
  category: 'engagement',
  action: 'feature_discovery',
  label: 'ai_insights',
  value: 10
})

// Track page view
analytics.page(user.id, 'Dashboard', {
  section: 'unified_inbox',
  message_count: 25
})
```

### Server-Side Tracking

```javascript
// API route tracking
export async function POST(req: Request) {
  const { userId, action } = await req.json()
  
  // Track API usage
  await analytics.track(userId, 'API Call', {
    endpoint: '/api/messages',
    method: 'POST',
    action: action,
    response_time_ms: 145
  })
  
  // Process request...
}
```

### Batch Tracking

```javascript
// Batch multiple events for efficiency
const events = [
  {
    userId: 'user_123',
    event: 'Message Processed',
    properties: { message_id: 'msg_1' }
  },
  {
    userId: 'user_123',
    event: 'Priority Calculated',
    properties: { score: 85 }
  }
]

await analytics.batchTrack(events)
```

## Dashboards & Reporting

### Executive Dashboard

Real-time metrics available at `/admin/analytics`:
- Daily active users
- Feature adoption rates
- Time savings calculations
- System performance metrics
- Error rates and alerts

### Weekly Executive Report

Automated email with:
- Personal productivity gains
- VIP communication summary
- Action item completion rate
- Time allocation insights
- Recommendations for optimization

### Custom Reports

Build custom reports using our API:
```javascript
GET /api/analytics/report
{
  "metrics": ["time_saved", "messages_processed"],
  "dimensions": ["date", "platform"],
  "date_range": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "filters": {
    "user_role": "CEO",
    "company_size": "enterprise"
  }
}
```

## Performance Monitoring

### Application Performance

```javascript
// Track performance metrics
analytics.track(userId, 'Performance Metric', {
  metric: 'page_load_time',
  value: 1.2,
  page: '/dashboard',
  device: 'desktop'
})

// Monitor API latency
analytics.track(userId, 'API Performance', {
  endpoint: '/api/ai/summarize',
  latency_ms: 342,
  success: true
})
```

### Error Tracking

```javascript
// Capture errors with context
window.addEventListener('error', (event) => {
  analytics.track(userId, 'Error Occurred', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    stack: event.error?.stack,
    user_agent: navigator.userAgent
  })
})
```

## Analytics Best Practices

### 1. Meaningful Events
- Track user outcomes, not just actions
- Include context for better analysis
- Avoid over-tracking vanity metrics

### 2. Data Quality
- Validate event properties
- Use consistent naming conventions
- Document all tracked events

### 3. Performance Impact
- Batch events when possible
- Use sampling for high-frequency events
- Monitor analytics payload size

### 4. Privacy First
- Never track PII in event properties
- Use hashed identifiers
- Respect user preferences

## Debugging Analytics

### Debug Mode

Enable debug mode to see all events:
```javascript
// Client-side
window.analytics.debug()

// Server-side
process.env.ANALYTICS_DEBUG = 'true'
```

### Event Validation

Test events before production:
```javascript
// Validate event schema
const isValid = analytics.validateEvent({
  event: 'Test Event',
  properties: {
    required_field: 'value'
  }
})
```

### Analytics Inspector

Browser extension for real-time event monitoring:
1. Install Segment Debugger
2. Open Chrome DevTools
3. Navigate to Segment tab
4. Monitor events in real-time

## Support

- **Documentation**: docs.napoleonai.com/analytics
- **Privacy Policy**: napoleonai.com/privacy
- **Data Request**: privacy@napoleonai.com
- **Analytics Team**: analytics@napoleonai.com