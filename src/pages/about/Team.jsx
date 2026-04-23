import React, { useState } from "react";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { motion } from "framer-motion";
import { FaLinkedinIn, FaInstagram, FaFacebookF, FaGithub } from "react-icons/fa";

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const SocialIcons = ({ linkedin, instagram, facebook, github }) => (
  <div className="flex items-center gap-3 text-light-text/60 text-base">
    {linkedin && (
      <a href={linkedin} target="_blank" rel="noopener noreferrer">
        <FaLinkedinIn className="hover:text-accent transition cursor-pointer" />
      </a>
    )}
    {instagram && (
      <a href={instagram} target="_blank" rel="noopener noreferrer">
        <FaInstagram className="hover:text-accent transition cursor-pointer" />
      </a>
    )}
    {facebook && (
      <a href={facebook} target="_blank" rel="noopener noreferrer">
        <FaFacebookF className="hover:text-accent transition cursor-pointer" />
      </a>
    )}
    {github && (
      <a href={github} target="_blank" rel="noopener noreferrer">
        <FaGithub className="hover:text-accent transition cursor-pointer" />
      </a>
    )}
  </div>
);

const members = [
  {
    name: "Kabir More",
    role: "Co-Founder & Chief Executive Officer (CEO)",
    img: "/Team-member-1.jpeg",
    position: "object-[50%_30%]",
    bio1: "Kabir founded Connect with a vision to create a transparent, performance-driven freelance marketplace that eliminates trust gaps and inefficient hiring systems.",
    bio2: "With strong expertise in product strategy, platform architecture, and marketplace design, he focuses on building scalable systems such as escrow protection, Job Success Score algorithms, and structured workflows that empower both freelancers and businesses globally.",
    linkedin: "https://www.linkedin.com/in/kabirr-more-5b2a82355",
    instagram: "https://www.instagram.com/kaabiirrrr.___",
    facebook: "https://www.facebook.com/share/1B8arPCGXZ/",
    github: "https://github.com/kaabiirrrr",
  },
  {
    name: "Rohan Patil",
    role: "Co-Founder & Chief Growth Officer (CMO)",
    img: "/Team-member-2.png",
    position: "object-[50%_20%]",
    bio1: "Rohan leads growth at Connect Freelance, building a system that removes noise from freelance hiring and focuses on quality over volume.",
    bio2: "He focuses on distribution, user acquisition, and market positioning, ensuring the platform attracts serious clients and reliable freelancers while scaling efficiently.",
    linkedin: "https://www.linkedin.com/in/rohan-patil-248aaa2a3/",
    instagram: "https://www.instagram.com/rohanpatil.3104/",
    facebook: "https://www.facebook.com/rohanpatil.3104",
    github: "https://github.com/rohanpatil-15",
  },
  {
    name: "Samarth Shendge",
    role: "Chief Technology Officer (CTO)",
    img: "/Team-member-3.jpeg",
    position: "object-[50%_10%]",
    bio1: "Samarth leads the technical vision of Connect, ensuring the platform is robust, scalable, and performance-driven. He is responsible for backend development, API architecture, and database management.",
    bio2: "With strong expertise in full-stack development, system design, and cloud-based architecture, he plays a key role in solving critical challenges such as API optimization, authentication security, and performance tuning.",
    linkedin: "https://www.linkedin.com/in/samarth-shendge-166ba1354",
    instagram: "https://www.instagram.com/samarth_shendge_20/",
    facebook: "https://m.facebook.com/profile.php?id=61578606565247",
    github: "https://github.com/samarthshendge20-tech",
  },
  {
    name: "Vijay Biradar",
    role: "Chief Product Officer (CPO)",
    img: "/Team-member-4.png",
    position: "object-[50%_25%]",
    bio1: "Vijay drives the product strategy of Connect, focusing on creating a seamless and user-friendly experience for both clients and freelancers.",
    bio2: "With a deep understanding of user behavior and product design, he works closely with the development team to refine features like profile completion, job posting, and bidding systems.",
    linkedin: "https://www.linkedin.com/in/vijay-biradar-02b7a7352",
    instagram: "https://www.instagram.com/vijaybiradar2022/",
    facebook: "https://www.facebook.com/share/1HtU1kHSSt/",
    github: "https://github.com/vijaybiradar1508-rgb",
  },
  {
    name: "Vaibhav Pawar",
    role: "Chief Operations Officer (COO)",
    img: "/Team-member-5.jpeg",
    position: "object-[50%_35%]",
    bio1: "Vaibhav oversees the operational flow of Connect, ensuring that all components of the platform work together smoothly and efficiently.",
    bio2: "He plays a crucial role in testing, quality assurance, and overall system coordination, helping maintain stability, reliability, and consistency throughout the platform.",
    linkedin: "https://www.linkedin.com/in/vaibhav-pawar-3122023b3",
    instagram: "https://www.instagram.com/vaibhav_pawar.96.k",
    facebook: "https://www.facebook.com/share/1BKKwq8ZNQ/",
    github: "https://github.com/vaibhavdpawar9921-Tech",
  },
];

const Team = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <Navbar />

      <motion.section
        id="team"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="bg-primary text-light-text py-10 px-4 sm:px-6 md:px-16 min-h-screen"
      >
        <div className="max-w-[1450px] mx-auto space-y-8 sm:space-y-14">

          {/* HEADER */}
          <motion.div variants={fadeUp} className="text-center">
            <h2 className="text-2xl font-semibold mb-3 tracking-tight text-white">
              Meet Our Team
            </h2>
            <p className="text-white/60 text-base max-w-3xl mx-auto">
              The people behind Connect are passionate about building a
              structured, secure, and performance-driven freelance ecosystem.
            </p>
          </motion.div>

          {/* Member Cards */}
          {members.map((m) => (
            <motion.div
              key={m.name}
              variants={fadeUp}
              whileHover={{ scale: 1.01 }}
              className="bg-transparent rounded-3xl border border-white/10 hover:border-accent transition-colors duration-300 overflow-hidden
                         flex flex-col md:flex-row md:items-center md:max-h-[280px] md:gap-10"
            >
              {/* Image */}
              <div className="w-full md:w-[260px] md:h-[280px] flex-shrink-0 overflow-hidden">
                <img
                  src={m.img}
                  alt={m.name}
                  onClick={() => setSelectedImage(m.img)}
                  className={`w-full h-[200px] md:h-[280px] object-cover ${m.position} cursor-pointer hover:scale-105 transition`}
                />
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6 md:py-8 md:pr-10 md:pl-0 w-full overflow-hidden">
                <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                  <h3 className="text-lg sm:text-2xl md:text-3xl font-semibold leading-tight">{m.name}</h3>
                  <SocialIcons 
                    linkedin={m.linkedin}
                    instagram={m.instagram}
                    facebook={m.facebook}
                    github={m.github}
                  />
                </div>
                <p className="text-accent mb-3 text-sm sm:text-base md:text-lg">{m.role}</p>
                <p className="text-light-text/70 mb-2 leading-relaxed text-xs sm:text-sm md:text-base line-clamp-2 md:line-clamp-none">
                  {m.bio1}
                </p>
                <p className="text-light-text/60 leading-relaxed text-xs sm:text-sm md:text-base hidden md:block">
                  {m.bio2}
                </p>
              </div>
            </motion.div>
          ))}

        </div>
      </motion.section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Profile"
            className="max-w-[90%] max-h-[90%] rounded-3xl shadow-2xl"
          />
        </div>
      )}

      <Footer />
    </>
  );
};

export default Team;
