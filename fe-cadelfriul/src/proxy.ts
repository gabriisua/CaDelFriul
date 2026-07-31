import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const TOKEN_COOKIE = "accessToken";

const protectedPaths = ["/dashboard"];
const authPaths = ["/login", "/register"];

export function proxy(request: NextRequest) {
  // Step 1: Let next-intl negotiate the locale (prefix > cookie > accept-language
  // > default). A status >= 300 means a locale negotiation redirect (e.g. /
  // -> /en) — return it immediately; auth checks run on the follow-up request.
  const intlResponse = intlMiddleware(request);
  if (intlResponse.status >= 300) {
    return intlResponse;
  }

  // Step 2: Strip the locale prefix so auth checks run on the canonical path.
  // /en/dashboard, /it/dashboard and /de/dashboard are all protected identically.
  const { pathname } = request.nextUrl;
  const locales = routing.locales as readonly string[];
  const firstSegment = pathname.split("/")[1];

  let path: string;
  let locale: string;
  if (firstSegment && locales.includes(firstSegment)) {
    path = "/" + pathname.split("/").slice(2).join("/");
    locale = firstSegment;
  } else {
    path = pathname;
    locale = routing.defaultLocale;
  }

  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  const isProtected = protectedPaths.some(
    (p) => path === p || path.startsWith(p + "/")
  );
  const isAuth = authPaths.some(
    (p) => path === p || path.startsWith(p + "/")
  );

  if (isProtected && !token) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuth && token) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Pass through the intl response to preserve the x-next-intl-locale header
  return intlResponse;
}

export const config = {
  // Match all pathnames except for
  // - ... if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - ... the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
