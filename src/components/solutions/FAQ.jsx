import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPublishedFAQs, submitFAQQuestion } from "../../services/apiService";
import { toast } from "react-hot-toast";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [active, setActive] = useState(null);
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const response = await getPublishedFAQs();
        if (response.success) {
          setFaqs(response.data);
        }
      } catch (error) {
        console.error("Error loading FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFaqs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await submitFAQQuestion(question);
      if (response.success) {
        toast.success(response.message || "Your question has been submitted.");
        setQuestion("");
      } else {
        toast.error(response.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("FAQ submission error:", error);
      toast.error("Failed to submit question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={container}
      className="max-w-[1000px] mx-auto px-6 py-20"
    >
      <motion.h2
        variants={item}
        className="text-4xl font-semibold mb-10"
      >
        Frequently Asked Questions
      </motion.h2>

      {/* FAQ LIST */}
      <motion.div variants={container} className="space-y-4 mb-16">
        {loading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="h-16 w-full bg-white/5 rounded-lg animate-pulse border border-white/10" />
          ))
        ) : faqs.length === 0 ? (
          <p className="text-white/40 text-center py-8 italic">No frequently asked questions available yet.</p>
        ) : (
          faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ scale: 1.01 }}
              className="border border-white/10 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setActive(active === index ? null : index)
                }
                className="w-full text-left px-6 py-4 flex justify-between items-center transition-colors duration-200"
              >
                <span className={`transition-colors duration-200 ${active === index ? "text-accent font-medium" : "text-white"}`}>
                  {faq.question}
                </span>

                <motion.span
                  animate={{ rotate: active === index ? 45 : 0, color: active === index ? "var(--color-accent)" : "rgba(255,255,255,0.7)" }}
                  transition={{ duration: 0.2 }}
                  className="text-lg"
                >
                  +
                </motion.span>
              </button>

              <AnimatePresence>
                {active === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-white/70 text-sm">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* ASK QUESTION SECTION */}
      <motion.div
        variants={item}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-transparent border border-white/10 rounded-xl p-8"
      >
        <h3 className="text-2xl font-semibold mb-4">
          Didn't find your question?
        </h3>

        <p className="text-white/60 mb-6 text-sm">
          Submit your question and our team will answer it soon.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.textarea
            whileFocus={{ scale: 1.02 }}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isSubmitting}
            placeholder="Write your question here..."
            className="w-full h-[120px] bg-primary border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-accent disabled:opacity-50"
          />

          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              type="submit"
              disabled={isSubmitting}
              className={`bg-accent px-6 py-3 rounded-[10px] text-sm font-medium transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
            >
              {isSubmitting ? "Submitting..." : "Submit Question"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.section>
  );
};

export default FAQ;