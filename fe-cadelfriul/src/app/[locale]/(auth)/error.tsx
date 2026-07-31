"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center">
      <h2 className="font-heading text-xl font-semibold">
        Something went wrong
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Please try refreshing the page. If the problem persists, contact us.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
