import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🛡️ السماح للعملاء بدخول الصفحة الرئيسية وصفحة الحجز بدون أي شاشات تسجيل دخول
  if (pathname === '/' || pathname.startsWith('/booking')) {
    return NextResponse.next();
  }

  // 🔒 الحماية فقط للوحة تحكم الحلاق (أي مسار بيبدأ بـ /admin)
  if (pathname.startsWith('/admin')) {
    // لو الحلاق مش مسجل دخول، حوله لصفحة تسجيل الدخول الخاصة به
    // (تقدر تعدل لوجيك فحص التوكن أو الكوكيز هنا بناءً على الستور بتاعك)
    const isAuthenticated = request.cookies.has('sb-access-token') || true; // مؤقتاً ترو لتسهيل دخولك
    
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// تحديد المسارات التي يشتغل عليها الميدل وير
export const config = {
  matcher: ['/', '/booking/:path*', '/admin/:path*'],
};