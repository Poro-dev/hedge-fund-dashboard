import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const isProduction = process.env.NODE_ENV === 'production';

export async function middleware(req: NextRequest) {
  if (!isProduction) return NextResponse.next();

  const token = req.cookies.get('poro_hub_token')?.value;
  const hubSecret = process.env.HUB_SESSION_SECRET;

  if (!token || !hubSecret) {
    return NextResponse.redirect(new URL('https://poro.uk'));
  }

  try {
    const secret = new TextEncoder().encode(hubSecret);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('https://poro.uk'));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
