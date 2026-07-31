"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { fetchProduct, getImageUrl, type Product } from "@/lib/api";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplets,
  ImageOff,
  Images,
  Info,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";

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

function humanizeAttributeKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProduct(id)
      .then((p) => {
        if (!cancelled) {
          setProduct(p);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProduct(null);
          setError("Failed to load product. Please try again later.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const fullImageUrls = useMemo(
    () => (product?.imageUrls ?? []).map(getImageUrl),
    [product]
  );

  const maxQuantity =
    product?.stockQuantity ?? Number.MAX_SAFE_INTEGER;

  const handleAddToCart = () => {
    if (!product) return;
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
      imageUrl:
        product.imageUrls.length > 0
          ? getImageUrl(product.imageUrls[0])
          : "",
      stockQuantity: product.stockQuantity,
      quantity,
    });
    toast.success(`${product.name} added to cart`);
  };

  const scrollCarousel = (dir: "prev" | "next") => {
    if (!product || product.imageUrls.length === 0) return;
    const len = product.imageUrls.length;
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
      {loading && !product ? (
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="md:hidden">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <div className="hidden md:block">
            <Skeleton className="h-[600px] w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ) : error && !product ? (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : product ? (
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* Left column: image gallery */}
          <section aria-label={`${product.name} photo gallery (${id})`}>
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
              {/* Desktop bento grid */}
              <div className="relative hidden md:grid gap-2 md:grid-cols-[2fr_1fr]">
                {fullImageUrls.length === 1 ? (
                  <div className="group relative h-[600px] overflow-hidden rounded-xl">
                    <GalleryImage
                      src={fullImageUrls[0]}
                      alt={product.name}
                      priority
                      className="transition duration-500 hover:scale-105 group-hover:brightness-110"
                    />
                  </div>
                ) : (
                  <>
                    <div className="group relative h-[600px] overflow-hidden rounded-xl">
                      <GalleryImage
                        src={fullImageUrls[0]}
                        alt={product.name}
                        priority
                        className="transition duration-500 hover:scale-105 group-hover:brightness-110"
                      />
                    </div>
                    <div
                      className={cn(
                        "grid gap-2",
                        fullImageUrls.length === 2
                          ? "grid-cols-1"
                          : "grid-cols-2"
                      )}
                    >
                      {fullImageUrls.slice(1).map((img, i) => (
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
                  {fullImageUrls.map((img, i) => (
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
                  {fullImageUrls.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "size-2 rounded-full",
                        i === mobileIndex
                          ? "bg-accent"
                          : "bg-muted-foreground/30"
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
                  {fullImageUrls.map((img, i) => (
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
                    setQuantity((q) => Math.min(maxQuantity, q + 1))
                  }
                  disabled={quantity >= maxQuantity}
                  className="flex size-10 items-center justify-center rounded-r-full disabled:opacity-40"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            {product.stockQuantity !== undefined &&
              product.stockQuantity <= 5 &&
              product.stockQuantity > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Only {product.stockQuantity} left in stock
                </p>
              )}

            <Button
              variant="default"
              size="lg"
              className="mt-6 w-full"
              onClick={handleAddToCart}
              disabled={
                !product.available ||
                !isAuthenticated ||
                product.stockQuantity === 0
              }
            >
              <ShoppingCart className="mr-2 size-4" />
              {!isAuthenticated
                ? "Sign In to Buy"
                : product.stockQuantity === 0
                  ? "Out of Stock"
                  : !product.available
                    ? "Unavailable"
                    : "Add to Cart"}
            </Button>

            {product.attributes &&
              Object.keys(product.attributes).length > 0 && (
                <>
                  <Separator className="my-8" />
                  <h2 className="font-heading text-lg font-semibold">
                    Product Details
                  </h2>
                  <div className="mt-4 divide-y divide-border border-y border-border">
                    {Object.entries(product.attributes).map(([key, value]) => {
                      const Icon =
                        key === "ingredients"
                          ? Droplets
                          : key === "usage"
                            ? Sparkles
                            : key === "volume"
                              ? Package
                              : Info;
                      return (
                        <details key={key} className="group">
                          <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                            <span className="flex items-center gap-2">
                              <Icon
                                className="size-4 text-accent"
                                aria-hidden
                              />
                              {humanizeAttributeKey(key)}
                            </span>
                            <ChevronDown
                              className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
                              aria-hidden
                            />
                          </summary>
                          <p className="pb-4 text-sm text-muted-foreground">
                            {value}
                          </p>
                        </details>
                      );
                    })}
                  </div>
                </>
              )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
