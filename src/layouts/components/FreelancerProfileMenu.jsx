import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import Avatar from "../../components/Avatar";
import ThemeToggle from "../../components/ui/ThemeToggle";

const ProfileMenu = () => {
  const { user, profile, logout } = useAuth();
  const { status } = useProfile();
  const navigate = useNavigate();

  /* ONLINE STATUS */
  const [online, setOnline] = useState(true);
  const toggleOnline = () => setOnline(!online);

  /* LOGOUT */
  const handleLogout = async () => {
    navigate("/");
    setTimeout(async () => {
      await logout();
    }, 100);
  };

  // Prefer status (from profileApi) over profile (from AuthContext)
  const displayName = status?.name || profile?.name || user?.user_metadata?.full_name || 'User';
  const displayRole = status?.role || user?.role || 'FREELANCER';
  const displayAvatar = status?.avatar_url || profile?.avatar_url || user?.user_metadata?.avatar_url || null;

  return (
    <div className="absolute top-[calc(100%+12px)] right-0 max-sm:left-0 max-sm:right-0 max-sm:mx-2 sm:w-[300px] p-1 bg-secondary border border-border rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 fixed-mobile-menu">
      <div className="w-full">

        {/* USER INFO */}
        <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 border-b border-border bg-hover mb-1 rounded-t-xl">
          <Avatar
            src={displayAvatar}
            name={displayName}
            size="w-10 h-10 sm:w-16 sm:h-16"
            className="flex-shrink-0 shadow-lg border-2 border-border"
          />
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-light-text">
              {displayName}
            </h3>
            <p className="text-xs text-light-text/60 capitalize">
              {displayRole === 'FREELANCER' ? 'Freelancer' : displayRole}
            </p>

          </div>
        </div>

        {/* ONLINE STATUS */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-border">
          <span className="text-xs sm:text-sm text-light-text">
            Online for messages
          </span>
          <div
            onClick={toggleOnline}
            className={`w-9 h-5 sm:w-10 sm:h-6 rounded-full relative cursor-pointer transition ${online ? "bg-accent" : "bg-gray-500"}`}
          >
            <div
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full absolute top-[3px] transition ${online ? "right-1" : "left-1"}`}
            />
          </div>
        </div>

        {/* MENU */}
        <div className="flex flex-col gap-0.5">
          <Link to={`/freelancer/${user?.id}`} className="dropdown-item !py-2 sm:!py-2.5 !text-xs sm:!text-sm">
            <img src="/Icons/icons8-user-100.png" alt="" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" style={{ filter: 'var(--dropdown-icon-filter)' }} />
            Your profile
          </Link>
          <Link to="/freelancer/account-health" className="dropdown-item !py-2 sm:!py-2.5 !text-xs sm:!text-sm">
            <img src="/Icons/icons8-heart-monitor-96.png" alt="" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" style={{ filter: 'var(--dropdown-icon-filter)' }} />
            Account health
          </Link>
          <Link to="/freelancer/membership" className="dropdown-item !py-2 sm:!py-2.5 !text-xs sm:!text-sm">
            <img src="/Icons/icons8-medal-96.png" alt="" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" style={{ filter: 'var(--dropdown-icon-filter)' }} />
            Membership plan
          </Link>
          <Link to="/freelancer/connects" className="dropdown-item !py-2 sm:!py-2.5 !text-xs sm:!text-sm">
            <img src="/Icons/growth.png" alt="" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" style={{ filter: 'var(--dropdown-icon-filter)' }} />
            Connects
          </Link>
          <ThemeToggle />
          <Link to="/freelancer/settings" className="dropdown-item !py-2 sm:!py-2.5 !text-xs sm:!text-sm">
            <img src="/Icons/icons8-setting-100.png" alt="" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" style={{ filter: 'var(--dropdown-icon-filter)' }} />
            Account settings
          </Link>
        </div>

        {/* LOGOUT */}
        <div className="mt-1 pt-1 border-t border-border">
          <button
            onClick={handleLogout}
            className="dropdown-item w-full text-left !text-red-600 hover:bg-red-500/10 hover:!text-red-700 group/logout transition-colors !py-2 sm:!py-2.5 !text-xs sm:!text-sm"
          >
            <img src="/Icons/icons8-export-64.png" alt="" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" style={{ filter: 'invert(21%) sepia(100%) saturate(7483%) hue-rotate(359deg) brightness(94%) contrast(117%)' }} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileMenu;