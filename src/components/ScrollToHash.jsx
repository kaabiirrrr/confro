import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToHash = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    // Skip Supabase OAuth callback hashes (access_token, etc.)
    if (hash.includes('access_token') || hash.includes('token_type') || hash.includes('refresh_token')) return;
    const timer = setTimeout(() => {
      try {
        const element = document.querySelector(hash);
        if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (_) {
        // Invalid selector (e.g. OAuth hash fragments) — ignore
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [hash]);

  return null;
};

export default ScrollToHash;