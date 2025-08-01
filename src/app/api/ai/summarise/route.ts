import { NextResponse } from 'next/server'

// Temporary stub for deployment - full implementation coming in Phase 2
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message } = body
    
    return NextResponse.json(
      { 
        summary: 'AI summarization ready for Phase 2 implementation',
        priority_score: 75,
        action_items: []
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Summarize error:', error)
    return NextResponse.json(
      { error: 'AI summarization temporarily unavailable' },
      { status: 500 }
    )
  }
}