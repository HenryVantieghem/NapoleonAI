'use client'

import { useAccessibility, AccessibilityAnnouncer } from '@/hooks/useAccessibility'
import { cn } from '@/lib/utils'
import { 
  Eye, 
  Type, 
  Hand, 
  Volume2, 
  RotateCcw,
  Check,
  Info
} from 'lucide-react'

export default function AccessibilitySettings() {
  const {
    settings,
    mounted,
    toggleHighContrast,
    toggleReducedMotion,
    updateSetting,
    resetToDefaults,
    announce
  } = useAccessibility()

  if (!mounted) {
    return <LoadingSkeleton />
  }

  const handleSettingChange = (setting: string, value: any, description: string) => {
    announce(`${description} ${value ? 'enabled' : 'disabled'}`)
  }

  return (
    <div className="p-4 space-y-6">
      <AccessibilityAnnouncer />
      
      {/* Skip link for keyboard navigation */}
      <a 
        href="#main-content" 
        className="skip-link"
        onClick={() => announce('Skipped to main content')}
      >
        Skip to main content
      </a>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-navy-900 mb-2">
          Accessibility Settings
        </h2>
        <p className="text-sm text-navy-600">
          Customize your experience for better accessibility and comfort
        </p>
      </div>

      {/* Visual Settings */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <Eye className="w-5 h-5 text-navy-600" />
          <h3 className="font-medium text-navy-900">Visual</h3>
        </div>
        
        <div className="space-y-4">
          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label 
                htmlFor="high-contrast"
                className="block text-sm font-medium text-navy-900 mb-1"
              >
                High Contrast Mode
              </label>
              <p className="text-xs text-navy-600">
                Increases contrast for better visibility
              </p>
            </div>
            <button
              id="high-contrast"
              type="button"
              role="switch"
              aria-checked={settings.highContrast}
              aria-describedby="high-contrast-desc"
              className={cn(
                "mobile-touch-target relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                settings.highContrast ? "bg-blue-600" : "bg-gray-300"
              )}
              onClick={() => {
                toggleHighContrast()
                handleSettingChange('high-contrast', !settings.highContrast, 'High contrast mode')
              }}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                  settings.highContrast ? "translate-x-6" : "translate-x-1"
                )}
              />
              <span className="sr-only">Toggle high contrast mode</span>
            </button>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-2">
              Font Size
            </label>
            <div className="flex space-x-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  className={cn(
                    "mobile-touch-target flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    settings.fontSize === size
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-navy-700 hover:bg-gray-200"
                  )}
                  onClick={() => {
                    updateSetting('fontSize', size)
                    announce(`Font size changed to ${size}`)
                  }}
                  aria-pressed={settings.fontSize === size}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Motion Settings */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <RotateCcw className="w-5 h-5 text-navy-600" />
          <h3 className="font-medium text-navy-900">Motion</h3>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label 
              htmlFor="reduced-motion"
              className="block text-sm font-medium text-navy-900 mb-1"
            >
              Reduce Motion
            </label>
            <p className="text-xs text-navy-600">
              Minimizes animations and transitions
            </p>
          </div>
          <button
            id="reduced-motion"
            type="button"
            role="switch"
            aria-checked={settings.reducedMotion}
            className={cn(
              "mobile-touch-target relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              settings.reducedMotion ? "bg-blue-600" : "bg-gray-300"
            )}
            onClick={() => {
              toggleReducedMotion()
              handleSettingChange('reduced-motion', !settings.reducedMotion, 'Reduced motion')
            }}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                settings.reducedMotion ? "translate-x-6" : "translate-x-1"
              )}
            />
            <span className="sr-only">Toggle reduced motion</span>
          </button>
        </div>
      </div>

      {/* Touch Settings */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <Hand className="w-5 h-5 text-navy-600" />
          <h3 className="font-medium text-navy-900">Touch</h3>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-900 mb-2">
            Touch Target Size
          </label>
          <div className="flex space-x-2">
            {(['standard', 'large'] as const).map((size) => (
              <button
                key={size}
                type="button"
                className={cn(
                  "mobile-touch-target flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                  settings.touchTargetSize === size
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-navy-700 hover:bg-gray-200"
                )}
                onClick={() => {
                  updateSetting('touchTargetSize', size)
                  announce(`Touch target size changed to ${size}`)
                }}
                aria-pressed={settings.touchTargetSize === size}
              >
                {size === 'standard' ? 'Standard (44px)' : 'Large (56px)'}
              </button>
            ))}
          </div>
          <p className="text-xs text-navy-600 mt-2">
            Larger touch targets are easier to tap accurately
          </p>
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Accessibility Features
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• All controls meet WCAG touch target requirements</li>
              <li>• Screen reader support with live announcements</li>
              <li>• Keyboard navigation with arrow keys</li>
              <li>• Swipe gestures with audio feedback</li>
              <li>• High contrast mode for better visibility</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          type="button"
          className={cn(
            "mobile-touch-target w-full px-4 py-3 text-sm font-medium rounded-lg",
            "bg-gray-100 text-navy-700 hover:bg-gray-200",
            "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
            "transition-colors"
          )}
          onClick={() => {
            resetToDefaults()
            announce('Accessibility settings reset to defaults')
          }}
        >
          <RotateCcw className="w-4 h-4 inline mr-2" />
          Reset to Defaults
        </button>
      </div>

      {/* Current Settings Summary (for screen readers) */}
      <div className="sr-only" aria-live="polite">
        Current accessibility settings: 
        High contrast {settings.highContrast ? 'enabled' : 'disabled'}, 
        Font size {settings.fontSize}, 
        Reduced motion {settings.reducedMotion ? 'enabled' : 'disabled'}, 
        Touch targets {settings.touchTargetSize}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gold/20 rounded w-48 mb-2" />
        <div className="h-4 bg-gold/20 rounded w-64" />
      </div>
      
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-5 h-5 bg-gold/20 rounded" />
            <div className="h-4 bg-gold/20 rounded w-16" />
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gold/20 rounded w-full" />
            <div className="h-4 bg-gold/20 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}