import React from "react";
import { Link } from "react-router-dom";

const FinanceDropdown = () => {
  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[280px] p-1 bg-secondary border border-border rounded-2xl shadow-2xl z-50 flex flex-col gap-1">
      <Link
        to="/freelancer/earnings"
        className="dropdown-item"
      >
        Earnings
      </Link>
      <Link
        to="/freelancer/transactions"
        className="dropdown-item"
      >
        Transactions
      </Link>
      <Link
        to="/freelancer/withdraw"
        className="dropdown-item"
      >
        Withdraw funds
      </Link>
    </div>
  );
};

export default FinanceDropdown;