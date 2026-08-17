import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";

export async function HeroSection() {
  const t = await getTranslations("home.hero");

  return (
    <div className="relative flex h-full w-full items-center overflow-hidden bg-foreground text-background">
      <div className="pointer-events-none absolute -end-32 -top-32 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
      <div className="pointer-events-none absolute -start-24 bottom-0 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background/10 px-3 py-1 text-xs font-semibold tracking-wide text-background/90">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          {t("eyebrow")}
        </span>
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-6xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-base text-background/80 sm:text-lg">{t("subtitle")}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/products"
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            {t("cta")}
          </Link>
          <Link
            href="/requests"
            className="rounded-full border border-background/30 px-6 py-3 text-sm font-bold text-background transition-colors hover:bg-background/10"
          >
            {t("ctaSecondary")}
          </Link>
        </div>
      </div>
    </div>
  );
}
