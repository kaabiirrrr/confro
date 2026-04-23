import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";

const ClientWelcome = () => {
  const [selected, setSelected] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleCloseAccount = () => {
    navigate("/");
  };

  const handleContinue = () => {
    navigate("/success");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-primary text-white flex flex-col relative"
    >

      {/* ===== NAVBAR ===== */}
      <header className="h-[72px] flex items-center justify-between px-8 md:px-2 lg:px-24">

        <div className="flex items-center pl-4">
          <Link to="/">
            <img
              src="/Logo2.png"
              alt="Connect Logo"
              className="h-10 cursor-pointer object-contain"
            />
          </Link>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowProfile(!showProfile)}
          className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-secondary transition"
        >
          <FiUser size={20} />
        </motion.button>
      </header>

      {/* ===== PROFILE CARD ===== */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[90px] right-24 w-[300px] bg-secondary border border-white/10 rounded-2xl p-6 shadow-xl z-50"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full border border-white/20 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                   <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <FiUser size={40} />
                )}
              </div>
              <h3 className="text-lg font-semibold">{profile?.name || "User"}</h3>
              <p className="text-white/50 text-sm">{profile?.role || "Basic"}</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleCloseAccount}
                className="flex items-center gap-3 text-white/80 hover:text-accent transition"
              >
                <FiSettings size={18} />
                Close Account
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-white/80 hover:text-accent transition"
              >
                <FiLogOut size={18} />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-[600px] ml-[200px] pt-[80px]"
        >

          <h1 className="text-[38px] leading-[46px] font-semibold mb-4">
            Welcome to Connect!
          </h1>

          <p className="text-[17px] text-white/60 mb-10">
            Tell us about your business and you'll be on your way to connect with talent.
          </p>

          <h2 className="text-[19px] font-medium mb-6">
            How many people are in your company?
          </h2>

          <div className="space-y-5 mb-12">
            {[
              "It's just me",
              "2-9 employees",
              "10-99 employees",
              "100-499 employees",
              "500-4,999 employees",
              "5,000 or more employees",
            ].map((option, index) => (
              <motion.label
                whileHover={{ x: 5 }}
                key={index}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="companySize"
                  value={option}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-[16px]">{option}</span>
              </motion.label>
            ))}
          </div>

          <div className="mb-8">
            <label className="block text-sm mb-2">Company Name</label>
            <input
              type="text"
              className="w-full h-[44px] px-4 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent transition"
            />
          </div>

          <div className="mb-14">
            <label className="block text-sm mb-2">Website</label>
            <input
              type="text"
              className="w-full h-[44px] px-4 bg-secondary border border-white/20 rounded-lg focus:outline-none focus:border-accent transition"
            />
          </div>

        </motion.div>
      </main>

      {/* ===== CONTINUE BUTTON ===== */}
      <motion.div
        className="flex justify-end pb-2 max-w-[1300px] ml-[200px] pt-[20px]"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleContinue}
          className="bg-accent hover:opacity-90 px-10 py-3 rounded-lg text-[16px] cursor-pointer font-medium transition"
        >
          Continue
        </motion.button>
      </motion.div>

      <Footer />

    </motion.div>
  );
};

export default ClientWelcome;