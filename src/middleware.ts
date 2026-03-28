import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Bỏ qua các đường dẫn không cần middleware
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/admin/login';
  const authCookie = request.cookies.get('admin_session')?.value;

  // Nếu truy cập vào /admin nhưng chưa đăng nhập -> Chuyển về /admin/login
  if (isAdminRoute && !isLoginRoute && authCookie !== 'authenticated') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Nếu đã đăng nhập mà lại vào /admin/login -> Chuyển về Dashboard
  if (isLoginRoute && authCookie === 'authenticated') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Yêu cầu root /admin chuyển hướng về /admin/dashboard
  if (request.nextUrl.pathname === '/admin' && authCookie === 'authenticated') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
