import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken  = request.cookies.get('staff_access_token')?.value;
  const refreshToken = request.cookies.get('staff_refresh_token')?.value;
  const authPending  = request.cookies.get('staff_auth_pending')?.value === 'true';
  const isLoggedIn   = !!(accessToken || refreshToken || authPending);

  // Root → redirect based on auth state
  if (pathname === '/') {
    return isLoggedIn
      ? NextResponse.redirect(new URL('/dashboard', request.url))
      : NextResponse.redirect(new URL('/login', request.url));
  }

  // Already logged in → away from login
  if (pathname.startsWith('/login') && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Not logged in → to login (covers /dashboard and all sub-routes)
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/dashboard/website')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

const ROUTE_PERMISSIONS = [
  { path: '/dashboard/clients', permission: 'client.view' },
  { path: '/dashboard/staff', permission: 'staff.view' },
  { path: '/dashboard/roles', permission: 'roles.view' },
  { path: '/dashboard/modules', permission: 'modules.view' },
  { path: '/dashboard/communication', permission: 'communication.view' },
  { path: '/dashboard/reports', permission: 'reports.view' },
  { path: '/dashboard/transactions', permission: 'transactions.view' },
  { path: '/dashboard/payment-management', permission: 'payment.view' },
  { path: '/dashboard/help', permission: 'help.view' },
  { path: '/dashboard/events/create', permission: 'event.create' },
  { path: '/dashboard/events', permission: 'event.view' },
  { path: '/dashboard/settings/config', permission: 'settings.edit' },
  { path: '/dashboard/settings/currency', permission: 'settings.edit' },
  { path: '/dashboard/settings/timezone', permission: 'settings.edit' },
  { path: '/dashboard/settings', permission: 'settings.view' },
];

  // Logged in → away from login (already logged in trying to hit dashboard sub-routes)
  if (pathname.startsWith('/dashboard') && isLoggedIn) {
    const rawPerms = request.cookies.get('staff_permissions')?.value;

    if (rawPerms) {
      const perms = rawPerms.split(',');
      
      // Match the most specific (longest) path first
      const matchedRoute = ROUTE_PERMISSIONS.slice()
        .sort((a, b) => b.path.length - a.path.length)
        .find(route => pathname.startsWith(route.path));

      if (matchedRoute && !perms.includes(matchedRoute.permission)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
