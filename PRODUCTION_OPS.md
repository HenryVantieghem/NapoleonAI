# Production Operations Guide - Napoleon AI

## Overview

This guide covers production deployment, monitoring, incident response, and operational best practices for Napoleon AI.

## Infrastructure Overview

### Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Vercel Edge   │────▶│  Next.js App     │────▶│   Supabase DB   │
│   (Global CDN)  │     │  (Serverless)    │     │  (PostgreSQL)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         ▼                       ▼                         ▼
   ┌──────────┐           ┌──────────┐              ┌──────────┐
   │  Clerk   │           │ OpenAI   │              │   Redis  │
   │  (Auth)  │           │  (AI)    │              │  (Cache) │
   └──────────┘           └──────────┘              └──────────┘
```

### Deployment Regions
- **Primary**: US-East (Virginia)
- **Failover**: US-West (California)
- **CDN**: Global (70+ edge locations)
- **Database**: US-East with read replicas

## Deployment Process

### Pre-deployment Checklist
- [ ] All tests passing (unit, integration, E2E)
- [ ] Lighthouse score > 90
- [ ] Security scan clean
- [ ] Database migrations tested
- [ ] Environment variables verified
- [ ] Feature flags configured
- [ ] Rollback plan documented

### Deployment Steps

#### 1. Staging Deployment
```bash
# Deploy to staging
vercel --env preview

# Run smoke tests
npm run test:smoke -- --url=https://staging.napoleonai.com

# Verify integrations
npm run test:integrations -- --env=staging
```

#### 2. Production Deployment
```bash
# Deploy to production
vercel --prod

# Verify deployment
curl https://napoleonai.com/api/health

# Monitor metrics
npm run monitor:deployment
```

#### 3. Post-deployment
- Monitor error rates for 30 minutes
- Check key user flows
- Verify AI processing pipeline
- Review performance metrics

### Rollback Procedure

#### Immediate Rollback (< 5 minutes)
```bash
# List recent deployments
vercel ls

# Rollback to previous
vercel rollback <deployment-id>
```

#### Database Rollback
```bash
# Connect to Supabase
supabase db remote commit

# Rollback migration
supabase db reset --db-url $DATABASE_URL

# Verify schema
supabase db diff
```

## Monitoring & Alerts

### Key Metrics

#### Application Health
- **Uptime Target**: 99.99% (4.32 minutes/month)
- **Response Time**: p95 < 200ms
- **Error Rate**: < 0.1%
- **AI Success Rate**: > 95%

#### Business Metrics
- **Daily Active Users**
- **Messages Processed/Hour**
- **AI Processing Time**
- **VIP Response Time**

### Monitoring Stack

#### Vercel Analytics
- Real-time performance metrics
- Core Web Vitals tracking
- Geographic distribution
- Error tracking

#### Datadog Integration
```javascript
// datadog.config.js
export default {
  rum: {
    applicationId: process.env.DD_APPLICATION_ID,
    clientToken: process.env.DD_CLIENT_TOKEN,
    site: 'datadoghq.com',
    service: 'napoleon-ai',
    env: process.env.VERCEL_ENV,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
  }
}
```

#### Custom Dashboards
1. **Executive Overview**
   - User activity
   - System health
   - AI performance
   - Cost metrics

2. **Technical Dashboard**
   - API latency
   - Database performance
   - Cache hit rates
   - Queue depths

### Alert Configuration

#### Critical Alerts (Page immediately)
- Application down
- Database unreachable
- Authentication service failure
- AI API errors > 10%

#### Warning Alerts (Notify on-call)
- Response time > 500ms
- Error rate > 1%
- Queue backup > 1000 messages
- Memory usage > 90%

#### Info Alerts (Log for review)
- Deployment completed
- Daily limits approaching
- Scheduled maintenance
- Feature flag changes

## Incident Response

### Severity Levels

#### SEV1 - Critical (< 15min response)
- Complete service outage
- Data loss or corruption
- Security breach
- Authentication system down

#### SEV2 - Major (< 1hr response)
- Partial service degradation
- AI processing failures
- Integration disconnections
- Performance degradation > 50%

#### SEV3 - Minor (< 4hr response)
- Single feature failure
- Slow performance < 50%
- Non-critical integration issues
- UI/UX bugs

### Response Playbook

#### 1. Assess Impact
```bash
# Check service health
curl https://napoleonai.com/api/health

# Check error rates
vercel logs --prod --since 1h | grep ERROR

# Check database
supabase db remote status
```

#### 2. Communicate
- Update status page
- Notify affected users
- Post in #incidents Slack
- Create incident ticket

#### 3. Mitigate
- Enable maintenance mode if needed
- Scale resources if performance issue
- Disable problematic features
- Implement temporary fixes

#### 4. Resolve
- Deploy fix
- Verify resolution
- Monitor for recurrence
- Update documentation

#### 5. Post-mortem
- Timeline of events
- Root cause analysis
- Lessons learned
- Action items

## Scaling Operations

### Auto-scaling Triggers

#### Vercel Functions
- CPU > 80% for 5 minutes
- Memory > 90%
- Concurrent executions > 900

#### Database
- Connections > 80%
- CPU > 70%
- Storage > 80%

### Manual Scaling

#### Increase Function Concurrency
```javascript
// vercel.json
{
  "functions": {
    "api/ai/process-messages.ts": {
      "maxDuration": 60,
      "memory": 3008
    }
  }
}
```

#### Database Connection Pooling
```javascript
// lib/supabase/config.ts
export const poolConfig = {
  max: 20, // increase from 10
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}
```

## Security Operations

### Daily Security Tasks
- Review authentication logs
- Check for unusual API usage
- Monitor failed login attempts
- Verify backup completion

### Weekly Security Tasks
- Rotate API keys (non-critical)
- Review access logs
- Update dependencies
- Security scan results

### Monthly Security Tasks
- Rotate all API keys
- Security audit
- Penetration test results
- Compliance review

## Cost Management

### Cost Monitoring
```bash
# Vercel usage
vercel billing

# Supabase usage
supabase projects list --org-id $ORG_ID

# OpenAI usage
curl https://api.openai.com/v1/usage
```

### Cost Optimization
1. **Caching Strategy**
   - Cache AI responses for 1 hour
   - CDN cache static assets
   - Database query caching

2. **Resource Limits**
   - Function timeout: 30s
   - Max memory: 3GB
   - API rate limits per user

3. **Efficient Queries**
   - Database indexes optimized
   - N+1 query prevention
   - Batch processing

## Maintenance Windows

### Scheduled Maintenance
- **Time**: Sundays 2-6 AM UTC
- **Frequency**: Monthly
- **Duration**: Max 4 hours
- **Notification**: 7 days advance

### Maintenance Checklist
- [ ] Database backup
- [ ] Update dependencies
- [ ] Apply security patches
- [ ] Clean up logs
- [ ] Optimize tables
- [ ] Test disaster recovery

## Disaster Recovery

### Backup Strategy
- **Database**: Daily automated, 30-day retention
- **Code**: Git with tagged releases
- **Secrets**: Encrypted vault backup
- **User data**: GDPR-compliant backups

### Recovery Procedures

#### Database Recovery
```bash
# List backups
supabase db backups list

# Restore from backup
supabase db restore --backup-id <id>

# Verify restoration
supabase db remote commit
```

#### Full System Recovery
1. Deploy last known good code
2. Restore database from backup
3. Reconfigure environment variables
4. Verify integrations
5. Run smoke tests
6. Gradual traffic migration

### RTO/RPO Targets
- **RTO** (Recovery Time Objective): 4 hours
- **RPO** (Recovery Point Objective): 1 hour

## Performance Optimization

### Database Optimization
```sql
-- Add missing indexes
CREATE INDEX idx_messages_user_priority ON messages(user_id, priority_score DESC);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Vacuum and analyze
VACUUM ANALYZE messages;
VACUUM ANALYZE action_items;
```

### Caching Strategy
```javascript
// Redis caching for hot data
const cacheKey = `user:${userId}:messages:recent`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

// Set with expiry
await redis.setex(cacheKey, 3600, JSON.stringify(messages))
```

### CDN Configuration
```javascript
// next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/assets/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
}
```

## Support Procedures

### User Issue Escalation
1. **L1 Support**: FAQ, basic troubleshooting
2. **L2 Support**: Technical issues, integrations
3. **L3 Engineering**: Bugs, feature requests
4. **Executive Success**: VIP user issues

### Common Issues & Solutions

#### "Cannot connect Gmail"
1. Check OAuth credentials
2. Verify redirect URLs
3. Check user permissions
4. Review integration logs

#### "AI summaries not working"
1. Check OpenAI API status
2. Verify API key validity
3. Check rate limits
4. Review error logs

#### "Slow performance"
1. Check current load
2. Review database queries
3. Check cache hit rate
4. Scale if needed

## Compliance & Auditing

### Audit Logs
- All API calls logged
- User actions tracked
- Admin actions audited
- Retention: 90 days

### Compliance Checks
- [ ] GDPR data requests processed
- [ ] Security certificates valid
- [ ] Penetration test scheduled
- [ ] Compliance training completed

### Monthly Reports
- Uptime statistics
- Performance metrics
- Security incidents
- Cost analysis
- User growth

## Contact Information

### Escalation Chain
1. **On-call Engineer**: PagerDuty
2. **Engineering Lead**: +1-XXX-XXX-XXXX
3. **CTO**: +1-XXX-XXX-XXXX
4. **CEO**: (emergency only)

### Vendor Support
- **Vercel**: enterprise@vercel.com
- **Supabase**: support@supabase.io
- **Clerk**: support@clerk.dev
- **OpenAI**: support@openai.com

### Internal Channels
- **Incidents**: #incidents (Slack)
- **Operations**: #ops (Slack)
- **Alerts**: ops-alerts@napoleonai.com