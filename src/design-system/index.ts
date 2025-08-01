/**
 * Napoleon AI - Design System Index
 * Executive Intelligence Platform Design Tokens
 */

import * as colorSystem from './colors';
export { 
  jetBlack,
  midnightBlue,
  champagneGold,
  platinumSilver,
  cognacLeather,
  warmIvory,
  contrastPairs
} from './colors';

const colors = colorSystem.colors;

// Typography tokens
export const typography = {
  fontFamily: {
    serif: ['var(--font-serif)', 'Playfair Display', 'serif'],
    sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
    mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
    script: ['var(--font-script)', 'cursive'],
  },
  
  fontSize: {
    hero: ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
    display: ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
    h1: ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
    h2: ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
    h3: ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
    h4: ['1.5rem', { lineHeight: '1.4' }],
    bodyLg: ['1.125rem', { lineHeight: '1.6' }],
    body: ['1rem', { lineHeight: '1.6' }],
    bodySm: ['0.875rem', { lineHeight: '1.5' }],
  },
} as const;

// Spacing tokens
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  '5xl': '8rem',    // 128px
} as const;

// Shadow tokens for private jet aesthetic
export const shadows = {
  luxury: '0 25px 50px -12px rgba(11, 13, 17, 0.15)',
  luxuryLg: '0 35px 60px -12px rgba(11, 13, 17, 0.2)',
  luxuryGlass: '0 8px 32px rgba(11, 13, 17, 0.12), inset 0 1px 0 rgba(246, 246, 244, 0.1)',
  executive: '0 12px 40px rgba(18, 32, 57, 0.25), 0 4px 16px rgba(212, 175, 55, 0.15)',
  jetBlack: '0 10px 40px rgba(11, 13, 17, 0.3)',
  jetBlackLg: '0 20px 60px rgba(11, 13, 17, 0.4)',
  champagne: '0 10px 40px rgba(212, 175, 55, 0.3)',
  champagneLg: '0 20px 60px rgba(212, 175, 55, 0.4)',
  champagneGlow: '0 0 30px rgba(212, 175, 55, 0.4), 0 0 60px rgba(212, 175, 55, 0.2)',
  cognac: '0 8px 32px rgba(140, 90, 60, 0.2)',
  platinum: '0 4px 16px rgba(199, 202, 209, 0.1)',
} as const;

// Animation tokens
export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '800ms',
  },
  
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    luxury: 'cubic-bezier(0.4, 0, 0.2, 1)',
    executive: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
} as const;

// Backdrop blur tokens
export const backdropBlur = {
  luxury: '16px',
  executive: '24px',
  glass: '12px',
  subtle: '8px',
} as const;

// Background gradient tokens
export const gradients = {
  jetBlack: 'linear-gradient(135deg, #0B0D11 0%, #2F3946 100%)',
  midnight: 'linear-gradient(135deg, #122039 0%, #1A3981 100%)',
  champagne: 'linear-gradient(135deg, #D4AF37 0%, #E8BE35 100%)',
  platinum: 'linear-gradient(135deg, #C7CAD1 0%, #B8BCC4 100%)',
  cognac: 'linear-gradient(135deg, #8C5A3C 0%, #9F5F2F 100%)',
  ivory: 'linear-gradient(135deg, #F6F6F4 0%, #FDFDFC 100%)',
  executive: 'linear-gradient(135deg, #0B0D11 0%, #122039 50%, #D4AF37 100%)',
  luxuryRadial: 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
} as const;

// Border radius tokens
export const borderRadius = {
  none: '0',
  xs: '0.125rem',   // 2px
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
  luxury: '0.75rem',    // Executive standard
  executive: '1rem',    // Premium components
} as const;

// Export complete design system
export const designSystem = {
  colors,
  typography,
  spacing,
  shadows,
  animations,
  backdropBlur,
  gradients,
  borderRadius,
} as const;

export default designSystem;