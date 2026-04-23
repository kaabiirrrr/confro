import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Reviews from '../components/solutions/Reviews';
import FAQ from '../components/solutions/FAQ';
import HowConnectWorks from '../components/solutions/HowConnectWorks';
import CTAForm from '../components/solutions/CTAForm';

const problems = [
  {
    question: "Businesses struggle to find reliable freelancers",
    answer:
      "Companies often spend hours browsing profiles and portfolios but still struggle to identify freelancers who truly have the right skills and experience for their projects.",
  },
  {
    question: "Freelancers struggle to find consistent work",
    answer:
      "Freelancers frequently face challenges finding stable project opportunities and connecting with clients who need their skills.",
  },
  {
    question: "Trust and credibility issues",
    answer:
      "Clients worry about hiring freelancers who might not deliver quality work, while freelancers worry about clients who may delay payment.",
  },
  {
    question: "Payment security concerns",
    answer:
      "Freelancers often experience delayed payments while clients worry about paying upfront without receiving quality work.",
  },
  {
    question: "Communication problems during projects",
    answer:
      "Without structured communication tools, freelancers and clients struggle to stay aligned on deadlines and feedback.",
  },
  {
    question: "Difficulty managing multiple projects",
    answer:
      "Businesses managing several freelancers and freelancers working with multiple clients struggle to stay organized.",
  },
];

const solutions = [
  {
    title: "Verified Freelancer Profiles",
    description:
      "Connect verifies freelancer profiles including their skills, portfolio, and experience so businesses can hire with confidence.",
  },
  {
    title: "Smart Talent Matching",
    description:
      "Our intelligent system connects businesses with freelancers based on skills, experience, and project needs.",
  },
  {
    title: "Secure Escrow Payments",
    description:
      "Funds are safely held in escrow until project milestones are completed successfully.",
  },
  {
    title: "Integrated Communication Tools",
    description:
      "Chat, file sharing, and updates keep freelancers and clients aligned during the project lifecycle.",
  },
  {
    title: "Transparent Review System",
    description:
      "Ratings and reviews help build trust between freelancers and businesses.",
  },
  {
    title: "Efficient Project Management",
    description:
      "Track deadlines, deliverables, and progress easily using Connect tools.",
  },
];

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardAnimation = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const Solutions = () => {
  return (
    <div className="bg-primary min-h-screen">

      <Navbar />

      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-[1500px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-8"
      >
        <h1 className="text-lg sm:text-2xl font-semibold mb-2 sm:mb-3 tracking-tight text-white">
          Solutions
        </h1>
        <p className="text-white/60 text-xs sm:text-base">
          Discover how Connect helps freelancers and businesses collaborate efficiently.
        </p>
      </motion.div>

      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h2 className="text-xl sm:text-3xl font-semibold mb-6 sm:mb-10">
          Problems People Face
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8"
        >
          {problems.map((item, index) => (
            <motion.div
              key={index}
              variants={cardAnimation}
              whileHover={{ y: -8 }}
              className="bg-transparent border border-white/10 hover:border-accent rounded-xl p-5 sm:p-6 transition-colors duration-300"
            >
              <h3 className="text-base sm:text-xl font-semibold mb-2 sm:mb-3">
                {item.question}
              </h3>
              <p className="text-white/60 text-xs sm:text-base leading-relaxed">
                {item.answer}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h2 className="text-xl sm:text-3xl font-semibold mb-6 sm:mb-10">
          How Connect Solves These Problems
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8"
        >
          {solutions.map((item, index) => (
            <motion.div
              key={index}
              variants={cardAnimation}
              whileHover={{ y: -8 }}
              className="bg-transparent border border-white/10 hover:border-accent rounded-xl p-5 sm:p-6 transition-colors duration-300"
            >
              <h4 className="text-base sm:text-xl font-semibold mb-2 sm:mb-3">
                {item.title}
              </h4>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <HowConnectWorks />

      <Reviews />

      <CTAForm />

      <FAQ />

      <Footer />

    </div>
  );
};

export default Solutions;