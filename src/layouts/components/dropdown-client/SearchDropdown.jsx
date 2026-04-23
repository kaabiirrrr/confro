import React from "react";

const SearchItem = ({ title, desc, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col px-4 py-3 cursor-pointer rounded-lg transition-all duration-200 ${
        active
          ? "bg-white/10 text-accent"
          : "hover:bg-white/5 text-light-text"
      }`}
    >
      <span className="text-sm font-medium leading-tight">
        {title}
      </span>

      <span className="text-xs text-light-text/50 mt-1">
        {desc}
      </span>
    </div>
  );
};

export default SearchItem;