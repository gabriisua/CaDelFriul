---
phase: 260709-fxy
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/api.ts
  - src/app/dashboard/profile/page.tsx
autonomous: true
requirements: []
user_setup: []

must_haves:
  truths:
    - "CustomerDetails interface exists with id, email, firstName, lastName, phone fields"
    - "fetchCustomerDetails(customerId) calls GET /api/customers/{customerId} and returns CustomerDetails"
    - "Profile page loads full customer data including phone from /api/customers/{id} instead of relying solely on /api/auth/me"
    - "npx tsc --noEmit passes with zero errors"
    - "SidebarNav still shows correct user initials (fetchProfile unchanged)"
  artifacts:
    - path: "src/lib/api.ts"
      provides: "CustomerDetails interface + fetchCustomerDetails function"
      exports: ["CustomerDetails", "fetchCustomerDetails"]
    - path: "src/app/dashboard/profile/page.tsx"
      provides: "Two-step data fetching (fetchProfile → fetchCustomerDetails) with full profile form state"
  key_links:
    - from: "src/app/dashboard/profile/page.tsx"
      to: "src/lib/api"
      via: "imports fetchProfile, fetchCustomerDetails, CustomerDetails"
      pattern: "import.*fetchCustomerDetails"
    - from: "src/app/dashboard/profile/page.tsx"
      to: "/api/customers/{id}"
      via: "fetchCustomerDetails(id) after fetchProfile() resolves"
      pattern: "fetchCustomerDetails"
---

<objective>
Add a `CustomerDetails` interface and `fetchCustomerDetails` function to the API client, then refactor the profile page to chain two fetches: `fetchProfile()` for the customer ID, then `fetchCustomerDetails(id)` for the full profile record (including phone).

**Purpose:** The `/api/auth/me` endpoint returns a lightweight `UserResponse` where `phone` may be absent/`undefined`. The profile page needs the complete customer record from `/api/customers/{id}` (which always includes `phone`). The sidebar (`SidebarNav`) continues using `fetchProfile()` only — it has no need for phone data so it should remain untouched.

**Output:** Updated `src/lib/api.ts` with `CustomerDetails`/`fetchCustomerDetails`, and refactored `src/app/dashboard/profile/page.tsx` that chains fetches properly.
</objective>

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/gabrielesuardi/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/api.ts
@src/app/dashboard/profile/page.tsx

**Key context from source code reads:**

From `api.ts` — the existing `UserResponse` (returned by `fetchProfile` → GET `/api/auth/me`):
```typescript
export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;              // optional — may be absent from /api/auth/me
}
```

From `api.ts` — existing fetch/update patterns:
```typescript
fetchProfile(): Promise<UserResponse>                          // GET /api/auth/me
updateProfile(customerId, data): Promise<UserResponse>         // PUT /api/customers/{id}
fetchAddresses(customerId): Promise<Address[]>                 // GET /api/customers/{id}/addresses
```

From `api.ts` — the existing `apiFetch` generic provides auth headers, 401/403 redirect, and JSON parsing. Every `apiFetch` call automatically attaches the Bearer token and handles errors.

From `profile/page.tsx` — current single-fetch approach:
```typescript
// Currently: one fetch from /api/auth/me — phone may be missing
fetchProfile()
  .then((u) => {
    setUser(u);
    setFirstName(u.firstName);
    setLastName(u.lastName);
    setPhone(u.phone ?? "");  // phone may be "" even when backend has it
  })
```

From `SidebarNav.tsx` — must NOT be modified:
```typescript
fetchProfile().then(setUser).catch(...)  // only needs id/name/email for initials display
```

**The existing `addresses/page.tsx` already uses the two-step pattern** (fetchProfile → get id → use id for further API calls). This plan applies the same pattern to the profile page.
</context>

<interfaces>
Existing exports from `src/lib/api.ts` that this plan builds on:

```typescript
// The lightweight session identity — stays unchanged
export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

// Generic fetch helper with auth headers, 401/403 redirect
export function apiFetch<T>(path: string, options?: RequestInit): Promise<T>

// Existing functions the profile page imports
export function fetchProfile(): Promise<UserResponse>
export function updateProfile(customerId: string, data: UpdateProfileRequest): Promise<UserResponse>
```

These will remain exactly as-is. Downstream consumers (SidebarNav, addresses page) are unaffected.
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add CustomerDetails interface and fetchCustomerDetails function to api.ts</name>
  <files>src/lib/api.ts</files>
  <action>
    Add two exports to `src/lib/api.ts`:

    1. `CustomerDetails` interface — a standalone interface (not extending `UserResponse`). Fields:
       - `id: string`
       - `firstName: string`
       - `lastName: string`
       - `email: string`
       - `phone: string`  (required — `/api/customers/{id}` returns full record with phone)

    2. `fetchCustomerDetails(customerId: string): Promise<CustomerDetails>` function:
       - Calls `apiFetch<CustomerDetails>(/api/customers/${customerId})`
       - GET method (default for `apiFetch`)
       - No request body needed

    Place `CustomerDetails` interface right after the existing `UserResponse` interface (line ~19).
    Place `fetchCustomerDetails` function after `fetchProfile` (line ~121), before `updateProfile`.

    Do NOT modify any existing exports, functions, or interfaces. Do NOT touch `UserResponse`, `fetchProfile`, `SidebarNav`, or any address-related code.
  </action>
  <verify>
    <automated>
      grep -n "export interface CustomerDetails" src/lib/api.ts | head -1 && \
      grep -n "export async function fetchCustomerDetails" src/lib/api.ts | head -1 && \
      npx tsc --noEmit
    </automated>
  </verify>
  <done>
    `CustomerDetails` interface defined with all 5 fields (phone required), `fetchCustomerDetails` function created, TypeScript compiles cleanly.
  </done>
</task>

<task type="auto">
  <name>Task 2: Refactor profile page to chain fetchProfile → fetchCustomerDetails</name>
  <files>src/app/dashboard/profile/page.tsx</files>
  <action>
    Refactor the profile page's data loading to use a two-step fetch chain, following the exact pattern already established in `addresses/page.tsx`.

    **Changes:**

    1. **Import change:** Add `CustomerDetails` and `fetchCustomerDetails` to the import from `@/lib/api`. Keep the existing `fetchProfile`, `updateProfile`, `UserResponse` imports.

    2. **State type change:** Change `const [user, setUser] = useState<UserResponse | null>(null)` to `const [user, setUser] = useState<CustomerDetails | null>(null)`. This is safe because `CustomerDetails` has all the fields `UserResponse` has plus `phone: string` (required).

    3. **useEffect refactor (the core change):** Replace the single `fetchProfile()` call with a two-step chain:

    ```typescript
    useEffect(() => {
      let cancelled = false;

      fetchProfile()
        .then((sessionUser) => {
          if (cancelled) return;
          // Use the session id to fetch full customer details
          return fetchCustomerDetails(sessionUser.id);
        })
        .then((customer) => {
          if (cancelled || !customer) return;
          setUser(customer);
          setFirstName(customer.firstName);
          setLastName(customer.lastName);
          setPhone(customer.phone);   // Guaranteed string from CustomerDetails
        })
        .catch(() => setError("Could not load profile data."))
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => { cancelled = true; };
    }, []);
    ```

    **Important:** Use the `cancelled` guard pattern (not `AbortController`) to prevent state updates after unmount. The addresses page does NOT use this pattern — add it proactively here since the two-step async increases the risk of post-unmount state updates.

    4. **No other changes needed:**
       - The `<form>` JSX remains identical (inputs, skeletons, error display, save button)
       - `handleSave` already uses `user!.id` which works with `CustomerDetails`
       - Email input still uses `user?.email` — `CustomerDetails` has `email`
       - Loading skeletons, error display, all shadcn UI remain untouched

    Do NOT modify Tailwind classes, do NOT change the form layout, do NOT touch the save handler logic.
  </action>
  <verify>
    <automated>
      npx tsc --noEmit
    </automated>
  </verify>
  <done>
    Profile page fetches `fetchProfile()` first for id, then `fetchCustomerDetails(id)` for full data. Phone field populated from the guaranteed `phone` field. Loading/error states handled. TypeScript compiles cleanly.
  </done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser → Spring Boot API | Untrusted network — all API calls go to an external REST API |
| fetchProfile() response → profile page state | Session identity crosses into profile form state — verified by id matching |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-fxy-01 | Spoofing | `fetchCustomerDetails` | mitigate | Uses `apiFetch` which attaches JWT Bearer token — server validates auth before returning customer data |
| T-fxy-02 | Tampering | `fetchCustomerDetails` response | mitigate | Response is typed as `CustomerDetails` at the fetch boundary; any shape mismatch caught by TypeScript |
| T-fxy-03 | Denial of Service | Two-step fetch (2 serial HTTP calls) | accept | Profile page is low-traffic; two serial GETs is negligible — each call has stnd timeout and error handling |
| T-fxy-04 | Information Disclosure | `fetchCustomerDetails` exposes full profile | mitigate | Only accessible with valid JWT; `apiFetch` auto-redirects to login on 401/403 |

</threat_model>

<verification>

After both tasks complete:
1. ✅ `grep -c "export interface CustomerDetails" src/lib/api.ts` returns `1`
2. ✅ `grep -c "export async function fetchCustomerDetails" src/lib/api.ts` returns `1`
3. ✅ `grep -c "fetchCustomerDetails" src/app/dashboard/profile/page.tsx` returns `1`
4. ✅ `npx tsc --noEmit` exits with code 0
5. ✅ SidebarNav.tsx has zero changes (verify with `git diff --name-only` after commit)

</verification>

<success_criteria>

1. `CustomerDetails` interface defined in `api.ts` with `phone: string` (required)
2. `fetchCustomerDetails(customerId)` makes GET `/api/customers/{customerId}` and returns `CustomerDetails`
3. Profile page chains `fetchProfile() → fetchCustomerDetails(id)` — phone field populated from the guaranteed `phone` field
4. All existing consumers of `UserResponse`/`fetchProfile` (SidebarNav, addresses page) are completely unchanged
5. `npx tsc --noEmit` passes with zero errors
6. Cancelled-guard prevents state updates after unmount during two-step async

</success_criteria>

<output>
After completion, create `.planning/quick/260709-fxy-refactor-profile-page-data-fetching-to-u/260709-fxy-01-SUMMARY.md`.
</output>
