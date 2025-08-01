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
    <div className="h-screen flex flex-col bg-gradient-to-br from-navy/5 via-white to-gold/5">
      {/* Executive glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-glass pointer-events-none" />
      
      {/* Dashboard Header */}
      <div className="relative z-10">
        <DashboardHeader 
          user={user}
          profile={profile}
          onViewChange={setActiveView}
          activeView={activeView}
        />
      </div>

      {/* Three-Panel Executive Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Navigation Panel - Left */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-80 backdrop-blur-executive bg-white/20 border-r border-white/30 shadow-luxury-glass flex flex-col"
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
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={`flex-1 backdrop-blur-executive bg-white/30 flex flex-col ${
            isContextPanelOpen ? 'border-r border-white/30' : ''
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

        {/* Executive Context Panel - Right */}
        <AnimatePresence mode="wait">
          {isContextPanelOpen && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-96 backdrop-blur-executive bg-white/20 border-l border-white/30 shadow-luxury-glass flex flex-col"
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