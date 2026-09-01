import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { HeroIllustration } from "./hero-illustration";

export async function HeroSection() {
  const t = await getTranslations("home.hero");

  return (
    <div className="relative flex min-h-screen w-full items-center overflow-hidden bg-background py-20 text-foreground">
      <div className="pointer-events-none absolute -end-32 -top-32 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
      <div className="pointer-events-none absolute -start-24 bottom-0 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-1 text-xs font-semibold tracking-wide text-foreground/90">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            {t("eyebrow")}
          </span>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-6xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-base text-foreground/80 sm:text-lg">{t("subtitle")}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              {t("cta")}
            </Link>
            <Link
              href="/requests"
              className="rounded-full border border-border px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-foreground/5"
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>

        <HeroIllustration />
      </div>
    </div>
  );
}
