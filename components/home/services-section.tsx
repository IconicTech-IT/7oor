import { getTranslations } from "next-intl/server";
import { Printer, Copy, PenTool } from "lucide-react";
import { Link } from "@/i18n/navigation";

export async function ServicesSection() {
  const t = await getTranslations("home.services");

  const services = [
    { icon: Copy, key: "photocopy" },
    { icon: Printer, key: "print" },
    { icon: PenTool, key: "write" },
  ] as const;

  return (
    <div className="flex h-full w-full items-center bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-aos="fade-up" className="mb-10 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wide text-accent">
            {t("eyebrow")}
          </span>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-primary-foreground/80">{t("subtitle")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {services.map(({ icon: Icon, key }, i) => (
            <div
              key={key}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              className="flex flex-col gap-3 rounded-2xl bg-background/10 p-6 backdrop-blur-sm"
            >
              <Icon className="h-8 w-8 text-accent" />
              <h3 className="text-lg font-bold">{t(`items.${key}`)}</h3>
            </div>
          ))}
        </div>

        <Link
          href="/requests"
          data-aos="fade-up"
          className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          {t("cta")}
        </Link>
      </div>
    </div>
  );
}
