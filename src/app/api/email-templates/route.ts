import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { emailTemplateService } from '@/lib/features/email-templates'

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
    const type = searchParams.get('type') || 'templates' // 'templates' | 'responses'
    const category = searchParams.get('category') || 'all'
    const messageContent = searchParams.get('messageContent')
    const action = searchParams.get('action')

    switch (action) {
      case 'suggest-responses':
        if (!messageContent) {
          return NextResponse.json(
            { error: 'Message content is required for suggestions' },
            { status: 400 }
          )
        }

        const messageContext = {
          sender: searchParams.get('sender') || undefined,
          subject: searchParams.get('subject') || undefined,
          channel: searchParams.get('channel') || undefined
        }

        const suggestions = await emailTemplateService.suggestQuickResponses(
          userId, 
          messageContent, 
          messageContext
        )

        return NextResponse.json({
          success: true,
          suggestions,
          count: suggestions.length
        })

      default:
        // Regular GET for templates or responses
        if (type === 'responses') {
          const responses = await emailTemplateService.getQuickResponses(userId, category)
          return NextResponse.json({
            success: true,
            responses,
            count: responses.length
          })
        } else {
          const templates = await emailTemplateService.getTemplates(userId, category)
          return NextResponse.json({
            success: true,
            templates,
            count: templates.length
          })
        }
    }
  } catch (error) {
    console.error('Email templates API error:', error)
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
    const { action, type, ...data } = body

    switch (action) {
      case 'create-template':
        const { name, category, subject_template, body_template, variables } = data

        if (!name || !body_template) {
          return NextResponse.json(
            { error: 'Template name and body are required' },
            { status: 400 }
          )
        }

        const template = await emailTemplateService.createTemplate(userId, {
          name,
          category: category || 'general',
          subject_template,
          body_template,
          variables
        })

        return NextResponse.json({
          success: true,
          template
        })

      case 'create-response':
        const { trigger_keywords, response_text, tone } = data

        if (!trigger_keywords || !response_text || !Array.isArray(trigger_keywords)) {
          return NextResponse.json(
            { error: 'Trigger keywords and response text are required' },
            { status: 400 }
          )
        }

        const response = await emailTemplateService.createQuickResponse(userId, {
          trigger_keywords,
          response_text,
          tone: tone || 'professional',
          category: data.category || 'general'
        })

        return NextResponse.json({
          success: true,
          response
        })

      case 'render-template':
        const { templateId, variables: templateVars } = data

        if (!templateId || !templateVars) {
          return NextResponse.json(
            { error: 'Template ID and variables are required' },
            { status: 400 }
          )
        }

        // Get the template first
        const templates = await emailTemplateService.getTemplates(userId)
        const templateToRender = templates.find(t => t.id === templateId)

        if (!templateToRender) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          )
        }

        const rendered = emailTemplateService.renderTemplate(templateToRender, templateVars)
        
        // Increment usage count
        await emailTemplateService.incrementTemplateUsage(templateId)

        return NextResponse.json({
          success: true,
          rendered
        })

      case 'increment-usage':
        const { responseId, templateId: incrementTemplateId, wasEffective } = data

        if (responseId) {
          await emailTemplateService.incrementResponseUsage(responseId, wasEffective !== false)
        } else if (incrementTemplateId) {
          await emailTemplateService.incrementTemplateUsage(incrementTemplateId)
        } else {
          return NextResponse.json(
            { error: 'Response ID or Template ID is required' },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true })

      case 'create-defaults':
        await Promise.all([
          emailTemplateService.createDefaultTemplates(userId),
          emailTemplateService.createDefaultQuickResponses(userId)
        ])

        return NextResponse.json({
          success: true,
          message: 'Default templates and responses created'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Email templates POST API error:', error)
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