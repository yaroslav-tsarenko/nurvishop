"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import {
  Mail, Lock, Eye, EyeOff, User, ShoppingBag,
  Phone, MapPin, Calendar, ChevronRight, ChevronLeft, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES } from "@/lib/countries";
import * as s from "../auth-classes";

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  if (password.length === 0) return { level: 0, label: "", color: "transparent" };
  if (password.length < 6) return { level: 25, label: "Weak", color: "#ef4444" };
  if (password.length < 10) return { level: 50, label: "Fair", color: "#f59e0b" };
  if (password.length < 14) return { level: 75, label: "Good", color: "#22c55e" };
  return { level: 100, label: "Strong", color: "#16a34a" };
}

const STEP_LABELS = ["Personal Info", "Contact Details", "Address", "Password"];
const STEP_ICONS = [User, Phone, MapPin, Lock];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

const initialForm: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  country: "",
  postalCode: "",
  dateOfBirth: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const t = useTranslations("auth");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getPasswordStrength(form.password);

  const selectedCountry = COUNTRIES.find((c) => c.code === form.country);
  const phoneHint = selectedCountry ? selectedCountry.phone : "+370";

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  function validateStep(s: number): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (s === 0) {
      if (!form.firstName.trim()) errs.firstName = "First name is required";
      if (!form.lastName.trim()) errs.lastName = "Last name is required";
      if (!form.dateOfBirth) errs.dateOfBirth = "Date of birth is required";
      else {
        const dob = new Date(form.dateOfBirth);
        const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        if (age < 18) errs.dateOfBirth = "You must be at least 18 years old";
      }
    } else if (s === 1) {
      if (!form.email.trim()) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
      if (!form.phone.trim()) errs.phone = "Phone is required";
    } else if (s === 2) {
      if (!form.street.trim()) errs.street = "Street address is required";
      if (!form.city.trim()) errs.city = "City is required";
      if (!form.country) errs.country = "Country is required";
      if (!form.postalCode.trim()) errs.postalCode = "Postal code is required";
    } else if (s === 3) {
      if (!form.password) errs.password = "Password is required";
      else if (form.password.length < 6) errs.password = "Min 6 characters";
      if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const goNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          street: form.street,
          city: form.city,
          country: form.country,
          postalCode: form.postalCode,
          dateOfBirth: form.dateOfBirth,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      toast.success("Account created!");
      window.location.href = "/en/account";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.625rem 0.75rem 0.625rem 2.5rem",
    fontSize: "0.875rem",
    color: "var(--color-text)",
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  };

  const plainInputStyle: React.CSSProperties = {
    ...inputStyle,
    paddingLeft: "0.75rem",
  };

  const selectStyle: React.CSSProperties = {
    ...plainInputStyle,
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239E9EB8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.75rem center",
    paddingRight: "2rem",
  };

  const renderError = (field: keyof FormData) =>
    errors[field] ? (
      <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors[field]}</span>
    ) : null;

  return (
    <div className={s.authPage}>
      <motion.div
        className={s.authCard}
        style={{ maxWidth: 480 }}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className={s.authHeader}>
          <div className={s.logoIcon}>
            <ShoppingBag size={24} />
          </div>
          <h1 className={s.authTitle}>{t("registerTitle")}</h1>
          <p className={s.authSubtitle}>{t("registerSubtitle")}</p>
        </div>

        {/* Step indicator */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          marginBottom: "1.75rem",
        }}>
          {STEP_LABELS.map((label, i) => {
            const Icon = STEP_ICONS[i];
            const isActive = i === step;
            const isDone = i < step;
            return (
              <button
                key={i}
                type="button"
                onClick={() => i < step && setStep(i)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                  padding: "0.5rem 0.25rem",
                  borderRadius: "10px",
                  border: "none",
                  cursor: i <= step ? "pointer" : "default",
                  background: isActive ? "var(--color-accent-light)" : "transparent",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.6875rem",
                  color: isActive ? "var(--color-accent)" : isDone ? "var(--color-accent)" : "var(--color-text-tertiary)",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
              >
                {isDone ? (
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--color-accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={10} strokeWidth={3} />
                  </div>
                ) : (
                  <Icon size={14} />
                )}
                <span style={{ display: "none" }}>{label}</span>
              </button>
            );
          })}
        </div>

        <div style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.25rem",
        }}>
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i <= step ? "var(--color-accent)" : "var(--color-border)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "1rem", fontWeight: 600 }}>
          Step {step + 1} of 4: {STEP_LABELS[step]}
        </p>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className={s.form}
              >
                <div className={s.inputGroup}>
                  <label className={s.inputLabel}>First Name *</label>
                  <div className={s.inputWrapper}>
                    <User size={16} className={s.inputIcon} />
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={set("firstName")}
                      placeholder="John"
                      className={s.input}
                      style={errors.firstName ? { borderColor: "var(--color-danger)" } : undefined}
                    />
                  </div>
                  {renderError("firstName")}
                </div>

                <div className={s.inputGroup}>
                  <label className={s.inputLabel}>Last Name *</label>
                  <div className={s.inputWrapper}>
                    <User size={16} className={s.inputIcon} />
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={set("lastName")}
                      placeholder="Doe"
                      className={s.input}
                      style={errors.lastName ? { borderColor: "var(--color-danger)" } : undefined}
                    />
                  </div>
                  {renderError("lastName")}
                </div>

                <div className={s.inputGroup}>
                  <label className={s.inputLabel}>Date of Birth *</label>
                  <div className={s.inputWrapper}>
                    <Calendar size={16} className={s.inputIcon} />
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={set("dateOfBirth")}
                      className={s.input}
                      style={errors.dateOfBirth ? { borderColor: "var(--color-danger)" } : undefined}
                    />
                  </div>
                  {renderError("dateOfBirth")}
                </div>

                <div className={s.submitButton}>
                  <Button type="button" color="primary" fullWidth onPress={goNext}>
                    Continue <ChevronRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className={s.form}
              >
                <div className={s.inputGroup}>
                  <label className={s.inputLabel}>{t("email")} *</label>
                  <div className={s.inputWrapper}>
                    <Mail size={16} className={s.inputIcon} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@example.com"
                      className={s.input}
                      style={errors.email ? { borderColor: "var(--color-danger)" } : undefined}
                    />
                  </div>
                  {renderError("email")}
                </div>

                <div className={s.inputGroup}>
                  <label className={s.inputLabel}>Phone *</label>
                  <div className={s.inputWrapper}>
                    <Phone size={16} className={s.inputIcon} />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder={`${phoneHint} XX XXX XXXX`}
                      className={s.input}
                      style={errors.phone ? { borderColor: "var(--color-danger)" } : undefined}
                    />
                  </div>
                  {renderError("phone")}
                  {!form.country && (
                    <span style={{ fontSize: "0.7rem", color: "var(--color-text-tertiary)" }}>
                      Select country in next step for phone code hint
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }} className={s.submitButton}>
                  <Button type="button" variant="bordered" onPress={goBack}>
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button type="button" color="primary" style={{ flex: 1 }} onPress={goNext}>
                    Continue <ChevronRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className={s.form}
              >
                <div className={s.inputGroup}>
                  <label className={s.inputLabel}>Street Address *</label>
                  <div className={s.inputWrapper}>
                    <MapPin size={16} className={s.inputIcon} />
                    <input
                      type="text"
                      value={form.street}
                      onChange={set("street")}
                      placeholder="123 Main Street, Apt 4B"
                      className={s.input}
                      style={errors.street ? { borderColor: "var(--color-danger)" } : undefined}
                    />
                  </div>
                  {renderError("street")}
                </div>

                <div className={s.inputGroup}>
                  <label className={s.inputLabel}>City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={set("city")}
                    placeholder="Vilnius"
                    style={{
                      ...plainInputStyle,
                      borderColor: errors.city ? "var(--color-danger)" : undefined,
                    }}
                  />
                  {renderError("city")}
                </div>

                <div className={s.inputGroup}>
                  <label className={s.inputLabel}>Country *</label>
                  <select
                    value={form.country}
                    onChange={set("country")}
                    style={{
                      ...selectStyle,
                      borderColor: errors.country ? "var(--color-danger)" : undefined,
                      color: form.country ? "var(--color-text)" : "var(--color-text-tertiary)",
                    }}
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                  {renderError("country")}
                </div>

                <div className={s.inputGroup}>
                  <label className={s.inputLabel}>Postal Code *</label>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={set("postalCode")}
                    placeholder="LT-10001"
                    style={{
                      ...plainInputStyle,
                      borderColor: errors.postalCode ? "var(--color-danger)" : undefined,
                    }}
                  />
                  {renderError("postalCode")}
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }} className={s.submitButton}>
                  <Button type="button" variant="bordered" onPress={goBack}>
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button type="button" color="primary" style={{ flex: 1 }} onPress={goNext}>
                    Continue <ChevronRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className={s.form}
              >
                <div className={s.inputGroup}>
                  <label className={s.inputLabel}>{t("password")} *</label>
                  <div className={s.inputWrapper}>
                    <Lock size={16} className={s.inputIcon} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={set("password")}
                      placeholder="Min 6 characters"
                      className={`${s.input} ${s.inputWithToggle}`}
                      style={errors.password ? { borderColor: "var(--color-danger)" } : undefined}
                    />
                    <button
                      type="button"
                      className={s.inputToggle}
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {renderError("password")}
                  {form.password.length > 0 && (
                    <div style={{ marginTop: "0.375rem" }}>
                      <div style={{ height: 4, borderRadius: 2, background: "var(--color-border)", overflow: "hidden" }}>
                        <div style={{ width: `${strength.level}%`, height: "100%", background: strength.color, transition: "width 0.3s" }} />
                      </div>
                      <p style={{ fontSize: "0.75rem", color: strength.color, marginTop: "0.25rem", margin: "0.25rem 0 0" }}>{strength.label}</p>
                    </div>
                  )}
                </div>

                <div className={s.inputGroup}>
                  <label className={s.inputLabel}>{t("confirmPassword")} *</label>
                  <div className={s.inputWrapper}>
                    <Lock size={16} className={s.inputIcon} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={set("confirmPassword")}
                      placeholder="Confirm your password"
                      className={`${s.input} ${s.inputWithToggle}`}
                      style={errors.confirmPassword ? { borderColor: "var(--color-danger)" } : undefined}
                    />
                    <button
                      type="button"
                      className={s.inputToggle}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {renderError("confirmPassword")}
                </div>

                <p className={s.termsText}>
                  By creating an account, you agree to our{" "}
                  <Link href="/policies/terms">Terms of Service</Link> and{" "}
                  <Link href="/policies/privacy">Privacy Policy</Link>.
                </p>

                <div style={{ display: "flex", gap: "0.75rem" }} className={s.submitButton}>
                  <Button type="button" variant="bordered" onPress={goBack}>
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button type="submit" color="primary" style={{ flex: 1 }} isLoading={loading}>
                    {t("signUp")}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <p className={s.authFooter}>
          {t("hasAccount")}{" "}
          <Link href="/auth/login">{t("signIn")}</Link>
        </p>
      </motion.div>
    </div>
  );
}
