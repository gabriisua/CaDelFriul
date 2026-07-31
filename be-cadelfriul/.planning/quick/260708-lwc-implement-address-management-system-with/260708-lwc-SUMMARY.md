---
status: complete
---

## Completed

1. Created `AddressRepository.java` in the repository package with `findByCustomerId`, `findByIdAndCustomerId`, `countByCustomerId` methods
2. Created `AddressService.java` with all required business logic:
   - `addAddress()` — finds customer, maps request, auto-sets defaults for first address
   - `getAddressesByCustomerId()` — returns all addresses for a customer
   - `updateAddress()` — updates address fields (non-null only)
   - `deleteAddress()` — prevents deleting last address, reassigns defaults
   - `setDefaultShipping()` / `setDefaultBilling()` — toggles default flags atomically
3. Created `AddressController.java` at `/api/customers/{customerId}/addresses` with full REST API: POST, GET, PUT, DELETE, PATCH for default-shipping/default-billing
4. Applied `@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'SUPER_ADMIN')")` at class level — SecurityConfig already public for Swagger and `/api/auth/**`
5. Build verified — `./gradlew build` passes
