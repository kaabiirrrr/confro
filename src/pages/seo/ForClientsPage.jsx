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
    icon: "🔍",
    title: "Find Freelancers Instantly",
    desc: "Search thousands of verified freelancer profiles by skill, location, rating, and price. Find the right talent for any project in minutes.",
  },
  {
    icon: "📋",
    title: "Post Jobs for Free",
    desc: "Describe your project, set your budget, and receive proposals from qualified freelancers within hours. No upfront cost to post.",
  },
  {
    icon: "🛡️",
    title: "Hire with Confidence",
    desc: "Every freelancer on Connect is verified. View portfolios, read reviews, and check Job Success Scores before making a hiring decision.",
  },
  {
    icon: "💳",
    title: "Secure Escrow Payments",
    desc: "Pay into escrow upfront. Funds are only released to the freelancer when you approve the completed work. Zero risk of losing money.",
  },
  {
    icon: "📊",
    title: "Manage Projects Easily",
    desc: "Track milestones, review work diaries, communicate via built-in chat, and manage all your contracts from one dashboard.",
  },
  {
    icon: "🤝",
    title: "Direct Contracts",
    desc: "Already know who you want to hire? Send a direct contract to any freelancer with custom terms, rates, and project scope.",
  },
];

const ForClientsPage = () => {
  return (
    <>
      <SEO
        title="For Clients – Hire Freelancers Online | Connect"
        description="Hire top freelancers online on Connect. Post jobs for free, review proposals, and pay securely. Find web developers, designers, writers, and more in India."
        keywords="hire freelancers online India, hire web developers, hire UI UX designers, hire content writers, post freelance jobs, freelancer marketplace for businesses, find talent online"
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
            <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-3 block">For Clients</span>
            <h1 className="text-2xl font-semibold mb-3 tracking-tight text-white uppercase">
              Hire Top Talent Fast & Secure
            </h1>
            <p className="text-white/60 text-base max-w-3xl mx-auto leading-relaxed">
              Connect makes it easy to find and hire skilled freelancers for any project.
              Post a job for free, review proposals, and pay only when you're satisfied.
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

          {/* HOW TO HIRE */}
          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.01 }}
            className="bg-transparent border border-white/10 rounded-2xl p-10 hover:border-accent transition-colors duration-300"
          >
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tighter">How to Hire on Connect</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <ol className="space-y-4">
                {[
                  "Sign up for free and select 'Client' as your account type.",
                  "Post your job — it takes under 5 minutes.",
                  "Receive proposals from verified freelancers and review portfolios.",
                  "Chat with candidates and send an offer to your preferred freelancer.",
                  "Fund the escrow, collaborate, and release payment when satisfied.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-4 text-white/60 text-base">
                    <span className="text-accent font-bold flex-shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <h3 className="text-white font-semibold mb-2 text-sm uppercase">Secure Shield</h3>
                <p className="text-white/40 text-xs leading-relaxed">
                  Your payments are protected by our Bank-Grade Escrow system. Funds are only released when milestones are cleared.
                </p>
              </div>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            variants={fadeUp}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                q: "Is it free to post?",
                a: "Yes, posting a job is completely free. You only pay when you hire."
              },
              {
                q: "How to trust?",
                a: "Every freelancer is identity verified with Job Success metrics."
              },
              {
                q: "What if unsatisfied?",
                a: "Funds stay in escrow until you approve. Disputes are handled by our resolution team."
              },
            ].map((faq, i) => (
              <div key={i} className="bg-transparent border border-white/10 rounded-xl p-6 hover:border-accent/40 transition">
                <h3 className="text-white font-semibold text-sm mb-2">{faq.q}</h3>
                <p className="text-white/60 text-xs leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            className="text-center pt-8"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Ready to Hire Your First Freelancer?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="bg-accent text-white px-10 py-3 rounded-full font-semibold hover:opacity-90 transition">
                Post a Job Free
              </Link>
              <Link to="/find-freelancers" className="border border-white/20 text-white px-10 py-3 rounded-full font-semibold hover:border-accent hover:text-accent transition">
                Browse Talent
              </Link>
            </div>
          </motion.div>

        </div>
      </motion.section>

      <Footer />
    </>
  );
};

export default ForClientsPage;
