import type { Metadata } from "next";
import { Fraunces, Inter, Geist_Mono, Lora } from "next/font/google";
import { getLocale } from "next-intl/server";
import "@/styles/globals.css";

const displayFont = Fraunces({
  variable: "--font-display-brand",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Fraunces' Latin-Extended glyphs have misplaced macrons (ē, ā, ī render as
// "e¯"), so Latvian pages swap the display face to Lora — see variables.css.
const latvianDisplayFont = Lora({
  variable: "--font-display-lv",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  // Only used on /lv; don't make English pages download it.
  preload: false,
});

const uiFont = Inter({
  variable: "--font-ui-brand",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "nurvishop — Fresh finds, friendly prices",
    template: "%s | nurvishop",
  },
  description:
    "nurvishop — a modern store for lifestyle goods, accessories and everyday favourites. Fresh, likable, and easy to trust.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-touch-icon.svg" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "nurvishop",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${displayFont.variable} ${latvianDisplayFont.variable} ${uiFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
