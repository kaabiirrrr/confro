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

const HowToFindFreelancersIndia = () => {
  return (
    <>
      <SEO
        title="How to Find Freelancers in India (Complete 2026 Guide) | Connect"
        description="Learn how to find and hire top freelancers in India in 2026. Step-by-step guide covering platforms, pricing, vetting tips, and how to manage remote freelancers effectively."
        keywords="how to find freelancers in India, hire freelancers India 2026, best freelance platforms India, find web developers India, hire designers India, freelancer hiring guide India"
      />
      <Navbar />

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative bg-primary text-light-text py-12 px-6 overflow-hidden min-h-screen"
      >
        <div className="max-w-[1450px] mx-auto space-y-16">

          {/* HEADER */}
          <motion.div variants={fadeUp} className="text-center">
            <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-3 block">Guide</span>
            <h1 className="text-2xl font-semibold mb-3 tracking-tight text-white uppercase">
              How to Find Freelancers in India (2026)
            </h1>
            <p className="text-white/60 text-base max-w-3xl mx-auto leading-relaxed">
              India has one of the largest and most skilled freelance workforces in the world. 
              Find, vet, and hire top-quality talent at competitive rates with this complete guide.
            </p>
          </motion.div>

          {/* WHY INDIA GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[
                { icon: "💰", title: "Cost-Effective", desc: "Indian freelancers offer world-class quality at 40–70% lower rates than Western markets." },
                { icon: "🎓", title: "Highly Skilled", desc: "India has a deep talent pool in web dev, mobile, UI/UX, content, and AI." },
                { icon: "🌐", title: "English Proficiency", desc: "Communication is seamless with one of the largest English-speaking workforces." },
                { icon: "⏰", title: "Time Zone Edge", desc: "Enable round-the-clock productivity with a significant time zone advantage." },
                { icon: "📈", title: "Growing Economy", desc: "India's freelance economy is growing 20%+ annually with verified talent pools." },
                { icon: "✅", title: "Proven Quality", desc: "Elite Indian freelancers are known for their reliability and professional expertise." }
             ].map((b, i) => (
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

          {/* WHERE TO FIND */}
          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.01 }}
            className="bg-transparent border border-white/10 rounded-2xl p-10 hover:border-accent transition-colors duration-300"
          >
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tighter">Where to Find Talent</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-xl border border-accent/20">
                  <h3 className="text-accent font-bold mb-2 uppercase tracking-wide">Connect — Best for India</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">
                    The fastest-growing freelance engine in India with verified profiles, 
                    escrow payments, and real-time collaboration tools.
                  </p>
                  <Link to="/find-freelancers" className="text-white font-semibold text-sm hover:underline hover:text-accent flex items-center gap-2">
                    Browse Freelancers <span>→</span>
                  </Link>
                </div>
                <div className="p-4 space-y-4">
                   <p className="text-white/40 text-sm">Other alternatives:</p>
                   <ul className="space-y-2 text-white/60 text-sm">
                      <li>• LinkedIn (Professional Profiles)</li>
                      <li>• Upwork (Global Marketplace)</li>
                      <li>• Freelancer.com (Budget Options)</li>
                   </ul>
                </div>
              </div>
              <div className="bg-white/5 p-6 rounded-xl border border-white/10 h-full flex flex-col justify-center">
                <h3 className="text-white font-semibold mb-3">Vetting Checklist</h3>
                <ul className="space-y-3">
                  {[
                    "Check portfolio relevance",
                    "Read recent client reviews",
                    "Verify Identity Badge status",
                    "Run a small paid test task",
                    "Assess communication speed",
                  ].map((check, i) => (
                    <li key={i} className="flex gap-3 text-white/50 text-sm">
                      <span className="text-accent font-bold">✓</span>
                      <span>{check}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* PRICING TABLE SECTION */}
          <motion.div variants={fadeUp} className="space-y-6">
            <h2 className="text-2xl font-bold text-white uppercase tracking-tighter text-center">Pricing Matrix (2026)</h2>
            <div className="overflow-x-auto bg-transparent border border-white/10 rounded-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 font-bold uppercase tracking-widest text-[10px]">
                    <th className="p-6 text-left">Vertical</th>
                    <th className="p-6 text-left">Junior</th>
                    <th className="p-6 text-left">Mid-Level</th>
                    <th className="p-6 text-left">Senior Elite</th>
                  </tr>
                </thead>
                <tbody className="text-white/60 divide-y divide-white/5">
                  {[
                    { v: "Web Dev", j: "₹500/hr", m: "₹2,000/hr", s: "₹5,000/hr" },
                    { v: "UI/UX", j: "₹400/hr", m: "₹1,800/hr", s: "₹4,000/hr" },
                    { v: "AI/Mobile", j: "₹600/hr", m: "₹2,500/hr", s: "₹6,000/hr" },
                    { v: "Content", j: "₹200/hr", m: "₹800/hr", s: "₹2,000/hr" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 font-semibold text-white">{row.v}</td>
                      <td className="p-6">{row.j}</td>
                      <td className="p-6">{row.m}</td>
                      <td className="p-6 text-white font-bold italic">{row.s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* STEP BY STEP (HOW TO HIRE STYLE) */}
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
              <div className="bg-white/5 p-6 rounded-xl border border-white/10 h-fit">
                <h3 className="text-white font-semibold mb-2 text-sm uppercase">Secure Shield</h3>
                <p className="text-white/40 text-[11px] leading-relaxed">
                  Your payments are protected by our Bank-Grade Escrow system. Funds are only released when milestones are cleared and approved by you.
                </p>
              </div>
            </div>
          </motion.div>

          {/* FAQ (MATCHING FOR CLIENTS) */}
          <motion.div
            variants={fadeUp}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                q: "What is the best platform?",
                a: "Connect is the best for finding verified Indian freelancers with escrow protection."
              },
              {
                q: "Is it safe to pay?",
                a: "Yes, funds stay in escrow until you approve the work. No upfront risk."
              },
              {
                q: "How to judge trust?",
                a: "Look for the Verified Identity badge and check Job Success Score metrics."
              },
            ].map((faq, i) => (
              <div key={i} className="bg-transparent border border-white/10 rounded-xl p-6 hover:border-accent/40 transition">
                <h3 className="text-white font-semibold text-sm mb-2 uppercase tracking-wide">{faq.q}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA SECTION */}
          <motion.div variants={fadeUp} className="text-center pt-8">
            <h2 className="text-xl font-semibold text-white mb-6 uppercase tracking-tight">Ready to Find Your First Freelancer?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="bg-accent text-white px-10 py-3 rounded-full font-semibold hover:opacity-90 transition shadow-lg shadow-accent/20">
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

export default HowToFindFreelancersIndia;
