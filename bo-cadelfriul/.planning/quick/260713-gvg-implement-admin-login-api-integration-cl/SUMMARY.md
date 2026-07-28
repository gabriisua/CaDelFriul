# Admin Login API Integration & SSR Cleanup

**Quick Task**: 260713-gvg
**Date**: 2026-07-13

## What was done

### SSR Removal
- Deleted `src/server.ts`, `src/main.server.ts`, `src/app/app.config.server.ts`
- Removed `@angular/platform-server`, `@angular/ssr`, `express`, `@types/express` from `package.json`
- Removed `server`, `outputMode`, `ssr` fields from `angular.json` build config; switched to `outputMode: "static"`

### AuthService (new)
- Created `core/services/auth.service.ts` with `login()`, `logout()`, `getToken()`, `isAuthenticated()`
- Login calls `POST /api/auth/admin/login` with `{ email, password }`, stores token in localStorage

### Auth Interceptor & Guard (rewritten)
- `core/interceptors/auth.interceptor.ts` — injects `AuthService`, reads token via `getToken()`, clones request with Bearer header
- `core/guards/auth.guard.ts` — injects `AuthService`, checks `isAuthenticated()`, redirects to `/login` if not

### Login Component (rewritten)
- `features/auth/auth.component.ts` — Reactive Forms (`FormBuilder`, `FormGroup`, `Validators`)
- Validation errors shown for required fields
- API error handling: 401 → "Invalid email or password", other → generic error
- Loading state disables button and shows "Logging in..."

### AdminLayoutComponent (updated)
- Logout now uses `AuthService.logout()` instead of direct localStorage + Router

## Build status
Production build passes. Output: `dist/bo-cadelfriul/` (client-side SPA, 259.72 kB initial).
