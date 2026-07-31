# Quick Task 260716-el6 Summary

**Status:** complete

## What was done

Aligned the Staff management feature with the backend Admin entity schema:

- **Staff model:** Replaced `firstName`, `lastName`, `phone`, `active`, `createdAt`, `updatedAt` with `fullName: string`. Updated `StaffRequest` and `StaffRole` enum (ADMIN, SUPER_ADMIN).
- **Staff component:** Removed `fullName` concatenation in `loadStaff()` (backend now returns it directly). Fixed confirm dialog and logs title to use `fullName`.
- **Staff edit dialog:** Replaced separate First Name/Last Name inputs with single Full Name input. Removed Phone and Active fields. Updated form controls and patching logic.

## Files modified
- `src/app/core/models/staff.model.ts`
- `src/app/features/staff/staff.component.ts`
- `src/app/features/staff/components/staff-edit-dialog/staff-edit-dialog.component.ts`

## Verification
- `npx ng build` passes successfully
- Grid now displays `fullName` directly from backend (no more "undefined undefined")
- Edit dialog uses single Full Name field
