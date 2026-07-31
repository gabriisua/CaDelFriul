import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AuthNotFound() {
  return (
    <div className="text-center">
      <h2 className="font-heading text-xl font-semibold">
        Page Not Found
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist. It may have been
        moved or deleted.
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
