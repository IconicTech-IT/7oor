import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("home.hero");
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
    </div>
  );
}
