import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { Heart, Truck, Shield, Award } from "lucide-react";
import styles from "./about.module.css";

const values = [
  { icon: <Heart size={28} />, title: "Customer First", desc: "Whether you're a professional electrician or a DIY installer, your satisfaction drives every decision we make." },
  { icon: <Truck size={28} />, title: "Fast & Reliable", desc: "We partner with trusted carriers to deliver your electrical supplies quickly and safely, every time." },
  { icon: <Shield size={28} />, title: "Certified Quality", desc: "Every product meets professional installation standards and is sourced from certified manufacturers." },
  { icon: <Award size={28} />, title: "Trade Pricing", desc: "We work directly with manufacturers to offer competitive trade prices on cables, switchgear, and more." },
];

export default function AboutPage() {
  return (
    <div className={styles.wrapper}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />

      <div className={styles.inner}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            About <span className="gradient-text">nurvishop</span>
          </h1>
          <p className={styles.lead}>
            We&apos;re on a mission to make professional-grade electrical materials accessible to electricians, contractors, and DIY installers. Finding the right cables, switchgear, and installation accessories shouldn&apos;t be complicated.
          </p>
        </div>

        <div className={styles.valuesGrid}>
          {values.map((v) => (
            <div key={v.title} className={styles.valueCard}>
              <div className={styles.valueIcon}>{v.icon}</div>
              <h3 className={styles.valueTitle}>{v.title}</h3>
              <p className={styles.valueDesc}>{v.desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.promise}>
          <h2 className={styles.promiseTitle}>Our Promise</h2>
          <p className={styles.promiseText}>
            We stand behind every electrical product we sell. If you&apos;re not completely satisfied, we&apos;ll make it right — that&apos;s our guarantee to you.
          </p>
        </div>
      </div>
    </div>
  );
}
