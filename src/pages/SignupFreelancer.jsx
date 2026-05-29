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

const SignupFreelancer = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
        role: "FREELANCER"
      });
      if (response.data.success) {
        toast.success("Account created!");
        localStorage.setItem('pending_role', 'FREELANCER');
        navigate("/verify-email-waiting", { state: { email: data.email } });
      }
    } catch (error) {
      logger.error("Registration error", error);
      toast.error(error.response?.data?.message || "An error occurred during registration.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      localStorage.setItem('oauth_intended_role', 'FREELANCER');
      localStorage.setItem('oauth_mode', 'signup');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getOauthRedirectUrl() }
      });
      if (error) throw error;
    } catch (error) { logger.error("Error logging in with Google", error); }
  };

  const handleFacebookLogin = async () => {
    try {
      localStorage.setItem('oauth_intended_role', 'FREELANCER');
      localStorage.setItem('oauth_mode', 'signup');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo: getOauthRedirectUrl() }
      });
      if (error) throw error;
    } catch (error) { logger.error("Error logging in with Facebook", error); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="h-screen flex flex-col bg-primary text-light-text font-sans selection:bg-accent/30"
    >
      {/* Header */}
      <header className="flex-shrink-0 w-full bg-primary">
        <div className="max-w-[1630px] mx-auto h-12 md:h-20 px-4 md:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <img src="/Logo-LightMode-trimmed.png" alt="Connect" className="h-8 md:h-12 object-contain block dark:hidden" />
            <img src="/Logo2.png" alt="Connect" className="h-7 md:h-10 object-contain hidden dark:block" />
          </Link>
          <div className="text-[13px] md:text-[16px] text-light-text/80">
            Here to hire talent?{" "}
            <Link to="/signup-client" className="text-accent font-medium">Join as a Client</Link>
          </div>
        </div>
      </header>

      {/* Scrollable content — padded at bottom so content doesn't hide behind fixed button */}
      <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="max-w-[520px] mx-auto px-5 pt-3 md:pt-10"
        >
          <h1 className="text-[18px] md:text-[32px] font-semibold text-center mb-3 md:mb-8 tracking-tight">
            Sign up to find work you love
          </h1>

          {/* Social buttons */}
          <div className="flex flex-col gap-2 md:gap-3 mb-2 md:mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="button" onClick={handleFacebookLogin}
              className="flex items-center justify-center gap-2 border border-[#1877F2] bg-[#1877F2] rounded-full py-2 md:py-2.5 px-4 hover:opacity-90 transition text-white w-full"
            >
              <FaFacebook size={16} />
              <span className="text-[13px] md:text-[14px] font-medium">Continue with Facebook</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="button" onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 border border-[var(--color-border)] bg-secondary rounded-full py-2 md:py-2.5 px-4 hover:bg-[var(--color-hover)] transition text-light-text w-full"
            >
              <FcGoogle size={16} />
              <span className="text-[13px] md:text-[14px] font-medium">Continue with Google</span>
            </motion.button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 md:py-5 items-center">
            <div className="flex-grow border-t border-[var(--color-border)]" />
            <span className="flex-shrink mx-4 text-text-muted text-xs md:text-sm">or</span>
            <div className="flex-grow border-t border-[var(--color-border)]" />
          </div>

          <form id="signup-freelancer-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2.5 md:space-y-5">

              {/* First / Last */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] md:text-[14px] font-medium mb-1 md:mb-2 text-light-text">First name</label>
                  <input
                    {...register("firstName")}
                    className={`w-full bg-secondary border rounded-lg px-3 py-1.5 md:py-2 text-[13px] md:text-base transition focus:border-accent outline-none text-light-text ${errors.firstName ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                  />
                  {errors.firstName && <p className="text-red-400 text-[10px] md:text-xs mt-0.5">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-[12px] md:text-[14px] font-medium mb-1 md:mb-2 text-light-text">Last name</label>
                  <input
                    {...register("lastName")}
                    className={`w-full bg-secondary border rounded-lg px-3 py-1.5 md:py-2 text-[13px] md:text-base transition focus:border-accent outline-none ${errors.lastName ? 'border-red-500' : 'border-white/20'}`}
                  />
                  {errors.lastName && <p className="text-red-400 text-[10px] md:text-xs mt-0.5">{errors.lastName.message}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[12px] md:text-[14px] font-medium mb-1 md:mb-2 text-white/90">Email address</label>
                <input
                  {...register("email")}
                  className={`w-full bg-secondary border rounded-lg px-3 py-1.5 md:py-2 text-[13px] md:text-base transition focus:border-accent outline-none ${errors.email ? 'border-red-500' : 'border-white/20'}`}
                />
                {errors.email && <p className="text-red-400 text-[10px] md:text-xs mt-0.5">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[12px] md:text-[14px] font-medium mb-1 md:mb-2 text-white/90">Password</label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (8 or more characters)"
                    className={`w-full bg-secondary border rounded-lg px-3 py-1.5 md:py-2 pr-9 text-[13px] md:text-base transition focus:border-accent outline-none ${errors.password ? 'border-red-500' : 'border-white/20'}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2 text-text-muted">
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-[10px] md:text-xs mt-0.5">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[12px] md:text-[14px] font-medium mb-1 md:mb-2 text-white/90">Confirm password</label>
                <div className="relative">
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className={`w-full bg-secondary border rounded-lg px-3 py-1.5 md:py-2 pr-9 text-[13px] md:text-base transition focus:border-accent outline-none ${errors.confirmPassword ? 'border-red-500' : 'border-white/20'}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2 text-text-muted">
                    {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-[10px] md:text-xs mt-0.5">{errors.confirmPassword.message}</p>}
              </div>

              {/* Country */}
              <div>
                <label className="block text-[12px] md:text-[14px] font-medium mb-1 md:mb-2 text-white/90">Country</label>
                <div className="text-[12px] md:text-base">
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

              {/* Checkboxes */}
              <div className="space-y-1.5 md:space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 accent-accent rounded border-white/20 bg-secondary flex-shrink-0" />
                  <span className="text-[11px] md:text-[14px] text-text-secondary leading-snug">Send me helpful emails to find rewarding work and job leads.</span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input {...register("terms")} type="checkbox" className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 accent-accent rounded border-white/20 bg-secondary flex-shrink-0" />
                  <span className="text-[11px] md:text-[14px] text-text-secondary leading-snug">
                    Yes, I understand and agree to the{" "}
                    <Link to="/legal#terms" className="text-accent hover:underline">Terms of Service</Link>, including the{" "}
                    <Link to="/legal#user-agreement" className="text-accent hover:underline">User Agreement</Link> and{" "}
                    <Link to="/legal#privacy-policy" className="text-accent hover:underline">Privacy Policy</Link>.
                  </span>
                </label>
                {errors.terms && <p className="text-red-400 text-[10px] md:text-xs">{errors.terms.message}</p>}
              </div>

              {/* Desktop-only submit (inline, after checkboxes) */}
              <div className="hidden md:block text-center pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent hover:opacity-90 disabled:opacity-50 text-white font-medium px-12 py-2.5 rounded-full transition w-auto text-base"
                >
                  {isSubmitting ? "Creating..." : "Create my account"}
                </motion.button>
                <p className="mt-6 text-[14px] text-text-muted">
                  Already have an account?{" "}
                  <Link to="/login" className="text-accent font-medium hover:underline">Log In</Link>
                </p>
              </div>

            </div>
          </form>
        </motion.div>
      </div>

      {/* Mobile-only: fixed button pinned to bottom */}
      <div className="md:hidden flex-shrink-0 bg-primary px-5 py-3 border-t border-[var(--color-border)]">
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          type="submit"
          form="signup-freelancer-form"
          disabled={isSubmitting}
          className="bg-accent hover:opacity-90 disabled:opacity-50 text-white font-medium py-2.5 rounded-full transition w-full text-[14px]"
        >
          {isSubmitting ? "Creating..." : "Create my account"}
        </motion.button>
        <p className="mt-2 text-center text-[12px] text-text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-medium hover:underline">Log In</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default SignupFreelancer;
