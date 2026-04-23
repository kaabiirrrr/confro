import React from "react";
import { motion } from "framer-motion";

const Fortalent = () => {
  return (
    <section className="bg-primary py-16 px-6 overflow-hidden">
      <div className="max-w-[1500px] mx-auto">

        {/* MAIN CONTAINER */}
        <div className="relative rounded-[40px] overflow-hidden bg-[#14263d]">

          {/* TOP IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="h-[260px] sm:h-[600px] lg:h-[820px] w-full overflow-hidden"
          >
            <motion.img
              src="/ForTalent.png"
              alt="For Talent"
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>

          {/* BOTTOM CONTENT CARD */}
          <motion.div
            initial={{ opacity: 0, y: 120 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative sm:absolute bottom-0 left-0 w-full bg-secondary rounded-t-[30px] sm:rounded-t-[40px] px-6 sm:px-12 lg:px-20 py-8 sm:py-10 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-0"
          >

            {/* LEFT SIDE */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.2,
                  },
                },
              }}
              className="w-full lg:w-1/2 text-center lg:text-left"
            >
              <motion.span
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="bg-white text-black text-xs sm:text-sm px-4 sm:px-5 py-1.5 sm:py-2 rounded-full inline-block"
              >
                For Talent
              </motion.span>

              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="text-2xl sm:text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mt-4 sm:mt-8 leading-tight sm:leading-[1.1]"
              >
                FIND OUTSTANDING <br className="hidden sm:block" />
                WORKMANSHIP.
              </motion.h1>
            </motion.div>

            {/* RIGHT SIDE */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2 lg:pl-4 text-center lg:text-left"
            >
              <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
                The outstanding workmanship displayed in the intricate craftsmanship
                of the hand-carved wooden furniture, meticulously detailed with
                ornate patterns and flawless finishes, is a testament to the artisan's
                exceptional skill and dedication to their craft.
              </p>
            </motion.div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default Fortalent;