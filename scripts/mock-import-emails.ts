#!/usr/bin/env tsx

/**
 * Napoleon AI - Mock Email Import Script
 * 
 * Imports realistic mock Gmail messages for local development and testing.
 * Uses Supabase client to insert messages with proper user context.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Mock user ID for development (replace with actual user ID)
const MOCK_USER_ID = 'user_2qZqZqZqZqZqZqZqZqZqZqZqZqZq' // Clerk user ID format

// Realistic executive email scenarios
const mockMessages = [
  {
    external_id: 'gmail_msg_001',
    sender: 'sarah.chen@techcorp.com',
    subject: 'Q4 Budget Review Meeting - Urgent Response Needed',
    content: `Hi there,

I need to schedule our Q4 budget review meeting ASAP. The board is asking for updated projections by Friday, and we need to align on the following:

1. Marketing spend allocation for Q1 2024
2. Engineering headcount projections 
3. International expansion budget

Can you please confirm your availability for tomorrow at 3 PM? We'll need about 2 hours to cover everything thoroughly.

I've attached the preliminary budget spreadsheet for your review.

Best regards,
Sarah Chen
CFO, TechCorp`,
    is_vip: true,
    urgency_keywords: ['urgent', 'ASAP', 'board', 'Friday deadline']
  },
  {
    external_id: 'gmail_msg_002',
    sender: 'john.smith@ventures.com',
    subject: 'Series B Follow-up: Investment Terms Discussion',
    content: `Good morning,

Following up on our Series B discussion last week. Our investment committee has reviewed your pitch deck and we're excited to move forward.

Key terms we'd like to discuss:
- $25M investment at $100M pre-money valuation
- 2 board seats for our fund
- Standard liquidation preferences and anti-dilution

Would you be available for a call this week to discuss? We'd like to have term sheets ready by month-end.

Looking forward to partnering with you on this journey.

Best,
John Smith
Partner, Venture Capital Partners`,
    is_vip: true,
    urgency_keywords: ['investment', 'board seats', 'term sheets', 'month-end']
  },
  {
    external_id: 'gmail_msg_003',
    sender: 'marketing@newsletter.com',
    subject: 'Weekly Industry Report: AI Trends & Market Analysis',
    content: `This week's AI industry highlights:

🔥 Hot Topics:
- OpenAI releases new enterprise features
- Google announces Gemini for Business
- Microsoft expands Azure AI offerings

📊 Market Data:
- AI software market up 47% YoY
- Enterprise adoption at 73%
- Investment rounds total $2.1B this quarter

🎯 Executive Insights:
Companies integrating AI reporting 3x productivity gains in knowledge work. Consider pilot programs for customer service and content creation.

Read full report: [link]

Unsubscribe | Manage preferences`,
    is_vip: false,
    urgency_keywords: []
  },
  {
    external_id: 'gmail_msg_004',
    sender: 'board.chair@company.com',
    subject: 'Board Meeting Agenda Review - Action Required',
    content: `Dear Board Members,

Please review the attached agenda for our upcoming board meeting on August 15th, 2024.

Key agenda items:
1. CEO Report & Company Performance
2. Financial Results Q2 2024
3. Strategic Initiative Updates
4. Executive Compensation Review
5. Risk Management & Compliance

Please submit any additional agenda items by August 10th. 

Pre-read materials will be distributed 48 hours before the meeting via BoardEffect portal.

Thank you for your continued leadership.

Best regards,
Robert Williams
Board Chair`,
    is_vip: true,
    urgency_keywords: ['board meeting', 'action required', 'August 10th deadline']
  },
  {
    external_id: 'gmail_msg_005',
    sender: 'hr@company.com',
    subject: 'Executive Assistant Search Update',
    content: `Hi,

Update on the Executive Assistant position search:

We've narrowed down to 3 final candidates after extensive interviews:

1. Jennifer Rodriguez - 8 years experience, former EA to Fortune 500 CEO
2. Michael Chang - 5 years experience, strong tech background
3. Lisa Thompson - 10 years experience, excellent references

All candidates have passed background checks and are available to start within 2 weeks.

Would you like to schedule final interviews this week? I can arrange 45-minute sessions at your convenience.

Please let me know your preference.

Best,
Amanda Foster
VP, Human Resources`,
    is_vip: false,
    urgency_keywords: ['final candidates', 'this week', 'schedule interviews']
  },
  {
    external_id: 'gmail_msg_006',
    sender: 'legal@lawfirm.com',
    subject: 'Contract Review: Partnership Agreement Terms',
    content: `Dear Client,

We've completed our review of the partnership agreement with GlobalTech Corp. 

Key findings and recommendations:

⚠️ URGENT ATTENTION NEEDED:
- Intellectual property clause requires modification (Section 4.2)
- Liability cap is below industry standard
- Termination provisions need strengthening

✅ Acceptable terms:
- Revenue sharing structure
- Performance milestones
- Dispute resolution process

We recommend scheduling a call tomorrow to discuss these issues before the Friday signing deadline.

Please confirm your availability between 10 AM - 4 PM tomorrow.

Regards,
David Martinez, Esq.
Partner, Martinez & Associates`,
    is_vip: true,
    urgency_keywords: ['urgent attention needed', 'Friday signing deadline', 'tomorrow call']
  },
  {
    external_id: 'gmail_msg_007',
    sender: 'assistant@company.com',
    subject: 'This Week\'s Schedule & Priority Updates',
    content: `Good morning!

Here's your schedule overview for this week:

🗓️ TODAY (Monday):
- 10:00 AM: Team standup (Conference Room A)
- 2:00 PM: Client presentation prep
- 4:00 PM: 1:1 with VP Engineering

📞 PRIORITY CALLS:
- Series B investor call (rescheduled to Wednesday 11 AM)
- Board chair check-in (Thursday 3 PM)
- Customer advisory board (Friday 1 PM)

📝 ACTION ITEMS:
- Review quarterly report draft (due Wednesday)
- Approve marketing campaign budget 
- Sign off on new hire packages

Travel reminder: Flight to NYC conference is Thursday evening. I've confirmed hotel and ground transportation.

Let me know if you need any schedule adjustments!

Best,
Emma Wilson
Executive Assistant`,
    is_vip: false,
    urgency_keywords: ['priority calls', 'due Wednesday', 'Thursday evening flight']
  },
  {
    external_id: 'gmail_msg_008',
    sender: 'ceo@competitor.com',
    subject: 'Confidential: Potential Strategic Partnership Discussion',
    content: `Hello,

I hope this message finds you well. I'm reaching out regarding a potential strategic partnership that could benefit both our companies.

As you know, our organizations have complementary strengths in the market. I believe there's an opportunity for collaboration that could:

- Expand both our market reach
- Share development costs for new technologies  
- Create competitive advantages against larger players

I'd like to propose a confidential discussion about potential partnership models. Would you be open to a brief call next week to explore this further?

Given the sensitive nature of this conversation, I suggest we keep this between us for now.

Looking forward to your thoughts.

Best regards,
Alex Thompson
CEO, InnovateTech Solutions

P.S. Congratulations on your recent Series A announcement!`,
    is_vip: true,
    urgency_keywords: ['confidential', 'strategic partnership', 'next week call']
  },
  {
    external_id: 'gmail_msg_009',
    sender: 'support@slack.com',
    subject: 'Slack Enterprise Plan: Usage & Billing Update',
    content: `Hi there,

Your Slack Enterprise Grid usage summary for July 2024:

📊 Usage Stats:
- Active users: 247 (up 12% from last month)
- Messages sent: 89,342
- Files shared: 2,156
- App integrations: 23 active

💰 Billing Information:
- Current plan: Enterprise Grid ($150/user/month)
- July charges: $37,050
- Next billing date: August 1st
- Payment method: Corporate Amex ending in 1234

🔧 Optimization Opportunities:
We notice you're using 18 external integrations. Consider our new AI-powered workflow automation to reduce manual processes.

Questions? Reply to this email or contact your dedicated success manager.

Thanks for choosing Slack!

The Slack Team`,
    is_vip: false,
    urgency_keywords: []
  },
  {
    external_id: 'gmail_msg_010',
    sender: 'investor.relations@fund.com',
    subject: 'Portfolio Update Request: Q2 Metrics & Growth Projections',
    content: `Dear Portfolio Company Leadership,

As we prepare our quarterly LP report, we need updated metrics from all portfolio companies.

Required metrics for Q2 2024:
• Monthly Recurring Revenue (MRR)
• Customer Acquisition Cost (CAC) 
• Churn rate and retention metrics
• Gross margins and unit economics
• Headcount by department
• Cash runway and burn rate

Additional requests:
- Updated cap table (if changes since Q1)
- Key partnerships or customer wins
- Product roadmap highlights
- Upcoming fundraising plans

Please submit via our secure portal by August 5th. Late submissions delay our LP reporting process.

Our team is available for questions during office hours (9 AM - 5 PM PST).

Best regards,
Michelle Park
Director, Portfolio Operations
Sequoia Growth Partners`,
    is_vip: true,
    urgency_keywords: ['August 5th deadline', 'required metrics', 'LP reporting']
  }
]

/**
 * Generate realistic timestamps for messages
 */
function generateTimestamps(count: number): Date[] {
  const now = new Date()
  const timestamps: Date[] = []
  
  for (let i = 0; i < count; i++) {
    // Messages from last 7 days, with more recent ones more likely
    const daysAgo = Math.floor(Math.random() * 7)
    const hoursAgo = Math.floor(Math.random() * 24)
    const minutesAgo = Math.floor(Math.random() * 60)
    
    const timestamp = new Date(now)
    timestamp.setDate(timestamp.getDate() - daysAgo)
    timestamp.setHours(timestamp.getHours() - hoursAgo)
    timestamp.setMinutes(timestamp.getMinutes() - minutesAgo)
    
    timestamps.push(timestamp)
  }
  
  return timestamps.sort((a, b) => b.getTime() - a.getTime()) // Newest first
}

/**
 * Calculate priority score based on content and sender
 */
function calculatePriorityScore(message: any): number {
  let score = 30 // Base score
  
  // VIP sender boost
  if (message.is_vip) score += 40
  
  // Urgency keywords
  const urgentWords = ['urgent', 'asap', 'deadline', 'emergency', 'critical']
  const executiveWords = ['board', 'ceo', 'investor', 'funding', 'acquisition']
  const timeWords = ['today', 'tomorrow', 'this week', 'friday']
  
  const content = (message.subject + ' ' + message.content).toLowerCase()
  
  urgentWords.forEach(word => {
    if (content.includes(word)) score += 15
  })
  
  executiveWords.forEach(word => {
    if (content.includes(word)) score += 10
  })
  
  timeWords.forEach(word => {
    if (content.includes(word)) score += 8
  })
  
  // Subject line urgency indicators
  if (message.subject.includes('URGENT') || message.subject.includes('Action Required')) {
    score += 20
  }
  
  return Math.min(100, Math.max(0, score))
}

/**
 * Main import function
 */
async function importMockEmails() {
  console.log('🚀 Starting mock email import...')
  
  try {
    // Check if user exists (for development, we'll assume it does)
    console.log(`📧 Preparing to import ${mockMessages.length} messages for user: ${MOCK_USER_ID}`)
    
    const timestamps = generateTimestamps(mockMessages.length)
    
    const messagesWithMetadata = mockMessages.map((message, index) => ({
      user_id: MOCK_USER_ID,
      source: 'gmail',
      external_id: message.external_id,
      sender: message.sender,
      subject: message.subject,
      content: message.content,
      priority_score: calculatePriorityScore(message),
      ai_summary: null, // Will be filled by AI processing
      created_at: timestamps[index].toISOString(),
      processing_status: 'pending',
      processing_attempts: 0,
      is_vip: message.is_vip,
      urgency_keywords: message.urgency_keywords
    }))
    
    // Insert messages in batches
    const BATCH_SIZE = 5
    let imported = 0
    
    for (let i = 0; i < messagesWithMetadata.length; i += BATCH_SIZE) {
      const batch = messagesWithMetadata.slice(i, i + BATCH_SIZE)
      
      const { data, error } = await supabase
        .from('messages')
        .upsert(batch, { 
          onConflict: 'user_id,source,external_id',
          ignoreDuplicates: false 
        })
        .select()
      
      if (error) {
        console.error(`❌ Error importing batch ${i / BATCH_SIZE + 1}:`, error)
        continue
      }
      
      imported += batch.length
      console.log(`✅ Imported batch ${i / BATCH_SIZE + 1}: ${batch.length} messages`)
      
      // Show sample message details
      if (i === 0 && data && data.length > 0) {
        const sample = data[0]
        console.log(`📝 Sample message: "${sample.subject}" (Priority: ${sample.priority_score})`)
      }
    }
    
    console.log(`🎉 Successfully imported ${imported} mock emails!`)
    
    // Show summary statistics
    const { data: stats } = await supabase
      .from('messages')
      .select('priority_score, is_vip, processing_status')
      .eq('user_id', MOCK_USER_ID)
    
    if (stats) {
      const vipCount = stats.filter(m => m.is_vip).length
      const highPriority = stats.filter(m => m.priority_score >= 70).length
      const avgPriority = Math.round(stats.reduce((sum, m) => sum + (m.priority_score || 0), 0) / stats.length)
      
      console.log('\n📊 Import Statistics:')
      console.log(`   Total messages: ${stats.length}`)
      console.log(`   VIP messages: ${vipCount}`)
      console.log(`   High priority (70+): ${highPriority}`)
      console.log(`   Average priority: ${avgPriority}`)
      console.log(`   Pending AI processing: ${stats.filter(m => m.processing_status === 'pending').length}`)
    }
    
    console.log('\n🔄 Next steps:')
    console.log('   1. Run AI processing: npm run process-messages')
    console.log('   2. Check dashboard: http://localhost:3000/dashboard')
    console.log('   3. Test search and filters with imported data')
    
  } catch (error) {
    console.error('❌ Failed to import mock emails:', error)
    process.exit(1)
  }
}

// Run the import
if require.main === module) {
  importMockEmails()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export { importMockEmails, mockMessages }