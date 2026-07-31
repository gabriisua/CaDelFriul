# Quick Task 260713-f5s: Scaffold Angular Admin Backoffice architecture

## Status
complete

## Summary
Successfully scaffolded the Angular Admin Backoffice architecture with Core/Features/Shared pattern:

### Folder Structure
- `core/` - Singleton services, HTTP interceptors, guards
- `features/` - Domain-specific standalone components (6 features)
- `layout/` - Structural components (Admin Layout with Sidebar)
- `shared/` - Reusable UI components (empty for now)

### Core Implementation
- `api.service.ts` - Base HTTP service configured for `/api/admin`
- `auth.interceptor.ts` - Automatically attaches Bearer token to outgoing requests
- `auth.guard.ts` - Protects admin routes, redirects to `/login` if unauthenticated

### Layout & Routing
- `admin-layout.component.ts` - Full admin layout with sidebar navigation
- `app.routes.ts` - Complete routing with auth guard protection
- Lazy-loaded routes for all features

### Boilerplate Components
- `auth.component.ts` - Login page with form
- `dashboard.component.ts` - Dashboard with stat cards
- `products.component.ts` - Products management
- `orders.component.ts` - Orders management
- `customers.component.ts` - Customers management
- `staff.component.ts` - Staff management

### SSR Compatibility
- All browser APIs wrapped with `isPlatformBrowser()` checks
- Build passes successfully with SSR enabled

## Files Created/Modified
- `src/app/core/services/api.service.ts`
- `src/app/core/interceptors/auth.interceptor.ts`
- `src/app/core/guards/auth.guard.ts`
- `src/app/layout/admin-layout.component.ts`
- `src/app/features/auth/auth.component.ts`
- `src/app/features/dashboard/dashboard.component.ts`
- `src/app/features/products/products.component.ts`
- `src/app/features/orders/orders.component.ts`
- `src/app/features/customers/customers.component.ts`
- `src/app/features/staff/staff.component.ts`
- `src/app/app.routes.ts`
- `src/app/app.config.ts`
- `src/app/app.ts`
- `src/app/app.config.server.ts`
