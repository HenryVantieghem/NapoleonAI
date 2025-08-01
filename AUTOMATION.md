# Automation & Integration Guide - Napoleon AI

## Overview

Napoleon AI integrates with popular automation platforms to extend executive productivity beyond the core platform. This guide covers Zapier integration, webhooks, and API automation capabilities.

## Zapier Integration

### Available Triggers

#### 1. New VIP Message
Fires when a message from a VIP contact arrives.
- **Data**: sender, subject, summary, priority score, timestamp
- **Use cases**: 
  - Send SMS alert for board member emails
  - Create Asana task for investor requests
  - Log to CRM for relationship tracking

#### 2. New Action Item
Fires when AI extracts an action item from messages.
- **Data**: action, due date, owner, context, source message
- **Use cases**:
  - Create calendar event with deadline
  - Add to project management tool
  - Send to executive assistant

#### 3. Daily Digest Ready
Fires when the executive daily digest is generated.
- **Data**: key insights, urgent items, summary statistics
- **Use cases**:
  - Send to Kindle for morning reading
  - Post to private Slack channel
  - Email to assistant for preparation

#### 4. Urgent Message (90+ Priority)
Fires for messages scoring 90+ priority.
- **Data**: full message details, AI analysis, suggested actions
- **Use cases**:
  - Page on-call executive
  - Create emergency calendar slot
  - Escalate to crisis management team

### Available Actions

#### 1. Send to Executive Assistant
Forward messages or tasks to your EA with context.
- **Inputs**: message ID, assistant email, instructions, due date
- **Features**: Includes AI summary and priority context

#### 2. Create Calendar Event
Generate calendar events from message content.
- **Inputs**: title, description, time, attendees, location
- **Features**: AI-suggested timing based on executive schedule

#### 3. Add Contact to CRM
Add new contacts from emails to your CRM.
- **Inputs**: email, name, company, role, notes
- **Features**: Auto-enrichment from email signature

#### 4. Summarize Email Thread
Get AI summary of entire email conversations.
- **Inputs**: thread ID, focus area
- **Output**: Executive summary with key decisions

### Zapier Setup

1. **Get API Key**
   ```
   Settings → Integrations → Zapier → Generate API Key
   ```

2. **Connect in Zapier**
   - Search for "Napoleon AI" in Zapier
   - Enter your API key
   - Test the connection

3. **Create Your First Zap**
   - Choose a Napoleon AI trigger
   - Add actions from other apps
   - Test and activate

### Popular Zap Templates

#### Executive Assistant Workflow
```
Trigger: New Action Item
Actions:
1. Create Todoist task
2. Send Slack message to EA
3. Add to Google Calendar
```

#### Board Communication Alert
```
Trigger: New VIP Message (filter: board members)
Actions:
1. Send SMS via Twilio
2. Create draft response in Gmail
3. Block calendar for review time
```

#### Daily Briefing Distribution
```
Trigger: Daily Digest Ready
Actions:
1. Send to Kindle email
2. Post to executive Slack channel
3. Create morning calendar event
```

## Webhook Integration

### Webhook Events

Napoleon AI can send webhooks for all Zapier triggers plus:
- `message.processed` - After AI analysis complete
- `priority.changed` - When message priority updates
- `vip.added` - New VIP contact added
- `integration.connected` - Platform connected
- `quota.warning` - Usage approaching limits

### Webhook Payload

```json
{
  "event": "message.processed",
  "timestamp": "2024-02-01T10:30:00Z",
  "user_id": "user_123",
  "data": {
    "message_id": "msg_456",
    "from": "board.member@company.com",
    "subject": "Q4 Results Review",
    "priority_score": 95,
    "ai_summary": "Board member requests review of Q4 results before Friday meeting",
    "action_items": [
      {
        "action": "Review Q4 financial results",
        "due": "2024-02-03",
        "owner": "CEO"
      }
    ]
  }
}
```

### Webhook Security

All webhooks include:
- `X-Napoleon-Signature` header for verification
- Timestamp to prevent replay attacks
- Optional IP allowlisting

Verify webhooks:
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return computed === signature;
}
```

## API Automation

### REST API Endpoints

Base URL: `https://api.napoleonai.com/v1`

#### Messages
- `GET /messages` - List messages with filters
- `GET /messages/:id` - Get message details
- `POST /messages/:id/summarize` - Trigger AI summary
- `POST /messages/:id/archive` - Archive message

#### Action Items
- `GET /action-items` - List action items
- `POST /action-items` - Create action item
- `PATCH /action-items/:id` - Update status
- `DELETE /action-items/:id` - Delete item

#### VIP Contacts
- `GET /vip-contacts` - List VIP contacts
- `POST /vip-contacts` - Add VIP
- `DELETE /vip-contacts/:id` - Remove VIP

### Authentication

Include API key in headers:
```
Authorization: Bearer YOUR_API_KEY
```

### Rate Limits
- 1000 requests/hour per API key
- 100 requests/minute burst
- 429 status with `Retry-After` header

### Example: Python Automation

```python
import requests
import os

class NapoleonAI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.napoleonai.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def get_urgent_messages(self, min_priority=90):
        response = requests.get(
            f"{self.base_url}/messages",
            headers=self.headers,
            params={"min_priority": min_priority}
        )
        return response.json()
    
    def summarize_message(self, message_id):
        response = requests.post(
            f"{self.base_url}/messages/{message_id}/summarize",
            headers=self.headers
        )
        return response.json()
    
    def create_action_item(self, message_id, action, due_date):
        response = requests.post(
            f"{self.base_url}/action-items",
            headers=self.headers,
            json={
                "message_id": message_id,
                "action": action,
                "due_date": due_date
            }
        )
        return response.json()

# Usage
napoleon = NapoleonAI(os.getenv("NAPOLEON_API_KEY"))

# Get urgent messages
urgent = napoleon.get_urgent_messages()

# Process each urgent message
for message in urgent["messages"]:
    # Get AI summary
    summary = napoleon.summarize_message(message["id"])
    
    # Create action items
    for item in summary["action_items"]:
        napoleon.create_action_item(
            message["id"],
            item["action"],
            item["due_date"]
        )
```

## Microsoft Power Automate

### Available Connectors
- Napoleon AI (Premium connector)
- Triggers: Same as Zapier
- Actions: Same as Zapier

### Power Automate Templates

#### Executive Calendar Blocking
```
Trigger: New Action Item
Actions:
1. Find free time in Outlook
2. Create calendar event
3. Send Teams notification
4. Update SharePoint task list
```

#### Cross-Platform Sync
```
Trigger: VIP Contact Added
Actions:
1. Add to Outlook contacts
2. Create SharePoint list entry
3. Update Dynamics CRM
4. Notify via Teams
```

## Make (formerly Integromat)

### Modules Available
- Watch VIP Messages
- Watch Action Items
- Get Message Summary
- Create Calendar Event
- Search Messages

### Scenario Examples

#### Intelligent Meeting Prep
```
1. Watch calendar for upcoming meetings
2. Search Napoleon AI for relevant messages
3. Generate AI summary of related threads
4. Create briefing document in Google Docs
5. Send to iPad 30 minutes before meeting
```

## Best Practices

### 1. Security
- Rotate API keys quarterly
- Use webhook signatures
- Implement IP allowlisting for sensitive workflows
- Audit automation logs monthly

### 2. Performance
- Batch operations when possible
- Use webhooks instead of polling
- Implement exponential backoff for retries
- Cache frequently accessed data

### 3. Reliability
- Set up error notifications
- Test automations in sandbox first
- Document all production workflows
- Monitor API usage and limits

### 4. Executive Experience
- Keep automations invisible
- Preserve context in handoffs
- Maintain executive tone in generated content
- Test with real executive scenarios

## Troubleshooting

### Common Issues

1. **Webhooks not firing**
   - Verify webhook URL is accessible
   - Check signature validation
   - Review event filters

2. **API rate limits**
   - Implement caching
   - Use batch endpoints
   - Upgrade plan if needed

3. **Zapier connection errors**
   - Regenerate API key
   - Check permissions
   - Verify account status

## Support

- **Documentation**: docs.napoleonai.com/automation
- **API Status**: status.napoleonai.com
- **Support**: support@napoleonai.com
- **Enterprise**: Contact your success manager