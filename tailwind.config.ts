import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Executive Navy & Gold Color Palette
        white: "#FFFFFF",
        black: "#0A0A0A",
        cream: "#F8F6F0",
        navy: {
          DEFAULT: "#1B2951",
          50: "#F0F2F9",
          100: "#D9E0F0",
          200: "#B4C5E0",
          300: "#8FA9D0",
          400: "#6A8EC0",
          500: "#4573B0",
          600: "#355A8A",
          700: "#254164",
          800: "#1B2951",
          900: "#141B3C",
        },
        gold: {
          DEFAULT: "#D4AF37",
          50: "#FEFBF0",
          100: "#FDF4D4",
          200: "#FBE9A9",
          300: "#F9DE7E",
          400: "#F7D353",
          500: "#D4AF37",
          600: "#B8962F",
          700: "#9C7D27",
          800: "#80641F",
          900: "#644B17",
        },
        charcoal: "#2C3E50",
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)"], // Executive headers
        sans: ["var(--font-sans)"],   // Professional body text
        mono: ["var(--font-mono)"],   // Code/data displays
        script: ["var(--font-script)"], // Logo only
      },
      fontSize: {
        'hero': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h1': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h2': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'h3': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'h4': ['1.5rem', { lineHeight: '1.4' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
      },
      animation: {
        "fade-in": "fade-in 0.8s ease-in-out forwards",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "slide-in-left": "slide-in-left 0.8s ease-out forwards",
        "slide-in-right": "slide-in-right 0.8s ease-out forwards",
        "scale-in": "scale-in 0.6s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow": {
          "0%": { boxShadow: "0 0 5px rgba(212, 175, 55, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.8)" },
        },
      },
      boxShadow: {
        'luxury': '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
        'luxury-lg': '0 35px 60px -12px rgba(0, 0, 0, 0.15)',
        'luxury-glass': '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'executive': '0 12px 40px rgba(27, 41, 81, 0.2), 0 4px 16px rgba(212, 175, 55, 0.1)',
        'navy': '0 10px 40px rgba(27, 41, 81, 0.3)',
        'navy-lg': '0 20px 60px rgba(27, 41, 81, 0.4)',
        'gold': '0 10px 40px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 20px 60px rgba(212, 175, 55, 0.4)',
        'gold-glow': '0 0 30px rgba(212, 175, 55, 0.4), 0 0 60px rgba(212, 175, 55, 0.2)',
      },
      backdropBlur: {
        'luxury': '16px',
        'executive': '24px',
        'glass': '12px',
      },
      backgroundImage: {
        'gradient-luxury': 'linear-gradient(135deg, #F8F6F0 0%, #FFFFFF 100%)',
        'gradient-navy': 'linear-gradient(135deg, #1B2951 0%, #254164 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #B8962F 100%)',
        'gradient-executive': 'linear-gradient(135deg, #1B2951 0%, #D4AF37 100%)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
} satisfies Config

export default config