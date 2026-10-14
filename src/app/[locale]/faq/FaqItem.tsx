"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      borderRadius: "var(--radius-xl)",
      border: "1px solid var(--color-border)",
      overflow: "hidden",
      background: open ? "var(--color-bg-secondary)" : "var(--color-bg)",
      transition: "background-color 0.2s",
    }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.125rem 1.25rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: "1rem",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text)" }}>{q}</span>
        <ChevronDown
          size={18}
          style={{
            color: "var(--color-text-tertiary)",
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 1.25rem 1.125rem", fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
