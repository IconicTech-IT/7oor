import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategoryIcon } from "@/lib/category-icons";
import { localized } from "@/lib/types";
import { DrawIn } from "@/components/ui/draw-in";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { Category } from "@/lib/types";

export async function CategoriesSection({ categories }: { categories: Category[] }) {
  const t = await getTranslations("home.categories");
  const locale = await getLocale();

  return (
    <div className="w-full bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <ScrollReveal className="mb-8 max-w-lg">
          <span className="text-xs font-bold uppercase tracking-wide text-primary">
            {t("eyebrow")}
          </span>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">{t("title")}</h2>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((cat, i) => {
            const Icon = getCategoryIcon(cat.slug);
            return (
              <ScrollReveal key={cat.id} scale={0.85} delay={i * 0.08}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                >
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <DrawIn duration={700} delay={i * 60} replayOnHover>
                      <Icon className="h-7 w-7" />
                    </DrawIn>
                  </span>
                  <span className="text-sm font-bold">
                    {localized(locale, cat.name_ar, cat.name_en)}
                  </span>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
