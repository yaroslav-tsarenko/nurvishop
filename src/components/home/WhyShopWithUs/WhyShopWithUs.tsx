"use client";

import { Shield, Leaf, Heart, RefreshCw, Award, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const reasons = [
  {
    icon: <Shield size={24} />,
    title: "Secure Shopping",
    desc: "Your data is protected with enterprise-grade encryption and secure payments.",
    gradient: "linear-gradient(135deg, #55412f 0%, #8a5a3b 100%)",
  },
  {
    icon: <Leaf size={24} />,
    title: "Natural Materials",
    desc: "Thoughtfully chosen linen, clay, oak and stoneware for a softer home.",
    gradient: "linear-gradient(135deg, #6f7a52 0%, #55412f 100%)",
  },
  {
    icon: <Heart size={24} />,
    title: "Thoughtfully Made",
    desc: "Every piece is crafted to feel warm and tactile, made to last for years.",
    gradient: "linear-gradient(135deg, #c67a4a 0%, #d9a441 100%)",
  },
  {
    icon: <RefreshCw size={24} />,
    title: "Easy Returns",
    desc: "Changed your mind? Return within 30 days — no questions asked.",
    gradient: "linear-gradient(135deg, #6f7a52 0%, #8a9a63 100%)",
  },
  {
    icon: <Award size={24} />,
    title: "Best Prices",
    desc: "We guarantee competitive pricing. Found it cheaper? We'll match it.",
    gradient: "linear-gradient(135deg, #d9a441 0%, #c67a4a 100%)",
  },
  {
    icon: <Headphones size={24} />,
    title: "24/7 Support",
    desc: "Our team is available around the clock to help with anything.",
    gradient: "linear-gradient(135deg, #8a5a3b 0%, #c67a4a 100%)",
  },
];

export function WhyShopWithUs() {
  return (
    <section className="section-padding bg-mist">
      <div className="section-container">
        <div className="mb-12 text-center">
          <h2 className="section-title">Why choose nurvishop</h2>
          <p className="section-subtitle" style={{ margin: "0.5rem auto 0" }}>
            Naturally made home goods with warm support and thoughtful details
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              className="rounded-xl border border-line bg-surface p-8 transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-lg"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg text-white" style={{ background: reason.gradient }}>
                {reason.icon}
              </div>
              <h3 className="mb-2 text-[1.0625rem] font-bold text-ink">{reason.title}</h3>
              <p className="text-sm leading-[1.6] text-muted">{reason.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
