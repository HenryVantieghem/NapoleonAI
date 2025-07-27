import { Crown } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Napoleon AI - Executive Communication Commander | Transform Chaos into Clarity",
  description: "The luxury AI platform for C-suite executives. Unite Gmail, Slack & Teams. Save 8+ hours weekly. Intelligent prioritization, VIP management & strategic insights.",
  keywords: [
    "executive communication platform",
    "C-suite productivity software", 
    "AI email management",
    "unified inbox for executives",
    "Napoleon AI",
    "luxury business software",
    "CEO communication tools",
    "executive assistant AI",
    "Slack Gmail Teams integration",
    "VIP email management"
  ],
  openGraph: {
    title: "Napoleon AI - Your Executive Communication Commander",
    description: "Transform communication chaos into strategic clarity. Save 8+ hours weekly with AI-powered prioritization.",
    images: [
      {
        url: "/og-hero-image.jpg",
        width: 1200,
        height: 630,
        alt: "Napoleon AI Executive Dashboard"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Napoleon AI - Executive Communication Commander",
    description: "Transform communication chaos into strategic clarity. The luxury AI platform for C-suite executives.",
  },
  alternates: {
    canonical: "https://napoleonai.com",
  },
}

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Napoleon AI",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "500",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "500",
        "priceCurrency": "USD",
        "unitText": "MONTH"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "127",
      "bestRating": "5"
    },
    "featureList": [
      "AI-Powered Email Prioritization",
      "Unified Inbox (Gmail, Slack, Teams)",
      "VIP Contact Management", 
      "Action Item Extraction",
      "Smart Reply Suggestions",
      "Executive Time Analytics"
    ],
    "screenshot": [
      {
        "@type": "ImageObject",
        "url": "https://napoleonai.com/screenshots/dashboard.png",
        "caption": "Napoleon AI Executive Dashboard"
      }
    ]
  }

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Napoleon AI",
    "url": "https://napoleonai.com",
    "logo": "https://napoleonai.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-NAPOLEON",
      "contactType": "customer service",
      "availableLanguage": ["English"]
    },
    "sameAs": [
      "https://twitter.com/napoleonai",
      "https://linkedin.com/company/napoleon-ai",
      "https://github.com/napoleon-ai"
    ]
  }

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://napoleonai.com"
    }]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      
      {/* Simplified landing page for deployment testing */}
      <main className="min-h-screen bg-gradient-to-br from-cream to-white flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <Crown className="w-24 h-24 text-burgundy-600 mx-auto mb-6" />
            <h1 className="text-6xl font-serif font-bold text-gray-900 mb-4">
              Napoleon AI
            </h1>
            <p className="text-2xl text-gray-600 mb-8">
              Executive Communication Commander
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
              Transform communication chaos into strategic clarity. The luxury AI platform designed exclusively for C-suite executives.
            </p>
            <div className="space-y-4">
              <a 
                href="/auth/signup" 
                className="inline-block bg-gradient-to-r from-burgundy-600 to-burgundy-700 text-white px-8 py-4 rounded-lg text-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Take Command Now
              </a>
              <div className="text-sm text-gray-400">
                Trusted by Fortune 500 executives worldwide
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}