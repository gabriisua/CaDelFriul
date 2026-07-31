export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h1 className="font-heading text-3xl font-semibold md:text-4xl">
        Our Story
      </h1>

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <div>
          <h2 className="font-heading text-2xl font-semibold">
            A Legacy in the Heart of Friuli
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Nestled among the rolling hills of the Collio wine region, Ca&apos; Del Friul
            has been a sanctuary of Italian hospitality for over a century. What began as a
            modest country estate has blossomed into one of Italy&apos;s most cherished resort
            destinations — a place where every stone tells a story and every meal celebrates
            the land.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Our family has tended these grounds through five generations, preserving the
            traditions of Friulian craftsmanship, cuisine, and warmth. Today, we welcome
            guests from around the world to experience the simple, profound beauty of this
            corner of Italy.
          </p>
          <h2 className="mt-10 font-heading text-2xl font-semibold">
            Our Philosophy
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            We believe true luxury is found in authenticity — in the taste of a sun-ripened
            tomato, the scent of hay in a summer meadow, the warmth of a handshake from a
            local winemaker. Every experience at Ca&apos; Del Friul is designed to connect you
            with the soul of this land.
          </p>
        </div>
        <div className="flex items-center justify-center rounded-lg bg-secondary p-16 text-center">
          <p className="text-sm italic text-muted-foreground">
            [Visual placeholder — heritage imagery]
          </p>
        </div>
      </div>
    </div>
  );
}
