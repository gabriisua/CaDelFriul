---
status: complete
---

## Completed

1. Added `POST /api/auth/customer/register` in `AuthenticationController.java` — delegates to `CustomerService.create()`, returns `201 Created` with `CustomerResponse`
2. Removed `POST /api/customers` from `CustomerController.java` and added `@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'RECEPTIONIST')")` at class level
3. Updated `SecurityConfig.java` with `@EnableMethodSecurity`, made `/api/auth/**` public, and required authentication for all other requests
4. Build verified — `./gradlew build` passes
