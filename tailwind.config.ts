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
        // Private Jet Executive Color Palette
        white: "#FFFFFF",
        black: "#000000",
        
        // Primary Private Jet Colors
        jetBlack: {
          DEFAULT: "#0B0D11",
          50: "#F5F5F6",
          100: "#E8E9EA",
          200: "#D1D3D6",
          300: "#B9BDC1",
          400: "#A2A7AD",
          500: "#8B9198",
          600: "#747B84",
          700: "#5D656F",
          800: "#464F5B",
          900: "#2F3946",
          950: "#0B0D11",
        },
        
        midnightBlue: {
          DEFAULT: "#122039",
          50: "#F2F4F8",
          100: "#E6E9F1",
          200: "#CCD3E3",
          300: "#B3BDD5",
          400: "#99A7C7",
          500: "#8091B9",
          600: "#667BAB",
          700: "#4D659D",
          800: "#334F8F",
          900: "#1A3981",
          950: "#122039",
        },
        
        champagneGold: {
          DEFAULT: "#D4AF37",
          50: "#FEFBF0",
          100: "#FDF6E1",
          200: "#FBEDC3",
          300: "#F9E4A5",
          400: "#F7DB87",
          500: "#F5D269",
          600: "#F3C94B",
          700: "#E8BE35",
          800: "#D4AF37",
          900: "#B8962F",
          950: "#9C7D27",
        },
        
        platinumSilver: {
          DEFAULT: "#C7CAD1",
          50: "#FAFBFC",
          100: "#F5F6F8",
          200: "#EBEDF1",
          300: "#E1E4EA",
          400: "#D7DBE3",
          500: "#CDD2DC",
          600: "#C7CAD1",
          700: "#B8BCC4",
          800: "#A9AEB7",
          900: "#9AA0AA",
          950: "#8B929D",
        },
        
        cognacLeather: {
          DEFAULT: "#8C5A3C",
          50: "#F9F5F2",
          100: "#F3EBE5",
          200: "#E7D7CB",
          300: "#DBC3B1",
          400: "#CFAF97",
          500: "#C39B7D",
          600: "#B78763",
          700: "#AB7349",
          800: "#9F5F2F",
          900: "#8C5A3C",
          950: "#7A4E33",
        },
        
        warmIvory: {
          DEFAULT: "#F6F6F4",
          50: "#FEFEFE",
          100: "#FDFDFC",
          200: "#FBFBF9",
          300: "#F9F9F7",
          400: "#F7F7F5",
          500: "#F6F6F4",
          600: "#F4F4F2",
          700: "#F2F2F0",
          800: "#F0F0EE",
          900: "#EEEEEC",
          950: "#ECECEA",
        },
        
        // Legacy color mappings for compatibility (will be phased out)
        navy: {
          DEFAULT: "#122039", // Mapped to midnightBlue
          50: "#F2F4F8",
          100: "#E6E9F1",
          200: "#CCD3E3",
          300: "#B3BDD5",
          400: "#99A7C7",
          500: "#8091B9",
          600: "#667BAB",
          700: "#4D659D",
          800: "#334F8F",
          900: "#1A3981",
        },
        
        gold: {
          DEFAULT: "#D4AF37", // Mapped to champagneGold
          50: "#FEFBF0",
          100: "#FDF6E1",
          200: "#FBEDC3",
          300: "#F9E4A5",
          400: "#F7DB87",
          500: "#F5D269",
          600: "#F3C94B",
          700: "#E8BE35",
          800: "#D4AF37",
          900: "#B8962F",
        },
        
        // Semantic color mapping
        background: {
          primary: "#0B0D11",    // jetBlack
          secondary: "#122039",  // midnightBlue
          accent: "#C7CAD1",     // platinumSilver
          surface: "#F6F6F4",    // warmIvory
        },
        
        text: {
          primary: "#F6F6F4",    // warmIvory
          secondary: "#C7CAD1",  // platinumSilver
          accent: "#D4AF37",     // champagneGold
          muted: "#8B929D",      // platinumSilver.950
          inverse: "#0B0D11",    // jetBlack
        },
        
        interactive: {
          primary: "#D4AF37",    // champagneGold
          primaryHover: "#E8BE35", // champagneGold.700
          secondary: "#122039",  // midnightBlue
          secondaryHover: "#1A3981", // midnightBlue.900
          accent: "#8C5A3C",     // cognacLeather
          accentHover: "#9F5F2F", // cognacLeather.800
        },
        
        vip: {
          tag: "#8C5A3C",        // cognacLeather
          tagText: "#F6F6F4",    // warmIvory
          border: "#D4AF37",     // champagneGold
        },
        
        card: {
          background: "#122039", // midnightBlue
          border: "#C7CAD1",     // platinumSilver
          hover: "#1A3981",      // midnightBlue.900
        },
        
        navigation: {
          background: "#0B0D11", // jetBlack
          active: "#D4AF37",     // champagneGold
          inactive: "#C7CAD1",   // platinumSilver
          hover: "#8B929D",      // platinumSilver.950
        },
        
        // Status colors (maintained for functionality)
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
        'luxury': '0 25px 50px -12px rgba(11, 13, 17, 0.15)',
        'luxury-lg': '0 35px 60px -12px rgba(11, 13, 17, 0.2)',
        'luxury-glass': '0 8px 32px rgba(11, 13, 17, 0.12), inset 0 1px 0 rgba(246, 246, 244, 0.1)',
        'glassmorphism': '0 0 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(199, 202, 209, 0.1)',
        'private-jet-glass': '0 0 24px rgba(0, 0, 0, 0.5), 0 8px 32px rgba(11, 13, 17, 0.3)',
        'executive': '0 12px 40px rgba(18, 32, 57, 0.25), 0 4px 16px rgba(212, 175, 55, 0.15)',
        'jet-black': '0 10px 40px rgba(11, 13, 17, 0.3)',
        'jet-black-lg': '0 20px 60px rgba(11, 13, 17, 0.4)',
        'midnight': '0 10px 40px rgba(18, 32, 57, 0.3)',
        'midnight-lg': '0 20px 60px rgba(18, 32, 57, 0.4)',
        'champagne': '0 10px 40px rgba(212, 175, 55, 0.3)',
        'champagne-lg': '0 20px 60px rgba(212, 175, 55, 0.4)',
        'champagne-glow': '0 0 30px rgba(212, 175, 55, 0.4), 0 0 60px rgba(212, 175, 55, 0.2)',
        'cognac': '0 8px 32px rgba(140, 90, 60, 0.2)',
        'platinum': '0 4px 16px rgba(199, 202, 209, 0.1)',
        // Legacy mappings for compatibility
        'navy': '0 10px 40px rgba(18, 32, 57, 0.3)',
        'navy-lg': '0 20px 60px rgba(18, 32, 57, 0.4)',
        'gold': '0 10px 40px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 20px 60px rgba(212, 175, 55, 0.4)',
        'gold-glow': '0 0 30px rgba(212, 175, 55, 0.4), 0 0 60px rgba(212, 175, 55, 0.2)',
      },
      backdropBlur: {
        'luxury': '16px',
        'executive': '24px',
        'glass': '12px',
        'private-jet': '30px',
        'glassmorphism': '30px',
      },
      backgroundImage: {
        'gradient-luxury': 'linear-gradient(135deg, #F6F6F4 0%, #FDFDFC 100%)',
        'gradient-jet-black': 'linear-gradient(135deg, #0B0D11 0%, #2F3946 100%)',
        'gradient-midnight': 'linear-gradient(135deg, #122039 0%, #1A3981 100%)',
        'gradient-champagne': 'linear-gradient(135deg, #D4AF37 0%, #E8BE35 100%)',
        'gradient-platinum': 'linear-gradient(135deg, #C7CAD1 0%, #B8BCC4 100%)',
        'gradient-cognac': 'linear-gradient(135deg, #8C5A3C 0%, #9F5F2F 100%)',
        'gradient-ivory': 'linear-gradient(135deg, #F6F6F4 0%, #FDFDFC 100%)',
        'gradient-executive': 'linear-gradient(135deg, #0B0D11 0%, #122039 50%, #D4AF37 100%)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        // Legacy mappings for compatibility
        'gradient-navy': 'linear-gradient(135deg, #122039 0%, #1A3981 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #E8BE35 100%)',
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
} satisfies Config

export default config