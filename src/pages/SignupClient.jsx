import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../schemas/formSchemas";
import axios from "axios";
import toast from "react-hot-toast";
import logger from "../utils/logger";
import { getOauthRedirectUrl, getApiUrl } from "../utils/authUtils";
 
const API_URL = getApiUrl();
import CustomDropdown from "../components/ui/CustomDropdown";
import { countries } from "../utils/countries";

const SignupClient = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        {
          email: data.email,
          password: data.password,
          name: `${data.firstName} ${data.lastName}`,
          role: "CLIENT"
        }
      );

      if (response.data.success) {
        toast.success("Account created!");
        localStorage.setItem('pending_role', 'CLIENT');
        navigate("/verify-email-waiting", { state: { email: data.email } });
      }
    } catch (error) {
      logger.error("Registration error", error);
      toast.error(error.response?.data?.message || "An error occurred during registration.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      localStorage.setItem('oauth_intended_role', 'CLIENT');
      localStorage.setItem('oauth_mode', 'signup');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getOauthRedirectUrl()
        }
      });
      if (error) throw error;
    } catch (error) {
      logger.error("Error logging in with Google", error);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      localStorage.setItem('oauth_intended_role', 'CLIENT');
      localStorage.setItem('oauth_mode', 'signup');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: getOauthRedirectUrl()
        }
      });
      if (error) throw error;
    } catch (error) {
      logger.error("Error logging in with Facebook", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-[10px] bg-primary text-light-text font-sans selection:bg-accent/30"
    >

      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary px-4 sm:px-8 md:px-12 lg:px-24 py-3 sm:py-4 max-w-[1630px] mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center group">
            <img
              src="/Logo2.png"
              alt="Connect Logo"
              className="h-7 sm:h-10 object-contain invert dark:invert-0"
            />
          </Link>
        </div>

        <div className="text-xs sm:text-[16px] text-light-text/80">
          Looking for work?{" "}
          <Link
            to="/signup-freelancer"
            className="text-accent font-medium"
          >
            Apply as talent
          </Link>
        </div>
      </header>

      {/* Form Container */}
      <motion.main
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-[600px] mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-8 sm:pb-20"
      >

          <>
            <h1 className="text-lg sm:text-[32px] font-semibold text-center mb-4 sm:mb-10 tracking-tight leading-tight">
              Sign up to hire talent
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleFacebookLogin}
                className="flex items-center justify-center gap-2 border border-[#1877F2] bg-[#1877F2] rounded-full py-2 px-4 hover:opacity-90 transition text-white"
              >
                <FaFacebook size={18} />
                <span className="text-[14px] font-medium">Continue with Facebook</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 border border-[var(--color-border)] bg-secondary rounded-full py-2 px-4 hover:bg-[var(--color-hover)] transition text-light-text"
              >
                <FcGoogle size={18} />
                <span className="text-[14px] font-medium">Continue with Google</span>
              </motion.button>
            </div>

            <div className="relative flex py-4 sm:py-8 items-center">
              <div className="flex-grow border-t border-[var(--color-border)]"></div>
              <span className="flex-shrink mx-4 text-text-muted text-sm">or</span>
              <div className="flex-grow border-t border-[var(--color-border)]"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[13px] sm:text-[14px] font-medium mb-1 sm:mb-2 text-light-text">First name</label>
                  <input
                    {...register("firstName")}
                    className={`w-full bg-secondary border rounded-lg px-3 py-1.5 sm:py-2 transition focus:border-accent outline-none text-light-text ${errors.firstName ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                  />
                  {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-[13px] sm:text-[14px] font-medium mb-1 sm:mb-2 text-light-text">Last name</label>
                  <input
                    {...register("lastName")}
                    className={`w-full bg-secondary border rounded-lg px-3 py-1.5 sm:py-2 transition focus:border-accent outline-none ${errors.lastName ? 'border-red-500' : 'border-white/20'}`}
                  />
                  {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[13px] sm:text-[14px] font-medium mb-1 sm:mb-2 text-white/90">Work email address</label>
                <input
                  {...register("email")}
                  className={`w-full bg-secondary border rounded-lg px-3 py-1.5 sm:py-2 transition focus:border-accent outline-none ${errors.email ? 'border-red-500' : 'border-white/20'}`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-[13px] sm:text-[14px] font-medium mb-1 sm:mb-2 text-white/90">Password</label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (8 or more characters)"
                    className={`w-full bg-secondary border rounded-lg px-3 py-1.5 sm:py-2 pr-10 transition focus:border-accent outline-none ${errors.password ? 'border-red-500' : 'border-white/20'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-text-muted"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-[13px] sm:text-[14px] font-medium mb-1 sm:mb-2 text-white/90">Country</label>
                <div className="text-[13px] sm:text-base">
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <CustomDropdown
                        options={countries}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select Country"
                        error={errors.country?.message}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2 sm:space-y-4 pt-1 sm:pt-2">
                <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
                  <input type="checkbox" className="w-3 h-3 sm:w-4 sm:h-4 mt-1 accent-accent rounded border-white/20 bg-secondary" />
                  <span className="text-[12px] sm:text-[14px] text-text-secondary leading-tight sm:leading-snug">Send me emails with tips on how to find talent that fits my needs.</span>
                </label>

                <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
                  <input {...register("terms")} type="checkbox" className="w-3 h-3 sm:w-4 sm:h-4 mt-1 accent-accent rounded border-white/20 bg-secondary" />
                  <span className="text-[12px] sm:text-[14px] text-text-secondary leading-tight sm:leading-snug">
                    Yes, I understand and agree to the <Link to="/legal#terms" className="text-accent hover:underline">Terms of Service</Link>, including the <Link to="/legal#terms" className="text-accent hover:underline">User Agreement</Link> and <Link to="/legal#privacy-policy" className="text-accent hover:underline">Privacy Policy</Link>.
                  </span>
                </label>
                {errors.terms && <p className="text-red-400 text-xs">{errors.terms.message}</p>}
              </div>

              <div className="text-center pt-4 sm:pt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent hover:opacity-90 disabled:opacity-50 text-white font-medium px-8 sm:px-12 py-2 sm:py-2.5 rounded-full transition w-full sm:w-auto shadow-lg shadow-accent/20 text-[14px] sm:text-base"
                >
                  {isSubmitting ? "Creating..." : "Create my account"}
                </motion.button>
                <p className="mt-4 sm:mt-8 text-[13px] sm:text-[14px] text-text-muted">Already have an account? <Link to="/login" className="text-accent font-medium hover:underline">Log In</Link></p>
              </div>
            </form>
          </>
      </motion.main>
    </motion.div>
  );
};

export default SignupClient;
