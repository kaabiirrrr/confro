import React from "react";
import { FiSearch, FiFilter } from "react-icons/fi";

const categories = [
  "All Categories",
  "Web Development",
  "Design",
  "Writing",
  "Marketing",
  "Data Science",
  "Mobile",
  "Video",
  "Translation",
];

const TalentFilterSidebar = ({
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="bg-transparent border border-white/10 rounded-2xl p-6 w-full">

      <div className="flex items-center gap-2 mb-5">
        <FiFilter className="text-accent" />
        <h2 className="font-semibold text-lg">Filters</h2>
      </div>

      {/* Search */}
      <div className="flex items-center bg-primary border border-white/10 rounded-xl px-3 py-2 mb-6">
        <FiSearch className="text-white/40 mr-2" />
        <input
          type="text"
          placeholder="Search talent..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent outline-none text-white w-full placeholder-white/40 text-sm"
        />
      </div>

      <p className="text-white/50 text-sm tracking-wider mb-4">
        CATEGORY
      </p>

      <div className="space-y-2">
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => setSelectedCategory(cat)}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${selectedCategory === cat
                ? "bg-accent text-white"
                : "hover:bg-white/10 text-white/70"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TalentFilterSidebar;