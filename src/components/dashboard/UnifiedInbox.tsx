"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Mail, Loader2, AlertCircle, RefreshCw, Filter } from "lucide-react"
import MessageCard from "./MessageCard"
import { Message } from "@/hooks/useMessages"

interface UnifiedInboxProps {
  messages: Message[]
  loading: boolean
  error: string | null
  selectedMessageId: string | null
  onMessageSelect: (messageId: string) => void
  onArchive: (messageId: string) => void
  onSnooze: (messageId: string) => void
  searchQuery: string
  activeFilters: string[]
}

export default function UnifiedInbox({
  messages,
  loading,
  error,
  selectedMessageId,
  onMessageSelect,
  onArchive,
  onSnooze,
  searchQuery,
  activeFilters
}: UnifiedInboxProps) {

  // Loading skeleton component
  const MessageSkeleton = () => (
    <div className="bg-white/95 backdrop-blur-luxury rounded-xl p-6 shadow-luxury border border-gold/20 animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-200 rounded-full w-12"></div>
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-7 bg-gray-200 rounded w-16"></div>
              <div className="h-7 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Error state component
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-navy-900 mb-2">
        Failed to Load Messages
      </h3>
      <p className="text-navy-600 mb-4 max-w-md">
        {error || 'An unexpected error occurred while fetching your messages.'}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center space-x-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Retry</span>
      </button>
    </div>
  )

  // Empty state component
  const EmptyState = () => {
    const hasActiveFilters = activeFilters.length > 0 && !activeFilters.includes('all')
    const hasSearchQuery = searchQuery.trim().length > 0

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mb-4">
          {hasActiveFilters || hasSearchQuery ? (
            <Filter className="w-8 h-8 text-gold-600" />
          ) : (
            <Mail className="w-8 h-8 text-gold-600" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-navy-900 mb-2">
          {hasActiveFilters || hasSearchQuery 
            ? 'No Messages Match Your Criteria'
            : 'No Messages Yet'
          }
        </h3>
        
        <p className="text-navy-600 mb-4 max-w-md">
          {hasActiveFilters || hasSearchQuery
            ? 'Try adjusting your filters or search terms to find more messages.'
            : 'Your unified inbox will show messages from Gmail, Slack, and Teams once connected.'
          }
        </p>

        {(hasActiveFilters || hasSearchQuery) && (
          <button
            onClick={() => {
              // This would be handled by parent component
              console.log('Clear filters/search')
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-gold text-navy-900 rounded-lg hover:shadow-gold transition-all"
          >
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="space-y-4 max-w-4xl mx-auto">
          {Array.from({ length: 5 }).map((_, index) => (
            <MessageSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <ErrorState />
        </div>
      </div>
    )
  }

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <EmptyState />
        </div>
      </div>
    )
  }

  // Messages list
  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Results summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-navy-600">
              {searchQuery ? (
                <>
                  <span className="font-medium">{messages.length}</span> results for "{searchQuery}"
                </>
              ) : (
                <>
                  <span className="font-medium">{messages.length}</span> messages
                  {activeFilters.length > 0 && !activeFilters.includes('all') && (
                    <span className="ml-2">
                      · Filtered by: {activeFilters.join(', ')}
                    </span>
                  )}
                </>
              )}
            </div>
            
            {/* Sort options - future enhancement */}
            <div className="text-xs text-navy-500">
              Sorted by priority & date
            </div>
          </div>
        </div>

        {/* Messages grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="space-y-4"
          >
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.3,
                    delay: Math.min(index * 0.05, 0.5) // Stagger with max delay
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  y: -20,
                  transition: { duration: 0.2 }
                }}
              >
                <MessageCard
                  message={message}
                  isSelected={message.id === selectedMessageId}
                  onSelect={onMessageSelect}
                  onArchive={onArchive}
                  onSnooze={onSnooze}
                  onReply={(messageId) => {
                    console.log('Reply to message:', messageId)
                    // This would open AI reply modal
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Load more button - for pagination */}
        {messages.length > 0 && messages.length % 20 === 0 && (
          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-white/80 text-navy-700 rounded-xl border border-gold/20 hover:bg-white hover:border-gold/40 transition-all">
              Load More Messages
            </button>
          </div>
        )}

        {/* Performance indicator for large lists */}
        {messages.length > 50 && (
          <div className="mt-4 text-center text-xs text-navy-500">
            Showing {messages.length} messages · Optimized for performance
          </div>
        )}
      </div>
    </div>
  )
}