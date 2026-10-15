"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import Image from "next/image";
import { ProductImage } from "@/components/shared/ProductImage/ProductImage";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validators/checkout";
import { formatPrice } from "@/lib/utils/format-price";
import { getLocalizedCountries } from "@/lib/countries";
import { useValidationMessage } from "@/lib/validators/messages";
import { COMPANY, VAT_RATE } from "@/lib/utils/constants";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import visaLogo from "@/assets/visa.svg";
import mastercardLogo from "@/assets/mastercard.svg";
import pciDssLogo from "@/assets/pci-dss.svg";
import { toast } from "sonner";
import {
  Mail, Phone, MapPin, Truck, CreditCard,
  ChevronRight, ShieldCheck, Lock, Check, ImageOff, UserPlus, Tag, X as XIcon,
} from "lucide-react";

interface AppliedDiscount {
  type: "welcome" | "newsletter";
  percent: number;
  code: string;
  source: "auto" | "code";
}

const SHIPPING_METHODS = [
  { key: "standard", price: 5.99, icon: Truck },
  { key: "express", price: 12.99, icon: Truck },
  { key: "free", price: 0, icon: Truck },
] as const;

const stepIcons = [Mail, MapPin, CreditCard];
const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const inputBaseStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  paddingLeft: "2.75rem",
  borderRadius: "12px",
  border: "1.5px solid var(--color-border)",
  background: "var(--color-bg)",
  color: "var(--color-text)",
  fontSize: "0.875rem",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const inputPlainStyle: React.CSSProperties = {
  ...inputBaseStyle,
  paddingLeft: "1rem",
};

const selectStyle: React.CSSProperties = {
  ...inputPlainStyle,
  appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239E9EB8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.75rem center",
  paddingRight: "2rem",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 600,
  marginBottom: "0.375rem",
  color: "var(--color-text-secondary)",
};

const errorStyle: React.CSSProperties = {
  color: "var(--color-danger)",
  fontSize: "0.75rem",
  marginTop: "0.25rem",
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
};

function InputWithIcon({ icon: Icon, error, ...props }: { icon: React.ElementType; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ position: "relative" }}>
      <Icon size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)", pointerEvents: "none" }} />
      <input
        {...props}
        style={{
          ...inputBaseStyle,
          borderColor: error ? "var(--color-danger)" : undefined,
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-accent-light)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = error ? "var(--color-danger)" : "var(--color-border)"; e.currentTarget.style.boxShadow = "none"; }}
      />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const nav = useTranslations("nav");
  const tOrder = useTranslations("order");
  const tCountries = useTranslations("countries");
  const tNotify = useTranslations("notifications");
  const vm = useValidationMessage();
  const router = useRouter();
  const locale = useLocale();
  const countries = getLocalizedCountries(locale);
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { currency, convert } = useCurrency();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [discount, setDiscount] = useState<AppliedDiscount | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    reset,
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      contact: { email: user?.email || "", phone: "" },
      shipping: {
        firstName: "",
        lastName: "",
        address1: "",
        address2: "",
        city: "",
        province: "",
        postalCode: "",
        country: "",
      },
      shippingMethod: "standard",
    },
  });

  // Prefill from the signed-in user's profile + default address.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d?.user) return;
        const u = d.user;
        const addresses = u.addresses || [];
        const addr = addresses.find((a: any) => a.isDefault) || addresses[0] || null;
        const [firstName, ...rest] = (u.name || "").trim().split(/\s+/);
        reset((prev) => ({
          ...prev,
          contact: {
            email: u.email || prev.contact.email,
            phone: u.phone || addr?.phone || prev.contact.phone,
          },
          shipping: {
            ...prev.shipping,
            firstName: addr?.firstName || firstName || "",
            lastName: addr?.lastName || rest.join(" ") || "",
            address1: addr?.address1 || prev.shipping.address1,
            address2: addr?.address2 || prev.shipping.address2,
            city: addr?.city || prev.shipping.city,
            province: addr?.province || prev.shipping.province,
            postalCode: addr?.postalCode || prev.shipping.postalCode,
            country: addr?.country || prev.shipping.country,
          },
        }));
      })
      .catch(() => null);
    return () => { cancelled = true; };
  }, [user, reset]);

  // When the order qualifies for free shipping, pre-select it by default.
  const qualifiesForFreeShipping = cart.subtotal >= 100;
  useEffect(() => {
    if (qualifiesForFreeShipping) {
      setValue("shippingMethod", "free");
    }
  }, [qualifiesForFreeShipping, setValue]);

  const steps = [t("contact"), t("shipping"), t("review")];
  const selectedMethod = watch("shippingMethod");
  const selectedCountry = watch("shipping.country");
  const availableMethods = cart.subtotal >= 100
    ? SHIPPING_METHODS
    : SHIPPING_METHODS.filter((m) => m.key !== "free");
  const shippingPrice = SHIPPING_METHODS.find((m) => m.key === selectedMethod)?.price ?? 5.99;

  const countryData = countries.find((c) => c.code === selectedCountry);
  const phoneHint = countryData ? `${countryData.phone} XX XXX XXXX` : "+370 XXX XXXX";

  const discountAmount = discount ? +(cart.subtotal * (discount.percent / 100)).toFixed(2) : 0;
  const discountedSubtotal = Math.max(cart.subtotal - discountAmount, 0);
  // Prices are VAT-inclusive, so VAT is the portion already contained in the
  // product price rather than an amount added on top.
  const vatIncluded = +(discountedSubtotal - discountedSubtotal / (1 + VAT_RATE / 100)).toFixed(2);
  const finalShipping = discountedSubtotal >= 100 && selectedMethod === "free" ? 0 : shippingPrice;
  const orderTotal = +(discountedSubtotal + finalShipping).toFixed(2);

  useEffect(() => {
    let cancelled = false;
    if (user) {
      fetch("/api/discounts")
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled && d?.discount) setDiscount(d.discount);
        })
        .catch(() => null);
    }
    return () => { cancelled = true; };
  }, [user]);

  const applyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;
    setApplyingPromo(true);
    setPromoError(null);
    try {
      const r = await fetch(`/api/discounts?code=${encodeURIComponent(code)}`);
      const data = await r.json();
      if (data?.discount) {
        setDiscount(data.discount);
        setPromoInput("");
        toast.success(t("discountToast", { percent: data.discount.percent }));
      } else {
        setPromoError(t("promoInvalid"));
      }
    } catch {
      setPromoError(t("promoFailed"));
    } finally {
      setApplyingPromo(false);
    }
  };

  const removeDiscount = () => {
    setDiscount(null);
    setPromoError(null);
  };

  const goNext = async () => {
    if (step === 0) {
      const valid = await trigger("contact");
      if (!valid) return;
    } else if (step === 1) {
      const valid = await trigger(["shipping", "shippingMethod"]);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, 2));
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!agreed) {
      setAgreeError(true);
      toast.error(t("agreeToast"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          locale,
          discountCode: discount?.source === "code" ? discount.code : undefined,
          currency,
          items: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            variantName: item.variantName,
          })),
        }),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          // ignore
        }
        console.error("Checkout submission failed on server:", errorData);
        throw new Error(errorData?.details || errorData?.error || "Failed to create order");
      }

      const order = await res.json();
      toast.success(tNotify("orderPlaced"));
      router.push(`/order/confirmed?orderId=${order.id}`);
    } catch {
      // Server details are logged above; show the customer a localized message.
      toast.error(t("orderFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (cart.items.length === 0) {
      router.push("/cart");
    }
  }, [cart.items.length, router]);

  if (cart.items.length === 0) return null;

  const freeShippingThreshold = convert(100);
  const subtotalConverted = convert(cart.subtotal);
  const amountToFreeShipping = freeShippingThreshold - subtotalConverted;

  return (
    <div className="mx-auto max-w-container px-4 pb-16">
      <Breadcrumbs items={[{ label: nav("home"), href: "/" }, { label: nav("cart"), href: "/cart" }, { label: t("title") }]} />

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-[1.75rem] font-extrabold tracking-tight max-[480px]:mb-3 max-[480px]:text-[1.375rem]"
      >
        {t("title")}
      </motion.h1>

      {/* Guest checkout notice */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.875rem 1.25rem",
            borderRadius: "12px",
            background: "var(--color-accent-light)",
            border: "1px solid var(--color-accent)",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
          }}
        >
          <UserPlus size={18} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
          <span>
            {t.rich("guestNotice", {
              login: (chunks) => (
                <Link href="/auth/login" style={{ color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}>
                  {chunks}
                </Link>
              ),
              register: (chunks) => (
                <Link href="/auth/register" style={{ color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}>
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </motion.div>
      )}

      {/* Step Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 flex items-center gap-0 rounded-lg bg-mist p-1 max-[480px]:mb-6"
      >
        {steps.map((s, i) => {
          const Icon = stepIcons[i];
          const isActive = i === step;
          const isDone = i < step;
          return (
            <button
              key={i}
              onClick={() => i < step && setStep(i)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                border: "none",
                cursor: i <= step ? "pointer" : "default",
                background: isActive ? "var(--color-bg)" : "transparent",
                boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                fontWeight: isActive ? 700 : 500,
                fontSize: "0.8125rem",
                color: isActive ? "var(--color-text)" : isDone ? "var(--color-accent)" : "var(--color-text-tertiary)",
                transition: "all 0.2s",
              }}
            >
              {isDone ? (
                <div style={{ width: "1.25rem", height: "1.25rem", borderRadius: "50%", background: "var(--color-accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={12} strokeWidth={3} />
                </div>
              ) : (
                <Icon size={16} />
              )}
              <span className="inline max-[480px]:hidden">{s}</span>
            </button>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-[1fr_380px] items-start gap-10 max-[1024px]:grid-cols-1 max-[1024px]:gap-6">
        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="contact"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-8 max-[640px]:gap-4 max-[640px]:rounded-lg max-[640px]:p-5"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "10px", background: "var(--color-accent-light)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Mail size={16} />
                  </div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{t("contact")}</h2>
                </div>
                <div>
                  <label style={labelStyle}>{t("email")} *</label>
                  <InputWithIcon
                    icon={Mail}
                    placeholder={t("emailPlaceholder")}
                    error={vm(errors.contact?.email?.message)}
                    {...register("contact.email")}
                  />
                  {!user && (
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: "0.25rem", display: "block" }}>
                      {t("emailHint")}
                    </span>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>{t("phone")}</label>
                  <InputWithIcon
                    icon={Phone}
                    placeholder={phoneHint}
                    error={vm(errors.contact?.phone?.message)}
                    {...register("contact.phone")}
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: "0.25rem", display: "block" }}>
                    {t("phoneHint")}
                  </span>
                </div>
                <Button color="primary" size="lg" onPress={goNext} style={{ marginTop: "0.5rem" }}>
                  {t("continueToShipping")} <ChevronRight size={16} />
                </Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="shipping"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-8 max-[640px]:gap-4 max-[640px]:rounded-lg max-[640px]:p-5"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "10px", background: "var(--color-accent-light)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MapPin size={16} />
                  </div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{t("shipping")}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
                  <div>
                    <label style={labelStyle}>{t("firstName")} *</label>
                    <input style={{ ...inputPlainStyle, borderColor: errors.shipping?.firstName ? "var(--color-danger)" : undefined }} placeholder={t("firstNamePlaceholder")} {...register("shipping.firstName")} />
                    {errors.shipping?.firstName && <span style={errorStyle}>{vm(errors.shipping.firstName.message)}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>{t("lastName")} *</label>
                    <input style={{ ...inputPlainStyle, borderColor: errors.shipping?.lastName ? "var(--color-danger)" : undefined }} placeholder={t("lastNamePlaceholder")} {...register("shipping.lastName")} />
                    {errors.shipping?.lastName && <span style={errorStyle}>{vm(errors.shipping.lastName.message)}</span>}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{t("address")} *</label>
                  <InputWithIcon icon={MapPin} placeholder={t("addressPlaceholder")} error={vm(errors.shipping?.address1?.message)} {...register("shipping.address1")} />
                </div>
                <div>
                  <label style={labelStyle}>{t("apartment")}</label>
                  <input style={inputPlainStyle} placeholder={t("apartmentPlaceholder")} {...register("shipping.address2")} />
                </div>

                <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
                  <div>
                    <label style={labelStyle}>{t("city")} *</label>
                    <input style={{ ...inputPlainStyle, borderColor: errors.shipping?.city ? "var(--color-danger)" : undefined }} placeholder={t("cityPlaceholder")} {...register("shipping.city")} />
                    {errors.shipping?.city && <span style={errorStyle}>{vm(errors.shipping.city.message)}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>{t("province")}</label>
                    <input style={inputPlainStyle} placeholder={t("provincePlaceholder")} {...register("shipping.province")} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
                  <div>
                    <label style={labelStyle}>{t("postalCode")} *</label>
                    <input style={{ ...inputPlainStyle, borderColor: errors.shipping?.postalCode ? "var(--color-danger)" : undefined }} placeholder={t("postalCodePlaceholder")} {...register("shipping.postalCode")} />
                    {errors.shipping?.postalCode && <span style={errorStyle}>{vm(errors.shipping.postalCode.message)}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>{t("country")} *</label>
                    <select
                      style={{
                        ...selectStyle,
                        borderColor: errors.shipping?.country ? "var(--color-danger)" : undefined,
                      }}
                      {...register("shipping.country")}
                    >
                      <option value="">{tCountries("select")}</option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                    {errors.shipping?.country && <span style={errorStyle}>{vm(errors.shipping.country.message)}</span>}
                  </div>
                </div>

                {/* Shipping Method Cards */}
                <div>
                  <label style={{ ...labelStyle, marginBottom: "0.75rem" }}>{t("shippingMethod")}</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {availableMethods.map((m) => {
                      const isSelected = selectedMethod === m.key;
                      return (
                        <label
                          key={m.key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "1rem 1.25rem",
                            borderRadius: "12px",
                            border: `1.5px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                            background: isSelected ? "var(--color-accent-light)" : "var(--color-bg)",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          <input type="radio" value={m.key} {...register("shippingMethod")} style={{ display: "none" }} />
                          <div
                            style={{
                              width: "1.25rem",
                              height: "1.25rem",
                              borderRadius: "50%",
                              border: `2px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {isSelected && <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: "var(--color-accent)" }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{tOrder(`shippingMethod.${m.key}`)}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{tOrder(`shippingTime.${m.key}`)}</div>
                          </div>
                          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: m.price === 0 ? "var(--color-success)" : "var(--color-text)" }}>
                            {m.price === 0 ? tOrder("free") : formatPrice(convert(m.price), currency, locale)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <Button variant="bordered" size="lg" onPress={() => setStep(0)} style={{ flex: "0 0 auto" }}>
                    {t("back")}
                  </Button>
                  <Button color="primary" size="lg" onPress={goNext} style={{ flex: 1 }}>
                    {t("reviewOrderCta")} <ChevronRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="review"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-8 max-[640px]:gap-4 max-[640px]:rounded-lg max-[640px]:p-5"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "10px", background: "var(--color-accent-light)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CreditCard size={16} />
                  </div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{t("review")}</h2>
                </div>

                {/* Order Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {cart.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "0.875rem 0",
                        borderBottom: i < cart.items.length - 1 ? "1px solid var(--color-border)" : "none",
                      }}
                    >
                      <div style={{
                        position: "relative",
                        width: "56px",
                        height: "56px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background: "#fff",
                        border: "1px solid var(--color-border)",
                        flexShrink: 0,
                      }}>
                        {item.imageUrl ? (
                          <ProductImage src={item.imageUrl} alt={item.name} fill sizes="56px" style={{ objectFit: "contain", padding: "4px" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)" }}>
                            <ImageOff size={18} />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{tOrder("qtyLabel", { count: item.quantity })}</div>
                      </div>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, flexShrink: 0 }}>
                        {formatPrice(convert(item.price * item.quantity), currency, locale)}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Merchant of Record / legal disclosure */}
                <div style={{
                  marginTop: "0.75rem",
                  padding: "0.875rem 1rem",
                  borderRadius: "12px",
                  background: "var(--color-bg-secondary)",
                  fontSize: "0.75rem",
                  lineHeight: 1.6,
                  color: "var(--color-text-secondary)",
                }}>
                  <div style={{ fontWeight: 700, color: "var(--color-text)", marginBottom: "0.25rem" }}>
                    {t("soldBy", { legalName: COMPANY.legalName, tradingName: COMPANY.tradingName })}
                  </div>
                  <div>{t("registeredOffice", { address: COMPANY.addressInline })}</div>
                  <div>{t("companyNumberVat", { number: COMPANY.companyNumber })}</div>
                  <div style={{ marginTop: "0.375rem" }}>
                    {t("merchantOfRecordNote", { legalName: COMPANY.legalName })}
                  </div>
                </div>

                {/* Policy agreement */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.625rem",
                    marginTop: "0.75rem",
                    fontSize: "0.8125rem",
                    color: "var(--color-text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => { setAgreed(e.target.checked); setAgreeError(false); }}
                    style={{ marginTop: "0.15rem", width: 16, height: 16, flexShrink: 0, accentColor: "var(--color-accent)" }}
                  />
                  <span>
                    {t.rich("agreePolicies", {
                      terms: (chunks) => <Link href="/policies/terms" target="_blank" style={{ color: "var(--color-accent)", fontWeight: 600 }}>{chunks}</Link>,
                      privacy: (chunks) => <Link href="/policies/privacy" target="_blank" style={{ color: "var(--color-accent)", fontWeight: 600 }}>{chunks}</Link>,
                      returns: (chunks) => <Link href="/policies/returns" target="_blank" style={{ color: "var(--color-accent)", fontWeight: 600 }}>{chunks}</Link>,
                      payment: (chunks) => <Link href="/policies/payment" target="_blank" style={{ color: "var(--color-accent)", fontWeight: 600 }}>{chunks}</Link>,
                    })}
                  </span>
                </label>
                {agreeError && (
                  <span style={errorStyle}>{t("agreeRequired")}</span>
                )}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <Button variant="bordered" size="lg" onPress={() => setStep(1)} style={{ flex: "0 0 auto" }}>
                    {t("back")}
                  </Button>
                  <motion.div style={{ flex: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      color="primary"
                      size="lg"
                      isLoading={submitting}
                      style={{ width: "100%" }}
                      startContent={!submitting ? <Lock size={16} /> : undefined}
                    >
                      {t("placeOrder")}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Order Summary Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sticky top-[calc(var(--header-height)+var(--announcement-height)+1rem)] h-fit rounded-xl border border-line bg-surface p-7 max-[1024px]:static max-[1024px]:order-[-1] max-[640px]:rounded-lg max-[640px]:p-5"
        >
          <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", marginBottom: "1.25rem" }}>{t("orderSummary")}</h3>

          {/* Free shipping progress */}
          {amountToFreeShipping > 0 && (
            <div style={{
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              background: "var(--color-bg-secondary)",
              marginBottom: "1.25rem",
              fontSize: "0.8125rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Truck size={14} style={{ color: "var(--color-accent)" }} />
                <span>{t.rich("addForFreeShipping", { amount: formatPrice(amountToFreeShipping, currency, locale), strong: (chunks) => <strong>{chunks}</strong> })}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "var(--color-border)", overflow: "hidden" }}>
                <div style={{
                  width: `${Math.min((subtotalConverted / freeShippingThreshold) * 100, 100)}%`,
                  height: "100%",
                  background: "var(--color-accent)",
                  borderRadius: 2,
                  transition: "width 0.3s",
                }} />
              </div>
            </div>
          )}

          {/* Mini item list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1.25rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--color-border)" }}>
            {cart.items.map((item) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  position: "relative",
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "#fff",
                  border: "1px solid var(--color-border)",
                  flexShrink: 0,
                }}>
                  {item.imageUrl ? (
                    <ProductImage src={item.imageUrl} alt={item.name} fill sizes="40px" style={{ objectFit: "contain", padding: "2px" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}>
                      <ImageOff size={14} />
                    </div>
                  )}
                  <div style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "var(--color-text-secondary)",
                    color: "#fff",
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {item.quantity}
                  </div>
                </div>
                <span style={{ fontSize: "0.75rem", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--color-text-secondary)" }}>
                  {item.name}
                </span>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, flexShrink: 0 }}>
                  {formatPrice(convert(item.price * item.quantity), currency, locale)}
                </span>
              </div>
            ))}
          </div>

          {/* Promo / discount block */}
          <div style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--color-border)" }}>
            {discount ? (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 0.75rem",
                borderRadius: "10px",
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                fontSize: "0.8125rem",
              }}>
                <Tag size={14} style={{ color: "#15803d", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#166534" }}>
                    {t("discountApplied", { percent: discount.percent })}
                  </div>
                  <div style={{ color: "#15803d", fontSize: "0.6875rem" }}>
                    {discount.type === "welcome" ? t("welcomeDiscount") : t("discountCode", { code: discount.code })}
                  </div>
                </div>
                {discount.source === "code" && (
                  <button
                    type="button"
                    onClick={removeDiscount}
                    aria-label={t("removeDiscount")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#15803d", padding: 4, display: "flex" }}
                  >
                    <XIcon size={14} />
                  </button>
                )}
              </div>
            ) : (
              <div>
                <label style={{ ...labelStyle, marginBottom: "0.375rem" }}>{t("promoCode")}</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(null); }}
                    placeholder={t("promoPlaceholder")}
                    aria-label={t("promoCode")}
                    style={{ ...inputPlainStyle, fontSize: "0.8125rem", letterSpacing: "0.5px" }}
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={!promoInput.trim() || applyingPromo}
                    style={{
                      padding: "0 0.875rem",
                      borderRadius: "12px",
                      border: "none",
                      background: "var(--color-accent)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.8125rem",
                      cursor: promoInput.trim() && !applyingPromo ? "pointer" : "not-allowed",
                      opacity: promoInput.trim() && !applyingPromo ? 1 : 0.5,
                    }}
                  >
                    {applyingPromo ? "…" : t("apply")}
                  </button>
                </div>
                {promoError && <span style={errorStyle}>{promoError}</span>}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>{tOrder("subtotal")}</span>
              <span style={{ fontWeight: 500 }}>{formatPrice(convert(cart.subtotal), currency, locale)}</span>
            </div>
            {discount && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "#15803d" }}>
                <span>{t("discountLine", { percent: discount.percent })}</span>
                <span style={{ fontWeight: 600 }}>−{formatPrice(convert(discountAmount), currency, locale)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>{tOrder("shipping")}</span>
              <span style={{ fontWeight: 500, color: step >= 1 && finalShipping === 0 ? "var(--color-success)" : undefined }}>
                {step < 1
                  ? t("shippingCalculated")
                  : finalShipping > 0
                    ? formatPrice(convert(finalShipping), currency, locale)
                    : tOrder("free")}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>{t("includesVat", { rate: VAT_RATE })}</span>
              <span style={{ fontWeight: 500 }}>{formatPrice(convert(vatIncluded), currency, locale)}</span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 800,
              fontSize: "1.125rem",
              borderTop: "2px solid var(--color-border)",
              paddingTop: "0.875rem",
              marginTop: "0.375rem",
            }}>
              <span>{tOrder("total")}</span>
              <span>{formatPrice(convert(step < 1 ? discountedSubtotal : orderTotal), currency, locale)}</span>
            </div>
            <p style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", margin: "0.25rem 0 0" }}>
              {t("pricesIncludeVat")}
            </p>
          </div>

          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1.5rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--color-border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
              <ShieldCheck size={14} />
              {t("secureCheckout")}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
              <Lock size={14} />
              {t("dataProtected")}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
              <Image src={visaLogo} alt="Visa" height={22} style={{ height: 22, width: "auto" }} />
              <Image src={mastercardLogo} alt="Mastercard" height={22} style={{ height: 22, width: "auto" }} />
              <Image src={pciDssLogo} alt={t("pciAlt")} height={26} style={{ height: 26, width: "auto" }} />
            </div>
          </div>

          {/* Merchant of Record disclosure */}
          <p style={{
            fontSize: "0.6875rem",
            lineHeight: 1.6,
            color: "var(--color-text-tertiary)",
            textAlign: "center",
            marginTop: "1rem",
          }}>
            {t.rich("merchantOfRecord", { legalName: COMPANY.legalName, strong: (chunks) => <strong>{chunks}</strong> })}
            <br />
            {COMPANY.addressInline}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
