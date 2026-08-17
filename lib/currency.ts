export function formatEGP(amount: number, locale: string = "ar") {
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return locale === "ar" ? `${formatted} ج.م` : `E£${formatted}`;
}
