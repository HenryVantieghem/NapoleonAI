import type { Metadata } from "next"
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google"
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css"
import { cn } from "@/lib/utils"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://napoleon-ai.com'),
  title: {
    default: "Napoleon AI - Executive Intelligence. Amplified.",
    template: "%s | Napoleon AI"
  },
  description: "Save 2+ hours daily on email and messages. The luxury AI platform that unifies Gmail, Slack & Teams for C-suite executives. Transform communication chaos into strategic clarity.",
  keywords: [
    "executive communication platform",
    "AI email management",
    "unified inbox for executives",
    "Napoleon AI",
    "CEO communication tools",
    "C-suite productivity",
    "executive assistant AI",
    "enterprise communication platform",
    "Gmail Slack Teams integration",
    "board communication management",
    "investor relations platform",
    "luxury productivity software"
  ],
  authors: [{ name: "Napoleon AI" }],
  creator: "Napoleon AI",
  publisher: "Napoleon AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://napoleon-ai.com",
    title: "Napoleon AI - Executive Intelligence. Amplified.",
    description: "Save 2+ hours daily. The luxury AI platform for C-suite executives.",
    siteName: "Napoleon AI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Napoleon AI - Executive Command Center",
      },
      {
        url: "/og-image-square.jpg",
        width: 600,
        height: 600,
        alt: "Napoleon AI Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Napoleon AI - Executive Intelligence. Amplified.",
    description: "Save 2+ hours daily. The luxury AI platform for C-suite executives.",
    images: ["/twitter-image.jpg"],
    creator: "@napoleonai",
    site: "@napoleonai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://napoleon-ai.com",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#1B2951",
      },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Napoleon AI",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  other: {
    "msapplication-TileColor": "#1B2951",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  // Handle missing Clerk key gracefully during build
  if (!clerkPublishableKey || clerkPublishableKey.includes('placeholder')) {
    return (
      <html lang="en" className="scroll-smooth">
        <head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="theme-color" content="#1B2951" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Napoleon AI" />
        </head>
        <body 
          className={cn(
            "min-h-screen bg-white font-sans antialiased",
            inter.variable,
            playfairDisplay.variable,
            jetBrainsMono.variable
          )}
        >
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>

          {/* Structured Data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Napoleon AI",
                "description": "Executive communication commander that transforms chaos into strategic clarity",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "500",
                  "priceCurrency": "USD",
                  "priceSpecification": {
                    "@type": "RecurringCharge",
                    "frequency": "Monthly"
                  }
                },
                "creator": {
                  "@type": "Organization",
                  "name": "Napoleon AI",
                  "url": "https://napoleonai.com"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "reviewCount": "500"
                }
              })
            }}
          />
        </body>
      </html>
    )
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#D4AF37',
          colorText: '#1B2951',
          colorTextSecondary: '#6B7280',
          colorBackground: '#FFFFFF',
          colorInputBackground: '#F9FAFB',
          colorInputText: '#1B2951',
          fontFamily: 'Inter, sans-serif',
          borderRadius: '0.75rem'
        },
        elements: {
          formButtonPrimary: 
            'bg-gradient-gold hover:shadow-gold-lg text-navy-900 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105',
          card: 'shadow-luxury border border-gold-200/20 bg-white/95 backdrop-blur-luxury rounded-2xl',
          headerTitle: 'font-serif text-3xl font-bold text-navy-900',
          headerSubtitle: 'text-navy-600',
          socialButtonsBlockButton: 
            'border-2 border-gold-200/30 hover:border-gold-400 hover:bg-gold-50 transition-all duration-300',
          formFieldInput: 
            'border-gold-200/30 focus:border-gold-400 focus:ring-gold-200 transition-all duration-200 focus:bg-gold-50/20',
          footerActionLink: 'text-gold-600 hover:text-gold-700 font-semibold'
        }
      }}
    >
      <html lang="en" className="scroll-smooth">
        <head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="theme-color" content="#1B2951" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Napoleon AI" />
        </head>
        <body 
          className={cn(
            "min-h-screen bg-white font-sans antialiased",
            inter.variable,
            playfairDisplay.variable,
            jetBrainsMono.variable
          )}
        >
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>

          {/* Structured Data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Napoleon AI",
                "description": "Executive communication commander that transforms chaos into strategic clarity",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "500",
                  "priceCurrency": "USD",
                  "priceSpecification": {
                    "@type": "RecurringCharge",
                    "frequency": "Monthly"
                  }
                },
                "creator": {
                  "@type": "Organization",
                  "name": "Napoleon AI",
                  "url": "https://napoleonai.com"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "reviewCount": "500"
                }
              })
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}