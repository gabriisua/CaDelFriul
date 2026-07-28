---
phase: 260709-emx
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/api.ts
  - src/app/dashboard/_components/SidebarNav.tsx
  - src/app/dashboard/addresses/page.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "API client exposes Address types and CRUD functions consumed by multiple pages"
    - "Sidebar shows the logged-in user's real name, email, and photo-less initials"
    - "Addresses page lists real addresses fetched from the API"
    - "User can add a new address via a form dialog"
    - "User can edit an existing address via a pre-filled form dialog"
    - "User can delete an address with a confirmation prompt"
    - "User can set any address as the default shipping address"
  artifacts:
    - path: src/lib/api.ts
      provides: "Address types + CRUD functions"
      exports:
        - "UserResponse (with id)"
        - "Address"
        - "CreateAddressRequest"
        - "fetchAddresses"
        - "createAddress"
        - "updateAddress"
        - "deleteAddress"
        - "setDefaultShippingAddress"
    - path: src/app/dashboard/_components/SidebarNav.tsx
      provides: "Sidebar with dynamic user data"
      min_lines: 120
    - path: src/app/dashboard/addresses/page.tsx
      provides: "Full CRUD address management"
      min_lines: 200
  key_links:
    - from: SidebarNav.tsx
      to: api.ts
      via: fetchProfile import
      pattern: "fetchProfile"
    - from: addresses/page.tsx
      to: api.ts
      via: address CRUD imports
      pattern: "fetchAddresses|createAddress|updateAddress|deleteAddress|setDefaultShippingAddress"
    - from: addresses/page.tsx
      to: Dialog + AlertDialog
      via: shadcn dialog components for add/edit/delete
      pattern: "Dialog|AlertDialog"
---

<objective>
Complete User Dashboard integration: extend API client with Address CRUD, wire Sidebar to real user data, and implement a fully functional Addresses page.

**Purpose:** Eliminate all hardcoded mock data from the dashboard experience. The sidebar and addresses page will operate against the real Spring Boot REST API, matching the pattern already established by the profile page.

**Output:**
- Updated `src/lib/api.ts` with `UserResponse.id`, `Address`/`AddressRequest` types, and 5 CRUD functions
- Updated `src/app/dashboard/_components/SidebarNav.tsx` that fetches and displays real user name, email, and dynamic initials
- Rebuilt `src/app/dashboard/addresses/page.tsx` as a client component with full CRUD (list, add, edit, delete, set default shipping)
- New shadcn/ui components: `dialog`, `alert-dialog` (added via CLI)
</objective>

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/gabrielesuardi/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/api.ts
@src/app/dashboard/_components/SidebarNav.tsx
@src/app/dashboard/addresses/page.tsx
@src/app/dashboard/profile/page.tsx

<interfaces>
**Existing API client patterns (src/lib/api.ts):**

- `apiFetch<T>(path, options?)` — generic fetch with Bearer token, 401/403 → redirect to `/login`, throws `AuthError`
- `fetchProfile(): Promise<UserResponse>` — calls `GET /api/auth/me`
- All authenticated calls use `apiFetch`, unauthenticated calls use plain `fetch`

**Existing SidebarNav patterns:**
- Client component (`"use client"`)
- Uses `usePathname()`, `useRouter()` from `next/navigation`
- Imports `logout` from `@/lib/api`
- Renders user info (hardcoded currently): avatar circle with initial, name, email
- Nav items array with href/label, active state detection via pathname
- Mobile responsive: hamburger toggle + overlay

**Existing address mock data shape:**
```typescript
{
  label: string;    // e.g. "Home", "Billing"
  name: string;     // e.g. "Guest User"
  street: string;   // e.g. "Via Roma, 123"
  city: string;     // e.g. "Udine"
  postcode: string; // e.g. "33100"
  country: string;  // e.g. "Italy"
}
```

**Existing UI components available:**
- `@/components/ui/button` — `Button` with variants (default, outline, ghost, destructive)
- `@/components/ui/card` — `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardDescription`
- `@/components/ui/input` — `Input`
- `@/components/ui/label` — `Label`
- `@/components/ui/skeleton` — `Skeleton`
- `@/components/ui/separator` — `Separator`
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extend API client with UserResponse.id + Address CRUD types and functions</name>
  <files>src/lib/api.ts</files>
  <action>
    1. Add `id: string` to the existing `UserResponse` interface. Place it as the first field.

    2. Add three new type exports AFTER `UserResponse`:
    ```typescript
    export interface Address {
      id: string;
      label: string;
      firstName: string;
      lastName: string;
      street: string;
      city: string;
      postcode: string;
      country: string;
      phone?: string;
      isDefaultShipping: boolean;
    }

    export interface CreateAddressRequest {
      label: string;
      firstName: string;
      lastName: string;
      street: string;
      city: string;
      postcode: string;
      country: string;
      phone?: string;
    }

    // UpdateAddressRequest is identical to CreateAddressRequest for this API
    export type UpdateAddressRequest = CreateAddressRequest;
    ```

    3. Add five new exported async functions AFTER `logout()`, each using `apiFetch<T>()`:

    ```typescript
    export async function fetchAddresses(): Promise<Address[]> {
      return apiFetch<Address[]>("/api/addresses");
    }

    export async function createAddress(
      data: CreateAddressRequest
    ): Promise<Address> {
      return apiFetch<Address>("/api/addresses", {
        method: "POST",
        body: JSON.stringify(data),
      });
    }

    export async function updateAddress(
      id: string,
      data: UpdateAddressRequest
    ): Promise<Address> {
      return apiFetch<Address>(`/api/addresses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    }

    export async function deleteAddress(id: string): Promise<void> {
      await apiFetch<void>(`/api/addresses/${id}`, {
        method: "DELETE",
      });
    }

    export async function setDefaultShippingAddress(
      id: string
    ): Promise<Address> {
      return apiFetch<Address>(`/api/addresses/${id}/default`, {
        method: "PUT",
      });
    }
    ```

    4. Do NOT change `login()`, `logout()`, `fetchProfile()`, `apiFetch()`, `getAuthHeaders()`, or `AuthError` — leave them exactly as-is.
    5. Run `npx tsc --noEmit` to verify TypeScript compiles without errors.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>
    - `UserResponse` includes `id: string` as first field
    - `Address`, `CreateAddressRequest`, `UpdateAddressRequest` types exported
    - `fetchAddresses`, `createAddress`, `updateAddress`, `deleteAddress`, `setDefaultShippingAddress` functions exported
    - TypeScript compiles without errors
    - Existing functions untouched
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire SidebarNav to show real user data with dynamic initials</name>
  <files>src/app/dashboard/_components/SidebarNav.tsx</files>
  <action>
    Convert the hardcoded user section in SidebarNav to fetch and display real user data from `fetchProfile()`.

    1. Add these imports at the top (insert after the existing `logout` import):
    ```typescript
    import { fetchProfile, UserResponse } from "@/lib/api";
    import { Skeleton } from "@/components/ui/skeleton";
    ```

    2. Add state variables inside the component function, after the existing `loggingOut` state:
    ```typescript
    const [user, setUser] = useState<UserResponse | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    ```

    3. Add a `useEffect` that fetches the profile on mount. Place it after the state declarations, before `handleLogout`:
    ```typescript
    useEffect(() => {
      fetchProfile()
        .then(setUser)
        .catch(() => { /* not authenticated — fallback stays */ })
        .finally(() => setProfileLoading(false));
    }, []);
    ```
    Add `useEffect` to the React import if not already there (extend the existing `useState` import).

    4. Replace the hardcoded user info block (lines 38-45, the avatar div + name/email divs) with dynamic content. The replacement should handle three states:

    **Loading state** (profileLoading is true):
    ```tsx
    <div className="flex items-center gap-3 px-6 py-6">
      <Skeleton className="size-10 rounded-full" />
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
    ```

    **Loaded state** (user is not null):
    ```tsx
    <div className="flex items-center gap-3 px-6 py-6">
      <div className="flex size-10 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
        {user.firstName.charAt(0).toUpperCase()}
        {user.lastName.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-medium text-sidebar-foreground">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
    </div>
    ```

    **Error/fallback state** (profileLoading is false and user is null):
    ```tsx
    <div className="flex items-center gap-3 px-6 py-6">
      <div className="flex size-10 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
        G
      </div>
      <div>
        <p className="text-sm font-medium text-sidebar-foreground">Guest</p>
        <p className="text-xs text-muted-foreground">Not signed in</p>
      </div>
    </div>
    ```

    Use a conditional that picks one of the three blocks based on `profileLoading` and `user`. Keep all other code (nav items, logout button, mobile toggle, aside markup) **exactly as-is**.

    5. Run `npx tsc --noEmit` to verify TypeScript compiles.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>
    - Sidebar fetches user profile via `fetchProfile()` on mount
    - Loading state shows skeleton circles and lines (no layout shift)
    - Loaded state shows real user initials (firstName[0] + lastName[0]), full name, and email
    - Error/unauthenticated state falls back to "G" initial, "Guest" name, "Not signed in" email
    - All existing navigation items, logout button, mobile toggle, and styling preserved
    - TypeScript compiles without errors
  </done>
</task>

<task type="auto">
  <name>Task 3: Implement Addresses page with full CRUD against real API</name>
  <files>src/app/dashboard/addresses/page.tsx</files>
  <action>
    Replace the static server component with a full-featured client component that fetches addresses from the API and supports list, add, edit, delete, and set-default-shipping.

    **Step A — Add shadcn Dialog components:**
    ```bash
    npx shadcn@latest add dialog alert-dialog --yes
    ```
    If this fails due to prompts, try with `-y` flag or pipe `yes`.

    **Step B — Rewrite `src/app/dashboard/addresses/page.tsx`:**

    1. Top of file: `"use client";` directive, then imports:
    ```typescript
    import { useEffect, useState } from "react";
    import { Plus, Pencil, Trash2, Star } from "lucide-react";
    import { Button } from "@/components/ui/button";
    import {
      Card,
      CardContent,
      CardHeader,
      CardTitle,
    } from "@/components/ui/card";
    import { Skeleton } from "@/components/ui/skeleton";
    import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
    } from "@/components/ui/dialog";
    import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
      AlertDialogTrigger,
    } from "@/components/ui/alert-dialog";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import {
      Address,
      CreateAddressRequest,
      fetchAddresses,
      createAddress,
      updateAddress,
      deleteAddress,
      setDefaultShippingAddress,
    } from "@/lib/api";
    ```

    2. Component logic — state and effects:
    ```typescript
    export default function AddressesPage() {
      const [addresses, setAddresses] = useState<Address[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);

      // Add/Edit dialog state
      const [dialogOpen, setDialogOpen] = useState(false);
      const [editingAddress, setEditingAddress] = useState<Address | null>(null);
      const [formData, setFormData] = useState<CreateAddressRequest>({
        label: "",
        firstName: "",
        lastName: "",
        street: "",
        city: "",
        postcode: "",
        country: "Italy",
        phone: "",
      });
      const [saving, setSaving] = useState(false);

      // Delete confirmation state
      const [deletingId, setDeletingId] = useState<string | null>(null);
      const [deleting, setDeleting] = useState(false);

      const loadAddresses = () => {
        setLoading(true);
        setError(null);
        fetchAddresses()
          .then(setAddresses)
          .catch(() => setError("Could not load addresses."))
          .finally(() => setLoading(false));
      };

      useEffect(() => {
        loadAddresses();
      }, []);
    ```

    3. Form handlers (inside component, after state):
    ```typescript
      const openAddDialog = () => {
        setEditingAddress(null);
        setFormData({
          label: "",
          firstName: "",
          lastName: "",
          street: "",
          city: "",
          postcode: "",
          country: "Italy",
          phone: "",
        });
        setDialogOpen(true);
      };

      const openEditDialog = (addr: Address) => {
        setEditingAddress(addr);
        setFormData({
          label: addr.label,
          firstName: addr.firstName,
          lastName: addr.lastName,
          street: addr.street,
          city: addr.city,
          postcode: addr.postcode,
          country: addr.country,
          phone: addr.phone ?? "",
        });
        setDialogOpen(true);
      };

      const handleFormChange = (field: keyof CreateAddressRequest, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
      };

      const handleSave = async () => {
        setSaving(true);
        try {
          if (editingAddress) {
            await updateAddress(editingAddress.id, formData);
          } else {
            await createAddress(formData);
          }
          setDialogOpen(false);
          loadAddresses();
        } catch {
          // keep dialog open on error — user can retry
        } finally {
          setSaving(false);
        }
      };

      const handleDelete = async (id: string) => {
        setDeleting(true);
        try {
          await deleteAddress(id);
          setDeletingId(null);
          loadAddresses();
        } catch {
          // keep dialog open on error
        } finally {
          setDeleting(false);
        }
      };

      const handleSetDefault = async (id: string) => {
        try {
          await setDefaultShippingAddress(id);
          loadAddresses();
        } catch {
          // silently fail — addresses stay as-is
        }
      };
    ```

    3. JSX return — the layout mirrors the existing page structure but with dynamic data and actions. Return this JSX:

    ```tsx
      return (
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-semibold">Addresses</h1>
              <p className="mt-2 text-muted-foreground">
                Manage your saved addresses for orders and billing.
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="mr-2 size-4" />
                  Add New Address
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingAddress ? "Edit Address" : "Add New Address"}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="label">Label</Label>
                      <Input
                        id="label"
                        placeholder="e.g. Home, Billing"
                        value={formData.label}
                        onChange={(e) => handleFormChange("label", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleFormChange("country", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleFormChange("firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleFormChange("lastName", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => handleFormChange("street", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleFormChange("city", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Postcode</Label>
                      <Input
                        id="postcode"
                        value={formData.postcode}
                        onChange={(e) => handleFormChange("postcode", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone ?? ""}
                      onChange={(e) => handleFormChange("phone", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : editingAddress ? "Update" : "Create"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {error && (
            <div className="mt-6 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-20" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <div className="mt-16 text-center text-muted-foreground">
              <p className="text-sm">No addresses saved yet.</p>
              <p className="mt-1 text-xs">
                Click "Add New Address" to get started.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {addresses.map((addr) => (
                <Card key={addr.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="font-heading text-base">
                        {addr.label}
                      </CardTitle>
                      {addr.isDefaultShipping && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                          <Star className="size-3 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEditDialog(addr)}
                        aria-label={`Edit ${addr.label}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <AlertDialog
                        open={deletingId === addr.id}
                        onOpenChange={(open) => {
                          if (!open) setDeletingId(null);
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => setDeletingId(addr.id)}
                            aria-label={`Delete ${addr.label}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Address</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the address "
                              {addr.label}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(addr.id)}
                              disabled={deleting}
                            >
                              {deleting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {addr.firstName} {addr.lastName}
                    </p>
                    <p>{addr.street}</p>
                    <p>
                      {addr.city}, {addr.postcode}
                    </p>
                    <p>{addr.country}</p>
                    {addr.phone && <p className="mt-1">{addr.phone}</p>}
                    {!addr.isDefaultShipping && (
                      <Button
                        variant="link"
                        className="mt-2 h-auto p-0 text-xs"
                        onClick={() => handleSetDefault(addr.id)}
                      >
                        Set as default shipping
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    }
    ```

    **Step C — After writing the file, verify:**
    ```bash
    npx tsc --noEmit
    ```
    Fix any TypeScript errors (likely import path issues).

    **Key constraints:**
    - The `Add New Address` button MUST NOT be disabled (it triggers the dialog with `openAddDialog`).
    - The default country for new addresses is `"Italy"`.
    - Use `lucide-react` icons: `Plus`, `Pencil`, `Trash2`, `Star` — nothing else.
    - The `handleSetDefault` function silently catches errors (optimistic UX — if the API fails, the next `loadAddresses()` reload shows the unchanged state).
    - The dialog form must show "Update" or "Create" button text depending on `editingAddress` being set.
    - After save or delete, reload the address list via `loadAddresses()`.
  </action>
  <verify>
    <automated>npx tsc --noEmit && ls src/components/ui/dialog.tsx src/components/ui/alert-dialog.tsx</automated>
  </verify>
  <done>
    - Addresses page is a `"use client"` component
    - Fetches real addresses from API on mount via `fetchAddresses()`
    - Loading state shows skeleton cards (no layout shift)
    - Empty state shows helpful message with CTA
    - Error state shows a red banner
    - "Add New Address" button opens a dialog with a form (label, firstName, lastName, street, city, postcode, country, phone)
    - Each address card has Edit (pencil icon) and Delete (trash icon) buttons
    - Edit opens dialog pre-filled with existing address data
    - Delete shows a confirmation AlertDialog
    - Default shipping addresses show a "Default" badge with star icon
    - Non-default addresses show "Set as default shipping" link
    - Create/update/delete calls the corresponding API functions and refreshes the list
    - shadcn Dialog and AlertDialog components are installed
    - TypeScript compiles without errors
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes without errors
2. `src/lib/api.ts` exports all new types and functions
3. `src/components/ui/dialog.tsx` and `src/components/ui/alert-dialog.tsx` exist
4. No hardcoded user data remains in SidebarNav (name, email, avatar initial are all dynamic)
5. No hardcoded mock addresses remain in the addresses page
6. The "Add New Address" button is no longer `disabled`
7. All addresses CRUD functions route through `apiFetch<T>()` with Bearer token auth
</verification>

<success_criteria>
- **API client**: `UserResponse` now has `id`, `Address` types defined, 5 CRUD functions exported — all usable by any dashboard page
- **Sidebar**: Shows real user first+last name, email, and two-letter initials in the avatar circle. Loading state uses skeletons. Error/unauthenticated state shows graceful fallback.
- **Addresses page**: Full CRUD against the real API. Users can view, add, edit, delete, and set default shipping addresses. All states handled (loading, empty, error, edge cases).
- **TypeScript**: `npx tsc --noEmit` passes with zero errors.
</success_criteria>

<output>
After completion, create `.planning/quick/260709-emx-complete-user-dashboard-integration-upda/260709-emx-SUMMARY.md`
</output>
