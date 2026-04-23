import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const hiringData = [
  {
    title: "Posting jobs is always free",
    desc: "Generate a job post with AI or create your own and filter talent matches.",
    img: "/hire1.jpeg",
    button: "Create a job",
    link: "/login",   // you can change later
  },
  {
    title: "Get proposals and hire",
    desc: "Review proposals, compare profiles and hire the best freelancer.",
    img: "/hire2(1).jpeg",
    button: "Review proposals",
    link: "/login",
  },
  {
    title: "Pay when work is done",
    desc: "Release payment only when you're satisfied with the work delivered.",
    img: "/hire3.jpeg",
    button: "Learn more",
    link: "/login",
  },
];

const workData = [
  {
    title: "Find clients and remote jobs",
    desc: "Browse projects and connect with clients worldwide.",
    img: "/hire1.jpeg",
    button: "Find work",
    link: "/login",
  },
  {
    title: "Submit proposals for work",
    desc: "Send proposals and showcase your expertise to win projects.",
    img: "/work2.jpeg",
    button: "Submit proposal",
    link: "/login",
  },
  {
    title: "Get paid as you deliver work",
    desc: "Receive secure payments once milestones are completed.",
    img: "/work3.jpeg",
    button: "Get paid",
    link: "/login",
  },
];

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState("hiring");
  const data = activeTab === "hiring" ? hiringData : workData;

  return (
    <section className="bg-primary py-12 px-6">
      <div className="max-w-[1500px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl sm:text-4xl font-semibold text-white">
            How it works
          </h2>

          <div className="flex bg-secondary rounded-full p-1">
            <button
              onClick={() => setActiveTab("hiring")}
              className={`w-[140px] sm:w-[170px] py-2 rounded-full text-sm cursor-pointer transition ${activeTab === "hiring"
                ? "bg-accent text-white"
                : "text-gray-400"
                }`}
            >
              For hiring
            </button>

            <button
              onClick={() => setActiveTab("work")}
              className={`w-[140px] sm:w-[170px] py-2 rounded-full text-sm cursor-pointer transition ${activeTab === "work"
                ? "bg-accent text-white"
                : "text-gray-400"
                }`}
            >
              For finding work
            </button>
          </div>
        </div>

        {/* Animated Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === "hiring" ? -80 : 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === "hiring" ? 80 : -80 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12"
          >
            {data.map((item, index) => (
              <div key={index} className="group">

                {/* Image */}
                <div className="h-[220px] sm:h-[280px] rounded-3xl overflow-hidden mb-6">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>

                {/* Hover Content — always visible on mobile */}
                <div className="opacity-100 max-h-60 sm:opacity-0 sm:max-h-0 sm:overflow-hidden sm:group-hover:opacity-100 sm:group-hover:max-h-60 transition-all duration-300">

                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    {item.desc}
                  </p>

                  <Link to={item.link}>
                    <button className="w-full bg-accent py-3 rounded-xl cursor-pointer text-white text-sm font-medium text-center">
                      {item.button}
                    </button>
                  </Link>

                </div>

              </div>
            ))}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};

export default HowItWorks;