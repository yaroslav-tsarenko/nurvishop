import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { ReactNode } from "react";

const contentClasses = [
  "text-[0.9375rem] leading-[1.75] text-muted",
  "max-[640px]:text-[0.875rem] max-[640px]:leading-[1.65]",
  // headings
  "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-[1.125rem] [&_h2]:font-bold [&_h2]:text-ink",
  "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink",
  "max-[640px]:[&_h2]:mt-6 max-[640px]:[&_h2]:text-[1.0625rem]",
  "max-[640px]:[&_h3]:text-[0.9375rem]",
  // paragraphs & lists
  "[&_p]:mb-3",
  "[&_ul]:my-2 [&_ul]:ml-6 [&_ul]:list-disc",
  "[&_ul_li]:mb-1",
  // tables
  "[&_table]:my-4 [&_table]:block [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse [&_table]:overflow-x-auto [&_table]:text-[0.875rem]",
  "[&_thead]:table [&_thead]:w-full [&_thead]:table-fixed",
  "[&_tbody]:table [&_tbody]:w-full [&_tbody]:table-fixed",
  "[&_tr]:table [&_tr]:w-full [&_tr]:table-fixed",
  "[&_th]:border [&_th]:border-line [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:break-words [&_th]:font-semibold [&_th]:text-ink [&_th]:bg-mist",
  "[&_td]:border [&_td]:border-line [&_td]:px-3 [&_td]:py-2 [&_td]:text-left [&_td]:break-words",
  "max-[480px]:[&_table]:text-[0.8125rem]",
  "max-[480px]:[&_th]:px-2 max-[480px]:[&_th]:py-[0.4rem]",
  "max-[480px]:[&_td]:px-2 max-[480px]:[&_td]:py-[0.4rem]",
].join(" ");

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function PolicyLayout({ title, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 [overflow-wrap:anywhere] [word-break:break-word]">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Policies", href: "/policies" },
          { label: title },
        ]}
      />
      <h1 className="mb-5 text-[1.75rem] font-extrabold tracking-[-0.02em] text-ink max-[640px]:text-[1.375rem]">
        {title}
      </h1>
      <div className={contentClasses}>
        <p className="mb-4 text-[0.875rem] text-subtle">Last updated: {lastUpdated}</p>
        {children}
      </div>
    </div>
  );
}

export function ContactBlock() {
  return (
    <div className="mt-2 rounded-md border border-line bg-mist px-4 py-[0.875rem] text-[0.875rem] leading-[1.7]">
      <p>
        <strong>ULTRASENS LT MB</strong>
        <br />
        Company number: 308011165
        <br />
        Registered office: V. Nagevičiaus g. 3, LT-08237 Vilnius, Lithuania
        <br />
        Phone: +44 7360 545980
        <br />
        Email: info@nurvishop.com
      </p>
    </div>
  );
}
