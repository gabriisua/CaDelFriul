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
import {
  fetchProfile,
  fetchCustomerDashboard,
  type CustomerDashboardResponse,
} from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardCard = {
  title: string;
  href: string;
  label: string;
  value?: string;
};

const cards: DashboardCard[] = [
  {
    title: "Upcoming Reservation",
    href: "/dashboard/reservations",
    label: "View reservations",
  },
  {
    title: "Active Orders",
    href: "/dashboard/orders",
    label: "View orders",
  },
  {
    title: "Saved Addresses",
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
  const [dashboard, setDashboard] = useState<CustomerDashboardResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile()
      .then((user) => setUserName(user.firstName))
      .catch(() => {
        /* not authenticated — Guest fallback stays */
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchCustomerDashboard();
        if (!cancelled) setDashboard(data);
      } catch {
        if (!cancelled) setDashboard(null); // graceful fallback: cards show placeholder text
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cardDescription = (card: DashboardCard): string => {
    switch (card.title) {
      case "Upcoming Reservation":
        return dashboard?.upcomingReservation
          ? `${dashboard.upcomingReservation.room.name} · ${dashboard.upcomingReservation.checkInDate}`
          : "No upcoming reservations";
      case "Active Orders":
        return dashboard && dashboard.activeOrdersCount > 0
          ? `${dashboard.activeOrdersCount} active order${
              dashboard.activeOrdersCount > 1 ? "s" : ""
            }`
          : "No active orders";
      case "Saved Addresses":
        return dashboard
          ? `${dashboard.savedAddressesCount} addresses saved`
          : "0 addresses saved";
      default:
        return card.value ?? "";
    }
  };

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
              {card.title === "Profile" ? (
                <CardDescription>{card.value}</CardDescription>
              ) : loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <CardDescription>{cardDescription(card)}</CardDescription>
              )}
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
