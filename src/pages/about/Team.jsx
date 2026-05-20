import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { motion } from "framer-motion";
import { FaLinkedinIn, FaInstagram, FaFacebookF, FaGithub, FaGlobe } from "react-icons/fa";
import { ArrowRight } from "lucide-react";
import { members } from "./teamData";

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const SocialIcons = ({ linkedin, instagram, facebook, github, website }) => (
  <div className="flex items-center gap-3 text-light-text/60 text-base" onClick={e => e.stopPropagation()}>
    {website && (
      <a href={website} target="_blank" rel="noopener noreferrer">
        <FaGlobe className="hover:text-accent transition cursor-pointer" />
      </a>
    )}
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


const Team = () => {
  const navigate = useNavigate();

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
              onClick={() => navigate(`/about/team/${m.id}`)}
              className="bg-transparent rounded-xl border border-white/10 hover:border-accent transition-colors duration-300 overflow-hidden cursor-pointer
                         flex flex-col md:flex-row md:items-center md:gap-10"
            >
              {/* Image */}
              <div className="w-full md:w-[260px] md:h-[280px] flex-shrink-0 overflow-hidden p-4">
                <img
                  src={m.img}
                  alt={m.name}
                  className={`w-full h-[200px] md:h-full object-cover ${m.position} rounded-xl hover:scale-105 transition`}
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
                    website={m.website}
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

      <Footer />
    </>
  );
};

export default Team;
