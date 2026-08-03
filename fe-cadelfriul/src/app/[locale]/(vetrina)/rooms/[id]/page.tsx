"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import {
  AuthError,
  createRoomReservation,
  fetchRoom,
  fetchRoomBookedDates,
  getRoomImageUrl,
  type Room,
} from "@/lib/api";
import { computeNights, findBlockedDate, toDateKey } from "@/lib/roomBooking";
import {
  CalendarDays,
  Car,
  Check,
  Coffee,
  ImageOff,
  Snowflake,
  Users,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react";

const AMENITY_ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
  pool: Waves,
  "air conditioning": Snowflake,
  "air-conditioning": Snowflake,
  ac: Snowflake,
};

function amenityIcon(amenity: string): LucideIcon {
  return AMENITY_ICONS[amenity.toLowerCase()] ?? Check;
}

function GalleryImage({
  src,
  alt,
  className,
  preload,
}: {
  src: string;
  alt: string;
  className?: string;
  preload?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div
        className={cn(
          "flex aspect-video w-full items-center justify-center rounded-xl bg-muted",
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
      width={1200}
      height={800}
      unoptimized
      preload={preload}
      className={cn("w-full h-auto object-cover rounded-xl", className)}
      onError={() => setFailed(true)}
    />
  );
}

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [room, setRoom] = useState<Room | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DateRange | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchRoom(id), fetchRoomBookedDates(id)])
      .then(([r, dates]) => {
        if (!cancelled) {
          setRoom(r);
          setBookedDates(dates);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRoom(null);
          setError("Failed to load room. Please try again later.");
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
    () => (room?.imageUrls ?? []).map(getRoomImageUrl),
    [room]
  );
  const displayedImages = fullImageUrls.slice(0, 5);
  const extraCount = fullImageUrls.length - 5;
  const bookedKeySet = useMemo(() => new Set(bookedDates), [bookedDates]);
  const todayKey = toDateKey(new Date());
  const disabledDates = useMemo(
    () => [
      { before: new Date() },
      ...bookedDates.map((d) => new Date(`${d}T00:00:00`)),
    ],
    [bookedDates]
  );
  const nights =
    selected?.from && selected?.to
      ? computeNights(selected.from, selected.to)
      : 0;
  const total = room ? nights * room.pricePerNight : 0;

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      setSelected(undefined);
      return;
    }
    if (!range.to) {
      setSelected({ from: range.from });
      return;
    }
    if (range.to.getTime() <= range.from.getTime()) {
      setSelected({ from: range.from });
      return;
    }
    const blocked = findBlockedDate(range.from, range.to, bookedKeySet, todayKey);
    if (blocked) {
      toast.error("Selected dates overlap with an existing booking.");
      setSelected({ from: range.from });
      return;
    }
    setSelected({ from: range.from, to: range.to });
  };

  const handleReserve = async () => {
    if (!selected?.from || !selected?.to || !room || submitting) return;
    setSubmitting(true);
    try {
      await createRoomReservation({
        roomId: room.id,
        checkInDate: toDateKey(selected.from),
        checkOutDate: toDateKey(selected.to),
      });
      toast.success("Reservation confirmed!");
      router.push("/dashboard");
    } catch (err) {
      let message: string | null = null;
      if (err instanceof AuthError) {
        const body = err.body as Record<string, unknown> | null;
        message =
          body && typeof body === "object" && "message" in body
            ? String((body as { message: string }).message)
            : null;
      }
      toast.error(message || "Failed to create reservation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      {loading && !room ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-72 w-full rounded-xl sm:col-span-2" />
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </>
      ) : error && !room ? (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : room ? (
        <>
          {/* Bento gallery */}
          {fullImageUrls.length === 0 ? (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted">
              <ImageOff className="size-10 text-muted-foreground/30" aria-hidden />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {displayedImages.map((img, i) => (
                <div
                  key={img}
                  className={cn(
                    "group overflow-hidden rounded-xl",
                    i === 0 && "sm:col-span-2",
                    i === displayedImages.length - 1 &&
                      extraCount > 0 &&
                      "relative"
                  )}
                >
                  <GalleryImage
                    src={img}
                    alt={i === 0 ? room.name : `${room.name} photo ${i + 1}`}
                    preload={i === 0}
                    className="transition duration-500 hover:scale-105 group-hover:brightness-110"
                  />
                  {i === displayedImages.length - 1 && extraCount > 0 && (
                    <span className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      +{extraCount} more
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Two-column body */}
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
            <div>
              <h1 className="font-heading text-3xl font-semibold md:text-4xl">
                {room.name}
              </h1>
              <p className="mt-3 text-2xl font-semibold text-accent">
                €{room.pricePerNight.toFixed(2)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  / night
                </span>
              </p>
              {room.maxCapacity !== undefined && room.maxCapacity > 0 && (
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4 text-accent" aria-hidden />
                  Up to {room.maxCapacity} guests
                </p>
              )}
              <p className="mt-5 leading-relaxed text-muted-foreground">
                {room.description}
              </p>

              <Separator className="my-8" />

              <h2 className="font-heading text-lg font-semibold">Amenities</h2>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {room.amenities.map((amenity) => {
                  const Icon = amenityIcon(amenity);
                  return (
                    <li
                      key={amenity}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <Icon className="size-4 text-accent" aria-hidden />
                      {amenity}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Sticky booking widget */}
            <Card className="h-fit lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle className="font-heading text-lg font-semibold">
                  <CalendarDays
                    className="mr-2 inline-block size-4 text-accent"
                    aria-hidden
                  />
                  Book your stay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Calendar
                  mode="range"
                  numberOfMonths={1}
                  selected={selected}
                  onSelect={handleSelect}
                  disabled={disabledDates}
                  className="mx-auto"
                />
                {nights > 0 && selected?.from && selected?.to && (
                  <div className="space-y-1.5 rounded-md bg-muted p-3 text-sm">
                    <div className="flex justify-between">
                      <span>
                        €{room.pricePerNight.toFixed(2)} × {nights} night
                        {nights !== 1 ? "s" : ""}
                      </span>
                      <span>€{total.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>€{total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                {authLoading ? (
                  <Button disabled className="w-full" size="lg">
                    Loading...
                  </Button>
                ) : !isAuthenticated ? (
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full"
                    onClick={() => router.push(`/login?redirect=/rooms/${id}`)}
                  >
                    Log in to Reserve
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full"
                    disabled={!selected?.from || !selected?.to || submitting}
                    onClick={handleReserve}
                  >
                    {submitting ? "Reserving..." : "Reserve Now"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
