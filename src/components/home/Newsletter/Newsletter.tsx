"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function Newsletter() {
  const t = useTranslations("home");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thanks for subscribing!");
      setEmail("");
    }
  };

  return (
    <motion.section
      className="section-padding relative overflow-hidden bg-accent"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="pointer-events-none absolute -right-[100px] -top-[100px] h-[400px] w-[400px] rounded-full bg-white opacity-15 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-[100px] -left-[50px] h-[300px] w-[300px] rounded-full bg-white opacity-15 blur-[60px]" />
      <div className="relative z-[1] mx-auto flex max-w-container flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex-1">
          <h2 className="mb-2 font-display text-[1.75rem] font-extrabold tracking-[-0.02em] text-white">{t("newsletter")}</h2>
          <p className="max-w-[400px] text-[0.9375rem] leading-[1.5] text-white/85">{t("newsletterSubtitle")}</p>
        </div>
        <form className="flex w-full max-w-[420px] gap-2" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("newsletterPlaceholder")}
            className="flex-1 rounded-pill border-2 border-white/25 bg-white/[0.12] px-5 py-3 text-sm text-white outline-none backdrop-blur-[8px] transition-[border-color,background-color] duration-200 placeholder:text-white/55 focus:border-white/50 focus:bg-white/[0.18]"
            required
          />
          <button
            type="submit"
            className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-pill border-none bg-white px-6 py-3 text-sm font-bold text-accent transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <Send size={16} />
            {t("newsletterCta")}
          </button>
        </form>
      </div>
    </motion.section>
  );
}
