import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function VetrinaHomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-3xl">
        <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
          Discover the Heart of Friuli
        </h1>
        <p className="mt-6 text-lg text-foreground/70 md:text-xl">
          Where tradition meets timeless elegance
        </p>
        <div className="mt-10">
          <Link
            href="/rooms"
            className={cn(buttonVariants({ variant: "default", size: "lg" }))}
          >
            Explore Our Resort
          </Link>
        </div>
      </div>
    </div>
  );
}
