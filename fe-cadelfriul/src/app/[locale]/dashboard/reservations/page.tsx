"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMyRoomReservations, type RoomReservationResponse } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function statusBadgeClass(status: RoomReservationResponse["status"]): string {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
  }
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<RoomReservationResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMyRoomReservations();
        if (!cancelled) {
          // Filtra via le prenotazioni CANCELLED prima di salvarle nello stato
          const filteredData = data.filter((res) => res.status !== "CANCELLED");
          setReservations(filteredData);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load reservations. Please try again later.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Reservations</h1>
      <p className="mt-2 text-muted-foreground">
        View and manage your upcoming and past reservations.
      </p>

      {loading && (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-full">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">{error}</p>
        </div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">No reservations yet.</p>
          <Link
            href="/rooms"
            className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Explore our rooms
          </Link>
        </div>
      )}

      {!loading && !error && reservations.length > 0 && (
        <div className="mt-8 space-y-4">
          {reservations.map((res) => (
            <Card key={res.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-heading text-lg">
                      {res.room.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {`RES-${res.id.substring(0, 8).toUpperCase()}`}
                    </p>
                  </div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(
                      res.status
                    )}`}
                  >
                    {res.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Check-in</p>
                    <p className="font-medium">{res.checkInDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Check-out</p>
                    <p className="font-medium">{res.checkOutDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium text-accent">
                      €{res.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
