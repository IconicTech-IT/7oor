import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect, Link } from "@/i18n/navigation";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const locale = await getLocale();
    redirect({ href: "/login", locale });
  }

  const t = await getTranslations("account");
  const tNav = await getTranslations("nav");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold">{t("title")}</h1>
      <nav className="mt-6 flex gap-2 border-b border-border">
        <Link
          href="/account/orders"
          className="border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold text-muted hover:text-primary"
        >
          {tNav("myOrders")}
        </Link>
        <Link
          href="/account/requests"
          className="border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold text-muted hover:text-primary"
        >
          {tNav("myRequests")}
        </Link>
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
