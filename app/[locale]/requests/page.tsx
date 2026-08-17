import { getLocale, getTranslations } from "next-intl/server";
import { getCategoryTree } from "@/lib/data/categories";
import { getProductBySlug } from "@/lib/data/products";
import { RequestForm } from "@/components/requests/request-form";
import { localized } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product: productSlug } = await searchParams;
  const t = await getTranslations("requests");
  const locale = await getLocale();
  const categories = await getCategoryTree();

  let prefillDescription: string | undefined;
  if (productSlug) {
    const product = await getProductBySlug(productSlug);
    if (product) {
      const name = localized(locale, product.name_ar, product.name_en);
      prefillDescription =
        locale === "ar" ? `بخصوص: ${name}\n\n` : `Regarding: ${name}\n\n`;
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("subtitle")}</p>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <RequestForm categories={categories} prefillDescription={prefillDescription} />
      </div>
    </div>
  );
}
