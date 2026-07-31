"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/addresses", label: "Addresses" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/reservations", label: "Reservations" },
];

export default function SidebarNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // best-effort logout — still redirect
    }
    router.push("/");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {!isMounted ? (
        <div className="flex items-center gap-3 px-6 py-6">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center gap-3 px-6 py-6">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ) : user ? (
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
            {user.firstName.charAt(0).toUpperCase()}
            {user.lastName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-sidebar-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex size-10 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
            G
          </div>
          <div>
            <p className="text-sm font-medium text-sidebar-foreground">Guest</p>
            <p className="text-xs text-muted-foreground">Not signed in</p>
          </div>
        </div>
      )}

      <Separator />

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent/10 text-accent border-l-2 border-accent"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6 space-y-2">
        <Separator className="mb-4" />
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Home className="size-4" />
          Back to Shop
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogOut className="mr-2 size-4" />
          {loggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
      >
        {mobileOpen ? (
          <X className="size-5 text-foreground" />
        ) : (
          <Menu className="size-5 text-foreground" />
        )}
      </button>

      <aside className="hidden h-full w-64 shrink-0 border-r border-border bg-sidebar md:block">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-64 bg-sidebar shadow-lg">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
