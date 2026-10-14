import { getTranslations } from "next-intl/server";
import { SearchX } from "lucide-react";
import { Link } from "@/i18n/routing";

// Rendered when notFound() is thrown inside the [locale] segment. The active
// locale comes from setRequestLocale() in the [locale] layout.
export default async function LocaleNotFound() {
  const t = await getTranslations("errors");

  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center px-4 py-24 text-center">
      <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-blob bg-accent-light text-accent">
        <SearchX size={30} />
      </span>
      <p className="eyebrow mb-2">404</p>
      <h1 className="mb-3 font-display text-3xl font-semibold tracking-tight text-ink">
        {t("notFound")}
      </h1>
      <p className="mb-8 text-[0.9375rem] leading-relaxed text-muted">{t("notFoundSubtitle")}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-pill bg-accent px-6 py-3 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {t("backHome")}
        </Link>
        <Link
          href="/catalog"
          className="rounded-pill border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink no-underline transition-colors duration-200 hover:bg-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {t("browseCatalog")}
        </Link>
      </div>
    </div>
  );
}
