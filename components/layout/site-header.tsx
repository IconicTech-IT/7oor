import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "./logo";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { HeaderNav } from "./header-nav";
import { UserMenu } from "./user-menu";
import { CartButton } from "@/components/cart/cart-button";
import { CartDrawer } from "@/components/cart/cart-drawer";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

  const links = [
    { href: "/", label: t("home") },
    { href: "/products", label: t("products") },
    { href: "/contact", label: t("contact") },
    { href: "/requests", label: t("requests") },
    { href: "/policy", label: t("policy") },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Logo />
            <HeaderNav links={links} />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <CartButton />
            <UserMenu user={user ? { email: user.email ?? "", role } : null} />
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
