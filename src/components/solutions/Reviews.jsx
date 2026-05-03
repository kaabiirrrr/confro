import React, { useState, useEffect } from "react";
import InfinityLoader from "../common/InfinityLoader";
import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../../lib/api";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // Fetch reviews from DB on mount
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/site-reviews?limit=4');
      if (res.data.success) {
        setReviews(res.data.data);
        setAvgRating(res.data.meta.avg_rating);
        setTotalReviews(res.data.meta.total_reviews);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !text.trim() || rating === 0) {
      toast.error("Please fill in all fields and select a rating");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/api/site-reviews', {
        name: name.trim(),
        rating,
        comment: text.trim()
      });

      if (res.data.success) {
        toast.success("Review submitted successfully!");
        setName("");
        setText("");
        setRating(0);
        // Refresh reviews from DB
        await fetchReviews();
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to submit review";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8"
    >

      {/* Title */}
      <motion.h2
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-2xl sm:text-4xl font-semibold mb-6 sm:mb-8"
      >
        What Our Users Say
      </motion.h2>

      {/* Average Rating */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 sm:gap-6 mb-14"
      >
        <span className="text-3xl sm:text-5xl font-bold text-white">
          {avgRating > 0 ? avgRating.toFixed(1) : "—"}
        </span>

        <div className="flex text-accent text-2xl sm:text-4xl gap-1 sm:gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={
                star <= Math.floor(avgRating)
                  ? "text-accent"
                  : "text-white/20"
              }
            />
          ))}
        </div>

        <span className="text-white/60 text-base sm:text-2xl">
          ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
        </span>
      </motion.div>

      {/* Reviews List */}
      <div className="space-y-6 mb-16">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <InfinityLoader size={30} />
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="border border-white/10 rounded-lg p-6"
            >
              <div className="flex mb-3 text-accent">
                {[...Array(review.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>

              <p className="text-white/80 mb-4">{review.comment}</p>

              <p className="text-accent font-semibold">{review.name}</p>

              <p className="text-white/40 text-xs mt-1">
                {new Date(review.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
              </p>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-16 border border-white/10 rounded-xl">
            <p className="text-white/40 text-lg">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        )}
      </div>

      {/* Review Form */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border border-white/10 rounded-2xl p-8 bg-transparent"
      >
        <h3 className="text-2xl font-semibold mb-2">
          Didn't share your experience yet?
        </h3>

        <p className="text-white/60 mb-6">
          Submit your review and help others learn about our platform.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-primary border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-accent"
          />

          {/* Star Rating */}
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">Rate us :</span>

            <div className="flex gap-2 text-3xl cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.div
                  whileHover={{ scale: 1.3 }}
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <FaStar
                    onClick={() => setRating(star)}
                    className={
                      star <= (hoverRating || rating)
                        ? "text-accent"
                        : "text-white/20"
                    }
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <motion.textarea
            whileFocus={{ scale: 1.02 }}
            placeholder="Write your review here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            className="w-full h-[140px] bg-primary border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-accent resize-none"
          />

          {/* Character count */}
          <div className="flex justify-between items-center">
            <span className="text-white/30 text-xs">
              {text.length}/1000
            </span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={submitting}
              className="bg-accent px-7 py-3 rounded-full cursor-pointer font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.section>
  );
};

export default Reviews;
