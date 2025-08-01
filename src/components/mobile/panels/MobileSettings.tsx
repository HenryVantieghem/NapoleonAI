'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Bell, Shield, Palette, Smartphone, Globe, 
  Moon, Sun, Contrast, Volume2, VolumeX, Eye, EyeOff,
  ChevronRight, Switch, Settings, Save, RefreshCw,
  Hand, Accessibility
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingItem {
  id: string
  label: string
  description?: string
  type: 'toggle' | 'select' | 'action'
  value?: boolean | string
  options?: { label: string; value: string }[]
  icon: React.ComponentType<any>
  action?: () => void
}

interface SettingSection {
  title: string
  icon: React.ComponentType<any>
  items: SettingItem[]
}

export default function MobileSettings() {
  const [settings, setSettings] = useState<Record<string, boolean | string>>({
    notifications: true,
    vipAlerts: true,
    prioritySound: true,
    vibrations: true,
    highContrast: false,
    darkMode: false,
    fontSize: 'medium',
    gestureNavigation: true,
    offline: true,
    autoSync: true,
    secureMode: true,
    biometricAuth: false,
    reducedMotion: false,
    touchTargetSize: 'standard'
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (settings.darkMode === 'auto') {
        // Auto mode would update theme based on system preference
        document.documentElement.classList.toggle('dark', e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [settings.darkMode])

  const handleSettingChange = (id: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [id]: value }))
    setHasChanges(true)

    // Apply immediate effects for certain settings
    if (id === 'highContrast') {
      document.documentElement.classList.toggle('high-contrast', value as boolean)
    }
    if (id === 'darkMode') {
      if (value === true) {
        document.documentElement.classList.add('dark')
      } else if (value === false) {
        document.documentElement.classList.remove('dark')
      }
    }
    if (id === 'reducedMotion') {
      document.documentElement.classList.toggle('reduce-motion', value as boolean)
    }
    if (id === 'touchTargetSize') {
      document.documentElement.classList.toggle('large-touch-targets', value === 'large')
    }
    if (id === 'fontSize') {
      document.documentElement.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge')
      document.documentElement.classList.add(`font-${value}`)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setHasChanges(false)
    
    // Show success feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  }

  const settingSections: SettingSection[] = [
    {
      title: 'Accessibility',
      icon: Accessibility,
      items: [
        {
          id: 'highContrast',
          label: 'High Contrast Mode',
          description: 'Improves readability with enhanced contrast',
          type: 'toggle',
          value: settings.highContrast,
          icon: Contrast
        },
        {
          id: 'fontSize',
          label: 'Font Size',
          description: 'Adjust text size for comfortable reading',
          type: 'select',
          value: settings.fontSize,
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
            { label: 'Extra Large', value: 'xlarge' }
          ],
          icon: Eye
        },
        {
          id: 'reducedMotion',
          label: 'Reduce Motion',
          description: 'Minimizes animations and transitions',
          type: 'toggle',
          value: settings.reducedMotion,
          icon: RefreshCw
        },
        {
          id: 'touchTargetSize',
          label: 'Touch Target Size',
          description: 'Adjust button and link sizes for easier tapping',
          type: 'select',
          value: settings.touchTargetSize,
          options: [
            { label: 'Standard (44px)', value: 'standard' },
            { label: 'Large (56px)', value: 'large' }
          ],
          icon: Hand
        }
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        {
          id: 'darkMode',
          label: 'Dark Mode',
          description: 'Reduces eye strain in low light conditions',
          type: 'select',
          value: settings.darkMode,
          options: [
            { label: 'Light', value: 'false' },
            { label: 'Dark', value: 'true' },
            { label: 'Auto', value: 'auto' }
          ],
          icon: settings.darkMode ? Moon : Sun
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          id: 'notifications',
          label: 'Push Notifications',
          description: 'Receive alerts for new messages',
          type: 'toggle',
          value: settings.notifications,
          icon: Bell
        },
        {
          id: 'vipAlerts',
          label: 'VIP Priority Alerts',
          description: 'Special notifications for VIP contacts',
          type: 'toggle',
          value: settings.vipAlerts,
          icon: Bell
        },
        {
          id: 'prioritySound',
          label: 'Priority Sounds',
          description: 'Audio alerts for high-priority messages',
          type: 'toggle',
          value: settings.prioritySound,
          icon: settings.prioritySound ? Volume2 : VolumeX
        },
        {
          id: 'vibrations',
          label: 'Haptic Feedback',
          description: 'Vibration for gestures and notifications',
          type: 'toggle',
          value: settings.vibrations,
          icon: Smartphone
        }
      ]
    },
    {
      title: 'Navigation & Gestures',
      icon: Smartphone,
      items: [
        {
          id: 'gestureNavigation',
          label: 'Swipe Gestures',
          description: 'Enable swipe-to-archive and snooze',
          type: 'toggle',
          value: settings.gestureNavigation,
          icon: Smartphone
        }
      ]
    },
    {
      title: 'Data & Sync',
      icon: Globe,
      items: [
        {
          id: 'offline',
          label: 'Offline Mode',
          description: 'Cache messages for offline viewing',
          type: 'toggle',
          value: settings.offline,
          icon: Globe
        },
        {
          id: 'autoSync',
          label: 'Auto Sync',
          description: 'Automatically sync when connected',
          type: 'toggle',
          value: settings.autoSync,
          icon: RefreshCw
        }
      ]
    },
    {
      title: 'Security & Privacy',
      icon: Shield,
      items: [
        {
          id: 'secureMode',
          label: 'Secure Mode',
          description: 'Enhanced security for sensitive content',
          type: 'toggle',
          value: settings.secureMode,
          icon: Shield
        },
        {
          id: 'biometricAuth',
          label: 'Biometric Authentication',
          description: 'Use fingerprint or face ID to unlock',
          type: 'toggle',
          value: settings.biometricAuth,
          icon: User
        }
      ]
    }
  ]

  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    disabled = false 
  }: { 
    enabled: boolean
    onChange: (value: boolean) => void
    disabled?: boolean 
  }) => (
    <motion.button
      onClick={() => !disabled && onChange(!enabled)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2",
        enabled 
          ? "bg-gold" 
          : "bg-gray-300",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      disabled={disabled}
      aria-checked={enabled}
      role="switch"
    >
      <motion.span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
        animate={{ x: enabled ? 24 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  )

  const SelectInput = ({ 
    value, 
    options, 
    onChange 
  }: { 
    value: string
    options: { label: string; value: string }[]
    onChange: (value: string) => void 
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gold/30 rounded-lg bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold">
              <Settings className="w-5 h-5 text-navy-900" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold">Settings</h1>
              <p className="text-xs text-gold-200">Customize your experience</p>
            </div>
          </div>
          
          {hasChanges && (
            <motion.button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-3 py-2 bg-gold text-navy-900 rounded-lg font-medium shadow-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save className={cn("w-4 h-4", saving && "animate-pulse")} />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto pb-20">
        {settingSections.map((section, sectionIndex) => (
          <div key={section.title} className="mb-6">
            {/* Section Header */}
            <div className="bg-gold/10 border-b border-gold/20 px-4 py-3">
              <div className="flex items-center space-x-2">
                <section.icon className="w-5 h-5 text-navy-900" />
                <h2 className="text-sm font-semibold text-navy-900">{section.title}</h2>
              </div>
            </div>

            {/* Section Items */}
            <div className="bg-white">
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-4 min-h-[60px]",
                    itemIndex < section.items.length - 1 && "border-b border-gray-100"
                  )}
                  whileHover={{ backgroundColor: "rgba(212, 175, 55, 0.05)" }}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <item.icon className="w-5 h-5 text-navy-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-navy-900">
                        {item.label}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-navy-600 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-3">
                    {item.type === 'toggle' && (
                      <ToggleSwitch
                        enabled={settings[item.id] as boolean}
                        onChange={(value) => handleSettingChange(item.id, value)}
                      />
                    )}
                    
                    {item.type === 'select' && item.options && (
                      <SelectInput
                        value={settings[item.id] as string}
                        options={item.options}
                        onChange={(value) => handleSettingChange(item.id, value)}
                      />
                    )}
                    
                    {item.type === 'action' && (
                      <button
                        onClick={item.action}
                        className="p-2 text-navy-600 hover:text-navy-900 transition-colors"
                        aria-label={item.label}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div className="bg-gray-50 mx-4 rounded-xl p-4 text-center">
          <h3 className="text-sm font-semibold text-navy-900 mb-2">Napoleon AI</h3>
          <p className="text-xs text-navy-600 mb-1">Executive Intelligence Platform</p>
          <p className="text-xs text-navy-500">Version 1.0.0</p>
        </div>
      </div>
    </div>
  )
}