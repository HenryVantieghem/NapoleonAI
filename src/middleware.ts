import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/privacy',
  '/terms',
  '/contact',
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password',
  '/api/webhooks/(.*)'
])

const isAuthRoute = createRouteMatcher([
  '/auth/(.*)'
])

const isExecutiveRoute = createRouteMatcher([
  '/dashboard/(.*)',
  '/onboarding/(.*)',
  '/api/auth/(.*)',
  '/api/messages/(.*)',
  '/api/integrations/(.*)'
])

// Executive role validation
function validateExecutiveRole(role: string): boolean {
  const executiveRoles = [
    'CEO', 'COO', 'CFO', 'CTO', 'CMO', 'CHRO',
    'President', 'VP', 'Vice President', 'Director', 
    'Executive Director', 'Managing Director',
    'Founder', 'Co-Founder', 'Partner', 'Executive'
  ]
  
  return executiveRoles.some(execRole => 
    role.toLowerCase().includes(execRole.toLowerCase())
  )
}

export default clerkMiddleware(async (auth, req) => {
  // Add comprehensive security headers for all responses
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // HSTS header for HTTPS (production only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  // CSP header for additional security
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.dev https://clerk.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://clerk.dev https://clerk.com https://*.supabase.co; " +
    "frame-src 'none';"
  )

  const { userId } = await auth()
  const pathname = req.nextUrl.pathname

  // Handle public routes
  if (isPublicRoute(req)) {
    // Redirect authenticated users away from auth pages
    if (userId && (pathname === '/' || isAuthRoute(req))) {
      const dashboard = new URL('/dashboard', req.url)
      return NextResponse.redirect(dashboard)
    }
    return response
  }

  // Require authentication for protected routes
  if (!userId) {
    // Store the intended destination
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Executive route validation
  if (isExecutiveRoute(req)) {
    try {
      const user = await currentUser()
      if (user) {
        const role = (user.publicMetadata?.role as string) || ''
        const isExecutive = validateExecutiveRole(role)
        
        // Check if user needs executive verification
        if (!isExecutive && pathname !== '/auth/executive-required') {
          const execRequiredUrl = new URL('/auth/executive-required', req.url)
          return NextResponse.redirect(execRequiredUrl)
        }
        
        // Check if user needs onboarding
        const onboardingCompleted = user.publicMetadata?.onboardingCompleted
        if (isExecutive && !onboardingCompleted && !pathname.startsWith('/onboarding') && pathname !== '/auth/executive-required') {
          const onboardingUrl = new URL('/onboarding', req.url)
          return NextResponse.redirect(onboardingUrl)
        }
      }
    } catch (error) {
      console.error('Executive validation error:', error)
      // Don't block access on validation errors, but log them
    }
  }

  // Handle API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('X-User-Id', userId)
    
    // Rate limiting headers (implement actual rate limiting with Redis in production)
    const rateLimits = {
      '/api/auth/': { limit: 50, window: 3600 },
      '/api/messages/': { limit: 200, window: 3600 },
      '/api/integrations/': { limit: 100, window: 3600 },
      'default': { limit: 500, window: 3600 }
    }
    
    const matchedPath = Object.keys(rateLimits).find(path => 
      path !== 'default' && pathname.startsWith(path)
    )
    const limits = rateLimits[matchedPath || 'default']
    
    response.headers.set('X-RateLimit-Limit', limits.limit.toString())
    response.headers.set('X-RateLimit-Remaining', (limits.limit - 1).toString())
    response.headers.set('X-RateLimit-Reset', Math.floor(Date.now() / 1000 + limits.window).toString())
    
    // Add API request timestamp
    response.headers.set('X-Request-Time', new Date().toISOString())
    
    return response
  }

  // Add user context headers for authenticated requests
  response.headers.set('X-User-Id', userId)
  response.headers.set('X-Request-Time', new Date().toISOString())

  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}