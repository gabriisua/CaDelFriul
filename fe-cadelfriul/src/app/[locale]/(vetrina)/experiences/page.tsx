import Link from "next/link";
import { Sparkles, Wine, ChefHat, Leaf, Search, Bike } from "lucide-react";

const experiences = [
  {
    title: "Spa & Wellness",
    duration: "2 hours",
    description:
        "Rejuvenate body and mind with our signature treatments using local Friulian ingredients — honey, grapeseed oil, and mountain herbs.",
    icon: Sparkles,
    href: "#",
    highlight: false,
  },
  {
    title: "Wine Tasting",
    duration: "1.5 hours",
    description:
        "Sample the finest Collio and Friuli wines guided by our resident sommelier, featuring vintages from nearby estates.",
    icon: Wine,
    href: "#",
    highlight: false,
  },
  {
    title: "Cooking Class",
    duration: "3 hours",
    description:
        "Learn to prepare authentic Friulian dishes — from frico to gnocchi di susine — with our chef in the resort kitchen.",
    icon: ChefHat,
    href: "#",
    highlight: false,
  },
  {
    title: "Olive Grove Tour",
    duration: "1 hour",
    description:
        "Stroll through our centuries-old olive groves and learn about traditional oil production, with a tasting of our own extra virgin olive oil.",
    icon: Leaf,
    href: "#",
    highlight: false,
  },
  {
    title: "Truffle Hunting",
    duration: "4 hours",
    description:
        "Join a local trifolau and trained dogs in the woods of Friuli for an unforgettable truffle hunt, followed by a tasting.",
    icon: Search,
    href: "#",
    highlight: false,
  },
  {
    title: "Cycling the Collio",
    duration: "Half day",
    description:
        "Explore the rolling hills of the Collio wine region on a guided e-bike tour, with stops at panoramic viewpoints and vineyards.",
    icon: Bike,
    href: "/experiences/e-bikes", // Il collegamento reale alla tua nuova pagina!
    highlight: true,
  },
];

export default function ExperiencesPage() {
  return (
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-12 max-w-2xl">
          <h1 className="font-heading text-4xl font-semibold text-brand-text md:text-5xl mb-4">
            Experiences & Activities
          </h1>
          <p className="text-lg leading-relaxed text-brand-muted">
            Immerse yourself in the culture, flavors, and landscapes of Friuli with our curated selection of experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {experiences.map((exp, index) => {
            const Icon = exp.icon;
            return (
                <Link
                    key={index}
                    href={exp.href}
                    className={`group flex flex-col rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
                ${
                        exp.highlight
                            ? "border-accent/50 ring-1 ring-accent/20"
                            : "border-border"
                    }
              `}
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div
                        className={`rounded-lg p-3 ${
                            exp.highlight
                                ? "bg-accent/10 text-accent"
                                : "bg-muted text-muted-foreground"
                        }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="font-heading text-xl font-semibold text-foreground transition-colors group-hover:text-accent">
                      {exp.title}
                    </h2>
                  </div>

                  <p className="mb-6 flex-grow text-sm leading-relaxed text-muted-foreground">
                    {exp.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {exp.duration}
                </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  Discover <span aria-hidden="true">&rarr;</span>
                </span>
                  </div>
                </Link>
            );
          })}
        </div>
      </div>
  );
}