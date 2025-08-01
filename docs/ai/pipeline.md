# AI Processing Pipeline - Napoleon AI

## Overview

Napoleon AI's AI processing pipeline leverages GPT-4 to transform executive communications into actionable intelligence. The pipeline processes messages in real-time, extracting insights, prioritizing content, and identifying action items.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Message Ingestion│ --> │ AI Processing    │ --> │ Data Persistence│
│ (Gmail/Slack)   │     │ (GPT-4 Engine)   │     │ (Supabase)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         v                       v                         v
   ┌──────────┐           ┌──────────┐              ┌──────────┐
   │ Rate     │           │ Prompt   │              │ Real-time│
   │ Limiter  │           │ Templates│              │ Updates  │
   └──────────┘           └──────────┘              └──────────┘
```

## Components

### 1. Message Ingestion
- **Source**: Gmail API (Phase 1), Slack/Teams (Phase 2)
- **Rate Limit**: 1000 messages/hour per user
- **Batch Size**: 10 messages per processing batch
- **Queue**: In-memory queue with Redis backup (Phase 2)

### 2. AI Processing Engine

#### Endpoints
- `POST /api/ai/process-messages` - Batch message processing
- `POST /api/ai/summarise` - Individual message summarization
- `GET /api/ai/insights` - Aggregate insights generation

#### Processing Steps
1. **Priority Scoring** (0-100 scale)
   - Board/investor emails: +40 base score
   - Urgent keywords: +20
   - VIP contacts: +30
   - Time sensitivity: +10

2. **Summarization**
   - Executive-focused summaries (2-3 sentences)
   - Key points extraction
   - Decision requirements highlighting

3. **Action Item Extraction**
   - Task identification with due dates
   - Responsible party assignment
   - Context preservation

4. **Sentiment Analysis**
   - Positive/Neutral/Negative classification
   - Urgency detection
   - Relationship tone assessment

### 3. Prompt Templates

Located in `/prompts/`:

#### summarise.txt
```
You are an executive assistant AI. Summarize this email for a C-suite executive in 2-3 sentences.
Focus on: 1) Key decision/action required 2) Critical information 3) Deadline if any.
Be concise and use executive business language.

Email: {message_content}
```

#### priority_score.txt
```
Score this message's priority for a C-suite executive (0-100).
Consider:
- Sender importance (board, investor, direct report)
- Time sensitivity
- Business impact
- Action requirement

Message: {message_preview}
Sender: {sender_info}
```

#### extract_actions.txt
```
Extract action items from this message for executive tracking.
Format: 
- Action: [specific task]
- Due: [date/time if mentioned]
- Owner: [who should do it]
- Context: [1 line of context]

Message: {message_content}
```

## Database Schema

### ai_processing_logs
```sql
CREATE TABLE ai_processing_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  message_id UUID REFERENCES messages(id),
  processing_type TEXT, -- 'summarize', 'priority', 'extract_actions'
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  processing_time_ms INTEGER,
  cost_usd DECIMAL(10,6),
  status TEXT, -- 'success', 'failed', 'timeout'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### ai_summaries
```sql
CREATE TABLE ai_summaries (
  id UUID PRIMARY KEY,
  message_id UUID REFERENCES messages(id),
  summary_text TEXT,
  key_points JSONB,
  sentiment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Processing Logic

### Batch Processing Flow
```javascript
// Pseudo-code for batch processing
async function processBatch() {
  // 1. Fetch pending messages
  const pending = await fetchPendingMessages(limit: 10)
  
  // 2. Process in parallel
  const results = await Promise.all(
    pending.map(msg => processMessage(msg))
  )
  
  // 3. Update database
  await saveBatchResults(results)
  
  // 4. Trigger real-time updates
  await notifyClients(results)
}
```

### VIP Boosting Algorithm
```javascript
function calculatePriority(message, sender) {
  let score = 0
  
  // Base scoring
  if (sender.isVip) score += 30
  if (sender.role === 'board_member') score += 40
  if (sender.role === 'investor') score += 35
  
  // Content analysis
  if (hasUrgentKeywords(message)) score += 20
  if (hasDeadline(message)) score += 15
  if (requiresDecision(message)) score += 10
  
  // Time factors
  if (isAfterHours(message)) score += 5
  if (isWeekend(message)) score += 5
  
  return Math.min(score, 100)
}
```

## Rate Limiting & Quotas

### OpenAI API Limits
- **Requests**: 3,500 RPM (requests per minute)
- **Tokens**: 90,000 TPM (tokens per minute)
- **Daily Budget**: $50/day safety limit

### Per-User Limits
- **Messages**: 2,880/day (2 per minute)
- **Summaries**: 100/hour
- **Batch Size**: 10 messages

### Rate Limiter Implementation
```javascript
const rateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // requests per window
  keyGenerator: (req) => req.user.id
})
```

## Error Handling

### Retry Strategy
1. **Exponential Backoff**: 1s, 2s, 4s, 8s
2. **Max Retries**: 3 attempts
3. **Fallback**: Keyword-based analysis

### Error Types
- `RATE_LIMIT_EXCEEDED`: Wait and retry
- `INVALID_API_KEY`: Alert admin
- `TIMEOUT`: Retry with smaller batch
- `CONTENT_FILTER`: Skip and log

## Monitoring & Metrics

### Key Metrics
- **Processing Latency**: <500ms average
- **Success Rate**: >95%
- **Token Usage**: Track per user/day
- **Cost per Message**: ~$0.03

### Logging
```javascript
{
  timestamp: "2024-02-01T10:30:00Z",
  user_id: "uuid",
  message_id: "uuid",
  processing_type: "summarize",
  latency_ms: 342,
  tokens_used: 245,
  cost_usd: 0.0245,
  status: "success"
}
```

## Security Considerations

### Data Privacy
- No message content in logs
- PII redaction before AI processing
- Encrypted storage for API keys
- User consent for AI processing

### API Key Management
- Rotate monthly
- Store in environment variables
- Separate keys for dev/staging/prod
- Monitor for unusual usage

## Testing

### Unit Tests
- Prompt template validation
- Priority scoring logic
- Error handling paths
- Rate limiter behavior

### Integration Tests
- End-to-end message processing
- Database persistence
- Real-time updates
- API error scenarios

### Load Tests
- 1000 concurrent users
- 10,000 messages/hour
- Measure latency percentiles
- Cost projections

## Deployment

### Environment Variables
```bash
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
AI_PROCESSING_ENABLED=true
AI_RATE_LIMIT_PER_MIN=60
AI_BATCH_SIZE=10
AI_RETRY_ATTEMPTS=3
```

### Feature Flags
- `ai_processing_enabled`: Global on/off
- `ai_vip_boosting`: VIP priority boost
- `ai_batch_processing`: Batch vs individual
- `ai_fallback_enabled`: Keyword fallback

## Phase 2 Enhancements

### Planned Features
1. **Custom AI Models**: Fine-tuned for executive communication
2. **Multi-language Support**: Process emails in 10+ languages
3. **Voice Transcription**: Process voice messages
4. **Meeting Summaries**: Integrate with calendar
5. **Predictive Insights**: Trend analysis and predictions

### Infrastructure Upgrades
- Redis queue for reliable processing
- Dedicated AI processing workers
- WebSocket for instant updates
- CDN for prompt caching

## Troubleshooting

### Common Issues

1. **Slow Processing**
   - Check API rate limits
   - Reduce batch size
   - Enable caching

2. **High Costs**
   - Review token usage
   - Optimize prompts
   - Implement user quotas

3. **Poor Summaries**
   - Refine prompt templates
   - Add user feedback loop
   - A/B test prompts

## Appendix

### Sample API Responses

#### Successful Processing
```json
{
  "message_id": "msg_123",
  "processing_results": {
    "summary": "Q4 revenue exceeded targets by 15%. Board approval needed for expansion budget by Friday.",
    "priority_score": 95,
    "sentiment": "positive",
    "action_items": [
      {
        "action": "Review Q4 revenue report",
        "due": "2024-02-03",
        "owner": "Executive"
      }
    ]
  },
  "metrics": {
    "processing_time_ms": 342,
    "tokens_used": 245,
    "cost_usd": 0.0245
  }
}
```

#### Error Response
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit exceeded. Please try again in 60 seconds.",
    "retry_after": 60
  }
}
```