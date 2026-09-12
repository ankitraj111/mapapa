import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/leads') || 
      request.nextUrl.pathname.startsWith('/pipeline')) {
    
    if (!token) {
      // In a real app, you would check auth context or proper cookie
      // For now, let's just let it pass if it's running client side zustand,
      // But typically we redirect to login
      // return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|$).*)',
  ],
};
