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

// AI configuration for summarization
const AI_CONFIG = {
  MODEL: 'gpt-4',
  MAX_TOKENS: 200,
  TEMPERATURE: 0.3,
  TIMEOUT_MS: 15000,
}

interface SummarisationResult {
  messageId: string
  success: boolean
  summary?: string
  error?: string
  tokensUsed?: number
  processingTimeMs?: number
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
 * Generate summary for a single message
 */
async function generateSummary(message: any): Promise<SummarisationResult> {
  const startTime = Date.now()
  
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

    // Load and fill summarization prompt
    const summarizePrompt = fillPromptTemplate(
      loadPromptTemplate('summarise'), 
      templateVars
    )

    // Generate summary with OpenAI
    const response = await openaiClient.chat.completions.create({
      model: AI_CONFIG.MODEL,
      messages: [{ role: 'user', content: summarizePrompt }],
      max_tokens: AI_CONFIG.MAX_TOKENS,
      temperature: AI_CONFIG.TEMPERATURE,
    })

    const summary = response.choices[0]?.message?.content?.trim() || 'No summary available.'
    const tokensUsed = response.usage?.total_tokens || 0
    const processingTimeMs = Date.now() - startTime

    return {
      messageId: message.id,
      success: true,
      summary,
      tokensUsed,
      processingTimeMs
    }
    
  } catch (error) {
    console.error(`Summarization failed for message ${message.id}:`, error)
    
    return {
      messageId: message.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTimeMs: Date.now() - startTime
    }
  }
}

/**
 * Log summarization metrics
 */
async function logSummarizationMetrics(
  userId: string,
  result: SummarisationResult,
  supabase: any
): Promise<void> {
  // Estimate cost (rough calculation: $0.03 per 1K tokens for GPT-4)
  const estimatedCostCents = Math.round(((result.tokensUsed || 0) / 1000) * 3)

  await supabase
    .from('ai_processing_logs')
    .insert({
      user_id: userId,
      batch_id: crypto.randomUUID(),
      operation_type: 'summarize',
      message_count: 1,
      processing_time_ms: result.processingTimeMs || 0,
      tokens_used: result.tokensUsed || 0,
      cost_cents: estimatedCostCents,
      success_count: result.success ? 1 : 0,
      error_count: result.success ? 0 : 1,
      model_used: AI_CONFIG.MODEL,
      model_version: 'gpt-4-0613',
      error_details: result.success ? null : {
        messageId: result.messageId,
        error: result.error
      }
    })
}

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
    
    // Parse request body
    const body = await request.json()
    const { messageId } = body

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      )
    }

    // Fetch the specific message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !message) {
      return NextResponse.json(
        { error: 'Message not found or access denied' },
        { status: 404 }
      )
    }

    // If already summarized, return existing summary
    if (message.ai_summary) {
      return NextResponse.json({
        success: true,
        messageId: message.id,
        summary: message.ai_summary,
        cached: true
      })
    }

    console.log(`Generating summary for message ${messageId} by user ${userId}`)

    // Generate summary
    const result = await generateSummary(message)

    if (result.success) {
      // Update message with summary
      await supabase
        .from('messages')
        .update({
          ai_summary: result.summary,
          processing_status: 'completed'
        })
        .eq('id', messageId)
    }

    // Log metrics
    await logSummarizationMetrics(userId, result, supabase)

    // Return result
    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      summary: result.summary,
      error: result.error,
      cached: false,
      metrics: {
        tokensUsed: result.tokensUsed,
        processingTimeMs: result.processingTimeMs
      }
    })

  } catch (error) {
    console.error('Summarization endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    
    // Fetch message summary
    const { data: message, error } = await supabase
      .from('messages')
      .select('id, ai_summary, processing_status, priority_score, subject, sender, created_at')
      .eq('id', messageId)
      .eq('user_id', user.id)
      .single()

    if (error || !message) {
      return NextResponse.json(
        { error: 'Message not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      messageId: message.id,
      summary: message.ai_summary,
      priorityScore: message.priority_score,
      hasSummary: !!message.ai_summary,
      processingStatus: message.processing_status,
      messagePreview: {
        subject: message.subject,
        sender: message.sender,
        createdAt: message.created_at
      }
    })

  } catch (error) {
    console.error('Get summary endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}