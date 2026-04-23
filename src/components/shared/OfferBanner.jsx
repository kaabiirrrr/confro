import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Clock, ArrowRight } from 'lucide-react';
import axios from 'axios';

import { getApiUrl } from '../../utils/authUtils';
 
const API_URL = getApiUrl();

const pad = (n) => String(Math.max(0, Math.floor(n))).padStart(2, '0');

function buildCountdown(endTime) {
  const diff = new Date(endTime) - Date.now();
  if (diff <= 0) return null;
  const totalSecs = Math.floor(diff / 1000);
  const d = Math.floor(totalSecs / 86400);
  const h = Math.floor((totalSecs % 86400) / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return { d, h, m, s };
}

const TimerUnit = ({ value, label, showColon = true }) => (
  <div className="flex items-center gap-1.5">
    <div className="bg-white/10 backdrop-blur-md text-white font-black text-xs px-2 py-1.5 rounded-lg min-w-[32px] text-center tabular-nums border border-white/20 shadow-sm transition-all duration-300">
      {label === 'd' ? `${value}d` : pad(value)}
    </div>
    {showColon && <span className="text-white/40 font-black text-sm">:</span>}
  </div>
);

const OfferBanner = memo(() => {
  const [offer, setOffer] = useState(null);
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const fetchActiveOffer = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/announcements/active`);
        if (data.success && data.data) {
          const ann = data.data;
          const dismissed = localStorage.getItem(`offer_dismissed_${ann.id}`);
          if (!dismissed) {
            setOffer(ann);
            setVisible(true);
          }
        }
      } catch (err) {
        // Silently fail
      }
    };
    fetchActiveOffer();
  }, []);

  const logAction = useCallback(async (action) => {
    if (!offer) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/announcements/log`,
        { announcement_id: offer.id, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      // Silently fail
    }
  }, [offer]);

  useEffect(() => {
    if (visible && offer && !logged) {
      setLogged(true);
      logAction('view');
    }
  }, [visible, offer, logged, logAction]);

  useEffect(() => {
    if (!offer?.end_time) return;

    const timer = setInterval(() => {
      const remaining = buildCountdown(offer.end_time);
      if (!remaining) {
        setCountdown(null);
        clearInterval(timer);
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [offer]);

  const handleDismiss = useCallback((e) => {
    e.stopPropagation();
    logAction('dismiss');
    localStorage.setItem(`offer_dismissed_${offer.id}`, '1');
    setVisible(false);
  }, [offer, logAction]);

  const handleClick = useCallback(() => {
    logAction('click');
  }, [logAction]);

  if (!visible || !offer) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0, y: -20 }}
        animate={{ height: 'auto', opacity: 1, y: 0 }}
        exit={{ height: 0, opacity: 0, y: -20 }}
        className="w-full relative z-[45] overflow-hidden"
      >
        <style>
          {`
            @keyframes marqueeSingle {
              0% { transform: translateX(100vw); }
              100% { transform: translateX(-100%); }
            }
            .animate-marquee-single {
              display: flex;
              animation: marqueeSingle 20s linear infinite;
              white-space: nowrap;
              width: max-content;
            }
            .animate-marquee-single:hover {
              animation-play-state: paused;
            }
          `}
        </style>
        <div
          onClick={handleClick}
          className="w-full bg-gradient-to-r from-[#FF8C42] via-[#FF5C8A] via-[#B347FF] to-[#4C8CFF] py-2 flex items-center relative group cursor-pointer overflow-hidden shadow-sm"
        >
          {/* Middle Scrolling Area - Full Width, Single Text Block */}
          <div className="flex-1 overflow-hidden relative h-7 flex items-center z-10">
            <div className="animate-marquee-single flex items-center">
              <div className="flex items-center gap-10 px-6">
                {/* Main Content */}
                <span className="text-white font-extrabold text-[12px] lg:text-[13px] tracking-wide drop-shadow-sm flex items-center gap-2">
                  {offer.title} <span className="opacity-80">—</span> {offer.message}
                </span>

                {/* Countdown Timer - Shown if end_time exists and countdown is built */}
                {countdown && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 p-1 rounded-lg">
                      {countdown.d > 0 && <TimerUnit value={countdown.d} label="d" />}
                      <TimerUnit value={countdown.h} label="h" />
                      <TimerUnit value={countdown.m} label="m" />
                      <TimerUnit value={countdown.s} label="s" showColon={false} />
                    </div>
                    <div className="flex items-center gap-2 text-white font-black text-[11px] tracking-tight">
                      <span className="uppercase tracking-[0.2em] opacity-90">Ends Soon</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Static Action - Minimal Dismiss Button */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30">
            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white transition-all p-1 group/close"
            >
              <X size={18} strokeWidth={3} className="group-hover/close:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

OfferBanner.displayName = 'OfferBanner';
export default OfferBanner;
