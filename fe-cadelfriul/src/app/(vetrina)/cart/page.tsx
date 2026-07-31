"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getImageUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { items, cartTotal, updateQuantity, removeFromCart } = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    setShippingLoading(true);
    // Cart page has no address context — reset loading after a brief moment
    // Real shipping calculation happens at checkout when address is known
    const timer = setTimeout(() => setShippingLoading(false), 300);
    return () => clearTimeout(timer);
  }, [items]);

  useEffect(() => {
    if (isMounted && !loading && !isAuthenticated) {
      localStorage.removeItem("cadelfriul_cart");
      router.push("/login");
    }
  }, [isMounted, loading, isAuthenticated, router]);

  if (!isMounted || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 size-16 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-heading text-2xl font-semibold">
            Please sign in to view your cart
          </h2>
          <p className="mt-3 text-muted-foreground">
            You need to be authenticated to access your shopping cart.
          </p>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "mt-8"
            )}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="flex flex-col items-center text-center">
          <ShoppingBag className="mb-6 size-16 text-muted-foreground/30" />
          <h1 className="font-heading text-3xl font-semibold">
            Your cart is empty
          </h1>
          <p className="mt-3 text-muted-foreground">
            Discover our curated selection of Friulian products and local
            treasures.
          </p>
          <Link
            href="/shop"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "mt-8"
            )}
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h1 className="font-heading text-3xl font-semibold md:text-4xl">
        Shopping Cart
      </h1>
      <p className="mt-3 text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"} in your cart
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-lg border border-border p-4 sm:items-center"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted sm:size-24">
                <Image
                  src={getImageUrl(item.imageUrl)}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-heading text-base font-semibold">
                    {item.productName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    &euro;{item.price.toFixed(2)} each
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      &euro;{(item.price * item.quantity).toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.productId)}
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border border-border p-6">
            <h2 className="font-heading text-lg font-semibold">
              Order Summary
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  &euro;{cartTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">
                  {shippingLoading ? "Calculating..." : "Calculated at checkout"}
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-accent">
                    &euro;{cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/checkout"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "mt-6 w-full"
              )}
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/shop"
              className="mt-3 block text-center text-sm text-muted-foreground hover:text-accent"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
