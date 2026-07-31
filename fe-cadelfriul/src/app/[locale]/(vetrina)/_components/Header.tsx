"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { LogOut, Menu, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "./LanguageSwitcher";

const navLinks = [
  { href: "/", key: "home" },
  { href: "/rooms", key: "rooms" },
  { href: "/experiences", key: "experiences" },
  { href: "/shop", key: "shop" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const t = useTranslations("Nav");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="font-heading text-xl font-semibold tracking-tight text-foreground"
        >
          Ca&apos; Del Friul
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm font-medium transition-colors hover:text-accent",
                  isActive
                    ? "text-accent after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-accent"
                    : "text-foreground/70"
                )}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>

        {/* CTA + Auth + Cart + Language + Mobile toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex">
            <LanguageSwitcher />
          </div>
          <Link
            href="/cart"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "relative"
            )}
            aria-label={t("cartAria")}
          >
            <ShoppingBag className="size-5" />
            {isMounted && itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "hidden md:inline-flex"
                )}
              >
                <User className="mr-2 size-4" />
                {t("dashboard")}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex text-muted-foreground"
                onClick={handleLogout}
                aria-label={t("logout")}
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "hidden md:inline-flex"
              )}
            >
              {t("signIn")}
            </Link>
          )}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="absolute left-0 right-0 top-16 border-b border-border bg-background px-4 pb-4 pt-2 md:hidden">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block py-2 text-sm font-medium transition-colors hover:text-accent",
                  isActive ? "text-accent" : "text-foreground/70"
                )}
              >
                {t(link.key)}
              </Link>
            );
          })}
          <LanguageSwitcher />
          <Link
            href="/cart"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-accent"
          >
            <ShoppingBag className="size-4" />
            {t("cart")}
            {itemCount > 0 ? ` (${itemCount})` : ""}
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "mt-3 w-full block text-center"
                )}
              >
                {t("dashboard")}
              </Link>
              <Button
                variant="ghost"
                className="mt-2 w-full text-muted-foreground"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="mr-2 size-4" />
                {t("logout")}
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "mt-3 w-full block text-center"
              )}
            >
              {t("signIn")}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
