"use client";

import { useAuth } from "@/providers/AuthProvider";
import { AccountSidebar } from "@/components/account/AccountSidebar/AccountSidebar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const nav = useTranslations("nav");
  const t = useTranslations("account");

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/en/auth/login";
    }
  }, [loading, user]);

  if (loading) return <LoadingSpinner />;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-container px-4 pb-16">
      <Breadcrumbs items={[{ label: nav("home"), href: "/" }, { label: t("title") }]} />
      <div className="grid grid-cols-[240px_1fr] items-start gap-8 max-[768px]:grid-cols-1 max-[768px]:gap-4">
        <AccountSidebar />
        <div>{children}</div>
      </div>
    </div>
  );
}
