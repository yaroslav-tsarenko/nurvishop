"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Mail, ShoppingBag, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import * as s from "../auth-classes";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4 },
    }),
  } as const;

  return (
    <div className={s.authPage}>
      <motion.div
        className={s.authCard}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div className={s.authHeader} custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className={s.logoIcon}>
            <ShoppingBag size={24} />
          </div>
          <h1 className={s.authTitle}>{t("forgotPasswordTitle")}</h1>
          <p className={s.authSubtitle}>{t("forgotPasswordSubtitle")}</p>
        </motion.div>

        {sent ? (
          <motion.div className={s.magicLinkSent} custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <CheckCircle size={32} />
            <p>{t("resetEmailSent")}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className={s.form}>
            <motion.div className={s.inputGroup} custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <label className={s.inputLabel}>{t("email")}</label>
              <div className={s.inputWrapper}>
                <Mail size={16} className={s.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={s.input}
                />
              </div>
            </motion.div>

            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className={s.submitButton}>
              <Button type="submit" color="primary" fullWidth isLoading={loading}>
                {t("sendResetLink")}
              </Button>
            </motion.div>
          </form>
        )}

        <motion.p className={s.authFooter} custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <ArrowLeft size={14} />
            {t("backToLogin")}
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}