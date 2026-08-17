import { getLocale, getTranslations } from "next-intl/server";

const SECTIONS_AR = [
  {
    title: "الاستلام والتوصيل",
    body: "يمكنك استلام طلبك من المحل مباشرة، أو اختيار خدمة التوصيل مقابل رسوم توصيل يتم عرضها عند إتمام الطلب. مدة التوصيل المتوقعة داخل النطاق المخدوم من يوم إلى ثلاثة أيام عمل.",
  },
  {
    title: "الدفع والتحويل",
    body: "نقبل الدفع كاش عند الاستلام أو التوصيل، أو التحويل عبر InstaPay أو فودافون كاش أو أي محفظة إلكترونية أخرى. في حالة التحويل، يجب رفع صورة إثبات التحويل عند إتمام الطلب حتى يتم تأكيده من فريقنا.",
  },
  {
    title: "سياسة الاسترجاع والاستبدال",
    body: "يمكن استرجاع أو استبدال المنتج خلال 3 أيام من الاستلام بشرط أن يكون بحالته الأصلية ولم يتم استخدامه، مع إحضار إثبات الشراء (رقم الطلب أو الفاتورة). خدمات الطباعة والتصوير والكتابة المخصصة غير قابلة للاسترجاع بعد التنفيذ.",
  },
  {
    title: "الطلبات الخاصة",
    body: "الطلبات الخاصة (منتج غير متوفر أو خدمة مخصصة) تخضع لتسعير مبدئي من فريقنا بعد مراجعة التفاصيل، ولا يتم تأكيد الطلب إلا بعد موافقتك على السعر النهائي.",
  },
  {
    title: "الخصوصية",
    body: "بياناتك (الاسم، رقم التواصل، العنوان) تُستخدم فقط لتنفيذ طلبك والتواصل معك بخصوصه، ولا تتم مشاركتها مع أي طرف ثالث غير المتعلق بتنفيذ الطلب (مثل شركات التوصيل).",
  },
];

const SECTIONS_EN = [
  {
    title: "Pickup & Delivery",
    body: "You can pick up your order in-store, or choose delivery for a fee shown at checkout. Estimated delivery time within our service area is one to three business days.",
  },
  {
    title: "Payment & Transfers",
    body: "We accept cash on pickup/delivery, or transfer via InstaPay, Vodafone Cash, or another e-wallet. For transfers, a screenshot proof must be uploaded at checkout so our team can confirm the order.",
  },
  {
    title: "Returns & Exchanges",
    body: "Items can be returned or exchanged within 3 days of receipt if unused and in original condition, with proof of purchase (order number or invoice). Printing, photocopying, and custom writing services are non-refundable once completed.",
  },
  {
    title: "Custom Requests",
    body: "Custom requests (an item we don't stock, or a custom job) receive an initial quote from our team after reviewing the details. The order is only confirmed once you approve the final price.",
  },
  {
    title: "Privacy",
    body: "Your details (name, contact info, address) are used only to fulfill your order and to reach you about it, and are never shared with third parties beyond what's needed to fulfill the order (e.g. delivery partners).",
  },
];

export default async function PolicyPage() {
  const t = await getTranslations("policy");
  const locale = await getLocale();
  const sections = locale === "ar" ? SECTIONS_AR : SECTIONS_EN;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t("title")}</h1>
      <div className="mt-8 flex flex-col gap-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-bold">{s.title}</h2>
            <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
