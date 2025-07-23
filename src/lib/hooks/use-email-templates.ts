import { useState, useEffect, useCallback } from 'react'
import { EmailTemplate, QuickResponse } from '@/lib/features/email-templates'

interface UseEmailTemplatesReturn {
  // Templates
  templates: EmailTemplate[]
  templatesLoading: boolean
  templatesError: string | null
  
  // Quick Responses
  quickResponses: QuickResponse[]
  responsesLoading: boolean
  responsesError: string | null
  
  // Functions
  getTemplates: (category?: string) => Promise<void>
  getQuickResponses: (category?: string) => Promise<void>
  createTemplate: (template: CreateTemplateParams) => Promise<EmailTemplate | null>
  createQuickResponse: (response: CreateResponseParams) => Promise<QuickResponse | null>
  renderTemplate: (templateId: string, variables: Record<string, string>) => Promise<{ subject: string; body: string } | null>
  suggestResponses: (messageContent: string, messageContext?: MessageContext) => Promise<QuickResponse[]>
  incrementUsage: (itemId: string, type: 'template' | 'response', wasEffective?: boolean) => Promise<void>
  createDefaults: () => Promise<void>
  refreshAll: () => Promise<void>
}

interface CreateTemplateParams {
  name: string
  category: string
  subject_template?: string
  body_template: string
  variables?: string[]
}

interface CreateResponseParams {
  trigger_keywords: string[]
  response_text: string
  tone: 'professional' | 'friendly' | 'formal' | 'brief'
  category: string
}

interface MessageContext {
  sender?: string
  subject?: string
  channel?: string
}

export function useEmailTemplates(userId?: string): UseEmailTemplatesReturn {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templatesError, setTemplatesError] = useState<string | null>(null)
  
  const [quickResponses, setQuickResponses] = useState<QuickResponse[]>([])
  const [responsesLoading, setResponsesLoading] = useState(false)
  const [responsesError, setResponsesError] = useState<string | null>(null)

  // Get templates
  const getTemplates = useCallback(async (category: string = 'all') => {
    if (!userId) return

    setTemplatesLoading(true)
    setTemplatesError(null)

    try {
      const response = await fetch(
        `/api/email-templates?userId=${userId}&type=templates&category=${category}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get templates')
      }

      const data = await response.json()
      setTemplates(data.templates)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get templates'
      setTemplatesError(errorMessage)
      console.error('Get templates error:', error)
    } finally {
      setTemplatesLoading(false)
    }
  }, [userId])

  // Get quick responses
  const getQuickResponses = useCallback(async (category: string = 'all') => {
    if (!userId) return

    setResponsesLoading(true)
    setResponsesError(null)

    try {
      const response = await fetch(
        `/api/email-templates?userId=${userId}&type=responses&category=${category}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get quick responses')
      }

      const data = await response.json()
      setQuickResponses(data.responses)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get quick responses'
      setResponsesError(errorMessage)
      console.error('Get quick responses error:', error)
    } finally {
      setResponsesLoading(false)
    }
  }, [userId])

  // Create template
  const createTemplate = useCallback(async (templateData: CreateTemplateParams): Promise<EmailTemplate | null> => {
    if (!userId) {
      setTemplatesError('User ID is required')
      return null
    }

    try {
      const response = await fetch('/api/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          action: 'create-template',
          ...templateData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create template')
      }

      const data = await response.json()
      
      // Refresh templates list
      await getTemplates()
      
      return data.template
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create template'
      setTemplatesError(errorMessage)
      console.error('Create template error:', error)
      return null
    }
  }, [userId, getTemplates])

  // Create quick response
  const createQuickResponse = useCallback(async (responseData: CreateResponseParams): Promise<QuickResponse | null> => {
    if (!userId) {
      setResponsesError('User ID is required')
      return null
    }

    try {
      const response = await fetch('/api/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          action: 'create-response',
          ...responseData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create quick response')
      }

      const data = await response.json()
      
      // Refresh responses list
      await getQuickResponses()
      
      return data.response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create quick response'
      setResponsesError(errorMessage)
      console.error('Create quick response error:', error)
      return null
    }
  }, [userId, getQuickResponses])

  // Render template
  const renderTemplate = useCallback(async (
    templateId: string, 
    variables: Record<string, string>
  ): Promise<{ subject: string; body: string } | null> => {
    if (!userId) return null

    try {
      const response = await fetch('/api/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          action: 'render-template',
          templateId,
          variables
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to render template')
      }

      const data = await response.json()
      return data.rendered
    } catch (error) {
      console.error('Render template error:', error)
      return null
    }
  }, [userId])

  // Suggest quick responses
  const suggestResponses = useCallback(async (
    messageContent: string, 
    messageContext?: MessageContext
  ): Promise<QuickResponse[]> => {
    if (!userId || !messageContent.trim()) return []

    try {
      const params = new URLSearchParams({
        userId,
        action: 'suggest-responses',
        messageContent
      })

      if (messageContext?.sender) params.append('sender', messageContext.sender)
      if (messageContext?.subject) params.append('subject', messageContext.subject)
      if (messageContext?.channel) params.append('channel', messageContext.channel)

      const response = await fetch(`/api/email-templates?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response suggestions')
      }

      const data = await response.json()
      return data.suggestions
    } catch (error) {
      console.error('Suggest responses error:', error)
      return []
    }
  }, [userId])

  // Increment usage
  const incrementUsage = useCallback(async (
    itemId: string, 
    type: 'template' | 'response', 
    wasEffective: boolean = true
  ): Promise<void> => {
    if (!userId) return

    try {
      await fetch('/api/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          action: 'increment-usage',
          [type === 'template' ? 'templateId' : 'responseId']: itemId,
          wasEffective
        })
      })
    } catch (error) {
      console.error('Increment usage error:', error)
    }
  }, [userId])

  // Create default templates and responses
  const createDefaults = useCallback(async (): Promise<void> => {
    if (!userId) return

    try {
      const response = await fetch('/api/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          action: 'create-defaults'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create defaults')
      }

      // Refresh both lists
      await Promise.all([getTemplates(), getQuickResponses()])
    } catch (error) {
      console.error('Create defaults error:', error)
      throw error
    }
  }, [userId, getTemplates, getQuickResponses])

  // Refresh all data
  const refreshAll = useCallback(async (): Promise<void> => {
    await Promise.all([getTemplates(), getQuickResponses()])
  }, [getTemplates, getQuickResponses])

  // Auto-load on mount
  useEffect(() => {
    if (userId) {
      getTemplates()
      getQuickResponses()
    }
  }, [userId, getTemplates, getQuickResponses])

  return {
    // Templates
    templates,
    templatesLoading,
    templatesError,
    
    // Quick Responses
    quickResponses,
    responsesLoading,
    responsesError,
    
    // Functions
    getTemplates,
    getQuickResponses,
    createTemplate,
    createQuickResponse,
    renderTemplate,
    suggestResponses,
    incrementUsage,
    createDefaults,
    refreshAll
  }
}

// Hook specifically for response suggestions in message composer
export function useResponseSuggestions(
  userId: string,
  messageContent: string,
  messageContext?: MessageContext
) {
  const [suggestions, setSuggestions] = useState<QuickResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { suggestResponses } = useEmailTemplates(userId)

  const loadSuggestions = useCallback(async () => {
    if (!messageContent.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const responseSuggestions = await suggestResponses(messageContent, messageContext)
      setSuggestions(responseSuggestions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suggestions')
    } finally {
      setIsLoading(false)
    }
  }, [messageContent, messageContext, suggestResponses])

  useEffect(() => {
    const debounceTimer = setTimeout(loadSuggestions, 500)
    return () => clearTimeout(debounceTimer)
  }, [loadSuggestions])

  return {
    suggestions,
    isLoading,
    error,
    refresh: loadSuggestions
  }
}