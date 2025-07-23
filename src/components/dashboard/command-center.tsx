"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NavigationPanel } from "./navigation-panel"
import { MainPanel } from "./main-panel"
import { ContextPanel } from "./context-panel"
import { DashboardHeader } from "./dashboard-header"
import { useAuth } from "@/lib/hooks/use-auth"

export function CommandCenter() {
  const { user, profile } = useAuth()
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [activeView, setActiveView] = useState<'digest' | 'messages' | 'actions'>('digest')
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(true)

  return (
    <div className="h-screen flex flex-col bg-gradient-subtle">
      {/* Dashboard Header */}
      <DashboardHeader 
        user={user}
        profile={profile}
        onViewChange={setActiveView}
        activeView={activeView}
      />

      {/* Three-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Panel - Left */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-80 bg-white border-r border-gray-200 shadow-sm flex flex-col"
        >
          <NavigationPanel 
            activeView={activeView}
            onViewChange={setActiveView}
            onMessageSelect={setSelectedMessage}
            selectedMessage={selectedMessage}
          />
        </motion.div>

        {/* Main Panel - Center */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`flex-1 bg-white flex flex-col ${
            isContextPanelOpen ? 'border-r border-gray-200' : ''
          }`}
        >
          <MainPanel 
            activeView={activeView}
            selectedMessage={selectedMessage}
            onMessageSelect={setSelectedMessage}
            onToggleContext={() => setIsContextPanelOpen(!isContextPanelOpen)}
            isContextPanelOpen={isContextPanelOpen}
          />
        </motion.div>

        {/* Context Panel - Right */}
        <AnimatePresence mode="wait">
          {isContextPanelOpen && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-96 bg-gray-50 border-l border-gray-200 flex flex-col"
            >
              <ContextPanel 
                selectedMessage={selectedMessage}
                onClose={() => setIsContextPanelOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}