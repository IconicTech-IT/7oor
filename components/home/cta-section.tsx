import { getTranslations } from "next-intl/server";
import { MapPin, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export async function CtaSection() {
  const t = await getTranslations("home.cta");
  const tContact = await getTranslations("contact");

  return (
    <div className="w-full bg-foreground text-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <ScrollReveal as="h2" className="text-3xl font-extrabold sm:text-5xl">
          {t("title")}
        </ScrollReveal>
        <ScrollReveal as="p" delay={0.08} className="max-w-lg text-background/80">
          {t("subtitle")}
        </ScrollReveal>
        <ScrollReveal
          direction="left"
          delay={0.16}
          className="mt-2 flex items-center justify-center gap-4 text-xs text-background/70 sm:gap-6 sm:text-sm"
        >
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {tContact("address")}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4" /> {tContact("hoursValue")}
          </span>
        </ScrollReveal>
        <ScrollReveal direction="right" delay={0.24}>
          <Link
            href="/contact"
            className="mt-4 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            {t("cta")}
          </Link>
        </ScrollReveal>
      </div>
    </div>
  );
}
