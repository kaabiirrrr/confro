import React from "react";
import { motion } from "framer-motion";
import { FiShare2, FiShield, FiUsers } from "react-icons/fi";

const containerVariant = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.25,
    },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const WhyChooseUs = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative bg-primary py-16 px-6 overflow-hidden"
    >
      <div className="max-w-[1500px] mx-auto relative">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-24 relative z-10"
        >
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            WHY CHOOSE US?
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-sm sm:text-lg">
            Choose us for unmatched quality, exceptional service, and a commitment
            to exceeding your expectations every time.
          </p>
        </motion.div>

        {/* ABSOLUTE IMAGE — hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, x: -120 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="hidden md:block absolute -left-30 top-30 bottom-0 z-0"
        >
          <motion.img
            src="/WhyChooseUs-Picsart-BackgroundRemover.png"
            alt="Professional"
            className="h-[780px] w-auto object-contain"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </motion.div>

        {/* CONTENT WRAPPER */}
        <motion.div
          variants={containerVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10 ml-0 md:ml-[700px] flex flex-col gap-10"
        >

          {/* ITEM 1 */}
          <motion.div
            variants={itemVariant}
            whileHover={{ scale: 1.03 }}
            className="flex items-start gap-6"
          >
            <div className="w-16 h-16 flex-shrink-0 rounded-full bg-secondary flex items-center justify-center text-accent">
              <FiShare2 size={26} />
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-white tracking-wide">
                SEAMLESS COLLABORATION
              </h3>
              <p className="text-gray-400 mt-3 text-sm sm:text-lg leading-relaxed max-w-[520px]">
                Our user-friendly platform ensures a seamless collaboration
                experience. Communicate with freelancers, share files, and
                track project progress effortlessly.
              </p>
            </div>
          </motion.div>

          {/* ITEM 2 */}
          <motion.div
            variants={itemVariant}
            whileHover={{ scale: 1.03 }}
            className="ml-0 md:ml-24 bg-secondary rounded-[30px] px-6 md:px-12 py-8 md:py-10 flex items-start gap-6"
          >
            <div className="w-16 h-16 flex-shrink-0 rounded-full bg-[#0b1d33] flex items-center justify-center text-accent">
              <FiUsers size={26} />
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-white tracking-wide">
                SUPPORT AND COMMUNITY
              </h3>
              <p className="text-gray-300 mt-3 text-sm sm:text-lg leading-relaxed max-w-[520px]">
                Join a vibrant community of freelancers and clients who are
                passionate about their work. Our support team is available
                to assist you whenever you need help or have questions.
              </p>
            </div>
          </motion.div>

          {/* ITEM 3 */}
          <motion.div
            variants={itemVariant}
            whileHover={{ scale: 1.03 }}
            className="flex items-start gap-6"
          >
            <div className="w-16 h-16 flex-shrink-0 rounded-full bg-secondary flex items-center justify-center text-accent">
              <FiShield size={26} />
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-white tracking-wide">
                SECURE AND RELIABLE
              </h3>
              <p className="text-gray-400 mt-3 text-sm sm:text-lg leading-relaxed max-w-[520px]">
                Your safety and security are our top priorities. We implement
                robust measures to protect your data and financial transactions.
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </motion.section>
  );
};

export default WhyChooseUs;