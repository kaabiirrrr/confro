import React from "react";

const StatsCard = ({ title, value }) => {

  return (
    <div className="bg-transparent border border-white/10 rounded-xl p-6">

      <p className="text-light-text/60 text-sm mb-2">
        {title}
      </p>

      <h3 className="text-2xl font-semibold text-accent">
        {value}
      </h3>

    </div>
  );
};

export default StatsCard;