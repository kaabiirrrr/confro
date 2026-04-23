import React, { useState } from "react";
import { FiSearch, FiFilter } from "react-icons/fi";

const skillsList = [
  "React",
  "Node.js",
  "Python",
  "Figma",
  "UI/UX",
  "Content Writing",
  "SEO",
  "Data Science",
  "Mobile",
  "WordPress",
];

const FilterSidebar = ({ selectedSkill, setSelectedSkill }) => {
  const [searchSkill, setSearchSkill] = useState("");

  const filteredSkills = skillsList.filter((skill) =>
    skill.toLowerCase().includes(searchSkill.toLowerCase())
  );

  return (
    <div className="bg-transparent border border-white/10 rounded-2xl p-4 w-full">

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <FiFilter className="text-accent" size={16} />
        <h2 className="text-white font-semibold text-base">
          Filters
        </h2>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-primary border border-white/10 rounded-xl px-3 py-2 mb-6">
        <FiSearch className="text-white/40 mr-2" />
        <input
          type="text"
          placeholder="Search talent..."
          value={searchSkill}
          onChange={(e) => setSearchSkill(e.target.value)}
          className="bg-transparent outline-none text-white w-full placeholder-white/40 text-sm"
        />
      </div>

      {/* Skills Label */}
      <p className="text-white/50 text-sm tracking-wider mb-4">
        SKILLS
      </p>

      {/* Skills Buttons */}
      <div className="flex flex-wrap gap-3">
        {filteredSkills.map((skill, index) => (
          <button
            key={index}
            onClick={() =>
              setSelectedSkill(
                selectedSkill === skill ? "" : skill
              )
            }
            className={`px-4 py-1.5 rounded-full text-sm transition ${selectedSkill === skill
                ? "bg-accent text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
          >
            {skill}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterSidebar;