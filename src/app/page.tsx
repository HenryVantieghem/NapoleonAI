import { Navbar } from "@/components/shared/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { ValueProposition } from "@/components/landing/value-proposition"
import { SocialProof } from "@/components/landing/social-proof"
import { CTASection } from "@/components/landing/cta-section"
import { Metadata } from "next"

// Disable static generation to avoid event handler issues
export const dynamic = 'force-dynamic'

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
      
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ValueProposition />
        <SocialProof />
        <CTASection />
      </main>
    </>
  )
}