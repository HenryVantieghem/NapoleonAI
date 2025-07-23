'use client'

import { useState, useEffect } from 'react'
import { 
  Send, 
  FileText as Template, 
  Zap, 
  Plus, 
  X, 
  Edit3,
  Copy,
  ChevronDown,
  Loader2,
  Check,
  FileText
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useEmailTemplates, useResponseSuggestions } from '@/lib/hooks/use-email-templates'
import { EmailTemplate, QuickResponse } from '@/lib/features/email-templates'

interface EmailComposerProps {
  userId: string
  replyTo?: {
    messageId: string
    sender: string
    subject: string
    content: string
    channel: string
  }
  onSend?: (email: { to: string; subject: string; body: string }) => void
  onClose?: () => void
  className?: string
}

export default function EmailComposer({ userId, replyTo, onSend, onClose, className }: EmailComposerProps) {
  const [to, setTo] = useState(replyTo?.sender || '')
  const [subject, setSubject] = useState(
    replyTo?.subject ? (replyTo.subject.startsWith('Re:') ? replyTo.subject : `Re: ${replyTo.subject}`) : ''
  )
  const [body, setBody] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showQuickResponses, setShowQuickResponses] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})
  
  const {
    templates,
    templatesLoading,
    quickResponses,
    responsesLoading,
    renderTemplate,
    incrementUsage,
    createDefaults
  } = useEmailTemplates(userId)

  const {
    suggestions,
    isLoading: suggestionsLoading
  } = useResponseSuggestions(
    userId,
    replyTo?.content || '',
    replyTo ? {
      sender: replyTo.sender,
      subject: replyTo.subject,
      channel: replyTo.channel
    } : undefined
  )

  // Initialize with reply context
  useEffect(() => {
    if (replyTo && !body) {
      const contextualGreeting = `Hi ${replyTo.sender.split(' ')[0] || replyTo.sender},\n\nThank you for your message regarding "${replyTo.subject}".\n\n`
      setBody(contextualGreeting)
    }
  }, [replyTo, body])

  const handleSend = () => {
    if (!to || !body.trim()) return

    onSend?.({
      to,
      subject: subject || 'No Subject',
      body
    })

    // Reset form
    setTo('')
    setSubject('')
    setBody('')
    onClose?.()
  }

  const handleUseTemplate = async (template: EmailTemplate) => {
    setSelectedTemplate(template)
    
    // Extract variables from template
    const variables: Record<string, string> = {}
    template.variables.forEach(variable => {
      variables[variable] = templateVariables[variable] || ''
    })
    
    // Pre-populate with known values
    if (replyTo) {
      variables['recipient_name'] = replyTo.sender.split(' ')[0] || replyTo.sender
      variables['original_subject'] = replyTo.subject
      variables['sender_name'] = 'Executive'
    }
    
    setTemplateVariables(variables)
  }

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return

    const rendered = await renderTemplate(selectedTemplate.id, templateVariables)
    if (rendered) {
      setSubject(rendered.subject)
      setBody(rendered.body)
      await incrementUsage(selectedTemplate.id, 'template')
      setSelectedTemplate(null)
      setTemplateVariables({})
    }
  }

  const handleUseQuickResponse = async (response: QuickResponse) => {
    if (body.trim()) {
      setBody(body + '\n\n' + response.response_text)
    } else {
      setBody(response.response_text)
    }
    
    await incrementUsage(response.id, 'response')
    setShowQuickResponses(false)
  }

  const handleCreateDefaults = async () => {
    try {
      await createDefaults()
    } catch (error) {
      console.error('Failed to create defaults:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-lg border shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          {replyTo ? 'Reply to Message' : 'Compose Email'}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-burgundy hover:bg-burgundy-50"
          >
            <Template className="h-4 w-4 mr-1" />
            Templates
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuickResponses(!showQuickResponses)}
            className="text-burgundy hover:bg-burgundy-50"
          >
            <Zap className="h-4 w-4 mr-1" />
            Quick Responses
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Templates Panel */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b bg-gray-50 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Email Templates</h4>
              {templates.length === 0 && !templatesLoading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateDefaults}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Defaults
                </Button>
              )}
            </div>
            
            {templatesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {templates.slice(0, 8).map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleUseTemplate(template)}
                    className="p-3 bg-white rounded border hover:border-burgundy-300 hover:shadow-sm cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm text-gray-900">
                          {template.name}
                        </h5>
                        <p className="text-xs text-gray-500 mt-1">
                          Category: {template.category}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Used {template.usage_count} times
                        </p>
                      </div>
                      <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No templates found. Create some defaults to get started.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Responses Panel */}
      <AnimatePresence>
        {showQuickResponses && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b bg-gray-50 p-4"
          >
            <h4 className="font-medium text-gray-900 mb-3">Quick Responses</h4>
            
            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-burgundy mb-2 flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  AI Suggested
                </h5>
                <div className="space-y-2">
                  {suggestions.slice(0, 3).map((response) => (
                    <div
                      key={response.id}
                      onClick={() => handleUseQuickResponse(response)}
                      className="p-2 bg-burgundy-50 border border-burgundy-200 rounded text-sm cursor-pointer hover:bg-burgundy-100 transition-colors"
                    >
                      <p className="text-gray-800">{response.response_text}</p>
                      <p className="text-xs text-burgundy-600 mt-1">
                        {response.tone} • {response.category}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {responsesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : quickResponses.length > 0 ? (
              <div className="space-y-2">
                {quickResponses.slice(0, 5).map((response) => (
                  <div
                    key={response.id}
                    onClick={() => handleUseQuickResponse(response)}
                    className="p-2 bg-white border rounded text-sm cursor-pointer hover:border-burgundy-300 hover:shadow-sm transition-all"
                  >
                    <p className="text-gray-800">{response.response_text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {response.tone} • Used {response.usage_count} times
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No quick responses found.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Variable Editor */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b bg-blue-50 p-4"
          >
            <h4 className="font-medium text-gray-900 mb-3">
              Complete Template: {selectedTemplate.name}
            </h4>
            <div className="space-y-3">
              {selectedTemplate.variables.map((variable) => (
                <div key={variable}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <input
                    type="text"
                    value={templateVariables[variable] || ''}
                    onChange={(e) => setTemplateVariables({
                      ...templateVariables,
                      [variable]: e.target.value
                    })}
                    className="w-full px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                    placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyTemplate}
                  className="bg-burgundy text-white hover:bg-burgundy-700"
                >
                  Apply Template
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer Form */}
      <div className="p-4 space-y-4">
        {/* To Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
            placeholder="recipient@company.com"
          />
        </div>

        {/* Subject Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
            placeholder="Email subject"
          />
        </div>

        {/* Body Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 resize-none"
            placeholder="Compose your message..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {replyTo && (
              <span>Replying to {replyTo.sender}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!to || !body.trim()}
              className="bg-burgundy text-white hover:bg-burgundy-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}