"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getImageUrl } from "@/lib/api";
import { Link } from "@/i18n/navigation";

interface ProductCardProps {
  name: string;
  price: string;
  description: string;
  imageUrls?: string[]; // ✅ Modificato da imageIds a imageUrls
  href?: string;
}

export default function ProductCard({
                                      name,
                                      price,
                                      description,
                                      imageUrls = [], // ✅ Modificato qui
                                      href,
                                    }: ProductCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgSrc, setImgSrc] = useState(
      imageUrls.length > 0 ? getImageUrl(imageUrls[0]) : ""
  );

  const navigate = (dir: "prev" | "next") => {
    if (imageUrls.length < 2) return;
    const next =
        dir === "next"
            ? (currentIndex + 1) % imageUrls.length
            : (currentIndex - 1 + imageUrls.length) % imageUrls.length;
    setCurrentIndex(next);
    setImgSrc(getImageUrl(imageUrls[next]));
  };

  return (
      <Card className="group overflow-hidden border-t-2 border-accent pt-0 transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {imageUrls.length > 0 ? (
              <>
                <Image
                    src={imgSrc}
                    alt={name}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    onError={() => setImgSrc("/placeholder-room.jpg")}
                />
                {imageUrls.length > 1 && (
                    <>
                      <button
                          type="button"
                          onClick={() => navigate("prev")}
                          className="absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button
                          type="button"
                          onClick={() => navigate("next")}
                          className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                      <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5">
                        {imageUrls.map((_, idx) => (
                            <span
                                key={idx}
                                className={`size-2 rounded-full ${
                                    idx === currentIndex
                                        ? "bg-accent"
                                        : "bg-muted-foreground/30"
                                }`}
                            />
                        ))}
                      </div>
                    </>
                )}
              </>
          ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm text-gray-500">
                No image
              </div>
          )}
        </div>
        <CardHeader>
          <CardTitle className="font-heading text-xl font-semibold">
            {href ? (
              <Link href={href} className="transition-colors hover:text-accent">
                {name}
              </Link>
            ) : (
              name
            )}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-accent">{price}</p>
        </CardContent>
      </Card>
  );
}