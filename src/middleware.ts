import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclude auth routes, static files, public API
  if (
    pathname.startsWith('/api/admin/auth') || 
    pathname.startsWith('/api/student/auth') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Handle Admin routes protection
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // If it's the login page itself
    if (pathname === '/admin/login') {
      const token = request.cookies.get('admin_token')?.value;
      if (token) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }
    
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    if (pathname === '/admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // Handle Student routes protection
  if (pathname.startsWith('/student') || pathname.startsWith('/api/student')) {
    // If it's the login page itself
    if (pathname === '/student/login') {
      const token = request.cookies.get('student_token')?.value;
      if (token) {
        return NextResponse.redirect(new URL('/student/dashboard', request.url));
      }
      return NextResponse.next();
    }
    
    const token = request.cookies.get('student_token')?.value;
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/student/login', request.url));
    }

    if (pathname === '/student') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/student', '/student/:path*', '/api/admin/:path*', '/api/student/:path*'],
};
