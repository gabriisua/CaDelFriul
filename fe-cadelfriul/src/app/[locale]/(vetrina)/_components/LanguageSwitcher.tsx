"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const languageNames: Record<string, string> = {
  en: "English",
  it: "Italiano",
  de: "Deutsch",
};

const languages = ["en", "it", "de"];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1">
      {languages.map((l) => (
        <button
          key={l}
          type="button"
          aria-label={languageNames[l]}
          title={languageNames[l]}
          onClick={() => router.replace(pathname, { locale: l })}
          className={cn(
            "text-sm font-medium px-2 py-1 rounded transition-colors",
            l === locale
              ? "text-accent bg-accent/10"
              : "text-foreground/60 hover:text-accent"
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
