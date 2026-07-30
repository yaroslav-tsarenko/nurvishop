import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { Heart, Truck, Shield, Award } from "lucide-react";

const values = [
  { icon: <Heart size={28} />, title: "Customer First", desc: "Whether you're a professional electrician or a DIY installer, your satisfaction drives every decision we make." },
  { icon: <Truck size={28} />, title: "Fast & Reliable", desc: "We partner with trusted carriers to deliver your electrical supplies quickly and safely, every time." },
  { icon: <Shield size={28} />, title: "Certified Quality", desc: "Every product meets professional installation standards and is sourced from certified manufacturers." },
  { icon: <Award size={28} />, title: "Trade Pricing", desc: "We work directly with manufacturers to offer competitive trade prices on cables, switchgear, and more." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-container px-4 pb-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />

      <div className="mx-auto max-w-[720px]">
        <div className="mb-12 text-center max-[640px]:mb-8">
          <h1 className="mb-4 font-display text-4xl font-extrabold tracking-tight max-[640px]:text-[1.625rem]">
            About <span className="gradient-text">nurvishop</span>
          </h1>
          <p className="mx-auto max-w-[540px] text-[1.0625rem] leading-[1.7] text-muted max-[640px]:text-[0.9375rem]">
            We&apos;re on a mission to make professional-grade electrical materials accessible to electricians, contractors, and DIY installers. Finding the right cables, switchgear, and installation accessories shouldn&apos;t be complicated.
          </p>
        </div>

        <div className="mb-12 grid grid-cols-2 gap-5 max-[600px]:mb-8 max-[600px]:grid-cols-1 max-[600px]:gap-3.5">
          {values.map((v) => (
            <div key={v.title} className="rounded-xl border border-line bg-surface p-7 max-[480px]:p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light text-accent">{v.icon}</div>
              <h3 className="mb-2 text-[1.0625rem] font-bold">{v.title}</h3>
              <p className="text-sm leading-[1.6] text-muted">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-accent p-10 text-center text-white max-[480px]:px-5 max-[480px]:py-7">
          <h2 className="mb-3 text-2xl font-extrabold max-[480px]:text-xl">Our Promise</h2>
          <p className="mx-auto max-w-[480px] text-[0.9375rem] leading-[1.7] opacity-90">
            We stand behind every electrical product we sell. If you&apos;re not completely satisfied, we&apos;ll make it right — that&apos;s our guarantee to you.
          </p>
        </div>
      </div>
    </div>
  );
}
