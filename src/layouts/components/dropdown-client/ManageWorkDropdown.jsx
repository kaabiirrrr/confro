import React from "react";
import { Link } from "react-router-dom";

const ManageWorkDropdown = () => {

  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[260px] bg-secondary border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">

      {/* SECTION 1 */}
      <div className="px-4 py-2 text-xs text-light-text/40">
        Active and past work
      </div>

      <Link
        to="/client/contracts"
        className="dropdown-item"
      >
        Your contracts
      </Link>

      <div className="border-t border-white/10 my-1"></div>

      {/* SECTION 2 */}
      <div className="px-4 py-2 text-xs text-light-text/40">
        Hourly contract activity
      </div>

      <Link
        to="/client/hourly/timesheets"
        className="dropdown-item"
      >
        Timesheets
      </Link>

      <Link
        to="/client/hourly/time-by-freelancer"
        className="dropdown-item"
      >
        Time by freelancer
      </Link>

      <Link
        to="/client/hourly/work-diaries"
        className="dropdown-item"
      >
        Work diaries
      </Link>

      <Link
        to="/client/hourly/export"
        className="dropdown-item"
      >
        Custom export
      </Link>

    </div>
  );
};

export default ManageWorkDropdown;