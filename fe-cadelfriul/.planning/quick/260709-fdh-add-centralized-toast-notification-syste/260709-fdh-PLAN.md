---
phase: 260709-fdh-add-centralized-toast-notification-syste
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/layout.tsx
  - src/lib/api.ts
  - src/app/dashboard/profile/page.tsx
autonomous: true
requirements: []
user_setup: []

must_haves:
  truths:
    - "User sees toast notifications on profile save success/error"
    - "User can edit first name, last name, and phone"
    - "Email remains read-only"
    - "Profile updates are persisted via API"
  artifacts:
    - path: "src/components/ui/sonner.tsx"
      provides: "Sonner toast component"
      min_lines: 10
    - path: "src/app/layout.tsx"
      provides: "Root layout with Toaster"
      contains: "Toaster"
    - path: "src/lib/api.ts"
      provides: "UserResponse with phone and updateProfile function"
      exports: ["UserResponse", "updateProfile"]
    - path: "src/app/dashboard/profile/page.tsx"
      provides: "Editable profile form with save functionality"
      min_lines: 80
  key_links:
    - from: "src/app/layout.tsx"
      to: "src/components/ui/sonner.tsx"
      via: "import Toaster"
      pattern: "import.*Toaster.*from"
    - from: "src/app/dashboard/profile/page.tsx"
      to: "src/lib/api.ts"
      via: "import updateProfile"
      pattern: "import.*updateProfile.*from"
    - from: "src/app/dashboard/profile/page.tsx"
      to: "src/components/ui/sonner.tsx"
      via: "import toast from sonner"
      pattern: "import.*toast.*from.*sonner"
---

<objective>
Add centralized toast notification system and refactor profile page to be editable with save functionality.

Purpose: Enable user profile editing with proper feedback via toast notifications.
Output: Working profile page with editable fields and save capability with toast feedback.
</objective>

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/gabrielesuardi/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

<interfaces>
<!-- Key types and contracts the executor needs -->

From src/lib/api.ts:
```typescript
export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export async function fetchProfile(): Promise<UserResponse>;
```

From src/components/ui/sonner.tsx:
```typescript
export function Toaster(props: ToasterProps): JSX.Element;
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install shadcn sonner and add Toaster to root layout</name>
  <files>src/components/ui/sonner.tsx, src/app/layout.tsx</files>
  <action>
    1. Run `npx shadcn@latest add sonner` to install the sonner component
    2. Import and add `<Toaster />` to src/app/layout.tsx inside the body tag
    3. Apply rustic-chic theme styling to Toaster: `<Toaster position="bottom-right" richColors closeButton />`
    4. Ensure Toaster is placed after `{children}` in the body
  </action>
  <verify>
    <automated>grep -q "Toaster" src/app/layout.tsx && echo "Toaster found" || echo "Toaster not found"</automated>
  </verify>
  <done>Toaster component exists and is added to root layout</done>
</task>

<task type="auto">
  <name>Task 2: Update API client with phone field and updateProfile function</name>
  <files>src/lib/api.ts</files>
  <action>
    1. Add `phone?: string` to the UserResponse interface (after email field)
    2. Create new interface `UpdateProfileRequest` with fields: firstName, lastName, phone (all strings)
    3. Add `updateProfile(customerId: string, data: UpdateProfileRequest): Promise<UserResponse>` function
    4. Implementation: Use apiFetch to PUT `/api/customers/${customerId}` with the data
    5. Export both the new interface and function
  </action>
  <verify>
    <automated>grep -q "phone.*string" src/lib/api.ts && grep -q "updateProfile" src/lib/api.ts && echo "API updated" || echo "API not updated"</automated>
  </verify>
  <done>UserResponse has phone field and updateProfile function exists and is exported</done>
</task>

<task type="auto">
  <name>Task 3: Refactor profile page with controlled inputs and save functionality</name>
  <files>src/app/dashboard/profile/page.tsx</files>
  <action>
    1. Import toast from "sonner" and updateProfile from "@/lib/api"
    2. Add controlled state variables: firstName, lastName, phone (all strings)
    3. Replace "Full Name" field with separate "First Name" and "Last Name" controlled inputs
    4. Keep "Email" as disabled/read-only input
    5. Make "Phone" an editable controlled input (remove disabled attribute)
    4. Add saving state: const [saving, setSaving] = useState(false)
    5. Create handleSave async function:
       - Set saving to true
       - Call updateProfile(user.id, { firstName, lastName, phone })
       - On success: toast("Profile updated successfully!")
       - On error: toast.error("Something went wrong.")
       - Finally: set saving to false
    6. Wire Save Changes button to handleSave, disable while saving, show "Saving..." text
    7. Initialize controlled state from user data after fetch (in useEffect or useMemo)
  </action>
  <verify>
    <automated>grep -q "firstName" src/app/dashboard/profile/page.tsx && grep -q "handleSave" src/app/dashboard/profile/page.tsx && echo "Profile refactored" || echo "Profile not refactored"</automated>
  </verify>
  <done>Profile page has editable first name, last name, phone fields and save button with toast feedback</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client→API | Profile updates cross from client to backend API |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-260709-01 | T (Tampering) | updateProfile function | mitigate | Validate input before sending, use existing apiFetch with auth headers |
| T-260709-02 | I (Info Disclosure) | UserResponse phone field | accept | Phone is user's own data, not sensitive PII in this context |
</threat_model>

<verification>
- Sonner component installed and Toaster added to root layout
- UserResponse interface has phone field
- updateProfile function exists and exports correctly
- Profile page has editable first name, last name, and phone inputs
- Email remains disabled/read-only
- Save button triggers handleSave with toast feedback
- Loading skeleton still works during initial fetch
</verification>

<success_criteria>
- Toast notifications appear on save success/error
- User can edit first name, last name, and phone
- Profile updates persist via API call
- Email field remains read-only
- No TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/260709-fdh-add-centralized-toast-notification-syste/260709-fdh-SUMMARY.md`
</output>
