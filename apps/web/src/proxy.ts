import { clerkMiddleware } from '@clerk/nextjs/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intl = createIntlMiddleware(routing)

// Clerk wraps next-intl so both see every page request. Nothing is protected yet:
// the site reads as a guest and only /api/keys/* will require a session (M3).
export default clerkMiddleware((_auth, request) => intl(request))

export const config = {
  matcher: [
    // Skip Next internals and static files, run on everything else including /api.
    '/((?!_next|_vercel|.*\\..*).*)',
    '/(api|trpc)(.*)',
  ],
}
