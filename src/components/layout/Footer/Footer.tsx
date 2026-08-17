"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { toast } from "sonner";
import { FaLinkedinIn, FaInstagram } from "react-icons/fa6";
import { CreditCard, ShieldCheck, Leaf, ArrowRight } from "lucide-react";
import { NurviLogo } from "../NurviLogo";
import { COMPANY } from "@/lib/utils/constants";
import { openCookieSettings } from "@/components/shared/CookieConsent/CookieConsent";
import visaLogo from "@/assets/visa.svg";
import mastercardLogo from "@/assets/mastercard.svg";
import pciDssLogo from "@/assets/pci-dss.svg";

const linkClass =
  "inline-block text-sm text-[#A89C8D] transition-[color,padding] duration-200 hover:pl-1 hover:text-[#F0E9DF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded";

type FooterColumn = {
  heading: string;
  links: { label: string; href: string }[];
};

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thanks for subscribing!");
      setEmail("");
    }
  };

  const columns: FooterColumn[] = [
    {
      heading: "Shop by room",
      links: [
        { label: nav("catalog"), href: "/catalog" },
        { label: "New arrivals", href: "/catalog?sort=newest" },
        { label: "Best sellers", href: "/catalog?sort=popular" },
        { label: "Sale", href: "/catalog?onSale=true" },
      ],
    },
    {
      heading: "Customer care",
      links: [
        { label: t("shipping"), href: "/policies/shipping" },
        { label: t("returns"), href: "/policies/returns" },
        { label: "Warranty", href: "/policies/warranty" },
        { label: "Care guides", href: "/faq" },
        { label: t("contact"), href: "/contact" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: t("about"), href: "/about" },
        { label: "My orders", href: "/account/orders" },
        { label: "Wishlist", href: "/account/wishlist" },
        { label: nav("login"), href: "/auth/login" },
      ],
    },
  ];

  return (
    <footer className="mt-auto bg-[#2B241D] text-[#F0E9DF]">
      <div className="mx-auto max-w-container px-4 lg:px-8">
        {/* Tier 1 — brand + newsletter */}
        <div className="grid grid-cols-1 gap-10 pb-12 pt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-display text-2xl font-semibold tracking-[-0.02em] text-[#F0E9DF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <NurviLogo size={30} />
              <span>nurvishop</span>
            </Link>
            <p className="max-w-[340px] font-display text-lg italic leading-relaxed text-[#F0E9DF]/90">
              Thoughtful things for a softer home.
            </p>
            <p className="max-w-[360px] text-sm leading-relaxed text-[#A89C8D]">
              Fresh finds, friendly prices. nurvishop brings you lifestyle goods,
              accessories and everyday favourites — polished enough to pay with
              confidence.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="eyebrow text-accent">Join the letter</p>
            <p className="max-w-[420px] text-sm leading-relaxed text-[#F0E9DF]/90">
              Join us for slow interiors, new arrivals and quiet offers.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex w-full max-w-[460px] flex-col gap-2 sm:flex-row"
            >
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex-1 rounded-pill border border-[#5C6B4F]/40 bg-[#F0E9DF]/[0.06] px-5 py-3 text-sm text-[#F0E9DF] outline-none transition-[border-color,background-color] duration-200 placeholder:text-[#A89C8D] focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/50"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-pill bg-accent px-6 py-3 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-accent-hover active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                Subscribe
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* sage hairline */}
        <div className="h-px w-full bg-[#5C6B4F]/30" />

        {/* Tier 2 — link columns (accordions on mobile) */}
        <div className="grid grid-cols-1 gap-x-8 py-4 md:grid-cols-3 md:py-12">
          {columns.map((col) => (
            <details
              key={col.heading}
              open
              className="group border-b border-[#5C6B4F]/30 py-4 md:border-0 md:py-0 md:[&_summary]:pointer-events-none [&[open]_.footer-chevron]:rotate-45"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#F0E9DF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 md:mb-5 md:cursor-default">
                {col.heading}
                <span
                  aria-hidden="true"
                  className="footer-chevron text-lg leading-none text-[#A89C8D] transition-transform duration-200 md:hidden"
                >
                  +
                </span>
              </summary>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0 pt-4 md:pt-0">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        {/* sage hairline */}
        <div className="h-px w-full bg-[#5C6B4F]/30" />

        {/* Tier 3 — trust row */}
        <div className="flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <span className="inline-flex items-center gap-2 text-sm text-[#A89C8D]">
              <ShieldCheck size={18} className="text-sage" />
              Secure checkout
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-[#A89C8D]">
              <Leaf size={18} className="text-sage" />
              Thoughtfully sourced materials
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-[#A89C8D]">
              <CreditCard size={18} className="text-sage" />
              Trusted payments
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-14 items-center justify-center rounded-md bg-[#F0E9DF] px-2">
                <Image src={visaLogo} alt="Visa" height={100} width={100} className="!h-auto !max-h-6 !w-auto !max-w-full object-contain" />
              </span>
              <span className="flex h-9 w-14 items-center justify-center rounded-md bg-[#F0E9DF] px-2">
                <Image src={mastercardLogo} alt="Mastercard" height={100} width={100} className="!h-auto !max-h-6 !w-auto !max-w-full object-contain" />
              </span>
              <span className="flex h-9 w-14 items-center justify-center rounded-md bg-[#F0E9DF] px-2">
                <Image src={pciDssLogo} alt="PCI DSS Compliant" height={100} width={100} className="!h-auto !max-h-6 !w-auto !max-w-full object-contain" />
              </span>
            </div>
            <div className="flex gap-2">
              {process.env.NEXT_PUBLIC_LINKEDIN_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_LINKEDIN_URL}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#5C6B4F]/40 text-[#A89C8D] transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedinIn size={16} />
                </a>
              )}
              {process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#5C6B4F]/40 text-[#A89C8D] transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram size={16} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* sage hairline */}
        <div className="h-px w-full bg-[#5C6B4F]/30" />

        {/* Company legal details */}
        <div className="flex flex-col gap-1.5 py-6">
          <p className="m-0 max-w-[900px] text-xs leading-relaxed text-[#A89C8D]">
            {COMPANY.tradingName} is a trading name of{" "}
            <strong className="text-[#F0E9DF]">{COMPANY.legalName}</strong>, a company
            registered in Lithuania (company no. {COMPANY.companyNumber}).
            {" "}Registered office: {COMPANY.addressInline}.
          </p>
          <p className="m-0 max-w-[900px] text-xs leading-relaxed text-[#A89C8D]">
            VAT is included in all product prices where applicable. {COMPANY.legalName} is
            the Merchant of Record for orders placed on this website.
          </p>
        </div>

        {/* Tier 4 — bottom legal bar */}
        <div className="flex flex-col items-center gap-4 border-t border-[#5C6B4F]/30 py-6 md:flex-row md:justify-between">
          <p className="m-0 text-xs text-[#A89C8D]">
            {t("copyright", { year: currentYear, storeName: "nurvishop" })}
          </p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Legal">
            <Link href="/policies/privacy" className={linkClass}>{t("privacy")}</Link>
            <Link href="/policies/terms" className={linkClass}>{t("terms")}</Link>
            <Link href="/policies/cookies" className={linkClass}>Cookies</Link>
            <Link href="/policies/accessibility" className={linkClass}>Accessibility</Link>
            <Link href="/policies/legal" className={linkClass}>Legal notice</Link>
            <button
              type="button"
              onClick={openCookieSettings}
              className="cursor-pointer border-none bg-transparent p-0 text-left text-sm text-[#A89C8D] transition-[color,padding] duration-200 hover:pl-1 hover:text-[#F0E9DF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              Cookie settings
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
