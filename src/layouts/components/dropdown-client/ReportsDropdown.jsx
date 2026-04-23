import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../lib/api";

const ReportsDropdown = () => {
  const [submenus, setSubmenus] = useState([
    { label: "Weekly financial summary", path: "/client/reports/weekly-summary" },
    { label: "Transaction history", path: "/client/reports/transactions" },
    { label: "Spending by activity", path: "/client/reports/spending-by-activity" }
  ]);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await api.get('/api/menu?menuKey=client_submenus');
        const data = res.data;

        if (data.success && data.data && data.data.length > 0) {
          setSubmenus(data.data);
        }
      } catch (err) {
        console.error("Failed to load dynamic submenus:", err);
      }
    };
    fetchMenus();
  }, []);

  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[260px] bg-secondary border border-white/10 rounded-xl shadow-xl p-2 z-50">
      {submenus.map((menu, idx) => (
        <Link
          key={idx}
          to={menu.path}
          className="dropdown-item block px-4 py-2 hover:bg-white/5 rounded-lg transition"
        >
          {menu.label}
        </Link>
      ))}
    </div>
  );
};

export default ReportsDropdown;
