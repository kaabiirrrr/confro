import React from "react";
import { Link } from "react-router-dom";

const HireTalentDropdown = () => {
  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[280px] bg-secondary border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">

      {/* SECTION 1 */}
      <div className="px-4 py-2 text-xs text-light-text/40">
        Manage jobs and offers
      </div>

      <Link to="/client/proposals" className="dropdown-item">
        Job posts and proposals
      </Link>

      <Link to="/client/pending-offers" className="dropdown-item">
        Pending offers
      </Link>

      <div className="border-t border-white/10 my-1"></div>

      {/* SECTION 2 */}
      <div className="px-4 py-2 text-xs text-light-text/40">
        Find freelancers
      </div>

      <Link to="/client/post-job" className="dropdown-item">
        Post a job
      </Link>

      <Link to="/find-freelancers" className="dropdown-item">
        Search for talent
      </Link>

      <Link to="/client/hired-talent" className="dropdown-item">
        Talent you've hired
      </Link>

      <Link to="/client/saved-talent" className="dropdown-item">
        Talent you've saved
      </Link>

      <Link to="/client/direct-contracts" className="dropdown-item">
        Direct contracts
      </Link>

    </div>
  );
};

export default HireTalentDropdown;