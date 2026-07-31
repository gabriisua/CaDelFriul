import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function VetrinaNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-3xl font-semibold">
        Page Not Found
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist. It may have been
        moved or deleted.
      </p>
      <div className="mt-8">
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
