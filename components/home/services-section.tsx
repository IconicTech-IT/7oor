import { getTranslations } from "next-intl/server";
import { Printer, Copy, PenTool } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DrawIn } from "@/components/ui/draw-in";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const services = [
  { icon: Copy, key: "photocopy" },
  { icon: Printer, key: "print" },
  { icon: PenTool, key: "write" },
] as const;

export async function ServicesSection() {
  const t = await getTranslations("home.services");

  return (
    <div className="w-full bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <ScrollReveal className="mb-10 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wide text-accent">
            {t("eyebrow")}
          </span>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-primary-foreground/80">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-3">
          {services.map(({ icon: Icon, key }, i) => (
            <ScrollReveal
              key={key}
              delay={i * 0.1}
              className="group flex flex-col gap-3 rounded-2xl bg-background/10 p-6 backdrop-blur-sm"
            >
              <DrawIn duration={800} delay={i * 100} replayOnHover>
                <Icon className="h-8 w-8 text-accent" />
              </DrawIn>
              <h3 className="text-lg font-bold">{t(`items.${key}`)}</h3>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <Link
            href="/requests"
            className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            {t("cta")}
          </Link>
        </ScrollReveal>
      </div>
    </div>
  );
}
