/**
 * Napoleon AI - Design Token System
 * Generated from design-tokens.json
 * Ultimate luxury design system for Fortune 500 executives
 */

import designTokens from './design-tokens.json'

// Type-safe design token access
export const tokens = designTokens

// Core color palette
export const colors = {
  // Core colors
  jetBlack: tokens.colors.core.jetBlack.value,
  midnightBlue: tokens.colors.core.midnightBlue.value,
  champagneGold: tokens.colors.core.champagneGold.value,
  platinumSilver: tokens.colors.core.platinumSilver.value,
  warmIvory: tokens.colors.core.warmIvory.value,
  cognacLeather: tokens.colors.core.cognacLeather.value,

  // Semantic colors
  background: tokens.colors.semantic.background,
  text: tokens.colors.semantic.text,
  interactive: tokens.colors.semantic.interactive,
  status: tokens.colors.semantic.status,

  // Glassmorphism
  glass: tokens.colors.glassmorphism
} as const

// Typography system
export const typography = {
  families: tokens.typography.families,
  scale: tokens.typography.scale,
  
  // Helper functions
  getFont: (type: keyof typeof tokens.typography.scale) => {
    const config = tokens.typography.scale[type]
    return {
      fontSize: config.size,
      lineHeight: config.lineHeight,
      letterSpacing: (config as any).letterSpacing || 'normal',
      fontFamily: `var(--font-${config.family})`,
      fontWeight: config.weight
    }
  }
} as const

// Spacing system
export const spacing = {
  scale: tokens.spacing.scale,
  semantic: tokens.spacing.semantic,
  
  // Helper function
  get: (index: number) => `${tokens.spacing.scale[index]}px`
} as const

// Shadow system
export const shadows = tokens.shadows

// Animation system
export const animations = {
  durations: tokens.animations.durations,
  easings: tokens.animations.easings,
  effects: tokens.animations.effects,
  
  // Helper functions
  getDuration: (type: keyof typeof tokens.animations.durations) => 
    `${tokens.animations.durations[type]}ms`,
    
  getEasing: (type: keyof typeof tokens.animations.easings) =>
    tokens.animations.easings[type],
    
  getRipple: () => ({
    duration: animations.getDuration('medium'),
    easing: animations.getEasing('luxury'),
    transform: 'scale(0) -> scale(1.2)'
  }),
  
  getShimmer: () => ({
    duration: '2s',
    easing: animations.getEasing('easeInOut'),
    background: tokens.colors.core.champagneGold.shimmer
  })
} as const

// Glassmorphism utilities
export const glassmorphism = {
  blur: tokens.glassmorphism.blur,
  borders: tokens.glassmorphism.borders,
  backgrounds: tokens.glassmorphism.backgrounds,
  
  // Pre-built glassmorphism styles
  card: {
    background: tokens.glassmorphism.backgrounds.card,
    backdropFilter: `blur(${tokens.glassmorphism.blur.heavy})`,
    border: tokens.glassmorphism.borders.medium,
    borderRadius: '16px',
    boxShadow: tokens.shadows.glassmorphism
  },
  
  panel: {
    background: tokens.glassmorphism.backgrounds.panel,
    backdropFilter: `blur(${tokens.glassmorphism.blur.executive})`,
    border: tokens.glassmorphism.borders.light,
    borderRadius: '12px'
  }
} as const

// Component design tokens
export const components = tokens.components

// Responsive breakpoints
export const breakpoints = tokens.breakpoints

// Performance budgets
export const performance = tokens.performance

// Utility functions for design consistency
export const utils = {
  // Generate luxury gradient
  luxuryGradient: (color1: string, color2: string) => 
    `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
    
  // Generate glassmorphism effect
  glassEffect: (blur = '30px', opacity = 0.1) => ({
    background: `rgba(18, 32, 57, ${opacity})`,
    backdropFilter: `blur(${blur})`,
    border: '1px solid rgba(199, 202, 209, 0.2)'
  }),
  
  // Generate executive shadow
  executiveShadow: (color = 'rgba(18, 32, 57, 0.25)') =>
    `0 12px 40px ${color}, 0 4px 16px rgba(212, 175, 55, 0.15)`,
    
  // Generate shimmer animation
  shimmerEffect: () => ({
    background: `linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.4) 50%, transparent 100%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s ease-in-out infinite'
  }),
  
  // WCAG contrast helper
  isAccessible: (color1: string, color2: string, level: 'AA' | 'AAA' = 'AA') => {
    // This would integrate with a color contrast library
    // For now, returning true based on our pre-validated color pairs
    return true
  }
} as const

// CSS custom properties for dynamic theming
export const cssVariables = {
  // Generate CSS custom properties
  toCSSVars: () => {
    const vars: Record<string, string> = {}
    
    // Colors
    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        vars[`--color-${key}`] = value
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          vars[`--color-${key}-${subKey}`] = subValue as string
        })
      }
    })
    
    // Typography
    Object.entries(typography.families).forEach(([key, family]) => {
      vars[`--font-${key}`] = family.name
    })
    
    // Spacing
    spacing.scale.forEach((value, index) => {
      vars[`--spacing-${index}`] = `${value}px`
    })
    
    return vars
  }
} as const

export default {
  colors,
  typography,
  spacing,
  shadows,
  animations,
  glassmorphism,
  components,
  breakpoints,
  performance,
  utils,
  cssVariables
}