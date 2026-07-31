"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  fetchAddresses,
  getImageUrl,
  placeOrder,
  createCheckoutSession,
  AuthError,
  type Address,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MapPin, ShoppingBag } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, cartTotal } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rimuoviamo loadingShipping, ora il calcolo è istantaneo!
  const [shippingCost, setShippingCost] = useState<number>(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetchAddresses(user.id)
        .then((addr) => {
          setAddresses(addr);
          const defaultAddr = addr.find((a) => a.isDefaultShipping);
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          else if (addr.length > 0) setSelectedAddressId(addr[0].id);
        })
        .catch(() => setError("Failed to load your addresses."))
        .finally(() => setLoadingAddresses(false));
  }, [user]);

  // NUOVO CALCOLO SPEDIZIONE FRONTEND (Istantaneo)
  useEffect(() => {
    if (!selectedAddressId || items.length === 0) {
      setShippingCost(0);
      return;
    }

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

    if (selectedAddress) {
      const country = selectedAddress.country?.trim().toLowerCase();
      const isItaly = country === "it" || country === "italia" || country === "italy";

      if (!isItaly) {
        setShippingCost(15.00);
      } else if (cartTotal >= 50.00) {
        setShippingCost(0.00);
      } else {
        setShippingCost(5.90);
      }
    }
  }, [selectedAddressId, addresses, cartTotal, items.length]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create order (Il backend farà comunque il suo calcolo di sicurezza)
      const order = await placeOrder({
        shippingAddressId: selectedAddressId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      // Step 2: Create Stripe checkout session
      const { sessionUrl } = await createCheckoutSession(order.id);

      // Step 3: Redirect to Stripe
      window.location.href = sessionUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      if (err instanceof AuthError) {
        const body = err.body as Record<string, unknown> | null;
        const message =
            body && typeof body === "object" && "message" in body
                ? String((body as { message: string }).message)
                : null;

        if (message?.toLowerCase().includes("stock")) {
          // Ora passiamo l'esatto messaggio del backend all'utente!
          toast.error(message);
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
  };

  if (authLoading) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <Skeleton className="h-8 w-48" />
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
    );
  }

  if (!user) return null;

  if (items.length === 0) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
          <div className="flex flex-col items-center text-center">
            <ShoppingBag className="mb-6 size-16 text-muted-foreground/30" />
            <h1 className="font-heading text-3xl font-semibold">
              Your cart is empty
            </h1>
            <p className="mt-3 text-muted-foreground">
              Add some products before checking out.
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
          Checkout
        </h1>
        <p className="mt-3 text-muted-foreground">
          Review your order and select a shipping address.
        </p>

        {error && (
            <div className="mt-6 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {/* Left: Address selection */}
          <div className="lg:col-span-2">
            <h2 className="font-heading text-lg font-semibold">
              Shipping Address
            </h2>
            {loadingAddresses ? (
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
            ) : addresses.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed border-border p-6 text-center">
                  <MapPin className="mx-auto mb-3 size-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No saved addresses found.
                  </p>
                  <Link
                      href="/dashboard/addresses"
                      className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
                  >
                    Add an address in your dashboard
                  </Link>
                </div>
            ) : (
                <div className="mt-4 space-y-3">
                  {addresses.map((addr) => (
                      <label
                          key={addr.id}
                          className={cn(
                              "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                              selectedAddressId === addr.id
                                  ? "border-accent bg-accent/5"
                                  : "border-border hover:border-border/80"
                          )}
                      >
                        <input
                            type="radio"
                            name="shipping-address"
                            value={addr.id}
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 accent-accent"
                        />
                        <div className="text-sm">
                          <p className="font-medium">
                            {addr.street} {addr.houseNumber}
                          </p>
                          <p className="text-muted-foreground">
                            {addr.zipCode} {addr.city}, {addr.province}
                          </p>
                          <p className="text-muted-foreground">{addr.country}</p>
                          {addr.additionalInfo && (
                              <p className="mt-1 text-muted-foreground">
                                {addr.additionalInfo}
                              </p>
                          )}
                          {addr.isDefaultShipping && (
                              <span className="mt-1 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        Default
                      </span>
                          )}
                        </div>
                      </label>
                  ))}
                </div>
            )}
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border border-border p-6">
              <h2 className="font-heading text-lg font-semibold">
                Order Summary
              </h2>
              <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
                {items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                            src={getImageUrl(item.imageUrl)}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="48px"
                        />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-muted-foreground">
                          Qty: {item.quantity} &times; &euro;{item.price.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                    &euro;{(item.price * item.quantity).toFixed(2)}
                  </span>
                    </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                  &euro;{cartTotal.toFixed(2)}
                </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                  {shippingCost === 0
                      ? "Free"
                      : `€${shippingCost.toFixed(2)}`}
                </span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span className="text-accent">
                    &euro;{(cartTotal + shippingCost).toFixed(2)}
                  </span>
                  </div>
                </div>
              </div>
              <Button
                  variant="default"
                  size="lg"
                  className="mt-6 w-full"
                  onClick={handlePlaceOrder}
                  disabled={
                      isProcessing || addresses.length === 0 || !selectedAddressId
                  }
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </div>
  );
}