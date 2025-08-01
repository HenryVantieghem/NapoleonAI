import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/server'

// Log automation errors for monitoring and debugging
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      integration,
      error_type,
      error_message,
      error_details,
      automation_id,
      retry_count,
      metadata
    } = body

    const supabase = createClient()

    // Log the error
    const { data: errorLog, error: logError } = await supabase
      .from('automation_errors')
      .insert({
        user_id: userId,
        integration,
        error_type,
        error_message,
        error_details,
        automation_id,
        retry_count: retry_count || 0,
        metadata,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (logError) {
      console.error('Failed to log automation error:', logError)
      return NextResponse.json(
        { error: 'Failed to log error' },
        { status: 500 }
      )
    }

    // Check if we should notify the user
    const shouldNotify = await shouldNotifyUser(
      userId,
      integration,
      error_type,
      retry_count
    )

    if (shouldNotify) {
      await createNotification(userId, integration, error_message)
    }

    // Return error handling suggestions
    const suggestions = getErrorSuggestions(error_type, integration)

    return NextResponse.json({
      error_id: errorLog.id,
      logged: true,
      notification_sent: shouldNotify,
      suggestions,
      retry_after: calculateRetryDelay(retry_count),
    })
  } catch (error) {
    console.error('Automation error logging failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve error history
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const integration = searchParams.get('integration')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createClient()

    let query = supabase
      .from('automation_errors')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (integration) {
      query = query.eq('integration', integration)
    }

    const { data: errors, error: fetchError } = await query

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch errors' },
        { status: 500 }
      )
    }

    // Group errors by type for summary
    const errorSummary = errors?.reduce((acc, error) => {
      const key = `${error.integration}_${error.error_type}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      errors: errors || [],
      total: errors?.length || 0,
      summary: errorSummary,
      health_status: calculateHealthStatus(errors || []),
    })
  } catch (error) {
    console.error('Failed to fetch automation errors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
async function shouldNotifyUser(
  userId: string,
  integration: string,
  errorType: string,
  retryCount: number
): Promise<boolean> {
  // Notify on first error or after multiple retries
  if (retryCount === 0 || retryCount >= 3) {
    return true
  }

  // Check if this is a critical error type
  const criticalErrors = [
    'authentication_failed',
    'rate_limit_exceeded',
    'integration_disconnected',
    'quota_exceeded'
  ]

  return criticalErrors.includes(errorType)
}

async function createNotification(
  userId: string,
  integration: string,
  errorMessage: string
) {
  const supabase = createClient()

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'system',
    title: `${integration} Automation Error`,
    message: errorMessage,
    priority: 'medium',
    link: '/dashboard/integrations',
    created_at: new Date().toISOString(),
  })
}

function getErrorSuggestions(errorType: string, integration: string): string[] {
  const suggestions: Record<string, string[]> = {
    authentication_failed: [
      `Reconnect your ${integration} account`,
      'Check if your credentials have expired',
      'Verify API permissions are still valid'
    ],
    rate_limit_exceeded: [
      'Wait before retrying',
      'Reduce automation frequency',
      'Upgrade to a higher API tier'
    ],
    network_error: [
      'Check your internet connection',
      'Verify the service is not down',
      'Try again in a few minutes'
    ],
    invalid_data: [
      'Check the data format',
      'Verify required fields are present',
      'Review the automation configuration'
    ],
    integration_disconnected: [
      `Reconnect ${integration} in settings`,
      'Check if the service revoked access',
      'Update integration permissions'
    ]
  }

  return suggestions[errorType] || [
    'Check the error details',
    'Contact support if the issue persists',
    'Review the automation logs'
  ]
}

function calculateRetryDelay(retryCount: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s
  return Math.min(Math.pow(2, retryCount) * 1000, 32000)
}

function calculateHealthStatus(errors: any[]): string {
  if (errors.length === 0) return 'healthy'
  
  const recentErrors = errors.filter(e => {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return new Date(e.created_at) > hourAgo
  })

  if (recentErrors.length > 10) return 'critical'
  if (recentErrors.length > 5) return 'warning'
  if (recentErrors.length > 0) return 'degraded'
  
  return 'healthy'
}