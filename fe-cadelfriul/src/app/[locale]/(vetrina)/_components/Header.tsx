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

          {/* RIVOLUZIONE UX: CTA + Auth + Cart + Language */}
          <div className="flex items-center gap-4 md:gap-6">

            {/* 1. Language Switcher */}
            <div className="hidden md:flex items-center">
              <LanguageSwitcher />
            </div>

            {/* Divisore elegante (solo desktop) */}
            <div className="hidden h-5 w-px bg-border md:block"></div>

            {/* 2. User Actions (Cart + Account/Login) */}
            <div className="flex items-center gap-3">

              {/* Cart */}
              <Link
                  href="/cart"
                  className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "relative text-foreground transition-opacity hover:opacity-80"
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

              {/* Auth Group */}
              {isAuthenticated ? (
                  <div className="hidden md:flex items-center gap-1 rounded-lg border border-border p-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <User className="size-4" />
                      <span>{t("dashboard")}</span>
                    </Link>
                    <button
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        onClick={handleLogout}
                        aria-label={t("logout")}
                        title={t("logout")}
                    >
                      <LogOut className="size-4" />
                    </button>
                  </div>
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

              {/* Mobile toggle */}
              <button
                  className="md:hidden p-1 text-foreground"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
              >
                {mobileOpen ? (
                    <X className="size-6" />
                ) : (
                    <Menu className="size-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav (Invariata, è già perfetta così) */}
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
              <div className="mt-2">
                <LanguageSwitcher />
              </div>
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