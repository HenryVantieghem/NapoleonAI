import { NextResponse } from 'next/server'

// Temporary stub for deployment - full implementation coming in Phase 2
export async function POST(request: Request) {
  try {
    return NextResponse.json(
      { 
        message: 'AI processing endpoint ready for Phase 2 implementation', 
        processed: 0,
        results: []
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Process messages error:', error)
    return NextResponse.json(
      { error: 'AI processing temporarily unavailable' },
      { status: 500 }
    )
  }
}