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
import { getRoomImageUrl, type Room } from "@/lib/api";

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgSrc, setImgSrc] = useState(
    room.imageUrls.length > 0 ? getRoomImageUrl(room.imageUrls[0]) : ""
  );

  const navigate = (dir: "prev" | "next") => {
    if (room.imageUrls.length < 2) return;
    const next =
      dir === "next"
        ? (currentIndex + 1) % room.imageUrls.length
        : (currentIndex - 1 + room.imageUrls.length) % room.imageUrls.length;
    setCurrentIndex(next);
    setImgSrc(getRoomImageUrl(room.imageUrls[next]));
  };

  return (
    <Card className="group overflow-hidden border-t-2 border-accent pt-0 transition-shadow hover:shadow-lg">
      <div className="relative h-48 w-full bg-muted">
        {room.imageUrls.length > 0 ? (
          <>
            <Image
              src={imgSrc}
              alt={room.name}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImgSrc("/placeholder-room.jpg")}
            />
            {room.imageUrls.length > 1 && (
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
                  {room.imageUrls.map((_, idx) => (
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
          {room.name}
        </CardTitle>
        <CardDescription className="text-sm">
          {room.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-2xl font-semibold text-accent">
          €{room.pricePerNight.toFixed(2)} / night
        </p>
        <div className="flex flex-wrap gap-2">
          {room.amenities.map((amenity) => (
            <span
              key={amenity}
              className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
            >
              {amenity}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
