import React from "react";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { motion } from "framer-motion";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const Legal = () => {
  return (
    <>
      <Navbar />

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={container}
        className="max-w-[1450px] mx-auto px-6 py-12 space-y-10"
      >

        {/* PAGE TITLE */}
        <motion.header
          variants={fadeUp}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold mb-3 tracking-tight text-white">
            Legal Information
          </h2>

          <p className="text-white/60 text-base max-w-3xl mx-auto">
            This page outlines the policies and legal terms governing the use of
            the Connect platform. These policies ensure transparency, fairness,
            and security for both freelancers and clients using the marketplace.
          </p>
        </motion.header>

        {/* PRIVACY POLICY */}
        <motion.section
          id="privacy-policy"
          variants={fadeUp}
          whileHover={{ scale: 1.01 }}
          className="bg-transparent p-8 rounded-2xl border border-white/10 hover:border-accent transition-colors duration-300"
        >
          <h3 className="text-xl font-semibold text-accent mb-3">Privacy Policy</h3>

          <div className="space-y-4 text-white/60 text-base leading-relaxed">
            <p>
              Connect respects your privacy and is committed to protecting your
              personal information. This policy explains how we collect, use, and
              safeguard the data you provide when interacting with the platform.
            </p>

            <p>
              When users create an account, we may collect personal information
              such as your name, email address, professional details, and account
              preferences. This information is necessary for account creation,
              platform access, and communication between freelancers and clients.
            </p>

            <p>
              Your data is used to operate and improve our services, provide
              customer support, process payments, and maintain platform security.
              We use industry-standard safeguards to protect user data from
              unauthorized access.
            </p>

            <p>
              Connect does not sell personal data to third parties. Information
              may only be shared when required to complete services, process
              payments, or comply with legal requirements.
            </p>
          </div>
        </motion.section>

        {/* TERMS */}
        <motion.section
          id="terms"
          variants={fadeUp}
          whileHover={{ scale: 1.01 }}
          className="bg-transparent p-8 rounded-2xl border border-white/10 hover:border-accent transition-colors duration-300"
        >
          <h3 className="text-xl font-semibold text-accent mb-3">
            Terms & Conditions
          </h3>

          <div className="space-y-4 text-white/60 text-base leading-relaxed">
            <p>
              By accessing or using Connect, you agree to comply with these Terms
              and Conditions. These terms define the responsibilities of users and
              ensure that the platform operates in a fair and professional manner.
            </p>

            <p>
              Users must provide accurate information when creating an account and
              must not misuse the platform for fraudulent or illegal activities.
            </p>

            <p>
              Freelancers are responsible for delivering services according to
              agreed project requirements, while clients must provide clear
              project expectations and approve payments for completed milestones.
            </p>

            <p>
              Connect reserves the right to update these terms, restrict access to
              accounts that violate policies, and maintain a safe environment for
              all users.
            </p>
          </div>
        </motion.section>

        {/* COOKIE POLICY */}
        <motion.section
          id="cookie-policy"
          variants={fadeUp}
          whileHover={{ scale: 1.01 }}
          className="bg-transparent p-8 rounded-2xl border border-white/10 hover:border-accent transition-colors duration-300"
        >
          <h3 className="text-xl font-semibold text-accent mb-3">
            Cookie Policy
          </h3>

          <div className="space-y-4 text-white/60 text-base leading-relaxed">
            <p>
              Connect uses cookies and similar technologies to enhance the
              functionality of the website and improve user experience.
            </p>

            <p>
              Cookies help us remember user preferences, maintain login sessions,
              and analyze website performance to optimize features and usability.
            </p>

            <p>
              Some cookies are essential for platform functionality, while others
              help us analyze usage patterns and improve our services.
            </p>

            <p>
              Users can disable cookies through browser settings, although doing
              so may limit certain features of the platform.
            </p>
          </div>
        </motion.section>

        {/* REFUND POLICY */}
        <motion.section
          id="refund-policy"
          variants={fadeUp}
          whileHover={{ scale: 1.01 }}
          className="bg-transparent p-8 rounded-2xl border border-white/10 hover:border-accent transition-colors duration-300"
        >
          <h3 className="text-xl font-semibold text-accent mb-3">
            Refund Policy
          </h3>

          <div className="space-y-4 text-white/60 text-base leading-relaxed">
            <p>
              Connect operates with a secure escrow-based payment system that
              protects both freelancers and clients during project transactions.
            </p>

            <p>
              Payments are held securely until project milestones are completed
              and approved. This system ensures that freelancers are compensated
              for their work while clients receive the agreed deliverables.
            </p>

            <p>
              In case of disputes, Connect may review communication records,
              project requirements, and submitted work to determine a fair
              resolution.
            </p>

            <p>
              Refunds may be issued when services were not delivered according to
              agreed requirements or when projects are cancelled before work is
              completed.
            </p>
          </div>
        </motion.section>

      </motion.section>

      <Footer />
    </>
  );
};

export default Legal;