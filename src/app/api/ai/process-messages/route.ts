import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase/server'
import { openai } from 'openai'
import fs from 'fs'
import path from 'path'

// Configure OpenAI client
const openaiClient = new openai({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Rate limiting configuration
const RATE_LIMITS = {
  MAX_MESSAGES_PER_BATCH: 10,
  MAX_BATCHES_PER_HOUR: 12, // 120 messages per hour per user
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
}

// AI processing configuration
const AI_CONFIG = {
  MODEL: 'gpt-4',
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.3,
  TIMEOUT_MS: 30000,
}

interface ProcessingResult {
  messageId: string
  success: boolean
  summary?: string
  priorityScore?: number
  actionItems?: ActionItem[]
  error?: string
  tokensUsed?: number
  processingTimeMs?: number
}

interface ActionItem {
  description: string
  dueDate: string | null
  priority: 'urgent' | 'high' | 'medium' | 'low'
  contextSnippet: string
  estimatedDuration: string
}

/**
 * Load prompt template from file system
 */
function loadPromptTemplate(templateName: string): string {
  try {
    const promptPath = path.join(process.cwd(), 'prompts', `${templateName}.txt`)
    return fs.readFileSync(promptPath, 'utf-8')
  } catch (error) {
    console.error(`Failed to load prompt template: ${templateName}`, error)
    throw new Error(`Prompt template '${templateName}' not found`)
  }
}

/**
 * Replace template variables with actual values
 */
function fillPromptTemplate(template: string, variables: Record<string, any>): string {
  let filledTemplate = template
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    const replacement = value !== null && value !== undefined ? String(value) : ''
    filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), replacement)
  })
  
  return filledTemplate
}

/**
 * Check rate limits for user
 */
async function checkRateLimit(userId: string, supabase: any): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  
  const { data: recentLogs } = await supabase
    .from('ai_processing_logs')
    .select('batch_id')
    .eq('user_id', userId)
    .eq('operation_type', 'batch_process')
    .gte('processed_at', oneHourAgo)
  
  const batchCount = new Set(recentLogs?.map(log => log.batch_id) || []).size
  return batchCount < RATE_LIMITS.MAX_BATCHES_PER_HOUR
}

/**
 * Process a single message with AI
 */
async function processMessage(message: any, userPrefs: any): Promise<ProcessingResult> {
  const startTime = Date.now()
  let tokensUsed = 0
  
  try {
    // Prepare template variables
    const templateVars = {
      sender: message.sender,
      subject: message.subject || '',
      content: message.content,
      is_vip: message.is_vip ? 'Yes' : 'No',
      urgency_keywords: Array.isArray(message.urgency_keywords) 
        ? message.urgency_keywords.join(', ') 
        : '',
      created_at: message.created_at
    }

    // Load and fill prompt templates
    const summarizePrompt = fillPromptTemplate(
      loadPromptTemplate('summarise'), 
      templateVars
    )
    
    const priorityPrompt = fillPromptTemplate(
      loadPromptTemplate('priority_score'),
      templateVars
    )
    
    const actionPrompt = fillPromptTemplate(
      loadPromptTemplate('extract_actions'),
      templateVars
    )

    // Process all AI tasks in parallel for efficiency
    const [summaryResponse, priorityResponse, actionResponse] = await Promise.all([
      // Generate summary
      openaiClient.chat.completions.create({
        model: AI_CONFIG.MODEL,
        messages: [{ role: 'user', content: summarizePrompt }],
        max_tokens: 200,
        temperature: AI_CONFIG.TEMPERATURE,
      }),
      
      // Generate priority score
      openaiClient.chat.completions.create({
        model: AI_CONFIG.MODEL,
        messages: [{ role: 'user', content: priorityPrompt }],
        max_tokens: 300,
        temperature: AI_CONFIG.TEMPERATURE,
        response_format: { type: "json_object" }
      }),
      
      // Extract action items
      openaiClient.chat.completions.create({
        model: AI_CONFIG.MODEL,
        messages: [{ role: 'user', content: actionPrompt }],
        max_tokens: 500,
        temperature: AI_CONFIG.TEMPERATURE,
        response_format: { type: "json_object" }
      })
    ])

    // Calculate total tokens used
    tokensUsed = (summaryResponse.usage?.total_tokens || 0) +
                 (priorityResponse.usage?.total_tokens || 0) +
                 (actionResponse.usage?.total_tokens || 0)

    // Parse AI responses
    const summary = summaryResponse.choices[0]?.message?.content?.trim() || 'No summary available.'
    
    let priorityScore = 50 // Default fallback
    try {
      const priorityData = JSON.parse(priorityResponse.choices[0]?.message?.content || '{}')
      priorityScore = Math.max(0, Math.min(100, priorityData.priority_score || 50))
    } catch (e) {
      console.error('Failed to parse priority response:', e)
    }
    
    let actionItems: ActionItem[] = []
    try {
      const actionData = JSON.parse(actionResponse.choices[0]?.message?.content || '[]')
      actionItems = Array.isArray(actionData) ? actionData : []
    } catch (e) {
      console.error('Failed to parse action items response:', e)
    }

    const processingTimeMs = Date.now() - startTime

    return {
      messageId: message.id,
      success: true,
      summary,
      priorityScore,
      actionItems,
      tokensUsed,
      processingTimeMs
    }
    
  } catch (error) {
    console.error(`AI processing failed for message ${message.id}:`, error)
    
    return {
      messageId: message.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTimeMs: Date.now() - startTime
    }
  }
}

/**
 * Update message with AI results
 */
async function updateMessageWithResults(
  messageId: string, 
  result: ProcessingResult, 
  supabase: any
): Promise<void> {
  if (!result.success) {
    // Update failure count and error
    await supabase
      .from('messages')
      .update({
        processing_attempts: supabase.raw('processing_attempts + 1'),
        last_processing_error: result.error,
        processing_status: 'failed'
      })
      .eq('id', messageId)
    return
  }

  // Update message with AI results
  await supabase
    .from('messages')
    .update({
      ai_summary: result.summary,
      priority_score: result.priorityScore,
      processing_status: 'completed',
      processing_attempts: supabase.raw('processing_attempts + 1'),
      last_processing_error: null
    })
    .eq('id', messageId)

  // Insert action items if any
  if (result.actionItems && result.actionItems.length > 0) {
    const actionItemsToInsert = result.actionItems.map(item => ({
      message_id: messageId,
      user_id: supabase.auth.user?.id,
      description: item.description,
      due_date: item.dueDate,
      priority: item.priority,
      context_snippet: item.contextSnippet,
      estimated_duration: item.estimatedDuration,
      confidence_score: 0.8 // Default confidence for AI extraction
    }))

    await supabase
      .from('action_items')
      .insert(actionItemsToInsert)
  }
}

/**
 * Log processing metrics
 */
async function logProcessingMetrics(
  userId: string,
  batchId: string,
  results: ProcessingResult[],
  supabase: any
): Promise<void> {
  const totalTokens = results.reduce((sum, r) => sum + (r.tokensUsed || 0), 0)
  const totalTime = results.reduce((sum, r) => sum + (r.processingTimeMs || 0), 0)
  const successCount = results.filter(r => r.success).length
  const errorCount = results.filter(r => !r.success).length
  
  // Estimate cost (rough calculation: $0.03 per 1K tokens for GPT-4)
  const estimatedCostCents = Math.round((totalTokens / 1000) * 3)

  await supabase
    .from('ai_processing_logs')
    .insert({
      user_id: userId,
      batch_id: batchId,
      operation_type: 'batch_process',
      message_count: results.length,
      processing_time_ms: totalTime,
      tokens_used: totalTokens,
      cost_cents: estimatedCostCents,
      success_count: successCount,
      error_count: errorCount,
      model_used: AI_CONFIG.MODEL,
      model_version: 'gpt-4-0613',
      error_details: errorCount > 0 ? {
        errors: results.filter(r => !r.success).map(r => ({
          messageId: r.messageId,
          error: r.error
        }))
      } : null
    })
}

/**
 * Main processing endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id
    const supabase = createServiceClient()
    
    // Check rate limits
    const withinRateLimit = await checkRateLimit(userId, supabase)
    if (!withinRateLimit) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again in an hour.',
          retryAfter: 3600 
        },
        { status: 429 }
      )
    }

    // Get user preferences for AI processing
    const { data: userPrefs } = await supabase
      .from('user_preferences')
      .select('ai_preferences, vip_contacts')
      .eq('user_id', userId)
      .single()

    // Find messages that need processing
    const { data: pendingMessages, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .eq('processing_status', 'pending')
      .lt('processing_attempts', RATE_LIMITS.MAX_RETRIES)
      .order('created_at', { ascending: false })
      .limit(RATE_LIMITS.MAX_MESSAGES_PER_BATCH)

    if (fetchError) {
      console.error('Error fetching pending messages:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch messages for processing' },
        { status: 500 }
      )
    }

    if (!pendingMessages || pendingMessages.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No messages to process',
        processed: 0
      })
    }

    // Mark messages as processing to prevent concurrent processing
    const messageIds = pendingMessages.map(m => m.id)
    await supabase
      .from('messages')
      .update({ processing_status: 'processing' })
      .in('id', messageIds)

    // Generate batch ID for logging
    const batchId = crypto.randomUUID()
    
    console.log(`Processing batch ${batchId}: ${pendingMessages.length} messages for user ${userId}`)

    // Process messages with AI
    const results: ProcessingResult[] = []
    
    for (const message of pendingMessages) {
      try {
        const result = await processMessage(message, userPrefs)
        results.push(result)
        
        // Update message with results
        await updateMessageWithResults(message.id, result, supabase)
        
        // Small delay between messages to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`Failed to process message ${message.id}:`, error)
        results.push({
          messageId: message.id,
          success: false,
          error: error instanceof Error ? error.message : 'Processing failed'
        })
      }
    }

    // Log processing metrics
    await logProcessingMetrics(userId, batchId, results, supabase)

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length
    
    console.log(`Batch ${batchId} completed: ${successCount} successful, ${errorCount} failed`)

    return NextResponse.json({
      success: true,
      batchId,
      processed: results.length,
      successful: successCount,
      failed: errorCount,
      results: results.map(r => ({
        messageId: r.messageId,
        success: r.success,
        error: r.error
      }))
    })

  } catch (error) {
    console.error('AI processing endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check processing status
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServiceClient()
    
    // Get processing statistics
    const { data: stats } = await supabase
      .from('messages')
      .select('processing_status')
      .eq('user_id', user.id)

    if (!stats) {
      return NextResponse.json({
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        total: 0
      })
    }

    const statusCounts = stats.reduce((acc, message) => {
      acc[message.processing_status] = (acc[message.processing_status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      pending: statusCounts.pending || 0,
      processing: statusCounts.processing || 0,
      completed: statusCounts.completed || 0,
      failed: statusCounts.failed || 0,
      total: stats.length
    })

  } catch (error) {
    console.error('Processing status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}