"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { FaLinkedinIn, FaInstagram } from "react-icons/fa6";
import { AvontLogo } from "../AvontLogo";
import { COMPANY } from "@/lib/utils/constants";
import { openCookieSettings } from "@/components/shared/CookieConsent/CookieConsent";
import visaLogo from "@/assets/visa-logo.svg";
import mastercardLogo from "@/assets/mastercard-logo.svg";
import pciDssLogo from "@/assets/pci-dss-compliant-logo-vector.svg";
import styles from "./Footer.module.css";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
              <AvontLogo size={28} />
              <span>AvontShop</span>
            </Link>
            <p className={styles.brandDesc}>
              Your trusted source for electrical materials, wiring, and installation supplies. Professional quality delivered to your door.
            </p>
            <div className={styles.socialRow}>
              {process.env.NEXT_PUBLIC_LINKEDIN_URL && (
                <a href={process.env.NEXT_PUBLIC_LINKEDIN_URL} className={styles.socialIcon} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                  <FaLinkedinIn size={16} />
                </a>
              )}
              {process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
                <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL} className={styles.socialIcon} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <FaInstagram size={16} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className={styles.sectionTitle}>Shop</h3>
            <ul className={styles.links}>
              <li><Link href="/catalog" className={styles.link}>{nav("catalog")}</Link></li>
              <li><Link href="/catalog?sort=newest" className={styles.link}>New Arrivals</Link></li>
              <li><Link href="/catalog?onSale=true" className={styles.link}>Sale</Link></li>
              <li><Link href="/catalog?sort=popular" className={styles.link}>Best Sellers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className={styles.sectionTitle}>{nav("account")}</h3>
            <ul className={styles.links}>
              <li><Link href="/auth/login" className={styles.link}>{nav("login")}</Link></li>
              <li><Link href="/account/orders" className={styles.link}>My Orders</Link></li>
              <li><Link href="/account/wishlist" className={styles.link}>Wishlist</Link></li>
              <li><Link href="/contact" className={styles.link}>{t("contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className={styles.sectionTitle}>Info</h3>
            <ul className={styles.links}>
              <li><Link href="/policies/terms" className={styles.link}>{t("terms")}</Link></li>
              <li><Link href="/policies/privacy" className={styles.link}>{t("privacy")}</Link></li>
              <li><Link href="/policies/returns" className={styles.link}>{t("returns")}</Link></li>
              <li><Link href="/policies/shipping" className={styles.link}>Shipping Policy</Link></li>
              <li><Link href="/policies/warranty" className={styles.link}>Warranty</Link></li>
              <li><Link href="/policies/payment" className={styles.link}>Payment Policy</Link></li>
              <li><Link href="/policies/cookies" className={styles.link}>Cookie Policy</Link></li>
              <li>
                <button type="button" onClick={openCookieSettings} className={styles.linkButton}>
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.legalBar}>
          <p className={styles.legalText}>
            {COMPANY.tradingName} is a trading name of <strong>{COMPANY.legalName}</strong>, a company
            registered in England and Wales (company no. {COMPANY.companyNumber}).
            {" "}Registered office: {COMPANY.addressInline}.
          </p>
          <p className={styles.legalText}>
            VAT is included in all product prices where applicable. {COMPANY.legalName} is the Merchant of
            Record for orders placed on this website.
          </p>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            {t("copyright", { year: currentYear, storeName: "AvontShop" })}
          </p>
          <div className={styles.paymentMethods}>
            <span className={styles.paymentBadge}>
              <Image src={visaLogo} alt="Visa" height={100} width={100} className={styles.paymentImg} />
            </span>
            <span className={styles.paymentBadge}>
              <Image src={mastercardLogo} alt="Mastercard" height={100} width={100} className={styles.paymentImg} />
            </span>
            <span className={styles.paymentBadge}>
              <Image src={pciDssLogo} alt="PCI DSS Compliant" height={100} width={100} className={styles.paymentImg} />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
