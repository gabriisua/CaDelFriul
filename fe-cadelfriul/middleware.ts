import { NextResponse } from 'next/server';
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Cerca il cookie con il token JWT
    const token = request.cookies.get('accessToken')?.value;
    const { pathname } = request.nextUrl;

    // 1. Utente NON loggato prova ad accedere alla dashboard -> Reindirizza al Login
    if (!token && pathname.startsWith('/dashboard')) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // 2. Utente GIÀ loggato prova ad accedere a login/register -> Reindirizza alla Dashboard
    if (token && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    // Lascia passare tutte le altre richieste (es. la vetrina pubblica)
    return NextResponse.next();
}

// Definisci su quali percorsi deve intervenire questo middleware
export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
};