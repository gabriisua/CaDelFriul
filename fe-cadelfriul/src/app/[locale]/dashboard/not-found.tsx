import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h2 className="font-heading text-xl font-semibold">
        Page Not Found
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist. It may have been
        moved or deleted.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
