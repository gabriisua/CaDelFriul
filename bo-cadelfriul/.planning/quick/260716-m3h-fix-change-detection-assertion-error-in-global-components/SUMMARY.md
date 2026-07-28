# SUMMARY: Fix Change Detection Assertion Error in Global Components

**Completed:** 2026-07-16T13:54:00Z  
**Files Modified:**
- `src/app/shared/components/global-toast/global-toast.component.ts` - OnPush + markForCheck
- `src/app/shared/components/global-confirm/global-confirm.component.ts` - OnPush + markForCheck

**Changes:**
1. Added `ChangeDetectionStrategy.OnPush` to both components
2. Replaced `detectChanges()` with `markForCheck()` in subscription callbacks

**Result:** Build passes, no more assertion errors
