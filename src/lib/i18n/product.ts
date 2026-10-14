// Product content is stored in English with per-locale overrides in
// Product.translations (filled by scripts/translate-products.ts). Every field
// falls back to the English original when a translation is missing.

export const PRODUCT_TRANSLATABLE_FIELDS = [
  "name",
  "shortDescription",
  "description",
  "metaTitle",
  "metaDescription",
  "characteristics",
] as const;

type TranslatableField = (typeof PRODUCT_TRANSLATABLE_FIELDS)[number];
type ProductTranslation = Partial<Record<TranslatableField, unknown>>;

function translationFor(translations: unknown, locale: string): ProductTranslation | null {
  if (!translations || typeof translations !== "object") return null;
  const t = (translations as Record<string, unknown>)[locale];
  return t && typeof t === "object" ? (t as ProductTranslation) : null;
}

/**
 * Returns a copy of `product` with translatable fields replaced by the
 * `locale` version when present. `translations` is stripped from the result so
 * it never leaks into client props or API payloads.
 */
export function localizeProduct<T extends { translations?: unknown }>(
  product: T,
  locale: string,
): Omit<T, "translations"> {
  const { translations, ...rest } = product;
  const tr = translationFor(translations, locale);
  if (!tr) return rest;
  const out: Record<string, unknown> = { ...rest };
  for (const field of PRODUCT_TRANSLATABLE_FIELDS) {
    if (!(field in rest)) continue;
    const value = tr[field];
    if (value !== null && value !== undefined && value !== "") out[field] = value;
  }
  return out as Omit<T, "translations">;
}

/** Just the localized name, for places that only select `name` + `translations`. */
export function localizedProductName(name: string, translations: unknown, locale: string): string {
  const value = translationFor(translations, locale)?.name;
  return typeof value === "string" && value ? value : name;
}
