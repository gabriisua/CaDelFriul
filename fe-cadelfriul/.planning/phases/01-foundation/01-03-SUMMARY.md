# 01-03 SUMMARY: (vetrina) Core Layout + Home + Rooms (Completed)

## What was done
- Created `(vetrina)` route group layout with Header + Footer wrapper
- Removed old `src/app/page.tsx` boilerplate (route group serves `/`)
- **Header:** Sticky top, logo, desktop nav (6 links with active gold indicator), "Explore Our Resort" CTA, mobile hamburger menu
- **Footer:** 4-column grid (About, Quick Links, Contact, Social), stone gray background, copyright
- **Home page:** HeroSection with "Discover the Heart of Friuli" headline, subtitle, CTA linking to `/rooms`
- **RoomCard:** Card component with gold top border, accent-colored price, amenity badges
- **Rooms page:** Grid of 4 static room cards with Friuli-themed data
- **Boundaries:** loading.tsx (skeleton grid), error.tsx ("Something went wrong"), not-found.tsx ("Page Not Found" + "Return Home")

## Build
- `build` succeeds — 3 routes (`/`, `/_not-found`, `/rooms`)
- Fixed `asChild` incompatibility — base-nova Button doesn't support it; used `buttonVariants()` class on `<Link>` instead
