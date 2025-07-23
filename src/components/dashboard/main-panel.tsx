"use client"

import { motion, AnimatePresence } from "framer-motion"
import { StrategicDigest } from "./strategic-digest"
import { MessagesList } from "./messages-list"
import { ActionItems } from "./action-items"
import { Maximize2, PanelRightOpen } from "lucide-react"

interface MainPanelProps {
  activeView: 'digest' | 'messages' | 'actions'
  selectedMessage: any
  onMessageSelect: (message: any) => void
  onToggleContext: () => void
  isContextPanelOpen: boolean
}

export function MainPanel({
  activeView,
  selectedMessage,
  onMessageSelect,
  onToggleContext,
  isContextPanelOpen
}: MainPanelProps) {
  const renderActiveView = () => {
    switch (activeView) {
      case 'digest':
        return (
          <StrategicDigest 
            onMessageSelect={onMessageSelect}
            selectedMessage={selectedMessage}
          />
        )
      case 'messages':
        return (
          <MessagesList 
            onMessageSelect={onMessageSelect}
            selectedMessage={selectedMessage}
          />
        )
      case 'actions':
        return (
          <ActionItems 
            onMessageSelect={onMessageSelect}
            selectedMessage={selectedMessage}
          />
        )
      default:
        return <StrategicDigest onMessageSelect={onMessageSelect} selectedMessage={selectedMessage} />
    }
  }

  const getViewTitle = () => {
    switch (activeView) {
      case 'digest': return 'Strategic Daily Digest'
      case 'messages': return 'All Messages'
      case 'actions': return 'Action Items'
      default: return 'Dashboard'
    }
  }

  const getViewDescription = () => {
    switch (activeView) {
      case 'digest': return 'AI-powered priority insights for executive decision making'
      case 'messages': return 'Unified view of all communication channels'
      case 'actions': return 'Outstanding action items requiring your attention'
      default: return ''
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main Panel Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between p-6 border-b border-gray-100 bg-white"
      >
        <div>
          <h2 className="text-xl font-serif font-semibold text-gray-900">
            {getViewTitle()}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {getViewDescription()}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleContext}
            className={`
              p-2 rounded-lg transition-colors flex items-center space-x-2
              ${isContextPanelOpen
                ? 'bg-burgundy-50 text-burgundy-700 hover:bg-burgundy-100'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {isContextPanelOpen ? (
              <>
                <PanelRightOpen className="w-4 h-4" />
                <span className="text-xs">Hide Context</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span className="text-xs">Show Context</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}