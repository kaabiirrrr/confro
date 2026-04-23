import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const FindWorkDropdown = () => {

  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[280px] p-1 bg-secondary border border-border rounded-2xl shadow-2xl z-50 flex flex-col gap-1">
      {/* SECTION 1 */}
      <div className="py-1">
        <Link
          to="/freelancer/find-work"
          className="dropdown-item"
        >
          Find jobs
        </Link>
        <Link
          to="/services"
          className="dropdown-item"
        >
          Browse services
        </Link>
        <Link
          to="/freelancer/saved-jobs"
          className="dropdown-item"
        >
          Saved jobs
        </Link>
        <Link
          to="/freelancer/proposals"
          className="dropdown-item"
        >
          Proposals and offers
        </Link>
      </div>

      <div className="border-t border-white/5 my-1"></div>

      {/* SECTION LABEL */}
      <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
        Reach more clients
      </div>

      {/* SECTION 2 */}
      <div className="pb-1">
        <Link
          to="/freelancer/services"
          className="dropdown-item"
        >
          Your services
        </Link>
        <Link
          to="/freelancer/promote"
          className="dropdown-item flex items-center justify-between"
        >
          Promote with ads
          <ExternalLink size={14} />
        </Link>
        <Link
          to="/freelancer/direct-contracts"
          className="dropdown-item"
        >
          Direct Contracts
        </Link>
      </div>
    </div>
  );

};

export default FindWorkDropdown;