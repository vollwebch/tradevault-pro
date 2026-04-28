import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Create the response - let Next.js handle the request normally
  const response = NextResponse.next();

  // Override cache headers to prevent the proxy (Caddy) from caching stale HTML.
  // This is the root cause of ChunkLoadError: the proxy cached old HTML that
  // referenced JS chunks from a previous build.
  response.headers.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');

  return response;
}

// Run middleware on all routes except Next.js internal static assets.
// Static files under _next/static/ are content-hashed and safe to cache,
// so we exclude them from middleware to preserve their normal caching.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt).*)',
  ],
};
