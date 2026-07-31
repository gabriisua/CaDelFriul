"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { fetchProfile } from "@/lib/api";

const cards = [
  {
    title: "Upcoming Reservation",
    value: "No upcoming reservations",
    href: "/dashboard/reservations",
    label: "View reservations",
  },
  {
    title: "Active Orders",
    value: "No active orders",
    href: "/dashboard/orders",
    label: "View orders",
  },
  {
    title: "Saved Addresses",
    value: "0 addresses saved",
    href: "/dashboard/addresses",
    label: "Manage addresses",
  },
  {
    title: "Profile",
    value: "Complete your profile",
    href: "/dashboard/profile",
    label: "Edit profile",
  },
];

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile()
      .then((user) => setUserName(user.firstName))
      .catch(() => {
        /* not authenticated — Guest fallback stays */
      });
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold md:text-3xl">
        Welcome, {userName || "Guest"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Manage your reservations, orders, and account settings.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                {card.title}
              </CardTitle>
              <CardDescription>{card.value}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={card.href}
                className="text-sm font-medium text-accent hover:underline"
              >
                {card.label} &rarr;
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
