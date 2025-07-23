import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/privacy',
  '/terms',
  '/contact',
  '/auth/login',
  '/auth/signup',
  '/api/webhooks/(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  // Add security headers for all responses
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Handle protected routes
  if (!isPublicRoute(req) && !(await auth()).userId) {
    return (await auth()).redirectToSignIn()
  }

  // Redirect logged in users to dashboard if they visit public routes
  if ((await auth()).userId && req.nextUrl.pathname === '/') {
    const dashboard = new URL('/dashboard', req.url)
    return NextResponse.redirect(dashboard)
  }

  // Handle API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const authResult = await auth()
    if (authResult.userId) {
      response.headers.set('X-User-Id', authResult.userId)
      // User email is not directly available in auth(), would need currentUser() for that
    }
    
    // Rate limiting headers (implement actual rate limiting with Redis in production)
    response.headers.set('X-RateLimit-Limit', '100')
    response.headers.set('X-RateLimit-Remaining', '99')
    response.headers.set('X-RateLimit-Reset', Math.floor(Date.now() / 1000 + 3600).toString())
    
    return response
  }

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