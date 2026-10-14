// App locales map to a concrete Intl locale so currency output is stable
// regardless of the runtime's default region ("en" keeps the original en-US
// look: "€5.91"; "lv" gives "5,91 €").
const INTL_LOCALES: Record<string, string> = {
  en: "en-US",
  lv: "lv-LV",
};

export function toIntlLocale(locale: string): string {
  return INTL_LOCALES[locale] ?? locale;
}

export function formatPrice(
  amount: number | string,
  currency: string = "EUR",
  locale: string = "en-US"
): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(toIntlLocale(locale), {
    style: "currency",
    currency,
  }).format(numericAmount);
}
