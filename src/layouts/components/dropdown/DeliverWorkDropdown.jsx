import React from "react";
import { Link } from "react-router-dom";

const DeliverWorkDropdown = () => {
  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[280px] p-1 bg-secondary border border-border rounded-2xl shadow-2xl z-50 flex flex-col gap-1">
      <Link
        to="/freelancer/contracts"
        className="dropdown-item"
      >
        Your active contracts
      </Link>
      <Link
        to="/freelancer/contract-history"
        className="dropdown-item"
      >
        Contract history
      </Link>
      <Link
        to="/freelancer/work-diary"
        className="dropdown-item"
      >
        Hourly work diary
      </Link>

      <div className="border-t border-white/5 my-1"></div>

      <Link
        to="/freelancer/services"
        className="dropdown-item"
      >
        Manage your services
      </Link>
    </div>
  );
};

export default DeliverWorkDropdown;