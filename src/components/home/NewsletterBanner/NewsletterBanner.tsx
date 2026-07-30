"use client";

import { useState, useRef } from "react";
import { CheckCircle } from "lucide-react";
import { motion, useInView } from "framer-motion";

export function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <motion.section
      ref={ref}
      className="relative mb-6 flex items-center justify-between gap-8 overflow-hidden rounded-lg bg-accent px-10 py-8 text-white max-md:flex-col max-md:p-6 max-md:text-center before:pointer-events-none before:absolute before:-top-[40%] before:-right-[10%] before:h-[300px] before:w-[300px] before:rounded-full before:bg-white/[0.06] before:content-[''] after:pointer-events-none after:absolute after:-bottom-1/2 after:left-[10%] after:h-[200px] after:w-[200px] after:rounded-full after:bg-white/[0.04] after:content-['']"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="relative z-[1] flex-1"
        initial={{ opacity: 0, x: -30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="mb-2.5 flex items-center gap-3 max-md:justify-center">
          <motion.div
            className="flex h-[52px] w-[52px] flex-shrink-0 flex-col items-center justify-center rounded-full bg-white/20 leading-none backdrop-blur-[4px]"
            animate={isInView ? { rotate: [0, -8, 8, -4, 0] } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <span className="text-xl font-black">10%</span>
            <span className="text-[0.5rem] font-bold uppercase tracking-wide">OFF</span>
          </motion.div>
          <div>
            <h2 className="m-0 font-display text-xl font-extrabold leading-[1.2]">Subscribe & Save 10%</h2>
            <p className="mx-0 mb-0 mt-1.5 text-[0.8125rem] leading-[1.5] opacity-85">Get exclusive deals, new arrivals & special offers straight to your inbox.</p>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="relative z-[1] flex flex-shrink-0 gap-2 max-md:w-full max-md:flex-col"
        initial={{ opacity: 0, x: 30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {submitted ? (
          <motion.span
            className="flex items-center gap-2 text-sm font-semibold"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <CheckCircle size={18} /> You&apos;re in! Check your inbox.
          </motion.span>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-[260px] rounded-lg border-2 border-white/25 bg-white/15 px-4 py-3 text-sm text-white outline-none backdrop-blur-[4px] transition-[border-color] duration-200 placeholder:text-white/60 focus:border-white/50 max-md:w-full"
            />
            <button
              type="submit"
              className="cursor-pointer whitespace-nowrap rounded-lg border-none bg-white px-6 py-3 text-sm font-bold text-accent transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Subscribe
            </button>
          </form>
        )}
      </motion.div>
    </motion.section>
  );
}
