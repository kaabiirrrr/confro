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

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    desc: "Sign up as a client or freelancer in under 2 minutes. Verify your email and complete your profile to get started on Connect.",
  },
  {
    number: "02",
    title: "Post a Job or Browse Services",
    desc: "Clients can post a detailed job listing and receive proposals from qualified freelancers. Or browse our services marketplace to hire instantly.",
  },
  {
    number: "03",
    title: "Review & Hire",
    desc: "Compare freelancer profiles, portfolios, reviews, and rates. Send an offer and agree on project scope, timeline, and payment terms.",
  },
  {
    number: "04",
    title: "Work & Collaborate",
    desc: "Use built-in messaging, video calls, and work diary tools to collaborate in real time. Track progress and stay aligned throughout the project.",
  },
  {
    number: "05",
    title: "Approve & Pay Securely",
    desc: "Funds are held in escrow and released only when you approve the work. Freelancers get paid fast with India-first payout support.",
  },
  {
    number: "06",
    title: "Review & Repeat",
    desc: "Leave a review to help the community. Build long-term relationships with trusted freelancers and grow your business with Connect.",
  },
];

const HowItWorksPage = () => {
  return (
    <>
      <SEO
        title="How Connect Works – Hire Freelancers or Find Work in 6 Easy Steps"
        description="Learn how Connect works. Post a job, review proposals, collaborate, and pay securely. Find freelancers online or get hired for freelance jobs in India."
        keywords="how to hire freelancers online, how freelance marketplace works, find freelance jobs India, post a job online, hire freelancers steps"
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
            <h1 className="text-2xl font-semibold mb-3 tracking-tight text-white uppercase">
              How Connect Works
            </h1>
            <p className="text-white/60 text-base max-w-3xl mx-auto leading-relaxed">
              Hiring a freelancer or finding work online has never been easier.
              Our 6-step workflow ensures transparency, security, and quality in every transaction.
            </p>
          </motion.div>

          {/* STEPS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                className="bg-transparent border border-white/10 rounded-2xl p-8 hover:border-accent transition-colors duration-300"
              >
                <span className="text-4xl font-black text-accent/20 block mb-4 tracking-tighter">{step.number}</span>
                <h2 className="text-xl font-semibold text-white mb-2">{step.title}</h2>
                <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* CLIENTS VS FREELANCERS */}
          <motion.div
            variants={fadeUp}
            className="grid sm:grid-cols-2 gap-8"
          >
            <div className="bg-transparent border border-white/10 rounded-2xl p-10 hover:border-accent transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tighter">For Clients</h2>
              <p className="text-white/60 text-base leading-relaxed mb-6">
                Post jobs for free, receive proposals within hours, and hire verified freelancers
                with confidence. Pay only when you're satisfied with the work.
              </p>
              <Link to="/for-clients" className="bg-accent text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 block w-full sm:inline-block sm:w-auto text-center transition">
                Learn more
              </Link>
            </div>
            <div className="bg-transparent border border-white/10 rounded-2xl p-10 hover:border-accent transition-colors duration-300">
              <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tighter">For Freelancers</h2>
              <p className="text-white/60 text-base leading-relaxed mb-6">
                Create a profile, apply to jobs, or sell your services directly. Get paid securely
                and build your reputation with every completed project.
              </p>
              <Link to="/for-freelancers" className="bg-accent text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 block w-full sm:inline-block sm:w-auto text-center transition">
                Learn more
              </Link>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            className="text-center pt-8"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Start Today — It's Free</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="bg-accent text-white px-10 py-3 rounded-full font-semibold hover:opacity-90 transition">
                Get Started Free
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

export default HowItWorksPage;
