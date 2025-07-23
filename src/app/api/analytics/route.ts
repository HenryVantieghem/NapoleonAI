import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { analyticsService } from '@/lib/features/analytics-service'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'metrics'
    const days = parseInt(searchParams.get('days') || '30')

    switch (type) {
      case 'metrics':
        const metrics = await analyticsService.getExecutiveMetrics(userId, days)
        return NextResponse.json({
          success: true,
          metrics,
          period: days
        })

      case 'insights':
        const insights = await analyticsService.getProductivityInsights(userId)
        return NextResponse.json({
          success: true,
          insights
        })

      case 'heatmap':
        const heatmap = await analyticsService.getCommunicationHeatmap(userId, days)
        return NextResponse.json({
          success: true,
          heatmap
        })

      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'generate-insights':
        await analyticsService.generateInsights(userId)
        return NextResponse.json({
          success: true,
          message: 'Insights generated successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Analytics POST API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}