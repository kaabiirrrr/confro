import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/formSchemas";
import toast from "react-hot-toast";
import logger from "../utils/logger";
import { getOauthRedirectUrl } from "../utils/authUtils";
import "./login-characters.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, getDashboardRoute, user, role, profile, loading, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null); // triggers verification banner
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const cooldownRef = useRef(null);

  const isVerified = searchParams.get('verified') === 'true';
  const verifiedEmail = searchParams.get('email');
  const alreadyVerified = searchParams.get('status') === 'already_verified';

  // Fallback redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const dashboardRoute = getDashboardRoute(role, profile);
      const from = location.state?.from?.pathname || dashboardRoute;
      logger.log(`[LoginPage] User already authenticated. Redirecting to: ${from}`);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, role, profile, navigate, location, getDashboardRoute]);

  // Cleanup resend countdown on unmount
  useEffect(() => () => clearInterval(cooldownRef.current), []);

  // Handle successful verification from URL
  useEffect(() => {
    if (isVerified) {
      if (alreadyVerified) {
        toast.success("Email is already verified. Please log in.");
      } else {
        toast.success("Email verified successfully! Please log in to complete your setup.", {
          duration: 6000,
          icon: '✅'
        });
      }
    }
  }, [isVerified, alreadyVerified]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: verifiedEmail || ""
    }
  });

  // Pre-fill email if provided via URL
  useEffect(() => {
    if (verifiedEmail) {
      setValue("email", verifiedEmail);
    }
  }, [verifiedEmail, setValue]);

  const onSubmit = async (data) => {
    try {
      logger.log(`[LoginPage] Attempting login for: ${data.email}`);
      const response = await login(data.email, data.password);

      if (response.success) {
        toast.success("Welcome back!");
        const { role, user } = response.data;
        logger.log(`[LoginPage] Login success! Role: ${role}`);
        
        // --- CORE REDIRECT LOGIC ---
        // Use the centralized helper which now handles profile completion checks for all roles
        const dashboardRoute = getDashboardRoute(role, user.profile || user);
        const from = location.state?.from?.pathname || dashboardRoute;
        
        logger.log(`[LoginPage] Login success! Role: ${role}. Redirecting to: ${from}`);
        navigate(from, { replace: true });
      }
    } catch (err) {
      logger.error("Login error", err);
      const msg = err?.response?.data?.message || err?.message || '';
      if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('email_not_confirmed')) {
        setUnverifiedEmail(data.email);
      }
      // other errors are handled by the toast in the context
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail || resendCooldown > 0) return;
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: unverifiedEmail });
      if (error) throw error;
      setResendSuccess(true);
      setResendCooldown(60);
      cooldownRef.current = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(err.message || 'Failed to resend. Try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const from = location.state?.from?.pathname;
      if (from && from !== '/') {
        localStorage.setItem('oauth_redirect_path', from);
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getOauthRedirectUrl()
        }
      });
      if (error) throw error;
    } catch (error) {
      logger.error("Error logging in with Google", error);
      toast.error(error.message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const from = location.state?.from?.pathname || '/';
      localStorage.setItem('oauth_redirect_path', from);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: getOauthRedirectUrl()
        }
      });
      if (error) throw error;
    } catch (error) {
      logger.error("Error logging in with Facebook", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const state = {
      mouse: { x: 0, y: 0 }
    };

    const refs = {
      purple: document.getElementById("purple"),
      black: document.getElementById("black"),
      orange: document.getElementById("orange"),
      yellow: document.getElementById("yellow"),
      yellowMouth: document.getElementById("yellow-mouth"),
      eyes: Array.from(document.querySelectorAll(".track-eye")),
      freePupils: Array.from(document.querySelectorAll(".track-pupil"))
    };

    function calc(element) {
      if (!element) return { faceX: 0, faceY: 0, bodySkew: 0 };

      const rect = element.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 3;

      const dx = state.mouse.x - cx;
      const dy = state.mouse.y - cy;

      return {
        faceX: Math.max(-15, Math.min(15, dx / 20)),
        faceY: Math.max(-10, Math.min(10, dy / 30)),
        bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
      };
    }

    function renderCharacters() {
      if (!refs.purple) return;

      const purplePos = calc(refs.purple);
      const blackPos = calc(refs.black);
      const orangePos = calc(refs.orange);
      const yellowPos = calc(refs.yellow);

      const peek = showPassword;

      refs.purple.style.transform = peek
        ? "skewX(0deg)"
        : `skewX(${purplePos.bodySkew}deg)`;

      refs.black.style.transform = peek
        ? "skewX(0deg)"
        : `skewX(${blackPos.bodySkew}deg)`;

      refs.orange.style.transform = peek
        ? "skewX(0deg)"
        : `skewX(${orangePos.bodySkew}deg)`;

      refs.yellow.style.transform = peek
        ? "skewX(0deg)"
        : `skewX(${yellowPos.bodySkew}deg)`;

      if (refs.yellowMouth) {
        refs.yellowMouth.style.left = peek
          ? "10px"
          : `${40 + yellowPos.faceX}px`;

        refs.yellowMouth.style.top = peek
          ? "88px"
          : `${88 + yellowPos.faceY}px`;
      }
    }

    function renderEyes() {
      refs.eyes.forEach((eye) => {
        const rect = eye.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        let dx = state.mouse.x - cx;
        let dy = state.mouse.y - cy;

        if (showPassword) {
          dx = -50;
          dy = -10;
        }

        const angle = Math.atan2(dy, dx);
        const dist = Math.min(Math.hypot(dx, dy), 5);

        const pupil = eye.querySelector(".pupil");

        if (pupil) {
          pupil.style.transform =
            `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
        }
      });

      refs.freePupils.forEach((pupil) => {
        const rect = pupil.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        let dx = state.mouse.x - cx;
        let dy = state.mouse.y - cy;

        if (showPassword) {
          dx = -50;
          dy = -10;
        }

        const angle = Math.atan2(dy, dx);
        const dist = Math.min(Math.hypot(dx, dy), 5);

        pupil.style.transform =
          `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
      });
    }

    function renderAll() {
      renderCharacters();
      renderEyes();
    }

    function handleMouse(event) {
      state.mouse.x = event.clientX;
      state.mouse.y = event.clientY;
      renderAll();
    }

    window.addEventListener("mousemove", handleMouse);
    renderAll();

    return () => {
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [showPassword]);

  return (
    <div className="login-wrapper">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >

        {/* LEFT SIDE */}
        <div className="login-left">
          <div className="scene">

            <motion.div className="character purple" id="purple" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
              <div className="face">
                <div className="eye track-eye"><div className="pupil"></div></div>
                <div className="eye track-eye"><div className="pupil"></div></div>
              </div>
            </motion.div>

            <motion.div className="character black" id="black" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3.5 }}>
              <div className="face">
                <div className="eye track-eye"><div className="pupil"></div></div>
                <div className="eye track-eye"><div className="pupil"></div></div>
              </div>
            </motion.div>

            <motion.div className="character orange" id="orange" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.8 }}>
              <div className="face">
                <div className="dark-pupil track-pupil"></div>
                <div className="dark-pupil track-pupil"></div>
              </div>
            </motion.div>

            <motion.div className="character yellow" id="yellow" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
              <div className="face">
                <div className="dark-pupil track-pupil"></div>
                <div className="dark-pupil track-pupil"></div>
              </div>
              <div className="mouth" id="yellow-mouth"></div>
            </motion.div>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">
          <button className="close-btn" onClick={() => navigate("/")}>×</button>
          <div className="form-container">

            <Link to="/" className="logo-wrapper">
              <img src="/Logo2.png" alt="Logo" className="login-logo mt-2" />
            </Link>

            <h2 className="login-title">Welcome Back</h2>

            <form className="login-form" onSubmit={handleSubmit(onSubmit)}>

              <div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Email address"
                  className={`login-input ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1 px-1">{errors.email.message}</p>
                )}
              </div>

              <div className="input-wrapper" style={{ position: "relative" }}>
                <input
                  {...register("password")}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className={`login-input ${errors.password ? 'border-red-500' : ''}`}
                  style={{ paddingRight: "45px" }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#7aa7ff",
                    cursor: "pointer"
                  }}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-[-15px] px-1">{errors.password.message}</p>
              )}

              <div style={{ textAlign: "right", marginTop: "-10px" }}>
                <Link to="/forgot-password" style={{ color: "#7aa7ff", fontSize: "14px", textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>

              {/* ── Email not confirmed banner ── */}
              {unverifiedEmail && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-yellow-500/30 bg-yellow-500/8 p-4 space-y-3"
                  style={{ background: 'rgba(234,179,8,0.06)' }}
                >
                  <div className="flex items-start gap-3">
                    <span style={{ fontSize: 18, lineHeight: 1 }}>✉️</span>
                    <div>
                      <p style={{ color: '#fbbf24', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                        Please verify your email
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.5 }}>
                        We sent a confirmation link to <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{unverifiedEmail}</strong>.
                        Check your inbox and click the link to activate your account.
                      </p>
                    </div>
                  </div>

                  {resendSuccess && (
                    <p style={{ color: '#4ade80', fontSize: 12, paddingLeft: 30 }}>
                      ✓ Confirmation email resent. Check your inbox.
                    </p>
                  )}

                  <div style={{ paddingLeft: 30, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0}
                      style={{
                        background: resendCooldown > 0 ? 'rgba(255,255,255,0.05)' : 'rgba(251,191,36,0.15)',
                        border: '1px solid rgba(251,191,36,0.3)',
                        color: resendCooldown > 0 ? 'rgba(255,255,255,0.3)' : '#fbbf24',
                        borderRadius: 10,
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        width: 'fit-content',
                      }}
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend confirmation email'}
                    </button>

                    <Link
                      to="/signup"
                      style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, textDecoration: 'none' }}
                    >
                      Wrong email? Sign up again →
                    </Link>
                  </div>
                </motion.div>
              )}

              <button type="submit" className="login-btn" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </button>

              <div className="divider">
                <span>or continue with</span>
              </div>

              <div className="social-buttons">
                <button
                  type="button"
                  className="google-btn"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  onClick={handleGoogleLogin}
                >
                  <FcGoogle size={20} />
                  Google
                </button>

                <button
                  type="button"
                  className="facebook-btn"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: "#1877F2", color: "#fff", border: "none" }}
                  onClick={handleFacebookLogin}
                >
                  <FaFacebook size={20} />
                  Facebook
                </button>
              </div>

              <p className="join-text">
                Don’t have an account?{" "}
                <Link to="/signup" className="join-link">
                  Join us
                </Link>
              </p>

            </form>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
