import ExperienceCard from "../_components/ExperienceCard";

const experiences = [
  {
    title: "Spa & Wellness",
    duration: "2 hours",
    description:
      "Rejuvenate body and mind with our signature treatments using local Friulian ingredients — honey, grapeseed oil, and mountain herbs.",
  },
  {
    title: "Wine Tasting",
    duration: "1.5 hours",
    description:
      "Sample the finest Collio and Friuli wines guided by our resident sommelier, featuring vintages from nearby estates.",
  },
  {
    title: "Cooking Class",
    duration: "3 hours",
    description:
      "Learn to prepare authentic Friulian dishes — from frico to gnocchi di susine — with our chef in the resort kitchen.",
  },
  {
    title: "Olive Grove Tour",
    duration: "1 hour",
    description:
      "Stroll through our centuries-old olive groves and learn about traditional oil production, with a tasting of our own extra virgin olive oil.",
  },
  {
    title: "Truffle Hunting",
    duration: "4 hours",
    description:
      "Join a local trifolau and trained dogs in the woods of Friuli for an unforgettable truffle hunt, followed by a tasting.",
  },
  {
    title: "Cycling the Collio",
    duration: "Half day",
    description:
      "Explore the rolling hills of the Collio wine region on a guided e-bike tour, with stops at panoramic viewpoints and vineyards.",
  },
];

export default function ExperiencesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h1 className="font-heading text-3xl font-semibold md:text-4xl">
        Experiences & Activities
      </h1>
      <p className="mt-3 text-muted-foreground">
        Immerse yourself in the culture, flavors, and landscapes of Friuli with our
        curated selection of experiences.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {experiences.map((exp) => (
          <ExperienceCard key={exp.title} {...exp} />
        ))}
      </div>
    </div>
  );
}
