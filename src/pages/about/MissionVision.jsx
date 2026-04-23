import React from "react";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const MissionVision = () => {
  return (
    <>
      <Navbar />

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative bg-primary text-light-text py-12 px-6 overflow-hidden"
      >
        <div className="max-w-[1450px] mx-auto space-y-10">

          {/* HEADER */}
          <motion.div variants={fadeUp} className="text-center">
            <h2 className="text-2xl font-semibold mb-3 tracking-tight text-white">
              Our Mission & Vision
            </h2>
            <p className="text-white/60 text-base max-w-3xl mx-auto">
              Connect is built to redefine freelance collaboration by combining
              trust, transparency, and technology into one unified ecosystem.
            </p>
          </motion.div>

          {/* MISSION CARD */}
          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.01 }}
            className="bg-transparent p-8 rounded-2xl border border-white/10 hover:border-accent transition-colors duration-300"
          >
            <h3 className="text-xl font-semibold text-accent mb-3">
              Our Mission
            </h3>

            <p className="text-white/60 text-base leading-relaxed mb-6">
              Our mission is to eliminate friction in freelance hiring by creating
              a dual-model marketplace where clients can either post jobs and receive
              proposals or instantly purchase structured service packages.
            </p>

            <div className="space-y-4 text-white/60 text-base leading-relaxed">
              <p>
                We aim to provide a secure escrow-based payment system that protects
                both clients and freelancers, ensuring every transaction is transparent
                and contract-backed.
              </p>

              <p>
                By implementing a reputation-driven Job Success Score (JSS),
                structured reviews, and milestone-based contracts, we create
                measurable trust signals that reward professionalism and quality.
              </p>

              <p>
                Our India-first payout infrastructure — including UPI, Payoneer,
                and global bank transfers — ensures freelancers get paid easily
                and reliably without unnecessary platform barriers.
              </p>

              <p>
                Ultimately, our mission is to empower independent professionals
                to build sustainable income streams while helping businesses hire
                verified talent faster and more efficiently.
              </p>
            </div>
          </motion.div>

          {/* VISION CARD */}
          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.01 }}
            className="bg-transparent p-8 rounded-2xl border border-white/10 hover:border-accent transition-colors duration-300"
          >
            <h3 className="text-xl font-semibold text-accent mb-3">
              Our Vision
            </h3>

            <p className="text-white/60 text-base leading-relaxed mb-6">
              We envision Connect becoming the most trusted freelance marketplace
              in South Asia and beyond — where quality work meets fair compensation
              and every interaction is protected by transparent contracts.
            </p>

            <div className="space-y-4 text-white/60 text-base leading-relaxed">
              <p>
                Our long-term vision is to create a reputation-first economy
                powered by measurable performance metrics instead of vanity indicators.
              </p>

              <p>
                Through intelligent ranking systems, AI-powered freelancer matching,
                and data-driven trust algorithms, we aim to reduce hiring time
                from days to hours.
              </p>

              <p>
                We are building a global professional ecosystem where freelancers
                can grow from beginners to Top Rated experts, supported by a
                structured leveling system that rewards consistency and excellence.
              </p>

              <p>
                Connect strives to become more than a marketplace — we aim to be
                the infrastructure layer for the future freelance economy.
              </p>
            </div>
          </motion.div>

        </div>
      </motion.section>

      <Footer />
    </>
  );
};

export default MissionVision;