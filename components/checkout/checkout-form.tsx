"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { checkoutSchema, fulfillmentStepFields, paymentStepFields } from "@/lib/validators/checkout";
import { placeOrderAction } from "@/lib/actions/checkout";
import { useCartStore, cartSubtotal, useCartHydrated } from "@/lib/store/cart";
import { useDirSign } from "@/lib/rtl";
import { getSlideVariants } from "@/lib/motion";
import type { PaymentInfo } from "@/lib/data/products";
import { OrderSummary } from "./order-summary";

const STEPS = ["fulfillment", "payment", "review"] as const;
const inputClass =
  "w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none";

export function CheckoutForm({
  deliveryFee,
  paymentInfo,
}: {
  deliveryFee: number;
  paymentInfo: PaymentInfo;
}) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "ar" | "en";
  const router = useRouter();
  const dirSign = useDirSign();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const hydrated = useCartHydrated();
  const [step, setStep] = useState(0);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const subtotal = cartSubtotal(items);

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted">{tCart("empty")}</p>
        <Link href="/products" className="mt-4 inline-block text-sm font-bold text-primary hover:underline">
          {tCart("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <Formik
      initialValues={{
        fulfillmentMethod: "pickup" as "pickup" | "delivery",
        deliveryAddress: "",
        paymentMethod: "cash" as "cash" | "instapay" | "vodafone_cash" | "other_wallet",
      }}
      validationSchema={checkoutSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const formData = new FormData();
        formData.set(
          "items",
          JSON.stringify(
            items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty })),
          ),
        );
        formData.set("fulfillmentMethod", values.fulfillmentMethod);
        if (values.deliveryAddress) formData.set("deliveryAddress", values.deliveryAddress);
        formData.set("paymentMethod", values.paymentMethod);
        if (screenshot) formData.set("screenshot", screenshot);

        const result = await placeOrderAction(formData);
        if (result.error || !result.orderId) {
          toast.error(result.error ?? tCommon("error"));
          setSubmitting(false);
          return;
        }
        clearCart();
        toast.success(t("orderPlaced"));
        router.push(`/account/orders/${result.orderId}`);
      }}
    >
      {({ values, validateForm, setTouched, isSubmitting }) => {
        const isDelivery = values.fulfillmentMethod === "delivery";
        const needsScreenshot = values.paymentMethod !== "cash";
        const total = subtotal + (isDelivery ? deliveryFee : 0);
        // Which account the customer must transfer to. Empty when the admin hasn't filled it
        // in yet under Admin -> Settings, in which case we render nothing rather than an
        // empty box — the screenshot upload alone would otherwise be unanswerable.
        const payToAccount =
          values.paymentMethod === "instapay"
            ? paymentInfo.instapay
            : values.paymentMethod === "vodafone_cash"
              ? paymentInfo.vodafoneCash
              : values.paymentMethod === "other_wallet"
                ? paymentInfo.otherWalletNote
                : "";

        async function goNext() {
          const stepFields = step === 0 ? fulfillmentStepFields : paymentStepFields;
          const allErrors = await validateForm();
          const hasError = stepFields.some((f) => Boolean((allErrors as Record<string, unknown>)[f]));
          if (hasError) {
            setTouched(Object.fromEntries(stepFields.map((f) => [f, true])));
            return;
          }
          if (step === 1 && needsScreenshot && !screenshot) {
            toast.error(t("uploadScreenshot"));
            return;
          }
          setStep((s) => Math.min(s + 1, STEPS.length - 1));
        }

        return (
          <Form className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-8 flex items-center gap-2">
                {STEPS.map((s, i) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= step ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={getSlideVariants(dirSign)}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="min-h-[280px] rounded-2xl border border-border bg-card p-6"
                >
                  {step === 0 && (
                    <div className="flex flex-col gap-5">
                      <h2 className="text-lg font-bold">{t("fulfillment")}</h2>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(["pickup", "delivery"] as const).map((method) => (
                          <label
                            key={method}
                            className={`cursor-pointer rounded-xl border p-4 text-sm font-semibold transition-colors ${
                              values.fulfillmentMethod === method
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border"
                            }`}
                          >
                            <Field
                              type="radio"
                              name="fulfillmentMethod"
                              value={method}
                              className="hidden"
                            />
                            {t(method)}
                          </label>
                        ))}
                      </div>
                      {isDelivery && (
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold">
                            {t("deliveryAddress")}
                          </label>
                          <Field as="textarea" rows={3} name="deliveryAddress" className={inputClass} />
                          <ErrorMessage
                            name="deliveryAddress"
                            component="p"
                            className="mt-1 text-xs text-danger"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {step === 1 && (
                    <div className="flex flex-col gap-5">
                      <h2 className="text-lg font-bold">{t("payment")}</h2>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(["cash", "instapay", "vodafone_cash", "other_wallet"] as const).map(
                          (method) => (
                            <label
                              key={method}
                              className={`cursor-pointer rounded-xl border p-4 text-sm font-semibold transition-colors ${
                                values.paymentMethod === method
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-border"
                              }`}
                            >
                              <Field
                                type="radio"
                                name="paymentMethod"
                                value={method}
                                className="hidden"
                              />
                              {t(
                                method === "vodafone_cash"
                                  ? "vodafoneCash"
                                  : method === "other_wallet"
                                    ? "otherWallet"
                                    : method,
                              )}
                            </label>
                          ),
                        )}
                      </div>
                      {needsScreenshot && payToAccount && (
                        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                          <p className="text-sm font-semibold text-primary">{t("sendPaymentTo")}</p>
                          <p dir="ltr" className="mt-1 select-all break-all text-base font-bold text-foreground">
                            {payToAccount}
                          </p>
                        </div>
                      )}
                      {needsScreenshot && (
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold">
                            {t("uploadScreenshot")}
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setScreenshot(e.currentTarget.files?.[0] ?? null)}
                            className="w-full text-sm"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="flex flex-col gap-3">
                      <h2 className="text-lg font-bold">{tCommon("confirm")}</h2>
                      <p className="text-sm text-muted">
                        {t("fulfillment")}: <b className="text-foreground">{t(values.fulfillmentMethod)}</b>
                      </p>
                      {isDelivery && (
                        <p className="text-sm text-muted">
                          {t("deliveryAddress")}:{" "}
                          <b className="text-foreground">{values.deliveryAddress}</b>
                        </p>
                      )}
                      <p className="text-sm text-muted">
                        {t("payment")}:{" "}
                        <b className="text-foreground">
                          {t(
                            values.paymentMethod === "vodafone_cash"
                              ? "vodafoneCash"
                              : values.paymentMethod === "other_wallet"
                                ? "otherWallet"
                                : values.paymentMethod,
                          )}
                        </b>
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 flex justify-between">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="rounded-full border border-border px-6 py-3 text-sm font-bold hover:border-primary"
                  >
                    {tCommon("back")}
                  </button>
                ) : (
                  <span />
                )}
                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
                  >
                    {tCommon("next")}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
                  >
                    {isSubmitting ? tCommon("loading") : t("placeOrder")}
                  </button>
                )}
              </div>
            </div>

            <OrderSummary
              items={items}
              subtotal={subtotal}
              deliveryFee={isDelivery ? deliveryFee : 0}
              total={total}
              locale={locale}
            />
          </Form>
        );
      }}
    </Formik>
  );
}
