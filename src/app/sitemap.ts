import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://napoleonai.com'
  
  // Static pages
  const staticPages = [
    '',
    '/features',
    '/pricing',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/auth/login',
    '/auth/signup',
  ]

  const staticRoutes = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Feature pages for SEO
  const featurePages = [
    '/features/ai-prioritization',
    '/features/unified-inbox',
    '/features/executive-insights',
    '/features/vip-management',
    '/features/action-extraction',
    '/features/smart-replies',
  ]

  const featureRoutes = featurePages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Use case pages for executive personas
  const useCasePages = [
    '/use-cases/ceo-communication',
    '/use-cases/cto-collaboration',
    '/use-cases/cfo-reporting',
    '/use-cases/executive-team',
  ]

  const useCaseRoutes = useCasePages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Blog/resources (if applicable)
  const resourcePages = [
    '/resources/executive-productivity-guide',
    '/resources/ai-communication-best-practices',
    '/resources/time-management-for-executives',
  ]

  const resourceRoutes = resourcePages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [
    ...staticRoutes,
    ...featureRoutes,
    ...useCaseRoutes,
    ...resourceRoutes,
  ]
}