# 01-05 SUMMARY: Auth Route Group (Completed)

## What was done
- **AuthLayout**: Centered `max-w-md` card layout with "Ca' Del Friul" logo + "Premium Italian Resort" brand mark
- **(auth) layout**: Route group layout wrapping all auth pages with AuthLayout
- **Login page** (`/login`): Sign In form with email + password fields, navigation links
- **Register page** (`/register`): Create Account form with name + email + password + confirm fields
- **Reset Password page** (`/reset-password`): Email-only form with "Send Reset Link" button
- **Boundaries**: loading.tsx (minimal skeleton), error.tsx ("Something went wrong"), not-found.tsx ("Page Not Found")
- All pages render without public Header/Footer — clean, distraction-free layout
- All forms use `preventDefault` (static placeholders)
