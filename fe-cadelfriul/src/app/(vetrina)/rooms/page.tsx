"use client";

import { useEffect, useState } from "react";
import RoomCard from "../_components/RoomCard";
import { fetchRooms, type Room } from "@/lib/api";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms()
      .then(setRooms)
      .catch(() => setError("Failed to load rooms. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h1 className="font-heading text-3xl font-semibold md:text-4xl">
        Rooms & Suites
      </h1>
      <p className="mt-3 text-muted-foreground">
        Discover our carefully appointed rooms, each designed to reflect the
        warmth and character of Friuli.
      </p>

      {loading && (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {error && (
        <p className="mt-10 text-center text-destructive">{error}</p>
      )}

      {!loading && !error && rooms.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">
          No rooms available at the moment.
        </p>
      )}

      {!loading && !error && rooms.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
