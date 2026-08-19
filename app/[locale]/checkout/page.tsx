import { getTranslations } from "next-intl/server";
import { getDeliveryFee, getPaymentInfo } from "@/lib/data/products";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const t = await getTranslations("checkout");
  const [deliveryFee, paymentInfo] = await Promise.all([getDeliveryFee(), getPaymentInfo()]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-extrabold">{t("title")}</h1>
      <CheckoutForm deliveryFee={deliveryFee} paymentInfo={paymentInfo} />
    </div>
  );
}
