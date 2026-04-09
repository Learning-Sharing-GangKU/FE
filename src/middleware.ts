import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = [
  /^\/gathering\/create$/,
  /^\/gathering\/[^/]+\/edit$/,
  /^\/manage$/,
  /^\/profile\/[^/]+/,
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some((pattern) => pattern.test(pathname));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('unauthorized', '1');
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/gathering/:path*', '/manage', '/profile/:path*'],
};
