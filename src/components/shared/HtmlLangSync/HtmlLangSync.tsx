"use client";

import { useEffect } from "react";

/** Keeps <html lang> in sync after client-side locale switches (screen readers, hyphenation). */
export function HtmlLangSync({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
