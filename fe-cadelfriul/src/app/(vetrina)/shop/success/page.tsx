"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const clearedRef = useRef(false);
  const [countdown, setCountdown] = useState(6);

  const sessionId = searchParams.get("session_id");

  // Clear cart on mount (ref guard for React strict mode)
  useEffect(() => {
    if (!clearedRef.current) {
      clearedRef.current = true;
      clearCart();
    }
  }, [clearCart]);

  // Auto-redirect after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard/orders");
    }, 6000);

    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [router]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <div className="flex flex-col items-center text-center">
        <CheckCircle className="mb-6 size-16 text-emerald-600" />
        <h1 className="font-heading text-3xl font-semibold">
          Grazie per il tuo ordine!
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Il tuo ordine è stato confermato. Riceverai una email di conferma a
          breve.
        </p>
        <Link
          href="/dashboard/orders"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "mt-8"
          )}
        >
          Gestisci i tuoi ordini
        </Link>
        <Link
          href="/shop"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "mt-4"
          )}
        >
          Continua lo shopping
        </Link>
        {countdown > 0 && (
          <p className="mt-6 text-sm text-muted-foreground">
            Reindirizzamento tra {countdown}s…
          </p>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 size-16 animate-pulse rounded-full bg-muted" />
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-4 w-80 animate-pulse rounded bg-muted" />
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
