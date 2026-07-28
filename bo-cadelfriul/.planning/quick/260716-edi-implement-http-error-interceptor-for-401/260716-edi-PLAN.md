# Quick Task 260716-edi: Implement HTTP error interceptor

## Goal
Add a global HTTP error interceptor that catches 401/403 responses and redirects unauthenticated users to the login page.

## Context
The auth service, guard, and route protection already exist. Missing: an HTTP interceptor that catches error responses.

## Tasks

### Task 1: Create error interceptor
- **File:** `src/app/core/interceptors/error.interceptor.ts`
- **Action:** Create functional `HttpInterceptorFn` using `catchError`
- **Logic:** On 401/403 when not authenticated → call `authService.logout()`, navigate to `/login`
- **Verify:** Build passes with `npx ng build`

### Task 2: Register error interceptor
- **File:** `src/app/app.config.ts`
- **Action:** Import `errorInterceptor`, add to `withInterceptors([authInterceptor, errorInterceptor])`
- **Verify:** Build passes, interceptor chain is active
