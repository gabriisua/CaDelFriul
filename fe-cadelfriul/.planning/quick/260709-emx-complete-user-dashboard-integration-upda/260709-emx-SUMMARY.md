---
phase: 260709-emx
plan: 01
subsystem: Dashboard
tags: [api, sidebar, addresses, crud, shadcn]
dependency-graph:
  requires: [260709-dy1]  # API client foundation
  provides: [Address CRUD patterns for future dashboard pages]
  affects: [SidebarNav, Addresses page]
tech-stack:
  added: [shadcn Dialog (@base-ui/react/dialog)]
  patterns:
    - "Profile-first fetching pattern: fetchProfile() → user.id → address CRUD with customerId"
    - "window.confirm for delete confirmation (per spec)"
key-files:
  created:
    - src/components/ui/dialog.tsx
  modified:
    - src/lib/api.ts (UserResponse.id, Address/AddressRequest types, 5 CRUD functions)
    - src/app/dashboard/_components/SidebarNav.tsx (dynamic user data)
    - src/app/dashboard/addresses/page.tsx (full CRUD rewrite)
decisions:
  - "User spec overrides plan: Address uses street/houseNumber/city/zipCode/province/country/additionalInfo, not label/firstName/lastName/phone/postcode"
  - "API functions take customerId as first param, endpoints use /api/customers/{customerId}/addresses"
  - "Delete uses window.confirm instead of AlertDialog (per user constraint)"
  - "Fetch profile first to get customerId (user.id), then fetch addresses"
metrics:
  duration: "~15 minutes"
  completed_date: 2026-07-09
  commits: 3
  files_changed: 4
  tsc_errors: 0
---

# Phase 260709-emx Plan 01: Complete User Dashboard Integration Summary

**One-liner:** Wired SidebarNav to show real user data with initials, added Address CRUD types and functions to the API client with customerId-path endpoints, and rebuilt the Addresses page as a full CRUD client component against the real API.

## Objective

Extend the API client with Address types and CRUD functions, connect the sidebar to live user data, and implement a fully functional Addresses management page that eliminates all hardcoded mock data from the dashboard experience.

## Completed Tasks

### Task 1: Extend API client with UserResponse.id + Address CRUD
- **Files:** `src/lib/api.ts`
- Added `id: string` as first field to `UserResponse`
- Added `Address` interface: `id`, `street`, `houseNumber`, `city`, `zipCode`, `province`, `country`, `additionalInfo?`, `isDefaultShipping`, `isDefaultBilling`
- Added `AddressRequest` interface (request body without id/default flags)
- Added 5 functions: `fetchAddresses(customerId)`, `addAddress(customerId, address)`, `updateAddress(customerId, addressId, address)`, `deleteAddress(customerId, addressId)`, `setDefaultShipping(customerId, addressId)`
- All functions use `apiFetch<T>()` with Bearer token auth
- All endpoints use `/api/customers/{customerId}/addresses` path pattern
- **Commit:** `6b481bd`

### Task 2: Wire SidebarNav with real user data and dynamic initials
- **Files:** `src/app/dashboard/_components/SidebarNav.tsx`
- Added `useEffect` to fetch user profile on mount via `fetchProfile()`
- **Loading state:** Skeleton circle + two skeleton text lines (no layout shift)
- **Loaded state:** Two-letter initials (`firstName[0]` + `lastName[0]`), full name, email
- **Error/fallback state:** "G" initial, "Guest" name, "Not signed in" email
- All nav items, logout button, mobile toggle preserved exactly
- **Commit:** `cca0999`

### Task 3: Implement Addresses page with full CRUD
- **Files:** `src/app/dashboard/addresses/page.tsx` (new), `src/components/ui/dialog.tsx` (added via shadcn CLI)
- Full `"use client"` component with lifecycle: `fetchProfile()` → user.id (customerId) → `fetchAddresses(customerId)`
- **List:** Address cards with street/houseNumber, city/zipCode, province/country
- **Badges:** "Default Shipping" and "Default Billing" with star icon
- **Add:** Dialog with form fields matching `AddressRequest` (street, houseNumber, city, zipCode, province, country, additionalInfo), default country "Italy"
- **Edit:** Pre-filled dialog via pencil icon button
- **Delete:** `window.confirm` confirmation with street/houseNumber context
- **Set Default:** "Set as default shipping" link on non-default addresses
- **States:** Skeleton loading cards, empty state with CTA, error banner
- **Commit:** `751abd1`

## Commits

| Hash | Message |
|------|---------|
| `6b481bd` | feat(260709-emx): extend API client with UserResponse.id and Address CRUD types/functions |
| `cca0999` | feat(260709-emx): wire SidebarNav with real user data and dynamic initials |
| `751abd1` | feat(260709-emx): implement addresses page with full CRUD against real API |

## Deviations from Plan

### [Rule 4 - Override] User's exact type specification overrides plan types

The PLAN.md defined different Address types (with label/firstName/lastName/postcode/phone fields) and different API endpoints (`/api/addresses`). The user explicitly provided exact types and endpoints that differ:

| Aspect | PLAN.md | User Spec (used) |
|--------|---------|-----------------|
| Address fields | label, firstName, lastName, street, city, postcode, country, phone? | street, houseNumber, city, zipCode, province, country, additionalInfo? |
| Request type | `CreateAddressRequest` / `UpdateAddressRequest` | `AddressRequest` |
| API functions | `fetchAddresses()` → `/api/addresses` | `fetchAddresses(customerId)` → `/api/customers/{customerId}/addresses` |
| Delete | `AlertDialog` confirmation | `window.confirm` |
| Default flags | `isDefaultShipping` | `isDefaultShipping` + `isDefaultBilling` |

### [Rule 4 - Override] Fetch profile before addresses

The plan had the addresses page fetching addresses directly via `fetchAddresses()`. The user's spec requires first calling `fetchProfile()` to obtain the user's `id` (customerId), then passing it to all address CRUD functions. This was implemented correctly.

### [Rule 4 - Deviation] Only dialog installed, not alert-dialog

The plan called for installing both `dialog` and `alert-dialog` shadcn components. Since delete uses `window.confirm` (per user constraint), only `dialog` was installed. `alert-dialog` is not needed.

## Self-Check: PASSED

- `npx tsc --noEmit` passes with zero errors
- `UserResponse` includes `id: string` as first field
- `Address`, `AddressRequest` types exported from `src/lib/api.ts`
- `fetchAddresses`, `addAddress`, `updateAddress`, `deleteAddress`, `setDefaultShipping` all exported
- `src/components/ui/dialog.tsx` exists
- Sidebar no longer has hardcoded user data — all dynamic via `fetchProfile()`
- Addresses page has no hardcoded mock addresses — all fetched from API
- "Add New Address" button is not disabled
- All CRUD functions route through `apiFetch<T>()` with Bearer token auth
