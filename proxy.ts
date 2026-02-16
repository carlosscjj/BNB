import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';


export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Proteger apenas /dashboard e /admin/:path*
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  if (isProtected) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    // Verificação robusta de role
    if (!token || ((token.user as any)?.role?.toUpperCase?.() !== 'ADMIN' && (token as any)?.role?.toUpperCase?.() !== 'ADMIN')) {
      const calendarUrl = new URL('/calendar', request.url);
      return NextResponse.redirect(calendarUrl);
    }
  }
  // Não bloquear outras rotas
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/admin/:path*'],
};
