export const PRODUCTS_PER_PAGE = 12;

export const LOCALES = ["en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

export const CURRENCIES = ["EUR", "USD", "GBP"] as const;

export const VAT_RATE = 21;

export const COMPANY = {
  legalName: "ULTRASENS LT MB",
  tradingName: "nurvishop",
  companyNumber: "308011165",
  addressLines: [
    "V. Nagevičiaus g. 3",
    "LT-08237 Vilnius",
    "Lithuania",
  ],
  addressInline: "V. Nagevičiaus g. 3, LT-08237 Vilnius, Lithuania",
  phone: "+44 7360 545980",
  email: "info@nurvishop.com",
} as const;
