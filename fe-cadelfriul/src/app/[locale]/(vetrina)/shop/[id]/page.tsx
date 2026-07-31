"use client";

import { use, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplets,
  ImageOff,
  Images,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";

interface MockProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  images: string[];
  stockQuantity: number;
}

const product: MockProduct = {
  id: "lavender-essential-oil",
  name: "Lavender Essential Oil",
  price: 24,
  description:
    "Small-batch steam-distilled from lavender grown in our own estate fields, this calming essential oil captures the quiet of the Friulian countryside. Its soft, herbaceous aroma soothes the senses and eases the transition into rest — a ritual of pure relaxation.",
  features: [
    "100% pure steam-distilled",
    "Hand-harvested from our estate fields",
    "40ml amber glass bottle",
    "Cruelty-free & vegan",
  ],
  images: [
    "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
  ],
  stockQuantity: 10,
};

function GalleryImage({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted",
          className
        )}
      >
        <ImageOff className="size-10 text-muted-foreground/30" aria-hidden />
      </div>
    );
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      className={cn("object-cover", className)}
      sizes="(max-width: 768px) 100vw, 50vw"
      onError={() => setFailed(true)}
    />
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast("Sign in to add items to your cart", {
        description: "Create an account to start building your order.",
        action: {
          label: "Sign In",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      imageUrl: product.images[0] ?? "",
      stockQuantity: product.stockQuantity,
      quantity,
    });
    toast.success(`${product.name} added to cart`);
  };

  const scrollCarousel = (dir: "prev" | "next") => {
    const len = product.images.length;
    const next =
      dir === "next"
        ? (mobileIndex + 1) % len
        : (mobileIndex - 1 + len) % len;
    setMobileIndex(next);
    scrollRef.current?.scrollTo({
      left: next * scrollRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        {/* Left column: image gallery */}
        <section aria-label={`${product.name} photo gallery (${id})`}>
          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            {/* Desktop bento grid */}
            <div className="relative hidden md:grid gap-2 md:grid-cols-[2fr_1fr]">
              {product.images.length === 1 ? (
                <div className="group relative h-[600px] overflow-hidden rounded-xl">
                  <GalleryImage
                    src={product.images[0]}
                    alt={product.name}
                    priority
                    className="transition duration-500 hover:scale-105 group-hover:brightness-110"
                  />
                </div>
              ) : (
                <>
                  <div className="group relative h-[600px] overflow-hidden rounded-xl">
                    <GalleryImage
                      src={product.images[0]}
                      alt={product.name}
                      priority
                      className="transition duration-500 hover:scale-105 group-hover:brightness-110"
                    />
                  </div>
                  <div
                    className={cn(
                      "grid gap-2",
                      product.images.length === 2 ? "grid-cols-1" : "grid-cols-2"
                    )}
                  >
                    {product.images.slice(1).map((img, i) => (
                      <div
                        key={img}
                        className="group relative h-[290px] overflow-hidden rounded-xl"
                      >
                        <GalleryImage
                          src={img}
                          alt={`${product.name} photo ${i + 2}`}
                          className="transition duration-500 hover:scale-105 group-hover:brightness-110"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-4 right-4 z-20 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/75"
              >
                <Images className="mr-1.5 inline-block size-4" aria-hidden />
                Show all photos
              </button>
            </div>

            {/* Mobile snap carousel */}
            <div className="relative md:hidden">
              <div
                ref={scrollRef}
                className="flex snap-x snap-mandatory gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {product.images.map((img, i) => (
                  <div
                    key={img}
                    className="group relative h-[400px] w-full shrink-0 snap-center overflow-hidden rounded-xl"
                  >
                    <GalleryImage
                      src={img}
                      alt={`${product.name} photo ${i + 1}`}
                      priority={i === 0}
                      className="transition duration-500 group-hover:brightness-110"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => scrollCarousel("prev")}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel("next")}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5">
                {product.images.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "size-2 rounded-full",
                      i === mobileIndex ? "bg-accent" : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-4 right-4 z-20 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/75"
              >
                <Images className="mr-1.5 inline-block size-4" aria-hidden />
                Show all photos
              </button>
            </div>

            {/* Lightbox */}
            <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl font-semibold">
                  {product.name}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {product.images.map((img, i) => (
                  <div
                    key={img}
                    className="relative h-40 overflow-hidden rounded-lg md:h-56"
                  >
                    <GalleryImage
                      src={img}
                      alt={`${product.name} photo ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
              <DialogClose className="absolute right-4 top-4">
                <X className="size-5" />
              </DialogClose>
            </DialogContent>
          </Dialog>
        </section>

        {/* Right column: product info & buy section */}
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Estate Apothecary
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-semibold text-accent">
            €{product.price.toFixed(2)}
          </p>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            {product.description}
          </p>
          <ul className="mt-6 space-y-2">
            {product.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Check
                  className="mt-0.5 size-4 shrink-0 text-accent"
                  aria-hidden
                />
                {feature}
              </li>
            ))}
          </ul>

          <Separator className="my-8" />

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Quantity</span>
            <div className="flex items-center rounded-full border border-border">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex size-10 items-center justify-center rounded-l-full disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.min(product.stockQuantity, q + 1))
                }
                disabled={quantity >= product.stockQuantity}
                className="flex size-10 items-center justify-center rounded-r-full disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {product.stockQuantity <= 5 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Only {product.stockQuantity} left in stock
            </p>
          )}

          <Button
            variant="default"
            size="lg"
            className="mt-6 w-full"
            onClick={handleAddToCart}
            disabled={!isAuthenticated || product.stockQuantity === 0}
          >
            <ShoppingCart className="mr-2 size-4" />
            {!isAuthenticated
              ? "Sign In to Buy"
              : product.stockQuantity === 0
                ? "Out of Stock"
                : "Add to Cart"}
          </Button>

          <Separator className="my-8" />

          <h2 className="font-heading text-lg font-semibold">
            Product Details
          </h2>
          <div className="mt-4 divide-y divide-border border-y border-border">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <Droplets className="size-4 text-accent" aria-hidden />
                  Ingredients
                </span>
                <ChevronDown
                  className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="pb-4 text-sm text-muted-foreground">
                100% pure Lavandula angustifolia essential oil. No synthetic
                additives, carriers, or fillers.
              </p>
            </details>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <Sparkles className="size-4 text-accent" aria-hidden />
                  Usage
                </span>
                <ChevronDown
                  className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="pb-4 text-sm text-muted-foreground">
                Add 3–5 drops to a diffuser, or blend with a carrier oil for a
                calming massage. Avoid direct contact with eyes.
              </p>
            </details>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <Package className="size-4 text-accent" aria-hidden />
                  Volume
                </span>
                <ChevronDown
                  className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="pb-4 text-sm text-muted-foreground">
                40 ml amber glass bottle with dropper — approximately 800 drops.
                Made in small batches in Friuli.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
