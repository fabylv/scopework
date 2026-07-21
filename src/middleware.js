import { proxy } from '@/proxy';

export async function middleware(request) {
  return proxy(request);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/project/:path*',
    '/account/:path*',
    '/contractors/:path*',
  ],
};
