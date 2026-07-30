"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { FaLinkedinIn, FaInstagram } from "react-icons/fa6";
import { NurviLogo } from "../NurviLogo";
import { COMPANY } from "@/lib/utils/constants";
import { openCookieSettings } from "@/components/shared/CookieConsent/CookieConsent";
import visaLogo from "@/assets/visa-logo.svg";
import mastercardLogo from "@/assets/mastercard-logo.svg";
import pciDssLogo from "@/assets/pci-dss-compliant-logo-vector.svg";

const linkClass =
  "text-sm text-muted transition-[color,padding] duration-200 hover:pl-1 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-mist">
      <div className="mx-auto max-w-container px-4 lg:px-8">
        <div className="grid grid-cols-1 gap-10 pb-10 pt-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-8">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-extrabold tracking-[-0.04em] text-accent"
            >
              <NurviLogo size={30} />
              <span>nurvishop</span>
            </Link>
            <p className="max-w-[280px] text-sm leading-relaxed text-muted">
              Fresh finds, friendly prices. nurvishop brings you lifestyle goods, accessories and everyday favourites — polished enough to pay with confidence.
            </p>
            <div className="mt-2 flex gap-2">
              {process.env.NEXT_PUBLIC_LINKEDIN_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_LINKEDIN_URL}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-well text-muted transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
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
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-well text-muted transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram size={16} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[0.8125rem] font-bold uppercase tracking-wide text-ink">Shop</h3>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              <li><Link href="/catalog" className={linkClass}>{nav("catalog")}</Link></li>
              <li><Link href="/catalog?sort=newest" className={linkClass}>New Arrivals</Link></li>
              <li><Link href="/catalog?onSale=true" className={linkClass}>Sale</Link></li>
              <li><Link href="/catalog?sort=popular" className={linkClass}>Best Sellers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[0.8125rem] font-bold uppercase tracking-wide text-ink">{nav("account")}</h3>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              <li><Link href="/auth/login" className={linkClass}>{nav("login")}</Link></li>
              <li><Link href="/account/orders" className={linkClass}>My Orders</Link></li>
              <li><Link href="/account/wishlist" className={linkClass}>Wishlist</Link></li>
              <li><Link href="/contact" className={linkClass}>{t("contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[0.8125rem] font-bold uppercase tracking-wide text-ink">Info</h3>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              <li><Link href="/policies/terms" className={linkClass}>{t("terms")}</Link></li>
              <li><Link href="/policies/privacy" className={linkClass}>{t("privacy")}</Link></li>
              <li><Link href="/policies/returns" className={linkClass}>{t("returns")}</Link></li>
              <li><Link href="/policies/shipping" className={linkClass}>Shipping Policy</Link></li>
              <li><Link href="/policies/warranty" className={linkClass}>Warranty</Link></li>
              <li><Link href="/policies/payment" className={linkClass}>Payment Policy</Link></li>
              <li><Link href="/policies/cookies" className={linkClass}>Cookie Policy</Link></li>
              <li>
                <button
                  type="button"
                  onClick={openCookieSettings}
                  className="cursor-pointer border-none bg-transparent p-0 text-left text-sm text-muted transition-[color,padding] duration-200 hover:pl-1 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-line py-5">
          <p className="m-0 max-w-[900px] text-xs leading-relaxed text-subtle">
            {COMPANY.tradingName} is a trading name of <strong>{COMPANY.legalName}</strong>, a company
            registered in England and Wales (company no. {COMPANY.companyNumber}).
            {" "}Registered office: {COMPANY.addressInline}.
          </p>
          <p className="m-0 max-w-[900px] text-xs leading-relaxed text-subtle">
            VAT is included in all product prices where applicable. {COMPANY.legalName} is the Merchant of
            Record for orders placed on this website.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 border-t border-line py-6 md:flex-row md:justify-between">
          <p className="text-xs text-subtle">
            {t("copyright", { year: currentYear, storeName: "nurvishop" })}
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center">
              <Image src={visaLogo} alt="Visa" height={100} width={100} className="!h-auto !w-[60px] object-contain" />
            </span>
            <span className="flex items-center justify-center">
              <Image src={mastercardLogo} alt="Mastercard" height={100} width={100} className="!h-auto !w-[60px] object-contain" />
            </span>
            <span className="flex items-center justify-center">
              <Image src={pciDssLogo} alt="PCI DSS Compliant" height={100} width={100} className="!h-auto !w-[60px] object-contain" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
