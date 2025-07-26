import { Metadata } from 'next'

interface PageMetadataProps {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  noIndex?: boolean
  canonicalUrl?: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://napoleonai.com'

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Napoleon AI - Executive Communication Commander',
    template: '%s | Napoleon AI'
  },
  description: 'Transform communication chaos into strategic clarity. The luxury AI platform designed exclusively for C-suite executives. Unite Gmail, Slack, and Teams with intelligent prioritization.',
  keywords: [
    'executive communication',
    'C-suite productivity', 
    'AI communication tool',
    'luxury business software',
    'executive assistant AI',
    'communication intelligence',
    'unified inbox',
    'email prioritization',
    'slack integration',
    'teams integration',
    'VIP management',
    'executive dashboard',
    'Napoleon AI',
    'strategic communication',
    'Fortune 500 tools',
    'CEO productivity',
    'executive efficiency'
  ],
  authors: [{ name: 'Napoleon AI Team' }],
  creator: 'Napoleon AI',
  publisher: 'Napoleon AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
      { url: '/apple-icon-180x180.png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    title: 'Napoleon AI - Executive Communication Commander',
    description: 'Transform communication chaos into strategic clarity with AI-powered executive intelligence.',
    siteName: 'Napoleon AI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Napoleon AI - Executive Communication Commander',
      },
      {
        url: '/og-image-square.jpg',
        width: 1200,
        height: 1200,
        alt: 'Napoleon AI Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Napoleon AI - Executive Communication Commander',
    description: 'Transform communication chaos into strategic clarity with AI-powered executive intelligence.',
    site: '@napoleonai',
    creator: '@napoleonai',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
  },
  category: 'Business Software',
}

export function generatePageMetadata({
  title,
  description,
  keywords = [],
  ogImage,
  noIndex = false,
  canonicalUrl,
}: PageMetadataProps): Metadata {
  const metadata: Metadata = {
    title,
    description,
    keywords: [...(defaultMetadata.keywords as string[]), ...keywords],
    robots: noIndex 
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }

  if (ogImage) {
    metadata.openGraph = {
      ...defaultMetadata.openGraph,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    }
    metadata.twitter = {
      ...defaultMetadata.twitter,
      images: [ogImage],
    }
  }

  if (canonicalUrl) {
    metadata.alternates = {
      canonical: canonicalUrl,
    }
  }

  return metadata
}

// Page-specific metadata generators
export const pageMetadata = {
  dashboard: generatePageMetadata({
    title: 'Executive Dashboard',
    description: 'Your AI-powered command center for strategic communication management.',
    keywords: ['dashboard', 'command center', 'executive tools'],
    noIndex: true, // Dashboard is private
  }),

  features: generatePageMetadata({
    title: 'Features',
    description: 'Discover the AI-powered features that transform executive communication into strategic advantage.',
    keywords: ['features', 'AI capabilities', 'executive tools'],
  }),

  pricing: generatePageMetadata({
    title: 'Executive Pricing',
    description: 'Luxury pricing for Fortune 500 executives. Transform your communication with Napoleon AI.',
    keywords: ['pricing', 'executive plans', 'luxury software pricing'],
  }),

  login: generatePageMetadata({
    title: 'Executive Login',
    description: 'Access your Napoleon AI command center.',
    noIndex: true,
  }),

  onboarding: generatePageMetadata({
    title: 'Executive Onboarding',
    description: 'Set up your Napoleon AI command center in minutes.',
    noIndex: true,
  }),
}