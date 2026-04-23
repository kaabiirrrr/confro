import React from "react";

const SearchItem = ({ title, desc, active, onClick }) => {

  return (
    <div
      onClick={onClick}
      className={`flex flex-col px-4 py-3 rounded-lg cursor-pointer transition ${
        active ? "bg-white/10" : "hover:bg-white/5"
      }`}
    >
      <span className="text-sm font-medium text-light-text">
        {title}
      </span>

      <span className="text-xs text-light-text/50">
        {desc}
      </span>
    </div>
  );
};

export default SearchItem;