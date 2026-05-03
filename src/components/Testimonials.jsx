import React from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

const Testimonials = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-primary px-6"
    >
      <div className="max-w-[1500px] mx-auto">

        <div className="relative bg-secondary rounded-[40px] px-6 sm:px-20 py-10 sm:py-20 flex flex-col sm:flex-row justify-between items-center sm:items-center gap-10 sm:gap-0 overflow-hidden text-center sm:text-left">

          {/* CURVED ARROW — desktop only */}
          <motion.img
            src="/arrow-curve.png"
            alt="arrow"
            className="hidden sm:block absolute left-[320px] bottom-[-30px] w-[580px] opacity-80"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-full sm:w-1/2 relative z-10"
          >
            <h2 className="text-2xl sm:text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              WHAT OUR <br /> CUSTOMERS SAY
            </h2>

            <div className="flex gap-6 mt-8 sm:mt-16 justify-center sm:justify-start">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-full border border-gray-400 text-gray-300 flex items-center justify-center cursor-pointer hover:bg-accent hover:text-white transition"
              >
                <FiArrowLeft size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-full border border-gray-400 text-gray-300 flex items-center justify-center cursor-pointer hover:bg-accent hover:text-white transition"
              >
                <FiArrowRight size={20} />
              </motion.button>
            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.2 },
              },
            }}
            className="w-full sm:w-1/2 relative flex flex-col z-10 items-center sm:items-start"
          >
            {/* Floating Quote Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 0.7, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="hidden sm:block absolute top-[-100px] left-[-100px]"
            >
              <motion.img
                src="/2Quotation.png"
                alt="quote"
                className="w-50 h-50 object-contain pointer-events-none"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
            </motion.div>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-gray-300 text-sm sm:text-lg leading-relaxed mb-8 relative z-10"
            >
              I recently hired a freelancer for a project, and I couldn’t be happier with the results.
              Their work exceeded my expectations in every way. Communication was smooth, deadlines
              were met, and the quality was outstanding. I highly recommend this freelancer to
              anyone looking for top-notch skills and professionalism.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              className="flex items-center gap-4 justify-center sm:justify-start"
            >
              <motion.img
                whileHover={{ scale: 1.1 }}
                src="https://www.wilsoncenter.org/sites/default/files/media/images/person/james-person-1.jpg"
                alt="Customer"
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <h4 className="text-white font-semibold text-base sm:text-lg">
                  Thomas Karlow
                </h4>
                <p className="text-gray-400 text-sm">
                  CEO at Cakar Ltd.
                </p>
              </div>
            </motion.div>

          </motion.div>

        </div>

      </div>
    </motion.section>
  );
};

export default Testimonials;