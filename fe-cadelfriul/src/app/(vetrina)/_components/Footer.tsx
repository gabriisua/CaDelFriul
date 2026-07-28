import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="font-heading text-lg font-semibold">Ca' Del Friul</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A premium Italian resort nestled in the heart of Friuli. Where tradition
              meets timeless elegance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground/60">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/rooms" className="transition-colors hover:text-accent">Rooms & Suites</Link></li>
              <li><Link href="/experiences" className="transition-colors hover:text-accent">Experiences</Link></li>
              <li><Link href="/shop" className="transition-colors hover:text-accent">Shop</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-accent">About Us</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-accent">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground/60">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Via del Resort, 1</li>
              <li>33010 Friuli, Italy</li>
              <li>+39 0432 123 456</li>
              <li>info@cadelfriul.it</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground/60">
              Follow Us
            </h4>
            <ul className="space-y-2 text-sm">
              <li><span className="transition-colors hover:text-accent cursor-default">Instagram</span></li>
              <li><span className="transition-colors hover:text-accent cursor-default">Facebook</span></li>
              <li><span className="transition-colors hover:text-accent cursor-default">TripAdvisor</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          &copy; 2026 Ca' Del Friul. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
