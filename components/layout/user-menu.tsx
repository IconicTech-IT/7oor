"use client";

import { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Tooltip } from "@/components/ui/tooltip";

type Props = {
  user: { email: string; role: string | null } | null;
};

export function UserMenu({ user }: Props) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh();
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        <User className="h-4 w-4" />
        {t("login")}
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <Tooltip label={t("account")}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5 text-foreground hover:bg-foreground/10"
          aria-label={t("account")}
        >
          <User className="h-5 w-5" />
        </button>
      </Tooltip>
      {open && (
        <div className="absolute end-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-border bg-card py-1.5 shadow-xl">
          <p className="truncate px-4 py-2 text-xs text-muted">{user.email}</p>
          <Link
            href="/account/orders"
            className="block px-4 py-2 text-sm hover:bg-foreground/5"
            onClick={() => setOpen(false)}
          >
            {t("myOrders")}
          </Link>
          <Link
            href="/account/requests"
            className="block px-4 py-2 text-sm hover:bg-foreground/5"
            onClick={() => setOpen(false)}
          >
            {t("myRequests")}
          </Link>
          {(user.role === "admin" || user.role === "staff") && (
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm font-medium text-primary hover:bg-foreground/5"
              onClick={() => setOpen(false)}
            >
              {t("admin")}
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-start text-sm text-danger hover:bg-foreground/5"
          >
            {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}
