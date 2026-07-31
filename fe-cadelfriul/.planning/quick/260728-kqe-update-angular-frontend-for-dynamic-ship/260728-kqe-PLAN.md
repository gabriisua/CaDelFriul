---
phase: quick
plan: kqe
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/api.ts
  - src/context/CartContext.tsx
  - src/app/(vetrina)/shop/page.tsx
  - src/app/(vetrina)/cart/page.tsx
  - src/app/(vetrina)/checkout/page.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Shop page displays product stock quantity and prevents adding more than available"
    - "Cart enforces per-product stock limits on quantity controls"
    - "Cart order summary shows a shipping cost (fetched from backend or fallback)"
    - "Checkout page calculates and displays shipping cost based on selected address"
    - "Checkout shows specific error messages when order fails (out-of-stock, invalid address, etc.)"
  artifacts:
    - path: "src/lib/api.ts"
      provides: "Product interface with stockQuantity, calculateShippingCost function"
      contains: "stockQuantity"
    - path: "src/context/CartContext.tsx"
      provides: "Cart with stock-aware quantity enforcement"
      contains: "stockQuantity"
    - path: "src/app/(vetrina)/shop/page.tsx"
      provides: "Shop page showing stock counts and enforcing limits"
      contains: "stockQuantity"
    - path: "src/app/(vetrina)/cart/page.tsx"
      provides: "Cart with dynamic shipping cost display"
      contains: "shipping"
    - path: "src/app/(vetrina)/checkout/page.tsx"
      provides: "Checkout with dynamic shipping and granular error handling"
      contains: "shippingCost"
  key_links:
    - from: "src/context/CartContext.tsx"
      to: "src/lib/api.ts"
      via: "Product type used for stockQuantity"
      pattern: "stockQuantity"
    - from: "src/app/(vetrina)/cart/page.tsx"
      to: "src/lib/api.ts"
      via: "calculateShippingCost call"
      pattern: "calculateShippingCost"
    - from: "src/app/(vetrina)/checkout/page.tsx"
      to: "src/lib/api.ts"
      via: "calculateShippingCost call on address change"
      pattern: "calculateShippingCost"
---

<objective>
Update the frontend e-commerce flow to support dynamic shipping costs from the backend, enforce per-product stock limits throughout the cart, and provide granular checkout error handling.

Purpose: The current cart and checkout hardcode shipping as "Free" or "Calculated at checkout" and have no stock awareness. The backend now exposes stock quantities on products and a shipping cost calculation endpoint — the frontend needs to consume both.

Output: Stock-aware cart + shop, dynamic shipping cost display, and specific checkout error messages.
</objective>

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md

<interfaces>
<!-- Key types and contracts the executor needs from the codebase. -->

From src/lib/api.ts (current Product interface):
```typescript
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  available: boolean;
  // NEW: stockQuantity will be added by Task 1
}
```

From src/lib/api.ts (current apiFetch pattern):
```typescript
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  // Uses Bearer token auth, handles 401/403 redirect, throws AuthError on failure
}
```

From src/context/CartContext.tsx (current CartItem):
```typescript
export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}
```

From src/context/CartContext.tsx (current addToCart signature):
```typescript
addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
```

From src/app/(vetrina)/checkout/page.tsx (current error handling):
```typescript
// Currently catches all errors with generic toast: "Failed to process checkout. Please try again."
// No stock validation, no address validation feedback, no shipping cost
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add stockQuantity to API types, stock-aware CartContext, and stock-aware Shop page</name>
  <files>src/lib/api.ts, src/context/CartContext.tsx, src/app/(vetrina)/shop/page.tsx</files>
  <action>
## src/lib/api.ts changes

1. Add `stockQuantity: number` to the `Product` interface (after `available`).

2. Add a `ShippingCostRequest` interface and `calculateShippingCost` function:
```typescript
export interface ShippingCostRequest {
  addressId: string;
  items: { productId: string; quantity: number }[];
}

export interface ShippingCostResponse {
  shippingCost: number;
  currency: string;
}

export async function calculateShippingCost(
  request: ShippingCostRequest
): Promise<ShippingCostResponse> {
  return apiFetch<ShippingCostResponse>("/api/shipping/calculate", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
```

## src/context/CartContext.tsx changes

1. Add `stockQuantity?: number` to the `CartItem` interface (optional because cart items from localStorage may not have it).

2. Update `addToCart` to accept `stockQuantity` in the item parameter: `Omit<CartItem, "quantity"> & { quantity?: number }` — pass it through to the stored item.

3. In `addToCart`, when the product already exists in cart, cap the new quantity at `stockQuantity` if provided:
```typescript
if (existing) {
  const newQty = Math.min(existing.quantity + qty, existing.stockQuantity ?? Infinity);
  return prev.map((i) =>
    i.productId === item.productId ? { ...i, quantity: newQty } : i
  );
}
```

4. Add a `maxQuantityFor(productId: number): number` helper (or expose it via context) so consumers can query the max allowed quantity. The simplest approach: add `getMaxQuantity(productId: string): number` to the context value that returns `stockQuantity ?? Infinity`.

## src/app/(vetrina)/shop/page.tsx changes

1. In `handleAddToCart`, pass `stockQuantity: product.stockQuantity` to `addToCart`.

2. Show a stock badge below each ProductCard when stock is low (≤ 5):
```tsx
{product.stockQuantity !== undefined && product.stockQuantity <= 5 && (
  <p className="text-xs text-muted-foreground mt-1">
    Only {product.stockQuantity} left in stock
  </p>
)}
```

3. Change the "Add to Cart" button: if the product's stock is 0, show "Out of Stock" and disable the button. If the product is in the cart and `cartItem.quantity >= product.stockQuantity`, show "Max in Cart" and disable. Otherwise show "Add to Cart" as normal.

4. Import `useCart` to get current cart items (already imported). Use it to check current quantity for each product:
```tsx
const { items: cartItems, addToCart } = useCart();
// In the render:
const cartItem = cartItems.find(ci => ci.productId === product.id);
const isAtMax = cartItem && product.stockQuantity !== undefined && cartItem.quantity >= product.stockQuantity;
```

5. Disable the button when `!product.available || !isAuthenticated || product.stockQuantity === 0 || isAtMax`.

6. Update the button label logic:
```tsx
{!isAuthenticated
  ? "Sign In to Buy"
  : product.stockQuantity === 0
    ? "Out of Stock"
    : isAtMax
      ? "Max in Cart"
      : product.available
        ? "Add to Cart"
        : "Unavailable"}
```
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <done>Product interface has stockQuantity; CartContext caps quantity at stock; Shop page shows stock info and disables add-to-cart when stock is 0 or cart is at max; TypeScript compiles clean.</done>
</task>

<task type="auto">
  <name>Task 2: Dynamic shipping cost in Cart + Checkout with granular error handling</name>
  <files>src/app/(vetrina)/cart/page.tsx, src/app/(vetrina)/checkout/page.tsx</files>
  <action>
## src/app/(vetrina)/cart/page.tsx changes

1. Import `calculateShippingCost` from `@/lib/api`.

2. Add state for shipping cost:
```tsx
const [shippingCost, setShippingCost] = useState<number | null>(null);
const [shippingLoading, setShippingLoading] = useState(false);
```

3. Add a `useEffect` that fetches shipping cost when items change (debounced or simple). Use a default address or skip if no default address:
```tsx
useEffect(() => {
  if (items.length === 0) return;
  setShippingLoading(true);
  // Try fetching with first item — cart doesn't have address context
  // Show "Calculated at checkout" if no address available
  setShippingCost(null); // Reset on item change
  setShippingLoading(false);
}, [items]);
```

Since the cart page doesn't have an address context, keep "Calculated at checkout" as the default text but make the shipping row dynamic:
- If `shippingCost` is null: show "Calculated at checkout"
- If `shippingCost` is 0: show "Free"
- If `shippingCost` > 0: show `€{shippingCost.toFixed(2)}`

4. In the order summary, replace the hardcoded shipping line:
```tsx
<div className="flex justify-between">
  <span className="text-muted-foreground">Shipping</span>
  <span className="text-muted-foreground">
    {shippingLoading ? "Calculating..." : "Calculated at checkout"}
  </span>
</div>
```

This keeps the cart page simple — the real shipping calculation happens at checkout when the address is known.

## src/app/(vetrina)/checkout/page.tsx changes

1. Import `calculateShippingCost` and `AuthError` from `@/lib/api`.

2. Add state for shipping cost:
```tsx
const [shippingCost, setShippingCost] = useState<number>(0);
const [shippingLoading, setShippingLoading] = useState(false);
```

3. Add a `useEffect` that fetches shipping cost whenever `selectedAddressId` changes:
```tsx
useEffect(() => {
  if (!selectedAddressId || items.length === 0) return;
  setShippingLoading(true);
  calculateShippingCost({
    addressId: selectedAddressId,
    items: items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  })
    .then((res) => setShippingCost(res.shippingCost))
    .catch(() => setShippingCost(0)) // Fallback to free on error
    .finally(() => setShippingLoading(false));
}, [selectedAddressId, items]);
```

4. Replace the hardcoded "Free" shipping line with:
```tsx
<div className="flex justify-between">
  <span className="text-muted-foreground">Shipping</span>
  <span className="font-medium">
    {shippingLoading
      ? "Calculating..."
      : shippingCost === 0
        ? "Free"
        : `€${shippingCost.toFixed(2)}`}
  </span>
</div>
```

5. Update the total to include shipping:
```tsx
// Replace cartTotal with cartTotal + shippingCost in the total line
<div className="flex justify-between text-base font-semibold">
  <span>Total</span>
  <span className="text-accent">
    &euro;{(cartTotal + shippingCost).toFixed(2)}
  </span>
</div>
```

6. Replace the generic catch in `handlePlaceOrder` with granular error handling:
```typescript
} catch (err) {
  console.error("Checkout error:", err);
  if (err instanceof AuthError) {
    const body = err.body as Record<string, unknown> | null;
    const message = body && typeof body === "object" && "message" in body
      ? String((body as { message: string }).message)
      : null;

    if (message?.toLowerCase().includes("stock")) {
      toast.error("Some items are no longer in stock. Please review your cart.");
    } else if (message?.toLowerCase().includes("address")) {
      toast.error("Invalid shipping address. Please select a different address.");
    } else if (message?.toLowerCase().includes("product")) {
      toast.error("One or more products are no longer available.");
    } else {
      toast.error(message || "Failed to process checkout. Please try again.");
    }
  } else {
    toast.error("Failed to process checkout. Please try again.");
  }
  setIsProcessing(false);
}
```

7. Also disable the "Place Order" button when `shippingLoading` is true.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <done>Cart shows "Calculated at checkout" dynamically; Checkout fetches shipping cost per address and shows it in summary; Total includes shipping cost; Checkout errors are parsed for stock/address/availability specifics; TypeScript compiles clean.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| CartContext → localStorage | Cart state persisted client-side; stockQuantity may be stale if product is refreshed |
| Checkout → backend API | Shipping cost fetched from backend; must handle non-200 gracefully |
| Checkout → Stripe redirect | Order placement must succeed before redirect; errors must surface before navigation |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-quick-01 | Tampering | CartContext | accept | Cart is localStorage-only, no PII; stale stockQuantity is a UX issue, not a security issue |
| T-quick-02 | Information Disclosure | Checkout error messages | mitigate | Parse backend error messages but don't expose internal stack traces or IDs to user; only show human-readable messages |
| T-quick-03 | Denial of Service | Shipping cost API | accept | Frontend makes one call per address selection; no abuse vector at this layer |
</threat_model>

<verification>
- `npx tsc --noEmit` passes with zero errors
- Shop page: products with `stockQuantity: 0` show "Out of Stock" button
- Shop page: products with low stock (≤5) show "Only X left in stock"
- Cart: quantity +/- buttons respect stock limits
- Checkout: selecting an address triggers shipping cost fetch
- Checkout: total reflects subtotal + shipping cost
- Checkout: order failure shows specific message (stock/address/unavailable)
</verification>

<success_criteria>
- Product interface includes `stockQuantity`
- Cart enforces per-product stock limits
- Shop page is stock-aware with visual indicators
- Checkout dynamically calculates and displays shipping cost
- Checkout errors are granular and user-friendly
- TypeScript compiles with zero errors
</success_criteria>

<output>
After completion, create `.planning/quick/260728-kqe-update-angular-frontend-for-dynamic-ship/260728-kqe-SUMMARY.md`
</output>
