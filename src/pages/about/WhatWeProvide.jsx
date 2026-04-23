import React from "react";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from "../../components/SEO";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const features = [
  {
    title: "Verified Talent",
    subtitle: "Reputation-Driven Identity",
    desc: "Every freelancer profile is a verified storefront with JSS metrics and checked skills.",
    icon: "/Icons/icons8-verified-48.png"
  },
  {
    title: "Escrow Shield",
    subtitle: "Milestone-Locked Funds",
    desc: "Payments are held in secure escrow and released only upon your explicit approval.",
    icon: "/Icons/icons8-lock-40.png"
  },
  {
    title: "Dual Discovery",
    subtitle: "Bidding + Instant Hire",
    desc: "Choose between traditional job postings or instant-buy service packages.",
    icon: "/Icons/icons8-bag-96.png"
  },
  {
    title: "Smart Matching",
    subtitle: "Algorithmic Precision",
    desc: "Our search engine prioritizes talent based on performance, not just keywords.",
    icon: "/Icons/search.png"
  },
  {
    title: "Secure Chat",
    subtitle: "Contract-Triggered Comms",
    desc: "Messaging activates only after a professional engagement starts, reducing spam.",
    icon: "/Icons/icons8-message-100.png"
  },
  {
    title: "Global Payouts",
    subtitle: "India-First Infrastructure",
    desc: "Withdraw via UPI, Bank Transfer, or PayPal with transparent local support.",
    icon: "/Icons/rupee.png"
  },
  {
    title: "Double-Blind",
    subtitle: "Fair Review Integrity",
    desc: "Reviews are hidden until both parties submit, ensuring 100% honest feedback.",
    icon: "/Icons/icons8-star-100.png"
  },
  {
    title: "Milestone Ops",
    subtitle: "Structured Workflow",
    desc: "Break projects into trackable milestones with automatic contract updates.",
    icon: "/Icons/icons8-check-book-80.png"
  },
  {
    title: "Justice Engine",
    subtitle: "Dispute Resolution",
    desc: "Structured framework for fair mediation and project resolution when needed.",
    icon: "/Icons/icons8-justice-100.png"
  },
  {
    title: "Badge Logic",
    subtitle: "Level Progression",
    desc: "Earn levels from New to Top Rated Plus as you build your career on Connect.",
    icon: "/Icons/icons8-medal-96.png"
  }
];

const WhatWeProvide = () => {
  return (
    <>
      <SEO
        title="Features & Services – What Connect Provides | Freelance Marketplace"
        description="Explore the features of Connect: Escrow payments, verified talent, smart matching, and secure project management. Everything you need for freelance success."
      />
      <Navbar />

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative bg-primary text-light-text py-12 px-6 overflow-hidden min-h-screen"
      >
        <div className="max-w-[1450px] mx-auto space-y-12">

          {/* HEADER */}
          <motion.div variants={fadeUp} className="text-center">
            <h1 className="text-2xl font-semibold mb-3 tracking-tight text-white uppercase">
              Platform <span className="text-accent">Integrity</span>
            </h1>
            <p className="text-white/60 text-base max-w-3xl mx-auto leading-relaxed">
              We deliver a structured, secure, and performance-driven marketplace
              designed to protect transactions and reward elite talent.
            </p>
          </motion.div>

          {/* FEATURES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                className="bg-transparent border border-white/10 rounded-2xl p-10 hover:border-accent transition-colors duration-300"
              >
                <div className="flex items-center gap-5 mb-8">
                  <img src={f.icon} alt={f.title} className="w-10 h-10 object-contain brightness-125" />
                  <div>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">{f.title}</h3>
                    <p className="text-white/40 text-xs uppercase font-medium">{f.subtitle}</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* PHILOSOPHY */}
          <motion.div
            variants={fadeUp}
            className="bg-transparent border border-white/10 rounded-2xl p-12 text-center hover:border-accent/40 transition"
          >
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest">Built for Accountability</h2>
            <p className="text-white/50 text-base max-w-4xl mx-auto leading-relaxed italic">
              "We believe a marketplace is only as strong as its trust signals. Connect replaces
              guesswork with data, and risk with security."
            </p>
          </motion.div>

        </div>
      </motion.section>

      <Footer />
    </>
  );
};

export default WhatWeProvide;
ide;