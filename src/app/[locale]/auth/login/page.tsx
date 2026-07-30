"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, Eye, EyeOff, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import * as s from "../auth-classes";

export default function LoginPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      toast.success("Logged in successfully!");
      if (data.user?.role === "ADMIN" || data.user?.role === "SUPER_ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/en/account";
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
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
          <h1 className={s.authTitle}>{t("loginTitle")}</h1>
          <p className={s.authSubtitle}>{t("loginSubtitle")}</p>
        </motion.div>

        <form onSubmit={handleEmailLogin} className={s.form}>
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

          <motion.div className={s.inputGroup} custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <label className={s.inputLabel}>{t("password")}</label>
            <div className={s.inputWrapper}>
              <Lock size={16} className={s.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className={`${s.input} ${s.inputWithToggle}`}
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
          </motion.div>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
            <Link href="/auth/forgot-password" className={s.forgotPasswordLink}>
              {t("forgotPassword")}
            </Link>
          </motion.div>

          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className={s.submitButton}>
            <Button type="submit" color="primary" fullWidth isLoading={loading}>
              {t("signIn")}
            </Button>
          </motion.div>
        </form>

        <motion.p className={s.authFooter} custom={5} variants={fadeUp} initial="hidden" animate="visible">
          {t("noAccount")}{" "}
          <Link href="/auth/register">
            {t("signUp")}
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
