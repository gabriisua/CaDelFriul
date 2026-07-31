"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function VetrinaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-3xl font-semibold">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Please try refreshing the page. If the problem persists, contact us.
      </p>
      <div className="mt-8 flex gap-4">
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
