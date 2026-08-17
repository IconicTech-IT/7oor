import { getTranslations } from "next-intl/server";
import { MapPin, Phone, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "./logo";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tContact = await getTranslations("contact");
  const tNav = await getTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">{t("tagline")}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-foreground">{t("quickLinks")}</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {[
              { href: "/products", label: tNav("products") },
              { href: "/requests", label: tNav("requests") },
              { href: "/policy", label: tNav("policy") },
              { href: "/contact", label: tNav("contact") },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-muted hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-foreground">{t("contactUs")}</h3>
          <ul className="mt-3 flex flex-col gap-2.5 text-sm text-muted">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{tContact("address")}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <span dir="ltr">+20 100 000 0000</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>9:00 AM – 11:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {year} 7oor Store — {t("rights")}
      </div>
    </footer>
  );
}
