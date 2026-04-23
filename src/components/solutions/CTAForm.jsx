import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { submitUserProblem } from "../../services/apiService";
import { toast } from "react-hot-toast";

const CTAForm = () => {

  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    problem: "",
  });

  /* Scroll to CTA if URL contains #contact-cta */
  useEffect(() => {
    if (location.hash === "#contact-cta") {
      const el = document.getElementById("contact-cta");
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.problem) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting your request...");

    try {
      const response = await submitUserProblem({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        description: formData.problem
      });

      if (response.success) {
        toast.success(response.message || "Request submitted successfully!", { id: toastId });
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          problem: "",
        });
      } else {
        toast.error(response.message || "Something went wrong.", { id: toastId });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.message || "Failed to submit request.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Animation Variants */

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

  return (
    <motion.section
      id="contact-cta"
      initial="hidden"
      whileInView="visible"
      variants={container}
      viewport={{ once: true }}
      className="px-6 py-24 flex items-center justify-center"
    >
      <div className="max-w-[900px] w-full mx-auto">

        {/* Title */}
        <motion.h2
          variants={fadeUp}
          className="text-4xl font-semibold mb-6 text-center"
        >
          Tell us your problem
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-white/60 text-center mb-12"
        >
          Describe your challenge and our team will help you find the best solution.
        </motion.p>

        {/* Form */}
        <motion.form
          variants={container}
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {/* Name Fields */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 gap-6"
          >

            <div>
              <label className="block text-[14px] mb-2 text-white/80">
                First name
              </label>

              <motion.input
                whileFocus={{ scale: 1.02 }}
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-secondary border border-white/20 rounded-lg px-4 py-3 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[14px] mb-2 text-white/80">
                Last name
              </label>

              <motion.input
                whileFocus={{ scale: 1.02 }}
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-secondary border border-white/20 rounded-lg px-4 py-3 outline-none transition"
              />
            </div>

          </motion.div>

          {/* Email */}
          <motion.div variants={fadeUp}>
            <label className="block text-[14px] mb-2 text-white/80">
              Email
            </label>

            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-secondary border border-white/20 rounded-lg px-4 py-3 outline-none transition"
            />
          </motion.div>

          {/* Problem */}
          <motion.div variants={fadeUp}>
            <label className="block text-[14px] mb-2 text-white/80">
              Describe your problem
            </label>

            <motion.textarea
              whileFocus={{ scale: 1.02 }}
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              placeholder="Explain your project or issue..."
              className="w-full h-[160px] bg-secondary border border-white/20 rounded-lg px-4 py-3 outline-none resize-none transition"
            />
          </motion.div>

          {/* Button */}
          <motion.div
            variants={fadeUp}
            className="flex justify-center pt-4"
          >

            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 10px 30px rgba(0,0,0,0.25)",
              }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting}
              className={`bg-accent px-10 py-3 rounded-full font-medium transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </motion.button>

          </motion.div>

        </motion.form>

      </div>
    </motion.section>
  );
};

export default CTAForm;