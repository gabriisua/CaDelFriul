# 01-01 SUMMARY: Theme & Root (Completed)

## What was done
- Updated `src/app/globals.css`:
  - Changed `--font-heading` to use `--font-playfair` in `@theme inline`
  - Replaced `:root` neutral palette with luxury rustic-chic brand colors (warm ivory, stone gray, muted gold)
  - Added `scroll-behavior: smooth` to `html` in `@layer base`
  - Preserved `.dark` block unchanged
- Updated `src/app/layout.tsx`:
  - Added `Playfair_Display` font import and instance with `--font-playfair` variable
  - Updated metadata title to "Ca' Del Friul — Premium Italian Resort" with brand description
  - Added `playfairDisplay.variable` to `<html>` className

## Verification
- All color token counts match acceptance criteria
- `build` succeeds with no errors
- Font loading + metadata correctly configured
