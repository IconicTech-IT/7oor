import { getTranslations } from "next-intl/server";
import { MapPin, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";

export async function CtaSection() {
  const t = await getTranslations("home.cta");
  const tContact = await getTranslations("contact");

  return (
    <div className="flex h-full w-full items-center bg-foreground text-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-4 text-center sm:px-6 lg:px-8">
        <h2 data-aos="fade-up" className="text-3xl font-extrabold sm:text-5xl">
          {t("title")}
        </h2>
        <p data-aos="fade-up" className="max-w-lg text-background/80">
          {t("subtitle")}
        </p>
        <div
          data-aos="fade-up"
          className="mt-2 flex flex-wrap items-center justify-center gap-6 text-sm text-background/70"
        >
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {tContact("address")}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4" /> 9:00 AM – 11:00 PM
          </span>
        </div>
        <Link
          href="/contact"
          data-aos="fade-up"
          className="mt-4 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          {t("cta")}
        </Link>
      </div>
    </div>
  );
}
