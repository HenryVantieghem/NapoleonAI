'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { 
  X, 
  Reply, 
  Forward, 
  Archive, 
  Star, 
  Clock, 
  User, 
  Mail,
  AlertCircle,
  CheckCircle,
  Send,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  subject: string
  sender_name: string
  sender_email: string
  content: string
  received_at: string
  priority_score: number
  ai_summary?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  is_vip: boolean
  action_items?: ActionItem[]
  thread_messages?: Message[]
}

interface ActionItem {
  id: string
  action: string
  due_date?: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'completed'
}

interface MessageModalProps {
  message: Message | null
  isOpen: boolean
  onClose: () => void
  onReply?: (messageId: string, content: string) => void
  onForward?: (messageId: string) => void
  onArchive?: (messageId: string) => void
  onStar?: (messageId: string) => void
}

export default function MessageModal({
  message,
  isOpen,
  onClose,
  onReply,
  onForward,
  onArchive,
  onStar
}: MessageModalProps) {
  const [replyMode, setReplyMode] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setReplyMode(false)
      setReplyContent('')
      setIsReplying(false)
    }
  }, [isOpen])

  if (!message) return null

  const handleReply = async () => {
    if (!replyContent.trim() || !onReply) return
    
    setIsReplying(true)
    try {
      await onReply(message.id, replyContent)
      setReplyMode(false)
      setReplyContent('')
      onClose()
    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      setIsReplying(false)
    }
  }

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50 border-red-200'
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-blue-600 bg-blue-50 border-blue-200'
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50'
      case 'negative': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="h-4 w-4" />
      case 'negative': return <AlertCircle className="h-4 w-4" />
      default: return <div className="h-4 w-4 rounded-full bg-gray-400" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-serif text-navy mb-2 pr-8">
                {message.subject}
              </DialogTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{message.sender_name}</span>
                  <span className="text-gray-400">({message.sender_email})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(message.received_at)}</span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Message Metadata */}
          <div className="flex items-center space-x-4">
            <Badge className={cn('border', getPriorityColor(message.priority_score))}>
              Priority: {message.priority_score}/100
            </Badge>
            
            {message.sentiment && (
              <Badge className={cn('border', getSentimentColor(message.sentiment))}>
                <span className="flex items-center space-x-1">
                  {getSentimentIcon(message.sentiment)}
                  <span className="capitalize">{message.sentiment}</span>
                </span>
              </Badge>
            )}
            
            {message.is_vip && (
              <Badge className="bg-gold text-white border-gold">
                <Star className="h-3 w-3 mr-1" />
                VIP
              </Badge>
            )}
          </div>

          {/* AI Summary */}
          {message.ai_summary && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-navy mb-2 flex items-center">
                  <div className="w-2 h-2 bg-gold rounded-full mr-2" />
                  AI Summary
                </h3>
                <p className="text-gray-700 leading-relaxed">{message.ai_summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Items */}
          {message.action_items && message.action_items.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-navy mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Action Items
                </h3>
                <div className="space-y-3">
                  {message.action_items.map(item => (
                    <div 
                      key={item.id}
                      className="flex items-start justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.action}</p>
                        {item.due_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {new Date(item.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={item.priority === 'high' ? 'destructive' : 
                                  item.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {item.priority}
                        </Badge>
                        <Badge 
                          variant={item.status === 'completed' ? 'default' : 'outline'}
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message Content */}
          <Card>
            <CardContent className="p-6">
              <div 
                className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>') }}
              />
            </CardContent>
          </Card>

          {/* Thread Messages */}
          {message.thread_messages && message.thread_messages.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-navy mb-3 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Thread ({message.thread_messages.length} messages)
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {message.thread_messages.map(threadMessage => (
                    <div key={threadMessage.id} className="border-l-2 border-gray-200 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{threadMessage.sender_name}</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(threadMessage.received_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {threadMessage.content.substring(0, 200)}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reply Interface */}
          {replyMode && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-navy mb-3 flex items-center">
                  <Reply className="h-4 w-4 mr-2" />
                  Reply to {message.sender_name}
                </h3>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setReplyMode(false)}
                      disabled={isReplying}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReply}
                      disabled={!replyContent.trim() || isReplying}
                      className="bg-navy hover:bg-navy/90"
                    >
                      {isReplying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReplyMode(!replyMode)}
              disabled={replyMode}
            >
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
            {onForward && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onForward(message.id)}
              >
                <Forward className="h-4 w-4 mr-2" />
                Forward
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {onStar && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStar(message.id)}
              >
                <Star className="h-4 w-4 mr-2" />
                Star
              </Button>
            )}
            {onArchive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onArchive(message.id)}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}