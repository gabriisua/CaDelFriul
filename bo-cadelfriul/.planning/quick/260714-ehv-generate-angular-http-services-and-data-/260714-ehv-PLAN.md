# Quick Task 260714-ehv: Generate Angular HTTP Services and Data Models

**Created:** 2026-07-14
**Status:** Complete

## Objective

Create Angular HTTP services and TypeScript interfaces for all Admin functionalities: Products, Categories, Staff, Customers, Orders.

## Files Created

### Models (`src/app/core/models/`)

1. **product.model.ts** - `Product` and `Category` interfaces
2. **staff.model.ts** - `Staff`, `StaffRole` enum, and `StaffLog` interfaces
3. **customer.model.ts** - `Customer` and `CustomerLog` interfaces

### Services (`src/app/core/services/`)

1. **product.service.ts** - Product and Category CRUD (uses ApiService + HttpClient for public endpoints)
2. **staff.service.ts** - Staff CRUD + logs (uses ApiService)
3. **customer.service.ts** - Customer CRUD + logs (uses HttpClient directly since endpoints are `/api/customers` not `/api/admin/customers`)
4. **order.service.ts** - Orders list + status update (uses ApiService)

## API Endpoint Mapping

| Service | Method | Endpoint | HttpClient or ApiService |
|---------|--------|----------|--------------------------|
| ProductService | GET | `/api/products` | HttpClient |
| ProductService | GET | `/api/products/categories` | HttpClient |
| ProductService | POST | `/api/admin/products` | ApiService |
| ProductService | PUT | `/api/admin/products/{id}` | ApiService |
| ProductService | DELETE | `/api/admin/products/{id}` | ApiService |
| ProductService | POST | `/api/admin/products/{id}/images` | ApiService |
| ProductService | POST | `/api/admin/products/categories` | ApiService |
| ProductService | PUT | `/api/admin/products/categories/{id}` | ApiService |
| ProductService | DELETE | `/api/admin/products/categories/{id}` | ApiService |
| StaffService | GET | `/api/admin/staff` | ApiService |
| StaffService | GET | `/api/admin/staff/{id}` | ApiService |
| StaffService | POST | `/api/admin/staff` | ApiService |
| StaffService | PUT | `/api/admin/staff/{id}` | ApiService |
| StaffService | DELETE | `/api/admin/staff/{id}` | ApiService |
| StaffService | GET | `/api/admin/staff/{id}/logs` | ApiService |
| CustomerService | GET | `/api/customers` | HttpClient |
| CustomerService | GET | `/api/customers/{id}` | HttpClient |
| CustomerService | PUT | `/api/customers/{id}` | HttpClient |
| CustomerService | DELETE | `/api/customers/{id}` | HttpClient |
| CustomerService | GET | `/api/customers/{id}/logs` | HttpClient |
| OrderService | GET | `/api/admin/orders` | ApiService |
| OrderService | PUT | `/api/admin/orders/{id}/status` | ApiService |

## Design Decisions

- **Services use `ApiService`** for admin endpoints (`/api/admin/*`) following the established pattern
- **ProductService and CustomerService** inject `HttpClient` directly for non-admin endpoints (`/api/products/*` and `/api/customers/*`)
- All services use `inject()` function for DI (Angular modern pattern)
- All services use `@Injectable({ providedIn: 'root' })` singleton pattern
- Models use TypeScript `interface` and `enum` exports (matching existing `order.model.ts` style)
- `uploadImage()` accepts `FormData` parameter for multipart file upload
- `updateOrderStatus()` accepts a status string payload

## Verification

- [x] Angular build succeeds with no TypeScript errors
- [x] All 4 services created
- [x] All 3 model files created (product, staff, customer)
- [x] Order service updated with status endpoint
- [x] All endpoints mapped to exact backend API paths
