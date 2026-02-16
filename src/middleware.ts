import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes('-auth-token') || cookie.name.startsWith('sb-'));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (!hasSupabaseAuthCookie(request)) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('auth', 'required');
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/api/admin')) {
    const configuredApiKey = process.env.ADMIN_API_KEY;
    if (configuredApiKey) {
      const requestApiKey = request.headers.get('x-admin-api-key');
      if (requestApiKey !== configuredApiKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
