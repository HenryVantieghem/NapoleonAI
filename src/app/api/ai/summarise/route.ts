import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messageId } = await request.json()
    
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createClient()

    // Fetch message from database
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // If already summarized, return existing summary
    if (message.ai_summary) {
      return NextResponse.json({ 
        summary: message.ai_summary,
        priority_score: message.priority_score 
      })
    }

    // Generate AI summary using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an executive AI assistant. Analyze this message and provide:
1. A concise executive summary (2-3 sentences max)
2. Key action items or decisions required
3. Priority level assessment (1-100, where 90+ is board/investor level)

Format your response as JSON with keys: summary, action_items, priority_score`
        },
        {
          role: "user",
          content: `From: ${message.sender_name || message.sender_email}
Subject: ${message.subject || 'No subject'}
Content: ${message.content}`
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    })

    let aiResponse
    try {
      aiResponse = JSON.parse(completion.choices[0].message.content || '{}')
    } catch (parseError) {
      // Fallback if JSON parsing fails
      aiResponse = {
        summary: completion.choices[0].message.content || 'Unable to generate summary',
        action_items: [],
        priority_score: 50
      }
    }

    // Update message with AI summary
    const { error: updateError } = await supabase
      .from('messages')
      .update({
        ai_summary: aiResponse.summary,
        priority_score: aiResponse.priority_score,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to update message:', updateError)
      return NextResponse.json({ error: 'Failed to save summary' }, { status: 500 })
    }

    return NextResponse.json({
      summary: aiResponse.summary,
      action_items: aiResponse.action_items,
      priority_score: aiResponse.priority_score
    })

  } catch (error) {
    console.error('AI summarization error:', error)
    
    // Fallback for when OpenAI is unavailable
    if (error instanceof Error && error.message.includes('API')) {
      return NextResponse.json({
        summary: 'AI summarization temporarily unavailable. Please check message manually.',
        action_items: ['Manual review required'],
        priority_score: 50
      })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const messageId = url.searchParams.get('messageId')
    
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    const supabase = createClient()

    const { data: message, error } = await supabase
      .from('messages')
      .select('ai_summary, priority_score')
      .eq('id', messageId)
      .eq('user_id', user.id)
      .single()

    if (error || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    return NextResponse.json({
      summary: message.ai_summary,
      priority_score: message.priority_score
    })

  } catch (error) {
    console.error('Get summary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}