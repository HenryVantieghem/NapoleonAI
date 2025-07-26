import type { Metadata } from "next"
import { Inter, Playfair_Display, Dancing_Script } from "next/font/google"
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css"
import { cn } from "@/lib/utils"

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

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-script",
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Napoleon AI - Executive Communication Commander",
  description: "Transform communication chaos into strategic clarity. The luxury AI platform designed exclusively for C-suite executives. Unite Gmail, Slack, and Teams with intelligent prioritization.",
  keywords: [
    "executive communication",
    "C-suite productivity",
    "AI communication tool",
    "luxury business software",
    "executive assistant AI",
    "communication intelligence",
    "Napoleon AI",
    "strategic communication"
  ],
  authors: [{ name: "Napoleon AI Team" }],
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
    url: "https://napoleonai.com",
    title: "Napoleon AI - Executive Communication Commander",
    description: "Transform communication chaos into strategic clarity with AI-powered executive intelligence.",
    siteName: "Napoleon AI",
    images: [
      {
        url: "https://napoleonai.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Napoleon AI - Executive Communication Commander",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Napoleon AI - Executive Communication Commander",
    description: "Transform communication chaos into strategic clarity with AI-powered executive intelligence.",
    images: ["https://napoleonai.com/twitter-image.jpg"],
    creator: "@napoleonai",
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
  verification: {
    google: "google-site-verification-code-here",
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
          <meta name="theme-color" content="#801B2B" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Napoleon AI" />
        </head>
        <body 
          className={cn(
            "min-h-screen bg-white font-sans antialiased",
            inter.variable,
            playfairDisplay.variable,
            dancingScript.variable
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
          colorPrimary: '#801B2B',
          colorText: '#111827',
          colorTextSecondary: '#6B7280',
          colorBackground: '#FFFFFF',
          colorInputBackground: '#F9FAFB',
          colorInputText: '#111827',
          fontFamily: 'Inter, sans-serif',
          borderRadius: '0.5rem'
        },
        elements: {
          formButtonPrimary: 
            'bg-gradient-to-r from-burgundy-600 to-burgundy-700 hover:from-burgundy-700 hover:to-burgundy-800 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl',
          card: 'shadow-luxury border border-gray-100 bg-white/80 backdrop-blur-sm',
          headerTitle: 'font-serif text-2xl font-semibold text-gray-900',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 
            'border border-gray-200 hover:border-burgundy-200 hover:bg-burgundy-50 transition-colors duration-200',
          formFieldInput: 
            'border-gray-200 focus:border-burgundy-300 focus:ring-burgundy-200 transition-colors duration-200',
          footerActionLink: 'text-burgundy-600 hover:text-burgundy-700 font-medium'
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
          <meta name="theme-color" content="#801B2B" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Napoleon AI" />
        </head>
        <body 
          className={cn(
            "min-h-screen bg-white font-sans antialiased",
            inter.variable,
            playfairDisplay.variable,
            dancingScript.variable
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