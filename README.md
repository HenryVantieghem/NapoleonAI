# Napoleon AI - Executive Communication Commander

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.7-38bdf8?logo=tailwind-css)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11.3.19-ff0055?logo=framer)](https://framer.com/motion)
[![Supabase](https://img.shields.io/badge/Supabase-2.45.1-3ecf8e?logo=supabase)](https://supabase.com)

## 🎯 Overview

Napoleon AI is a luxury communication command center designed exclusively for C-suite executives. Transform communication chaos into strategic clarity with AI-powered prioritization, VIP relationship management, and unified platform integration.

### ✨ Key Features

- **AI Strategic Commander** - Advanced AI that understands C-suite priorities
- **Executive Unified Inbox** - Gmail, Slack, Teams in one luxury interface
- **VIP Relationship Management** - Never miss critical communications
- **Intelligent Action Items** - Automated task extraction and prioritization
- **Luxury User Experience** - Cartier-inspired design system
- **Enterprise Security** - Row-level security and encryption

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom luxury theme
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL + Auth + Real-time)
- **AI**: OpenAI GPT-4 via Vercel AI SDK
- **Deployment**: Vercel + GitHub Actions

### Design System - Cartier Theme
```css
/* Luxury Color Palette */
--white: #FFFFFF
--black: #000000
--cream: #F8F6F0
--burgundy: #801B2B
--gray-50: #F9FAFB
--gray-900: #111827

/* Typography */
--font-serif: 'Playfair Display', serif    /* Headers */
--font-sans: 'Inter', sans-serif            /* Body */
--font-script: 'Dancing Script', cursive    /* Logo */
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17.0 or later
- npm 9.0.0 or later
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/napoleon-ai.git
cd napoleon-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env.local
```

4. **Configure environment variables**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
```

5. **Set up database**
```bash
# Execute the migration in Supabase SQL Editor
# File: supabase/migrations/20240101000000_initial_schema.sql

# Optional: Load seed data for development
# File: supabase/seed.sql
```

6. **Run development server**
```bash
npm run dev
```

7. **Open in browser**
Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
napoleon-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css        # Global styles with luxury theme
│   │   ├── layout.tsx         # Root layout with SEO
│   │   ├── page.tsx           # Landing page
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components
│   │   │   └── button.tsx     # Luxury button variants
│   │   ├── landing/           # Landing page sections
│   │   │   ├── hero-section.tsx
│   │   │   ├── value-proposition.tsx
│   │   │   ├── social-proof.tsx
│   │   │   └── cta-section.tsx
│   │   └── shared/            # Shared components
│   │       └── navbar.tsx     # Luxury navigation
│   ├── lib/                   # Utilities and services
│   │   ├── supabase/          # Database clients
│   │   │   ├── client.ts      # Browser client
│   │   │   ├── server.ts      # Server client
│   │   │   └── config.ts      # Configuration
│   │   ├── auth/              # Authentication
│   │   │   └── oauth.ts       # OAuth providers
│   │   └── utils.ts           # Utility functions
│   ├── types/                 # TypeScript definitions
│   │   └── database.ts        # Database types
│   └── middleware.ts          # Route protection
├── supabase/                  # Database schema
│   ├── migrations/            # SQL migrations
│   └── seed.sql              # Development data
├── public/                    # Static assets
├── docs/                      # Documentation
└── config files...
```

## 🎨 Design System

### Component Examples

```tsx
// Luxury Button
<Button variant="luxury" size="xl" className="group">
  <Crown className="w-5 h-5 mr-3 group-hover:animate-pulse" />
  Take Command Now
</Button>

// Executive Badge  
<div className="executive-badge">
  <Crown className="w-4 h-4 mr-2" />
  <span>Exclusive for C-Suite</span>
</div>

// Luxury Card
<div className="card-luxury hover-lift hover-glow">
  <h3 className="text-h3">Strategic Intelligence</h3>
</div>
```

### Animation System
```tsx
// Luxury animations with Framer Motion
const luxuryAnimations = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  }
}
```

## 📱 Responsive Design

The application is fully responsive with mobile-first design:

- **Mobile (320px+)**: Single column, touch-optimized
- **Tablet (768px+)**: Two-column layouts, enhanced interactions
- **Desktop (1024px+)**: Multi-column grids, hover effects
- **Executive (1440px+)**: Maximum luxury experience

### Mobile Optimizations
- Touch-friendly button sizes (min 44px)
- Optimized font scaling
- Simplified navigation
- Executive-focused content prioritization

## 🔒 Security

### Row Level Security (RLS)
- All tables protected with RLS policies
- Users can only access their own data
- Service role for admin operations

### Authentication
- OAuth with Google, Microsoft, Slack
- Secure token storage and rotation
- State parameter validation
- CSRF protection

### Data Protection
- Access tokens encrypted at rest
- HTTPS enforcement
- Secure environment variables
- Rate limiting on API endpoints

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
```bash
npm install -g vercel
vercel login
vercel
```

2. **Configure environment variables**
Add all environment variables in Vercel dashboard

3. **Set up custom domain** (optional)
Configure DNS settings in Vercel

4. **Enable analytics**
Add Vercel Analytics to track performance

### Manual Deployment

1. **Build application**
```bash
npm run build
```

2. **Start production server**
```bash
npm start
```

## 📊 Performance Targets

- **Page Load Time**: < 2 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1
- **Mobile Performance**: 90+ Lighthouse score

### Optimization Features
- Image optimization with Next.js
- Font optimization with Google Fonts
- Code splitting and lazy loading
- Efficient bundle size management

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Quality
- TypeScript for type safety
- ESLint for code consistency
- Prettier for code formatting
- Husky for git hooks

## 📈 Analytics & Monitoring

### Executive Metrics Tracking
- Time saved per executive
- Communication priority accuracy
- VIP response rates
- Platform usage analytics

### Performance Monitoring
- Core Web Vitals tracking
- User session analytics
- Error rate monitoring
- API response times

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/executive-dashboard`)
3. **Commit changes** (`git commit -m 'Add executive dashboard'`)
4. **Push to branch** (`git push origin feature/executive-dashboard`)
5. **Open Pull Request**

### Code Standards
- Follow existing TypeScript patterns
- Maintain luxury design consistency
- Write comprehensive tests
- Update documentation

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For C-suite executive support:
- **Email**: executives@napoleonai.com
- **Phone**: +1 (555) NAPOLEON
- **Priority Support**: Available 24/7 for enterprise clients

---

**Built for executives, by executives. Transform your communication strategy with Napoleon AI.**

*"Communication intelligence worthy of the C-suite"*