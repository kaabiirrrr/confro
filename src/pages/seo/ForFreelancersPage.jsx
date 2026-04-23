import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const benefits = [
  {
    icon: "💼",
    title: "Find Freelance Jobs Online",
    desc: "Browse hundreds of active job listings across web development, design, writing, marketing, and more. Apply with a single proposal and get hired fast.",
  },
  {
    icon: "🛒",
    title: "Sell Your Services Directly",
    desc: "Create service packages and let clients hire you instantly — no bidding required. Set your own price, scope, and delivery timeline.",
  },
  {
    icon: "💰",
    title: "Get Paid Securely",
    desc: "Funds are held in escrow and released when work is approved. Fast withdrawals with India-first payout support including UPI and bank transfers.",
  },
  {
    icon: "⭐",
    title: "Build Your Reputation",
    desc: "Every completed project earns you reviews and improves your Job Success Score (JSS). Top-rated freelancers get more visibility and better clients.",
  },
  {
    icon: "📈",
    title: "Grow With Membership Plans",
    desc: "Upgrade to Pro or Premium to unlock more proposals, profile boosts, and priority placement in search results.",
  },
  {
    icon: "🔒",
    title: "Verified & Trusted Platform",
    desc: "Complete identity verification to earn a verified badge. Clients trust verified freelancers more — leading to higher conversion rates.",
  },
];

const ForFreelancersPage = () => {
  return (
    <>
      <SEO
        title="For Freelancers – Find Freelance Jobs Online | Connect"
        description="Find freelance jobs online on Connect. Apply to web development, design, writing, and marketing jobs. Get paid securely and build your freelance career in India."
        keywords="find freelance jobs online, freelance jobs India, freelance web developer jobs, freelance designer jobs, freelance writer jobs, get paid freelancing, freelancer platform India"
      />
      <Navbar />

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative bg-primary text-light-text py-12 px-6 overflow-hidden min-h-screen"
      >
        <div className="max-w-[1450px] mx-auto space-y-10">

          {/* HEADER */}
          <motion.div variants={fadeUp} className="text-center">
            <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-3 block">For Freelancers</span>
            <h1 className="text-2xl font-semibold mb-3 tracking-tight text-white uppercase">
              Get Paid What You're Worth
            </h1>
            <p className="text-white/60 text-base max-w-3xl mx-auto leading-relaxed">
              Connect is the freelance jobs platform built for professionals.
              Apply to jobs, sell services, and grow your freelance career — all in one place.
            </p>
          </motion.div>

          {/* BENEFITS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                className="bg-transparent border border-white/10 rounded-2xl p-8 hover:border-accent transition-colors duration-300"
              >
                <span className="text-4xl mb-4 block leading-none">{b.icon}</span>
                <h3 className="text-xl font-semibold text-white mb-2">{b.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* HOW TO START */}
          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.01 }}
            className="bg-transparent border border-white/10 rounded-2xl p-10 hover:border-accent transition-colors duration-300"
          >
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tighter">How to Start Freelancing on Connect</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <ol className="space-y-4">
                {[
                  "Sign up for free and choose 'Freelancer' as your account type.",
                  "Complete your profile — add skills, experience, and portfolio.",
                  "Get identity verified to earn a trusted badge and rank higher.",
                  "Browse job listings and submit proposals, or sell services directly.",
                  "Deliver great work and build your reputation on the platform.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-4 text-white/60 text-base">
                    <span className="text-accent font-bold flex-shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <h3 className="text-white font-semibold mb-3">Popular Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Web Dev", "UI/UX", "Mobile Apps", "Content", "SEO", "Design", "Video"
                  ].map((cat, i) => (
                    <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            className="text-center pt-8"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Join Thousands of Freelancers</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="bg-accent text-white px-10 py-3 rounded-full font-semibold hover:opacity-90 transition">
                Create Free Account
              </Link>
              <Link to="/find-work" className="border border-white/20 text-white px-10 py-3 rounded-full font-semibold hover:border-accent hover:text-accent transition">
                Browse Jobs
              </Link>
            </div>
          </motion.div>

        </div>
      </motion.section>

      <Footer />
    </>
  );
};

export default ForFreelancersPage;
