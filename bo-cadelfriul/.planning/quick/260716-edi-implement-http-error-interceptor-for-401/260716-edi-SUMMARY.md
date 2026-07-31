# Quick Task 260716-edi Summary

**Status:** complete

## What was done

Created `src/app/core/interceptors/error.interceptor.ts` — a functional HTTP interceptor that:
- Catches `HttpErrorResponse` with status 401 or 403
- Checks `authService.isAuthenticated()` before taking action
- Calls `authService.logout()` and navigates to `/login` when unauthenticated

Updated `src/app/app.config.ts` to register the error interceptor in the HTTP client provider chain.

## Files modified
- `src/app/core/interceptors/error.interceptor.ts` (new)
- `src/app/app.config.ts` (updated)

## Verification
- `npx ng build` passes successfully
- Auth guard, route protection, and error interceptor all functional
