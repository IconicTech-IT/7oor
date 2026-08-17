import { getTranslations } from "next-intl/server";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold">{t("register")}</h1>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <RegisterForm />
      </div>
    </div>
  );
}
