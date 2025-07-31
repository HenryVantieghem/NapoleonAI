# Napoleon AI - Database Security Policies

## Overview

This document outlines the Row Level Security (RLS) policies implemented for Napoleon AI's database tables. All policies ensure data isolation between users while enabling secure AI processing operations.

## Authentication Context

- **User Authentication**: Uses Clerk via Supabase Auth integration
- **User ID Source**: `auth.uid()` returns the Clerk user ID from JWT claims
- **Service Role**: Special role for AI processing operations that bypass RLS

## Table Policies

### Messages Table (`public.messages`)

**Purpose**: Store unified messages from Gmail, Slack, and Teams with AI processing metadata.

**Policies**:
- `Users can view own messages`: `FOR SELECT USING (auth.uid() = user_id)`
- `Users can insert own messages`: `FOR INSERT WITH CHECK (auth.uid() = user_id)`
- `Users can update own messages`: `FOR UPDATE USING (auth.uid() = user_id)`
- `Users can delete own messages`: `FOR DELETE USING (auth.uid() = user_id)`

**Security Notes**:
- Users can only access messages where `user_id` matches their authenticated ID
- AI processing operations use service role to bypass restrictions
- External message ingestion validates user ownership before insertion

### Action Items Table (`public.action_items`)

**Purpose**: Store AI-extracted action items with user ownership tracking.

**Policies**:
- `Users can view own action items`: `FOR SELECT USING (auth.uid() = user_id)`
- `Users can insert own action items`: `FOR INSERT WITH CHECK (auth.uid() = user_id)`
- `Users can update own action items`: `FOR UPDATE USING (auth.uid() = user_id)`
- `Users can delete own action items`: `FOR DELETE USING (auth.uid() = user_id)`

**Security Notes**:
- Double isolation: both `user_id` and parent `message_id` must belong to user
- AI extraction process automatically sets correct `user_id`
- Manual action items require user authentication

### Connected Accounts Table (`public.connected_accounts`)

**Purpose**: Store OAuth tokens and account information for external integrations.

**Policies**:
- `Users can view own connected accounts`: `FOR SELECT USING (auth.uid() = user_id)`
- `Users can insert own connected accounts`: `FOR INSERT WITH CHECK (auth.uid() = user_id)`
- `Users can update own connected accounts`: `FOR UPDATE USING (auth.uid() = user_id)`
- `Users can delete own connected accounts`: `FOR DELETE USING (auth.uid() = user_id)`

**Security Notes**:
- Contains sensitive OAuth tokens in encrypted JSONB format
- Users can only manage their own connected accounts
- Token refresh operations validate user ownership
- Account disconnection immediately revokes access

### User Preferences Table (`public.user_preferences`)

**Purpose**: Store user preferences, VIP contacts, and AI processing settings.

**Policies**:
- `Users can view own preferences`: `FOR SELECT USING (auth.uid() = user_id)`
- `Users can insert own preferences`: `FOR INSERT WITH CHECK (auth.uid() = user_id)`
- `Users can update own preferences`: `FOR UPDATE USING (auth.uid() = user_id)`

**Security Notes**:
- One-to-one relationship with user accounts
- Contains VIP contact lists and personalization data
- AI processing reads preferences to customize behavior
- No delete policy - preferences persist for user experience

### Concierge Requests Table (`public.concierge_requests`)

**Purpose**: Store premium support requests with context and priority.

**Policies**:
- `Users can view own concierge requests`: `FOR SELECT USING (auth.uid() = user_id)`
- `Users can insert own concierge requests`: `FOR INSERT WITH CHECK (auth.uid() = user_id)`
- `Users can update own concierge requests`: `FOR UPDATE USING (auth.uid() = user_id)`

**Security Notes**:
- Users can create and track their own support requests
- Support staff access via admin interface (separate from RLS)
- Context data may contain sensitive business information
- Request history maintained for relationship continuity

### AI Processing Logs Table (`public.ai_processing_logs`)

**Purpose**: Monitor AI operations, performance metrics, and debugging information.

**Policies**:
- `Users can view own processing logs`: `FOR SELECT USING (auth.uid() = user_id)`
- `Service role can insert processing logs`: `FOR INSERT WITH CHECK (true)`

**Security Notes**:
- Read-only for users (transparency into AI operations)
- Service role writes all processing logs
- Contains performance metrics and cost tracking
- No user update/delete permissions for audit integrity

## Service Role Operations

The `service_role` has elevated permissions for:

1. **AI Processing**: Insert and update AI summaries, priority scores, and action items
2. **Logging**: Write processing logs and performance metrics
3. **Batch Operations**: Process multiple users' messages for efficiency
4. **System Maintenance**: Database cleanup and optimization tasks

## Security Best Practices

1. **Token Encryption**: OAuth tokens stored in encrypted JSONB format
2. **Audit Trail**: All AI operations logged with user context
3. **Rate Limiting**: API endpoints enforce user-specific rate limits
4. **Data Retention**: Automatic cleanup of old processing logs
5. **Monitoring**: Real-time alerts for policy violations or unusual access patterns

## Policy Testing

```sql
-- Test user isolation
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "user-1-id"}';

-- Should only return user-1's messages
SELECT COUNT(*) FROM messages;

-- Should fail - cannot insert for different user
INSERT INTO messages (user_id, ...) VALUES ('user-2-id', ...);
```

## Future Enhancements

1. **Granular Permissions**: Role-based access for team accounts
2. **Data Classification**: Sensitivity levels for different message types
3. **Geographic Restrictions**: Region-based data access controls
4. **Compliance Controls**: GDPR, CCPA, and SOX compliance features

## Policy Updates

When updating policies:

1. Test in development environment first
2. Verify existing data access patterns
3. Document breaking changes
4. Coordinate with application code updates
5. Monitor for performance impact

---

**Last Updated**: 2025-07-31  
**Migration**: `20250731_create_ai_tables.sql`  
**Review Date**: 2025-08-31