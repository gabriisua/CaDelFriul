"use client";

import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const RESORT_COORDS = { lat: 46.187583, lng: 12.89075 };

export default function ContactPage() {
  const locale = useLocale();
  const t = useTranslations("Contact");

  const mapSrc = `https://maps.google.com/maps?q=${RESORT_COORDS.lat},${RESORT_COORDS.lng}&hl=${locale}&z=15&output=embed`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h1 className="font-heading text-3xl font-semibold md:text-4xl">
        Get in Touch
      </h1>
      <p className="mt-3 text-muted-foreground">
        We&apos;d love to hear from you. Reach out with questions, special requests, or to
        start planning your stay.
      </p>

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        {/* Contact details */}
        <div>
          <h2 className="font-heading text-2xl font-semibold">Contact Details</h2>
          <dl className="mt-6 space-y-6">
            <div>
              <dt className="text-sm font-medium text-foreground">Address</dt>
              <dd className="mt-1 text-muted-foreground">
                Via del Resort, 1<br />
                33010 Friuli, Italy
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-foreground">Phone</dt>
              <dd className="mt-1 text-muted-foreground">+39 0432 123 456</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-foreground">Email</dt>
              <dd className="mt-1 text-muted-foreground">info@cadelfriul.it</dd>
            </div>
          </dl>

          {/* Map */}
          <div className="mt-8">
            <h2 className="font-heading text-2xl font-semibold">
              {t("whereToFindUs")}
            </h2>
            <div className="mt-4 overflow-hidden rounded-xl shadow-md">
              <iframe
                src={mapSrc}
                title={t("mapAria")}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[400px] w-full border-0 md:h-[500px]"
              />
            </div>
          </div>
        </div>

        {/* Contact form placeholder */}
        <div>
          <h2 className="font-heading text-2xl font-semibold">Send a Message</h2>
          <form className="mt-6 space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                rows={5}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Your message..."
                required
              ></textarea>
            </div>
            <Button type="submit" variant="default">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
