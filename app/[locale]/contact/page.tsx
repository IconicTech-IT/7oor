import { getTranslations } from "next-intl/server";
import { MapPin, Phone, Clock } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="max-w-xl">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted">{t("subtitle")}</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div data-aos="fade-up" className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-bold">{t("address")}</p>
                <p className="text-sm text-muted">
                  123 شارع التحرير، وسط البلد، القاهرة
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-bold">{t("phone")}</p>
                <p dir="ltr" className="text-sm text-muted">
                  +20 100 000 0000
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-bold">{t("hours")}</p>
                <p className="text-sm text-muted">9:00 AM – 11:00 PM</p>
              </div>
            </div>
          </div>

          <div className="aspect-video overflow-hidden rounded-2xl border border-border">
            <iframe
              title="map"
              className="h-full w-full"
              loading="lazy"
              src="https://www.google.com/maps?q=Cairo,Egypt&output=embed"
            />
          </div>
        </div>

        <div data-aos="fade-up" className="rounded-2xl border border-border bg-card p-6">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
