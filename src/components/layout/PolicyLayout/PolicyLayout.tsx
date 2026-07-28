import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { ReactNode } from "react";
import styles from "./PolicyLayout.module.css";

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function PolicyLayout({ title, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <div className={styles.container}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Policies", href: "/policies" },
          { label: title },
        ]}
      />
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.content}>
        <p className={styles.lastUpdated}>Last updated: {lastUpdated}</p>
        {children}
      </div>
    </div>
  );
}

export function ContactBlock() {
  return (
    <div className={styles.contactBlock}>
      <p>
        <strong>AVONTRA LTD</strong>
        <br />
        Company number: 17245887
        <br />
        Registered office: Dept 6735, 196 High Road, Wood Green, London, United Kingdom, N22 8HH
        <br />
        Phone: +44 7360 545980
        <br />
        Email: info@nurvishop.com
      </p>
    </div>
  );
}
