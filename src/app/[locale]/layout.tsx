import { NextIntlClientProvider } from "next-intl";
import type { Metadata } from "next";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { isAppLocale } from "@/i18n/routing";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/providers/CartProvider";
import { CurrencyProvider } from "@/providers/CurrencyProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { Header } from "@/components/layout/Header/Header";
import { Footer } from "@/components/layout/Footer/Footer";
import { CookieConsent } from "@/components/shared/CookieConsent/CookieConsent";
import { HtmlLangSync } from "@/components/shared/HtmlLangSync/HtmlLangSync";
import { openGraphFor, twitterFor } from "@/lib/i18n/metadata";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("siteTitle");
  const description = t("siteDescription");

  return {
    // absolute: the root layout's "%s | nurvishop" template must not wrap the
    // site title itself (it already contains the brand).
    title: { absolute: title, template: "%s | nurvishop" },
    description,
    // No canonical/og:url here: they'd be inherited by every child page.
    openGraph: openGraphFor(locale, { title, description }),
    twitter: twitterFor({ title, description }),
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              {/* The root <html lang> isn't re-rendered on client-side locale
                  switches, so locale-specific CSS (Latvian display font) keys
                  off this wrapper, which is. */}
              <div lang={locale} className="contents">
                <HtmlLangSync locale={locale} />
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <ToastProvider />
                <CookieConsent />
              </div>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
