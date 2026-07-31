"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Bike, Calendar, Check } from "lucide-react";

interface EBike {
  id: string;
  modelName: string;
  description: string;
  pricePerDay: number;
  imageUrl: string;
}

const eBikes: EBike[] = [
  {
    id: "city-cruiser",
    modelName: "Friuli City Cruiser",
    description:
      "A relaxed city-style e-bike perfect for gentle rides around the resort grounds and along the quiet country lanes that weave through our vineyards.",
    pricePerDay: 29,
    imageUrl:
      "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "collio-trail",
    modelName: "Collio Trail E-MTB",
    description:
      "A trail-capable e-MTB built for the rolling hills of the Collio, with punchy assist on climbs and stable geometry for gravel paths and panoramic viewpoints.",
    pricePerDay: 49,
    imageUrl:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "alpina-premium",
    modelName: "Alpina Premium E-MTB",
    description:
      "Our premium full-suspension e-MTB with a high-capacity battery and refined drivetrain — the choice for longer expeditions into the Collio hills.",
    pricePerDay: 69,
    imageUrl:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80",
  },
];

interface BikeCardProps {
  bike: EBike;
  selected: boolean;
  onSelect: () => void;
}

function BikeCard({ bike, selected, onSelect }: BikeCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected && "ring-2 ring-accent ring-offset-2"
      )}
    >
      <Card
        className={cn(
          "overflow-hidden border-t-2 border-accent pt-0 transition-shadow hover:shadow-lg",
          selected && "bg-accent/5"
        )}
      >
        <div className="relative h-48 w-full bg-muted">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center">
              <Bike className="size-12 text-muted-foreground/30" />
            </div>
          ) : (
            <Image
              src={bike.imageUrl}
              alt={bike.modelName}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
              onError={() => setImgError(true)}
            />
          )}
          {selected && (
            <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Check className="size-4" />
            </span>
          )}
        </div>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-semibold">
            {bike.modelName}
          </CardTitle>
          <CardDescription>{bike.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-accent">
            €{bike.pricePerDay} / day
          </p>
        </CardContent>
      </Card>
    </button>
  );
}

export default function EBikesPage() {
  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toLocaleDateString("en-CA");
  const datesValid =
    startDate !== "" && endDate !== "" && startDate >= todayStr && endDate > startDate;
  const numberOfDays = datesValid
    ? Math.round(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000
      )
    : 0;
  const selectedBike = eBikes.find((b) => b.id === selectedBikeId) ?? null;
  const totalPrice = selectedBike && datesValid ? selectedBike.pricePerDay * numberOfDays : 0;

  const handleBook = () => {
    if (!selectedBike || !datesValid || isSubmitting) return;
    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Booking request sent successfully!");
      setSelectedBikeId(null);
      setStartDate("");
      setEndDate("");
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h1 className="font-heading text-3xl font-semibold md:text-4xl">
        Rent an E-Bike
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Explore the resort surroundings at your own pace — glide through our
        vineyards, climb into the Collio hills, and reach the most beautiful
        panoramic viewpoints on a whisper-quiet e-bike.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Left: bike selection */}
        <div className="lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold">
            Choose Your E-Bike
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {eBikes.map((bike) => (
              <BikeCard
                key={bike.id}
                bike={bike}
                selected={selectedBikeId === bike.id}
                onSelect={() => setSelectedBikeId(bike.id)}
              />
            ))}
          </div>
        </div>

        {/* Right: booking panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border border-border p-6">
            <h2 className="font-heading text-lg font-semibold">
              Book Your Ride
            </h2>
            <Calendar className="mb-4 mt-2 size-5 text-accent" aria-hidden />
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  min={todayStr}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
                {startDate !== "" && startDate < todayStr && (
                  <p className="mt-1 text-sm text-destructive">
                    Start date cannot be in the past.
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  min={startDate || todayStr}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                />
                {endDate !== "" && endDate <= startDate && (
                  <p className="mt-1 text-sm text-destructive">
                    End date must be after the start date.
                  </p>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bike</span>
                <span
                  className={cn(
                    "font-medium",
                    !selectedBike && "text-muted-foreground"
                  )}
                >
                  {selectedBike?.modelName ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days</span>
                <span
                  className={cn(
                    "font-medium",
                    !datesValid && "text-muted-foreground"
                  )}
                >
                  {datesValid
                    ? `${numberOfDays} ${numberOfDays === 1 ? "day" : "days"}`
                    : "—"}
                </span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span
                    className={cn(
                      "text-accent",
                      !(datesValid && selectedBike) && "text-muted-foreground"
                    )}
                  >
                    {datesValid && selectedBike
                      ? `€${totalPrice.toFixed(2)}`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="default"
              size="lg"
              className="mt-6 w-full"
              onClick={handleBook}
              disabled={!selectedBike || !datesValid || isSubmitting}
            >
              {isSubmitting ? "Sending request…" : "Book Now"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
