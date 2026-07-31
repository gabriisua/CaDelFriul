# PLAN: Fix Change Detection for Global Toast/Confirm

**ID:** 260716-f1m  
**Date:** 2026-07-16  
**Status:** DONE

## Problem
`GlobalToastComponent` and `GlobalConfirmComponent` only render when a subsequent DOM event triggers change detection. Toasts from `setTimeout` auto-dismiss don't trigger Angular's change detection cycle.

## Root Cause
1. `UiService.showToast()` schedules `removeToast()` via `setTimeout()` which runs outside Angular's Zone
2. Components subscribe to observables but don't manually trigger change detection

## Changes Made

### 1. `UiService` (`src/app/core/services/ui.service.ts`)
- Injected `NgZone` service
- Wrapped `setTimeout()` in `NgZone.run()` to ensure it runs inside Angular's zone

### 2. `GlobalToastComponent` (`src/app/shared/components/global-toast/global-toast.component.ts`)
- Injected `ChangeDetectorRef`
- Added `cdr.detectChanges()` in subscription callback after updating `toasts` array

### 3. `GlobalConfirmComponent` (`src/app/shared/components/global-confirm/global-confirm.component.ts`)
- Injected `ChangeDetectorRef`
- Added `cdr.detectChanges()` in subscription callback after updating `state`

## Verification
- Build passed with no errors
- Toasts auto-dismiss correctly after 3 seconds without requiring user interaction
- Confirm dialogs render immediately when `UiService.confirm()` is called