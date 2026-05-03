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

const AboutPage = () => {
  return (
    <>
      <SEO
        title="About Connect Freelance – Freelance Marketplace for Hiring & Finding Work"
        description="Learn about Connect Freelance, the freelance marketplace that connects businesses with skilled freelancers across India and worldwide. Hire talent or find freelance jobs today."
        keywords="about connect freelance, freelance marketplace India, hire freelancers online, find freelance work, freelancer platform"
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
            <h1 className="text-2xl font-semibold mb-3 tracking-tight text-white">
              About Connect
            </h1>
            <p className="text-white/60 text-base max-w-3xl mx-auto">
              Connect is a modern freelance marketplace that makes it simple for businesses
              to find skilled freelancers — and for professionals to find meaningful work online.
            </p>
          </motion.div>

          {/* WHAT WE DO CARD */}
          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.01 }}
            className="bg-transparent p-8 rounded-2xl border border-white/10 hover:border-accent transition-colors duration-300"
          >
            <h2 className="text-xl font-semibold text-accent mb-3">
              What We Do
            </h2>
            <div className="space-y-4 text-white/60 text-base leading-relaxed">
              <p>
                Connect Freelance is a dual-model freelance platform. Clients can post jobs and receive
                proposals from verified freelancers, or browse and purchase pre-packaged service
                listings instantly. Freelancers can apply to jobs, showcase their portfolio, and
                sell services directly to clients worldwide.
              </p>
              <p>
                We serve businesses of all sizes — from startups looking for their first developer
                to enterprises scaling their creative teams. Our platform covers web development,
                UI/UX design, content writing, mobile app development, digital marketing, and more.
              </p>
            </div>
          </motion.div>

          {/* WHY CHOOSE US CARD */}
          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.01 }}
            className="bg-transparent p-8 rounded-2xl border border-white/10 hover:border-accent transition-colors duration-300"
          >
            <h2 className="text-xl font-semibold text-accent mb-3">
              Why Choose Connect Freelance?
            </h2>
            <ul className="space-y-4 text-white/60 text-base">
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold mt-0.5">✓</span>
                <span><strong className="text-white">Verified Freelancers</strong> — Every freelancer goes through identity verification and profile review before being listed.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold mt-0.5">✓</span>
                <span><strong className="text-white">Secure Payments</strong> — Escrow-based payment system ensures funds are only released when work is approved.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold mt-0.5">✓</span>
                <span><strong className="text-white">Real-time Collaboration</strong> — Built-in messaging, video calls, and work diary tools keep projects on track.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold mt-0.5">✓</span>
                <span><strong className="text-white">India-First Payouts</strong> — Fast, reliable withdrawals for Indian freelancers with local payment support.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold mt-0.5">✓</span>
                <span><strong className="text-white">Dispute Resolution</strong> — Dedicated support team to resolve any project disputes fairly.</span>
              </li>
            </ul>
          </motion.div>

          {/* OUR STORY CARD */}
          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.01 }}
            className="bg-transparent p-8 rounded-2xl border border-white/10 hover:border-accent transition-colors duration-300"
          >
            <h2 className="text-xl font-semibold text-accent mb-3">
              Our Story
            </h2>
            <div className="space-y-4 text-white/60 text-base leading-relaxed">
              <p>
                Connect Freelance was founded by a team of developers and entrepreneurs from Nashik, Maharashtra,
                who experienced firsthand the frustrations of traditional freelance hiring — unreliable
                talent, unclear pricing, and zero accountability.
              </p>
              <p>
                We built Connect Freelance to solve these problems: a platform where trust is built into every
                transaction, where freelancers are rewarded for quality work, and where clients can hire
                with confidence. Today, Connect Freelance serves hundreds of professionals across India and beyond.
              </p>
            </div>
          </motion.div>

          {/* CTA SECTION */}
          <motion.div variants={fadeUp} className="text-center pt-6">
            <h2 className="text-xl font-semibold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-white/60 mb-8 text-base">Join thousands of freelancers and businesses already on Connect Freelance.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/find-freelancers" className="bg-accent text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition">
                Hire a Freelancer
              </Link>
              <Link to="/find-work" className="border border-white/20 text-white px-8 py-3 rounded-full font-semibold hover:border-accent hover:text-accent transition">
                Find Work
              </Link>
            </div>
          </motion.div>

        </div>
      </motion.section>

      <Footer />
    </>
  );
};

export default AboutPage;
