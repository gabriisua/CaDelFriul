# SUMMARY: Fix Change Detection for Global Toast/Confirm

**Completed:** 2026-07-16T08:49:00Z  
**Files Modified:**
- `src/app/core/services/ui.service.ts` - NgZone wrap for setTimeout
- `src/app/shared/components/global-toast/global-toast.component.ts` - ChangeDetectorRef
- `src/app/shared/components/global-confirm/global-confirm.component.ts` - ChangeDetectorRef

**Root Cause:** setTimeout ran outside Angular Zone, components didn't trigger CD after observable updates

**Result:** Toasts and confirms now render correctly without requiring user interaction to trigger change detection